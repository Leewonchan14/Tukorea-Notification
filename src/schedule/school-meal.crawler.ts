import { GeminiCli } from "@/ai/gemini.cli";
import { sendWebHook } from "@/discord-webhook";
import { getEnv } from "@/env";
import { mealInputSchema, mealOutputSchema } from "@/schema/ai.schema";
import { ISchoolMeal, SchoolMeal } from "@/schema/school-meal.schema";
import { convertSrcToBuffer } from "@/util";
import _ from "lodash";
import { Page } from "playwright";
import { queueing } from "./queueing";

const WEBHOOK_URL = getEnv("SCHOOL_MEAL_WEBHOOK");

export const schoolMealCrawler = queueing(
  async (getPage: () => Promise<Page>) => {
    const page = await getPage();
    await page.goto("https://ibook.kpu.ac.kr/Viewer/menu02", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector("img[class*='pageImage']");

    const images = await page.locator("img[class*='pageImage']").all();
    console.log("school meal images: ", images.length);

    const filteredNewSchoolMeals = _.compact(
      await Promise.all(
        images.map(async (image) => {
          const src = "https:" + (await image.getAttribute("src"));
          const place = await image
            .getAttribute("aria-label")
            .then((v) => v?.split("\n")[0]?.trim());
          const rawLabel = (await image.getAttribute("aria-label")) ?? "";

          const findSchoolMeal = await SchoolMeal.findOne({ src: src });
          if (findSchoolMeal) return undefined;

          return { src, place, rawLabel };
        })
      )
    );

    await page.close();

    for (const schoolMeal of filteredNewSchoolMeals) {
      // const { description } = await extractWithAI(schoolMeal);
      const createdSchoolMeal = await SchoolMeal.create({
        ...schoolMeal,
        // description,
      });
      await sendWebHook(
        WEBHOOK_URL,
        await schoolMealToMessage(createdSchoolMeal)
      );
    }
  }
);

const extractWithAI = async (schoolMeal: { src: string; rawLabel: string }) => {
  const attachedPictures = await convertSrcToBuffer(schoolMeal.src);
  return GeminiCli.extractInfo(
    "meal",
    {
      rawLabel: schoolMeal.rawLabel,
      attachedPictures: [attachedPictures.name],
    },
    [attachedPictures],
    mealInputSchema,
    mealOutputSchema,
    "meal"
  );
};

const schoolMealToMessage = async (schoolMeal: ISchoolMeal) => {
  return [
    `# [${schoolMeal.place}](${schoolMeal.src})`,
    "",
    schoolMeal.description,
  ].join("\n");
};
