import { GeminiCli } from "@/ai/gemini.cli";
import { sendWebHook } from "@/discord-webhook";
import { getEnv } from "@/env";
import { aiInputSchema, aiOutputSchema } from "@/schema/ai.schema";
import { NoticeAuthor } from "@/schema/notice-athor.schema";
import { INotice, Notice } from "@/schema/notice.schema";
import { convertSrcToBuffer, wait } from "@/util";
import { ROLE_MAP } from "@/webhook";
import * as cheerio from "cheerio";
import z from "zod";

const TARGET_DOMAIN = "https://www.tukorea.ac.kr";
const WEBHOOK_URL = getEnv("NOTICE_WEBHOOK");

export const noticeCrawler = async (sleepSec: number) => {
  while (true) {
    coreLogic();
    await wait(sleepSec * 1000);
  }
};

const coreLogic = async () => {
  const windowHtml = await fetch(
    `${TARGET_DOMAIN}/tukorea/7607/subview.do`,
  ).then((res) => res.text());

  const $ = cheerio.load(windowHtml);

  const newNotices = $("a:has(span[class*='new'])")
    .get()
    .map((n) => $(n));

  const newNoticeIds = newNotices.map((el) => {
    return el.find("dl[class='num'] > dd").text();
  });

  const findeNotices = await Notice.find({ id: { $in: newNoticeIds } });

  for (const [i, el] of newNotices.entries()) {
    const id = newNoticeIds[i];
    if (!id) return;

    const findNotice = findeNotices.find((notice) => notice.id === id);
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
    const fetchHref = `${TARGET_DOMAIN}${linkHref}`;

    const $content = cheerio.load(await fetch(fetchHref).then((r) => r.text()));
    const content = $content("div[class='_fnctWrap']")
      .text()
      .replaceAll(/\s+/gm, " "); // 연속 공백만 정규화;

    const pictures = $content("div[class='_fnctWrap'] img")
      .map((_, el) => el.attribs.src?.trim())
      .toArray();

    const attachedFileNames = $content("div[class='_fnctWrap'] .view-file a")
      .map((_, el) => $(el).html()?.trim())
      .get();

    // extract ai
    const { description, majorList, targetStudents } = await extractWithAI({
      noticeId: id,
      author: author.name,
      title,
      content,
      attachedPictures: pictures,
      attachedFileNames: attachedFileNames,
    });

    const createdNotice = await Notice.create({
      id,
      href,
      title,
      author,
      postedAt,
      content,
      attachedPictures: pictures,
      attachedFileNames: attachedFileNames,
      description,
      majorList,
      targetStudents,
    });

    console.log(noticeToMessage(createdNotice));

    await sendWebHook(WEBHOOK_URL, await noticeToMessage(createdNotice));
  }
};

const extractWithAI = async (notice: z.input<typeof aiInputSchema>) => {
  const attachedPictures: Awaited<ReturnType<typeof convertSrcToBuffer>>[] = [];
  notice.attachedPictures.forEach(async (src) => {
    attachedPictures.push(await convertSrcToBuffer(src));
  });

  return GeminiCli.extractInfo(
    notice.noticeId,
    notice,
    attachedPictures,
    aiInputSchema,
    aiOutputSchema,
    "notice",
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
