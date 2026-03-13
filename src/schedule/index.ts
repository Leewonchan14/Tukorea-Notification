import { dormitoryNoticeCrawler } from "./dormitory-notice.crawler";
import { noticeCrawler } from "./notice.crawler";
import { shuttleCrawler } from "./shuttle.crawler";

export const scheduleTasks = async () => {
  // Notice
  noticeCrawler(10 * 60); // 10분 마다

  // Dormitory Notice
  dormitoryNoticeCrawler(15 * 60); // 15분 마다

  // // School Meal
  shuttleCrawler(60 * 60); // 1시간 마다
  // withErorrWebHook(() => schoolMealCrawler(getPage))();
  // cron.schedule(
  //   "6-59/30 * * * *", // 30분 마다
  //   withErorrWebHook(() => schoolMealCrawler(getPage)),
  // );

  // // Shuttle
  // withErorrWebHook(() => shuttleCrawler(getPage))();
  // cron.schedule(
  //   "9-59/60 * * * *", // 1시간 마다
  //   withErorrWebHook(() => shuttleCrawler(getPage)),
  // );
};
