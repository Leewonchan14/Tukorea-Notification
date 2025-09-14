import cron from "node-cron";
import { noticeCrawler } from "./notice.crawler";
import { chromium } from "playwright";
import { dormitoryNoticeCrawler } from "./dormitory-notice.crawler";
import { shuttleCrawler } from "./shuttle.crawler";
import { schoolMealCrawler } from "./school-meal.crawler";
import { withErorrWebHook } from "@/discord-webhook";

export const scheduleTasks = async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  });
  const ctx = await browser.newContext();
  const getPage = () => ctx.newPage();

  // Notice
  withErorrWebHook(() => noticeCrawler(getPage))();
  cron.schedule(
    "*/5 * * * *",
    withErorrWebHook(() => noticeCrawler(getPage))
  );

  // Dormitory Notice
  withErorrWebHook(() => dormitoryNoticeCrawler(getPage))();
  cron.schedule(
    "*/5 * * * *",
    withErorrWebHook(() => dormitoryNoticeCrawler(getPage))
  );

  // School Meal
  withErorrWebHook(() => schoolMealCrawler(getPage))();
  cron.schedule(
    "*/5 * * * *",
    withErorrWebHook(() => schoolMealCrawler(getPage))
  );

  // Shuttle
  withErorrWebHook(() => shuttleCrawler(getPage))();
  cron.schedule(
    "*/5 * * * *",
    withErorrWebHook(() => shuttleCrawler(getPage))
  );
};
