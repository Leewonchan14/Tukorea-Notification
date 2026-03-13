import { sendWebHook } from "@/discord-webhook";
import { getEnv } from "@/env";
import { ISchoolMeal, SchoolMeal } from "@/schema/school-meal.schema";
import { wait } from "@/util";
import * as cheerio from "cheerio";

const WEBHOOK_URL = getEnv("SCHOOL_MEAL_WEBHOOK");
const getSrcsUrl = (bookCode: string) =>
  `https://ibook.tukorea.ac.kr/Viewer/getBookXML/${bookCode}`;

export const schoolMealCrawler = async (sleepSec: number) => {
  while (true) {
    try {
      await coreLogic();
    } catch (error) {
      console.error("Error in schoolMealCrawler:", error);
    }
    await wait(sleepSec * 1000);
  }
};

const coreLogic = async () => {
  const windowHtml = await fetch(
    "https://ibook.tukorea.ac.kr/Viewer/menu02",
  ).then((r) => r.text());

  const $ = cheerio.load(windowHtml);

  const bookCode = $("input[name='bookcode']").attr("value");
  if (!bookCode) return;

  const srcs = (
    (await fetch(getSrcsUrl(bookCode)).then((res) => res.json())) as {
      src: string;
    }[]
  ).map(({ src }) => `https:${src}`);

  for (const src of srcs) {
    try {
      const findSchoolMeal = await SchoolMeal.findOne({ src: src });
      if (findSchoolMeal) continue;

      await SchoolMeal.create({ src });

      const msg = schoolMealToMessage({ src });
      console.log(msg);

      await sendWebHook(WEBHOOK_URL, msg);
    } catch (err) {
      console.error("Error processing school meal:", err);
    }
  }
};
const schoolMealToMessage = (schoolMeal: Pick<ISchoolMeal, "src">) => {
  return `${schoolMeal.src}`;
};
