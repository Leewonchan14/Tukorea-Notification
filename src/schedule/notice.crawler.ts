import { GeminiCli } from "@/ai/gemini.cli";
import { sendWebHook } from "@/discord-webhook";
import { getEnv } from "@/env";
import { aiInputSchema, aiOutputSchema } from "@/schema/ai.schema";
import { NoticeAuthor } from "@/schema/notice-athor.schema";
import { INotice, Notice } from "@/schema/notice.schema";
import { convertSrcToBuffer, sanitizeHtmlForAi } from "@/util";
import { ROLE_MAP } from "@/webhook";
import _ from "lodash";
import { Page } from "playwright";
import z from "zod";
import { queueing } from "./queueing";

const TARGET_DOMAIN = "https://www.tukorea.ac.kr";
const WEBHOOK_URL = getEnv("NOTICE_WEBHOOK");

export const noticeCrawler = queueing(async (getPage: () => Promise<Page>) => {
  const page = await getPage();
  await page.goto(`${TARGET_DOMAIN}/tukorea/7607/subview.do`, {
    waitUntil: "domcontentloaded",
  });
  try {
    await page.waitForSelector("a:has(span[class*='new'])");
  } catch {
    console.log("no new notices");
    return;
  }

  const newNotices = await page.locator("a:has(span[class*='new'])").all();
  console.log("notice newNotices: ", newNotices.length);

  const filteredNewNotices = _.compact(
    await Promise.all(
      newNotices.map(async (notice) => {
        const id = await notice.locator("dl[class='num'] > dd").textContent();

        if (!id) {
          throw new Error("id is not found");
        }

        const findNotice = await Notice.findOne({ id: id });
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

        return {
          id,
          href,
          title,
          author,
          postedAt,
        };
      })
    )
  );

  const createdNotices = [];

  for (const { id, title, href, author, postedAt } of filteredNewNotices) {
    await page.goto(href);
    await page.waitForSelector("div[class='contents'] div[class='_fnctWrap']");

    const outerHtml = await page
      .locator("div[class='contents'] div[class='_fnctWrap']")
      .innerHTML();
    const content = sanitizeHtmlForAi(outerHtml);

    const getPicture = async () => {
      const noticeLocator = await page
        .locator("div[class='contents'] div[class='_fnctWrap'] img")
        .all();

      const pictures = await Promise.all(
        noticeLocator.map(async (v) => {
          return v.getAttribute("src").then((src) => src?.trim());
        })
      );

      return pictures.filter((v) => v !== undefined);
    };

    const attachedPictureSrcs = await getPicture();

    const getAttachedFileNames = async () => {
      const attachedFileLocators = await page
        .locator("div[class='contents'] div[class='_fnctWrap'] .view-file a")
        .all();
      return await Promise.all(
        attachedFileLocators.map((v) => v.innerText().then((v) => v.trim()))
      );
    };

    const attachedFileNames = await getAttachedFileNames();

    createdNotices.push({
      id,
      href,
      title,
      author,
      postedAt,
      content,
      attachedPictures: attachedPictureSrcs,
      attachedFileNames: attachedFileNames,
    });
  }

  await page.close();

  for (const notice of createdNotices) {
    const { description, majorList, targetStudents } = await extractWithAI({
      ...notice,
      noticeId: notice.id,
      author: notice.author.name,
      title: notice.title ?? "",
    });

    const createdNotice = await Notice.create({
      ...notice,
      description,
      majorList,
      targetStudents,
    });

    try {
      await sendWebHook(WEBHOOK_URL, await noticeToMessage(createdNotice));
    } catch (error) {
      console.error(error);
      await Notice.deleteOne({ id: notice.id });
      console.error(`Notice ${notice.id} deleted`);
      throw error;
    }
  }
});

const extractWithAI = async (notice: z.input<typeof aiInputSchema>) => {
  const attachedPictures = await Promise.all(
    notice.attachedPictures.map((src) => convertSrcToBuffer(src))
  );

  return GeminiCli.extractInfo(
    notice.noticeId,
    notice,
    attachedPictures,
    aiInputSchema,
    aiOutputSchema,
    "notice"
  );
};

const noticeToMessage = async (notice: INotice) => {
  return [
    `# [(${notice.postedAt})[${notice.author.name}]${notice.title}](${notice.href})`,
    `### ⚠️ ${notice.majorList
      .map((v) => `<@&${ROLE_MAP[v as keyof typeof ROLE_MAP]}>`)
      .join(" ")} 주목`,
    `### ⚠️ ${notice.targetStudents
      .map((v) => `<@&${ROLE_MAP[v as keyof typeof ROLE_MAP]}>`)
      .join(" ")} 주목`,
    "",
    notice.description,
  ].join("\n");
};
