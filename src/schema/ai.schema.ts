import { MAJOR_LIST } from "@/webhook";
import z from "zod";

export const majorSchema = z.enum(MAJOR_LIST.map((major) => major.name));

export const aiInputSchema = z.object({
  author: z.string().describe("공지사항 작성기관"),
  noticeId: z.string().describe("공지사항 아이디"),
  title: z.string().describe("공지사항 제목"),
  content: z.string().describe("공지사항 내용"),
  attachedPictures: z.array(z.string()).describe("첨부된 사진 목록"),
  attachedFileNames: z.array(z.string()).describe("첨부된 파일 제목"),
});

export const aiOutputSchema = z.object({
  description: z
    .string()
    .describe(
      "해당 공지사항의 내용을 분석하여 학생들이 쉽게 이해할 수 있는 설명을 discord webhook으로 보낼수 있게 markdown 형식으로 응답한다. 가독성 좋게 적절한 이모지를 사용한다."
    ),
  majorList: z
    .array(majorSchema)
    .describe(
      "관심있을 만한 학과 목록. 관심있을 만한 학과가 없으면 '모든 학과'를 포함한다."
    ),
});

export const mealInputSchema = z.object({
  rawLabel: z.string().describe("메뉴 이미지의 원본 텍스트"),
  attachedPictures: z.array(z.string()).describe("첨부된 메뉴 이미지 목록"),
});

export const mealOutputSchema = z.object({
  description: z
    .string()
    .describe(
      "학생식당 메뉴 정보를 분석하여 학생들이 쉽게 이해할 수 있는 설명을 discord webhook으로 보낼수 있게 markdown 형식으로 응답한다. 가독성 좋게 적절한 이모지를 사용한다."
    ),
});
