import { dormitoryNoticeCrawler } from "./dormitory-notice.crawler";
import { noticeCrawler } from "./notice.crawler";
import { schoolMealCrawler } from "./school-meal.crawler";
import { shuttleCrawler } from "./shuttle.crawler";

export const scheduleTasks = async () => {
  // Notice
  noticeCrawler(10 * 60); // 10분 마다

  // Dormitory Notice
  dormitoryNoticeCrawler(15 * 60); // 15분 마다

  // School Meal
  schoolMealCrawler(30 * 60); // 30분 마다

  // Shuttle
  shuttleCrawler(60 * 60); // 1시간 마다
};
