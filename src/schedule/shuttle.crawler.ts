import { sendWebHook } from "@/discord-webhook";
import { getEnv } from "@/env";
import { IShuttles, Shuttle } from "@/schema/shuttle.schema";
import _ from "lodash";
import { Page } from "playwright";
import { queueing } from "./queueing";

const WEBHOOK_URL = getEnv("SHUTTLE_WEBHOOK");

export const shuttleCrawler = queueing(async (getPage: () => Promise<Page>) => {
  const page = await getPage();
  await page.goto("https://ibook.kpu.ac.kr/Viewer/bus01");
  await page.waitForSelector("img[class*='pageImage']", {
    // timeout: 10000,
  });

  const images = await page.locator("img[class*='pageImage']").all();
  console.log("images: ", images);

  const filteredNewShuttles = _.compact(
    await Promise.all(
      images.map(async (image) => {
        const src = "https:" + (await image.getAttribute("src"));
        const alt = await image.getAttribute("alt");
        const place: IShuttles["place"] = alt?.startsWith("1")
          ? "본교 ↔ 정왕역"
          : "제2캠퍼스 ↔ 본교 ↔ 정왕역";

        const findShuttle = await Shuttle.findOne({ src: src });
        if (findShuttle) return undefined;

        return await Shuttle.create({ src, place });
      })
    )
  );

  await page.close();

  filteredNewShuttles.forEach(async (shuttle) => {
    await sendWebHook(WEBHOOK_URL, shuttleToMessage(shuttle));
  });
});

const shuttleToMessage = (shuttle: IShuttles) => {
  return `${shuttle.place}\n${shuttle.src}`;
};
