import dayjs from "dayjs";
import { Document, Schema, model } from "mongoose";

export interface IShuttles extends Document {
  src: string;
  place: "본교 ↔ 정왕역" | "제2캠퍼스 ↔ 본교 ↔ 정왕역";
  createdAt: dayjs.Dayjs;
  updatedAt: dayjs.Dayjs;
}

const shuttleSchema = new Schema<IShuttles>(
  {
    src: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      enum: ["본교 ↔ 정왕역", "제2캠퍼스 ↔ 본교 ↔ 정왕역"],
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

export const Shuttle = model<IShuttles>("Shuttle", shuttleSchema);
