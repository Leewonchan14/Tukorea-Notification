import { LlmJson } from "@solvers-hub/llm-json/dist/src/index";
import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import fs from "fs";
import _ from "lodash";
import path from "path";
import { slugify } from "transliteration";
import z from "zod";
import { getEnv } from "./env";

export const wait = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const asyncExist = async (path: string): Promise<boolean> => {
  if (path.startsWith("~")) {
    path = path.replace("~", getEnv("HOME"));
  }
  try {
    await fs.promises.access(path, fs.promises.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

export const execCmdAsync = (
  command: string,
  args: string[],
  options: SpawnOptionsWithoutStdio,
): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    console.log("execAsync: ", command, args.join(" "), options);
    const child = spawn(command, args, {
      ...options,
      env: {
        HOME: getEnv("HOME"),
        GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),
        ...options.env,
      },
    });

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (error) => {
      stderr += error.toString();
    });
    child.on("error", (err) => {
      stderr += err.toString();
    });

    child.on("close", (code) => {
      resolve({ stdout, stderr });
    });
  });
};

export const extractJsonFromLlm = <T>(
  llmOutput: string,
  outputSchema: z.ZodSchema<T>,
  select: string[],
) => {
  const llmJson = new LlmJson();
  const jsonData = _.get(JSON.parse(llmOutput), select.join("."));
  const { text, json } = llmJson.extract(jsonData);
  console.log("text: ", text);
  console.log("json: ", json);

  const jsonResult = json.find((js) => outputSchema.safeParse(js).success);

  if (!jsonResult) {
    throw new Error(
      `extractJsonFromLlm error: llmOutput: ${llmOutput} \n jsonData: ${jsonData} text: ${text}\n`,
    );
  }

  return outputSchema.parse(jsonResult);
};

export const convertSrcToBuffer = async (src: string) => {
  const name = slugify(path.basename(src), { lowercase: true });
  const buffer = await fetch(src)
    .then((v) => v.arrayBuffer())
    .then((v) => Buffer.from(v));
  return { name, buffer };
};
