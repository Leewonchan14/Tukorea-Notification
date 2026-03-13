import { sendWebHook } from "@/discord-webhook";
import { getEnv } from "@/env";
import { IShuttles, Shuttle } from "@/schema/shuttle.schema";
import { wait } from "@/util";
import * as cheerio from "cheerio";

const WEBHOOK_URL = getEnv("SHUTTLE_WEBHOOK");
const getSrcsUrl = (bookCode: string) =>
  `https://ibook.tukorea.ac.kr/Viewer/getBookXML/${bookCode}`;

export const shuttleCrawler = async (sleepSec: number) => {
  while (true) {
    await coreLogic();
    await wait(sleepSec * 1000);
  }
};

const coreLogic = async () => {
  const windowHtml = await fetch(
    "https://ibook.tukorea.ac.kr/Viewer/bus01",
  ).then((r) => r.text());

  const $ = cheerio.load(windowHtml);

  const bookCode = $("input[name='bookcode']").attr("value");
  if (!bookCode) return;

  const srcs = (
    (await fetch(getSrcsUrl(bookCode)).then((res) => res.json())) as {
      src: string;
    }[]
  ).map(({ src }) => `https:${src}`);

  srcs.forEach(async (src) => {
    const findShuttle = await Shuttle.findOne({ src: src });
    if (findShuttle) return;

    await Shuttle.create({ src });

    const msg = shuttleToMessage({ src });
    console.log(msg);

    await sendWebHook(WEBHOOK_URL, msg);
  });
};

const shuttleToMessage = (shuttle: Pick<IShuttles, "src">) => {
  return `${shuttle.src}`;
};
