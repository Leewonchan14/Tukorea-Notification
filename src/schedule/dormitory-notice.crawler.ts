import { sendWebHook } from "@/discord-webhook";
import { getEnv } from "@/env";
import {
  DormitoryNotice,
  IDormitoryNotice,
} from "@/schema/dormitory-notice.schema";
import { NoticeAuthor } from "@/schema/notice-athor.schema";
import { wait } from "@/util";
import * as cheerio from "cheerio";

const TARGET_DOMAIN = "https://dorm.tukorea.ac.kr";
const WEBHOOK_URL = getEnv("DORMITORY_NOTICE_WEBHOOK");

export const dormitoryNoticeCrawler = async (sleepSec: number) => {
  while (true) {
    coreLogic();
    await wait(sleepSec * 1000);
  }
};

const coreLogic = async () => {
  const windowHtml = await fetch(`${TARGET_DOMAIN}/dorm/2630/subview.do`).then(
    (res) => res.text(),
  );

  const $ = cheerio.load(windowHtml);

  const newNotices = $("a:has(span[class*='new'])")
    .get()
    .map((n) => $(n));

  const newNoticeIds = newNotices.map((el) => {
    return el.find("dl[class='num'] > dd").text().trim();
  });

  const findNotices = await DormitoryNotice.find({ id: { $in: newNoticeIds } });

  newNotices.forEach(async (el, i) => {
    const id = newNoticeIds[i];
    if (!id) return;

    const findNotice = findNotices.find((notice) => notice.id === id);
    if (findNotice) return;

    const authorName = el.find("dl[class='writer'] > dd").text().trim();

    const author = await NoticeAuthor.findOneAndUpdate(
      { name: authorName },
      { name: authorName },
      { upsert: true, new: true },
    );

    const title = el.find("div[class='title'] > strong").text().trim();
    const postedAt = el.find("dl[class='date'] > dd").text().trim();

    const linkHref = el.attr("href")?.trim();
    const href = `${TARGET_DOMAIN}${linkHref}?layout=unknown`;

    const createdNotice = await DormitoryNotice.create({
      id,
      href,
      title,
      author,
      postedAt,
    });

    console.log(noticeToMessage(createdNotice));

    await sendWebHook(WEBHOOK_URL, noticeToMessage(createdNotice));
  });
};

const noticeToMessage = (notice: IDormitoryNotice) => {
  return [
    `[(${notice.postedAt})[${notice.author.name}]`,
    `${notice.title}](${notice.href})\n`,
    `작성기관: ${notice.author.name}`,
  ].join("");
};
