import { Document, Schema, model } from "mongoose";
import { INoticeAuthors } from "./notice-athor.schema";
import dayjs from "dayjs";

export interface IDormitoryNotice extends Document {
  id: string;
  href: string;
  title: string;
  author: INoticeAuthors; // 또는 mongoose.Schema.Types.ObjectId;
  postedAt: string;
  createdAt: dayjs.Dayjs;
  updatedAt: dayjs.Dayjs;
}

const dormitoryNoticeSchema = new Schema<IDormitoryNotice>(
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

export const DormitoryNotice = model<IDormitoryNotice>(
  "DormitoryNotice",
  dormitoryNoticeSchema
);
