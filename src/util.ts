import { LlmJson } from "@solvers-hub/llm-json/dist/src/index";
import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import createDOMPurify from "dompurify";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import { slugify } from "transliteration";
import z from "zod";
import { getEnv } from "./env";
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

export const execAsync = (
  command: string,
  args: string[],
  options: SpawnOptionsWithoutStdio
): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    console.log("execAsync: ", command, args, options);
    const child = spawn(command, args, {
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

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

export const sanitizeHtmlForAi = (htmlString: string) => {
  return DOMPurify.sanitize(htmlString, {
    ALLOWED_ATTR: [],
  })
    .replaceAll(/(\r\n|\n|\r|\t)/gm, "")
    .replaceAll(/>\s+</gm, "");
};

export const extractJsonFromLlm = (
  llmOutput: string,
  outputSchema: z.ZodSchema<any>
) => {
  const llmJson = new LlmJson();
  const { text, json } = llmJson.extract(llmOutput);
  console.log("text: ", text);
  console.log("json: ", json);

  const jsonResult = json.find((js) => outputSchema.safeParse(js).success);
  if (!jsonResult) {
    throw new Error(
      `${
        outputSchema.description
      } 정보를 찾을 수 없습니다. \n llmOutput: ${llmOutput} \n text: ${text}\n json: ${JSON.stringify(
        json,
        null,
        2
      )}`
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
