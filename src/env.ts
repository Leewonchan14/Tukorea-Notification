import dotenv from "dotenv";
import { MAJOR_LIST, WEBHOOK_MAP } from "./webhook";

export const isDev = process.env.NODE_ENV !== "production";
console.log("isDev: ", isDev);
dotenv.config({
  debug: isDev,
  path: isDev ? ".env.dev" : ".env",
});

interface Env {
  readonly NODE_ENV: "development" | "production" | "test";
  readonly PORT: string;
  readonly MONGODB_URI: string;

  // GEMINI
  readonly GEMINI_EXEC: string;
  readonly GEMINI_API_KEY: string;
  readonly HOME: string;
}

type EnvKey =
  | keyof Env
  | (typeof MAJOR_LIST)[number]["name"]
  | keyof typeof WEBHOOK_MAP;

export const getEnv = (key: EnvKey) => {
  process.env = { ...process.env, ...WEBHOOK_MAP };

  if (!process.env[key]) {
    console.error(`${key}: `, process.env[key]);
    throw new Error(`${key} is not set`);
  }

  return process.env[key];
};
