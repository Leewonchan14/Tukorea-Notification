import { withErorrWebHook } from "@/discord-webhook";
import cron from "node-cron";
import { chromium } from "playwright";
import { dormitoryNoticeCrawler } from "./dormitory-notice.crawler";
import { noticeCrawler } from "./notice.crawler";
import { schoolMealCrawler } from "./school-meal.crawler";
import { shuttleCrawler } from "./shuttle.crawler";

export const scheduleTasks = async () => {
  const browser = await chromium.launch({
    // headless: false,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      "--disable-client-side-phishing-detection",
      "--disable-sync",
      "--disable-extensions",
      "--disable-default-apps",
      "--no-first-run",
      "--no-default-browser-check",
      "--memory-pressure-off",
      "--max-old-space-size=256",
    ],
  });

  const ctx = await browser.newContext();

  const getPage = async () => {
    const pages = ctx.pages();
    if (pages.length !== 0 && pages[0]) {
      return pages[0];
    }
    return ctx.newPage();
  };

  // Notice
  withErorrWebHook(() => noticeCrawler(getPage))();
  cron.schedule(
    "0-59/10 * * * *", // 10분 마다 
    withErorrWebHook(() => noticeCrawler(getPage))
  );

  // Dormitory Notice
  withErorrWebHook(() => dormitoryNoticeCrawler(getPage))();
  cron.schedule(
    "3-59/15 * * * *", // 15분 마다 
    withErorrWebHook(() => dormitoryNoticeCrawler(getPage))
  );

  // School Meal
  withErorrWebHook(() => schoolMealCrawler(getPage))();
  cron.schedule(
    "6-59/30 * * * *", // 30분 마다
    withErorrWebHook(() => schoolMealCrawler(getPage))
  );

  // Shuttle
  withErorrWebHook(() => shuttleCrawler(getPage))();
  cron.schedule(
    "9-59/60 * * * *", // 1시간 마다
    withErorrWebHook(() => shuttleCrawler(getPage))
  );
};
