import { noticeCrawler } from "./notice.crawler";

export const scheduleTasks = async () => {
  noticeCrawler(10 * 60); // 10분 마다
  // // Notice
  // cron.schedule(
  //   "0-59/10 * * * *", // 10분 마다
  //   withErorrWebHook(noticeCrawler),
  // );

  // // Dormitory Notice
  // withErorrWebHook(() => dormitoryNoticeCrawler(getPage))();
  // cron.schedule(
  //   "3-59/15 * * * *", // 15분 마다
  //   withErorrWebHook(() => dormitoryNoticeCrawler(getPage)),
  // );

  // // School Meal
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
