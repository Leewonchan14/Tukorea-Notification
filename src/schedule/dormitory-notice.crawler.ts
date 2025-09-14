import { sendWebHook } from "@/discord-webhook";
import { getEnv } from "@/env";
import {
  DormitoryNotice,
  IDormitoryNotice,
} from "@/schema/dormitory-notice.schema";
import { NoticeAuthor } from "@/schema/notice-athor.schema";
import { Page } from "playwright";
import _ from "lodash";

const TARGET_DOMAIN = "https://dorm.tukorea.ac.kr/dorm/2630/subview.do";
const WEBHOOK_URL = getEnv("DORMITORY_NOTICE_WEBHOOK");

export const dormitoryNoticeCrawler = async (getPage: () => Promise<Page>) => {
  const page = await getPage();
  await page.goto("https://dorm.tukorea.ac.kr/dorm/2630/subview.do");
  await page.waitForSelector("a:has(span)", {
    timeout: 10000,
  });

  const newNotices = await page.locator("a:has(span[class*='new'])").all();

  const filteredNewNotices = _.compact(
    await Promise.all(
      newNotices.map(async (notice) => {
        const id = await notice.locator("dl[class='num'] > dd").textContent();

        if (!id) {
          throw new Error("id is not found");
        }

        const findNotice = await DormitoryNotice.findOne({ id: id });
        if (findNotice) return undefined;

        const linkHref = await notice
          .getAttribute("href")
          .then((v) => v?.trim());

        const href = `${TARGET_DOMAIN}${linkHref}?layout=unknown`;

        const title = await notice
          .locator("div[class='title'] > strong")
          .textContent()
          .then((v) => v?.trim());

        const authorName = await notice
          .locator("dl[class='writer'] > dd")
          .textContent()
          .then((v) => v?.trim());

        const postedAt = await notice
          .locator("dl[class='date'] > dd")
          .textContent()
          .then((v) => v?.trim());

        const author = await NoticeAuthor.findOneAndUpdate(
          { name: authorName },
          { name: authorName },
          { upsert: true, new: true }
        );

        return await DormitoryNotice.create({
          id,
          href,
          title,
          author,
          postedAt,
        });
      })
    )
  );

  await page.close();

  filteredNewNotices.forEach(async (notice) => {
    await sendWebHook(WEBHOOK_URL, noticeToMessage(notice));
  });
};

const noticeToMessage = (notice: IDormitoryNotice) => {
  return `[(${notice.postedAt})[${notice.author.name}]${notice.title}](${notice.href})`;
};
