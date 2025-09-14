import { WebhookClient } from "discord.js";
import { getEnv } from "./env";

const ERROR_WEBHOOK = getEnv("ERROR_WEBHOOK");

export const sendWebHook = async (url: string, message: string) => {
  if (getEnv("NODE_ENV") === "development") return;
  const webhookClient = new WebhookClient({ url });
  await webhookClient.send({ content: message });
  webhookClient.destroy();
};

export const withErorrWebHook = (fn: (...args: any[]) => Awaited<any>) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(error);
      sendWebHook(ERROR_WEBHOOK, String(error));
    }
  };
};
