import fs from "fs";
import _ from "lodash";
import path from "path";
import z from "zod";
import { getEnv } from "../env";
import {
  aiInputSchema,
  aiOutputSchema,
  mealInputSchema,
  mealOutputSchema,
} from "../schema/ai.schema";
import {
  asyncExist,
  execAsync as execCmdAsync,
  extractJsonFromLlm,
} from "../util";

export class GeminiCli {
  static GEMINI_EXEC = getEnv("GEMINI_EXEC");
  static SOURCE_DIR = `${getEnv("HOME")}/.gemini/source`;
  static SYSTEM_NOTICE_PROMPT = `${getEnv("HOME")}/.gemini/notice.md`;
  static SYSTEM_MEAL_PROMPT = `${getEnv("HOME")}/.gemini/meal.md`;
  static isInitialized = false;

  public static async init(): Promise<void> {
    if (GeminiCli.isInitialized) {
      return;
    }

    if (!(await asyncExist(GeminiCli.SOURCE_DIR))) {
      console.log("SOURCE_DIR not exists, creating...");
      await fs.promises.mkdir(GeminiCli.SOURCE_DIR, { recursive: true });
    }

    console.log("saving system prompt...");
    await saveSystemPrompt();

    GeminiCli.isInitialized = true;
  }

  public static async extractNoticeInfo(
    noticeInfo: z.input<typeof aiInputSchema>,
    pictures: { name: string; buffer: Buffer }[]
  ): Promise<z.infer<typeof aiOutputSchema> | undefined> {
    await GeminiCli.init();

    // source에 첨부 사진들 저장
    const noticeDir = path.join(GeminiCli.SOURCE_DIR, noticeInfo.noticeId);
    await fs.promises.mkdir(noticeDir, { recursive: true });
    await Promise.all(
      pictures.map(async (pic) => {
        const picPath = path.join(noticeDir, pic.name);
        // 파일 저장
        await fs.promises.writeFile(picPath, pic.buffer);
        console.log("writing pictures: ", pic.name);
        return pic;
      })
    );

    const geminiArgs = GeminiCli.buildGeminiArgs(
      JSON.stringify(aiInputSchema.parse(noticeInfo)) +
        " " +
        pictures.map((pic) => `@${pic.name}`).join(" ")
    );

    const excute = async () => {
      const { stdout, stderr } = await execCmdAsync(
        GeminiCli.GEMINI_EXEC,
        geminiArgs,
        {
          cwd: getEnv("HOME"),
          env: {
            GEMINI_SYSTEM_MD: GeminiCli.SYSTEM_NOTICE_PROMPT,
          },
        }
      );

      return extractJsonFromLlm(stdout, aiOutputSchema);
    };

    let result: z.infer<typeof aiOutputSchema> | undefined;

    for (let i = 0; i < 3; i++) {
      try {
        result = await excute();
        break;
      } catch (error) {
        console.error("error: ", error);
      }
    }

    // noticeDir 삭제
    await fs.promises.rmdir(noticeDir, { recursive: true });

    return result;
  }

  public static async extractMealInfo(
    mealInfo: z.input<typeof mealInputSchema>,
    pictures: { name: string; buffer: Buffer }[]
  ): Promise<z.infer<typeof mealOutputSchema> | undefined> {
    await GeminiCli.init();

    // source에 첨부 사진들 저장
    const mealDir = path.join(GeminiCli.SOURCE_DIR, "meal");
    await fs.promises.mkdir(mealDir, { recursive: true });
    await Promise.all(
      pictures.map(async (pic) => {
        const picPath = path.join(mealDir, pic.name);
        await fs.promises.writeFile(picPath, pic.buffer);
      })
    );

    const geminiArgs = GeminiCli.buildGeminiArgs(
      JSON.stringify(mealInputSchema.parse(mealInfo)) +
        " " +
        pictures.map((pic) => `@${pic.name}`).join(" ")
    );

    const excute = async () => {
      const { stdout, stderr } = await execCmdAsync(
        GeminiCli.GEMINI_EXEC,
        geminiArgs,
        {
          cwd: getEnv("HOME"),
          env: {
            GEMINI_SYSTEM_MD: GeminiCli.SYSTEM_MEAL_PROMPT,
          },
        }
      );

      console.log("stderr: ", stderr);

      return extractJsonFromLlm(stdout, mealOutputSchema);
    };

    let result: z.infer<typeof mealOutputSchema> | undefined;

    for (let i = 0; i < 3; i++) {
      try {
        result = await excute();
        break;
      } catch (error) {
        console.error("error: ", error);
      }
    }

    // mealDir 삭제
    pictures.forEach(async (pic) => {
      await fs.promises.unlink(path.join(mealDir, pic.name));
    });

    return result;
  }

  private static buildGeminiArgs = (
    input: string,
    model: string = "gemini-2.5-flash"
  ) => {
    return [
      "-p",
      input,
      // model
      "-m",
      "gemini-2.5-flash",
      // include directories
      "--include-directories",
      GeminiCli.SOURCE_DIR,
    ];
  };
}

const saveSystemPrompt = async () => {
  const notice =
    (await fs.promises.readFile(process.cwd() + "/notice.md", "utf-8")) +
    `


## 입력 형식
${JSON.stringify(_.omit(z.toJSONSchema(aiInputSchema), ["$schema"]), null, 2)}

## 출력 형식
${JSON.stringify(
  _.omit(z.toJSONSchema(aiOutputSchema), ["$schema"]),
  null,
  2
)}`;

  if (!(await asyncExist(GeminiCli.SYSTEM_NOTICE_PROMPT))) {
    await fs.promises.mkdir(path.dirname(GeminiCli.SYSTEM_NOTICE_PROMPT), {
      recursive: true,
    });
  }
  console.log("SYSTEM_NOTICE_PROMPT, creating...");
  await fs.promises.writeFile(GeminiCli.SYSTEM_NOTICE_PROMPT, notice);

  const meal =
    (await fs.promises.readFile(process.cwd() + "/meal.md", "utf-8")) +
    `

  ## 입력 형식
${JSON.stringify(_.omit(z.toJSONSchema(mealInputSchema), ["$schema"]), null, 2)}

## 출력 형식
${JSON.stringify(
  _.omit(z.toJSONSchema(mealOutputSchema), ["$schema"]),
  null,
  2
)}`;

  if (!(await asyncExist(GeminiCli.SYSTEM_MEAL_PROMPT))) {
    await fs.promises.mkdir(path.dirname(GeminiCli.SYSTEM_MEAL_PROMPT), {
      recursive: true,
    });
  }
  console.log("SYSTEM_MEAL_PROMPT, creating...");
  await fs.promises.writeFile(GeminiCli.SYSTEM_MEAL_PROMPT, meal);
};
