import { sendWebHook } from "@/discord-webhook";
import { getEnv } from "@/env";
import { ISchoolMeal, SchoolMeal } from "@/schema/school-meal.schema";
import _ from "lodash";
import { Page } from "playwright";
import { queueing } from "./queueing";

const WEBHOOK_URL = getEnv("SCHOOL_MEAL_WEBHOOK");

export const schoolMealCrawler = queueing(
  async (getPage: () => Promise<Page>) => {
    const page = await getPage();
    await page.goto("https://ibook.kpu.ac.kr/Viewer/menu02", {
      // timeout: 10000,
    });
    await page.waitForSelector("img[class*='pageImage']");

    const images = await page.locator("img[class*='pageImage']").all();
    console.log("images: ", images);

    const filteredNewSchoolMeals = _.compact(
      await Promise.all(
        images.map(async (image) => {
          const src = "https:" + (await image.getAttribute("src"));
          const place = await image
            .getAttribute("aria-label")
            .then((v) => v?.split("\n")[0]?.trim());

          const findSchoolMeal = await SchoolMeal.findOne({ src: src });
          if (findSchoolMeal) return undefined;

          return await SchoolMeal.create({ src, place });
        })
      )
    );

    await page.close();

    filteredNewSchoolMeals.forEach(async (schoolMeal) => {
      await sendWebHook(WEBHOOK_URL, schoolMealToMessage(schoolMeal));
    });
  }
);

const schoolMealToMessage = (schoolMeal: ISchoolMeal) => {
  return `[${schoolMeal.place}](${schoolMeal.src})`;
};
