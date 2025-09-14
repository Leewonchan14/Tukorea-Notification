import dotenv from "dotenv";

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
  readonly NOTICE_WEBHOOK: string;
  readonly DORMITORY_NOTICE_WEBHOOK: string;
  readonly SCHOOL_MEAL_WEBHOOK: string;
  readonly SHUTTLE_WEBHOOK: string;
  readonly ERROR_WEBHOOK: string;
}

export const getEnv = (key: keyof Env) => {
  if (!process.env[key]) {
    console.error(`${key}: `, process.env[key]);
    throw new Error(`${key} is not set`);
  }
  return process.env[key] as Env[typeof key];
};
