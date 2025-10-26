import { Document, Schema, model } from "mongoose";
import { INoticeAuthors } from "./notice-athor.schema";
import dayjs from "dayjs";

export interface INotice extends Document {
  id: string;
  href: string;
  title: string;
  author: INoticeAuthors; // 또는 mongoose.Schema.Types.ObjectId;
  postedAt: string;
  createdAt: dayjs.Dayjs;
  updatedAt: dayjs.Dayjs;
  content: string;
  description: string;
  majorList: string[];
  attachedPictures: string[]; // 첨부된 사진 src 목록
  attachedFileNames: string[]; // 첨부된 파일 이름 목록
}

const noticeSchema = new Schema<INotice>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    href: {
      type: String,
      required: true,
      maxlength: 2083,
    },
    title: {
      type: String,
      required: true,
      maxlength: 255,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    majorList: {
      type: [String],
      required: true,
      default: [],
    },
    attachedPictures: {
      type: [String],
      required: true,
      default: [],
    },
    attachedFileNames: {
      type: [String],
      required: true,
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "NoticeAuthor",
      required: true,
    },
    postedAt: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: function (v: Date): dayjs.Dayjs {
        return dayjs(v);
      },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      get: function (v: Date): dayjs.Dayjs {
        return dayjs(v);
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Notice = model<INotice>("Notice", noticeSchema);
