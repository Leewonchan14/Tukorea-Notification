import dayjs from "dayjs";
import { Document, Schema, model } from "mongoose";

export interface ISchoolMeal extends Document {
  src: string;
  place?: string;
  createdAt: dayjs.Dayjs;
  updatedAt: dayjs.Dayjs;
  rawLabel?: string;
  description?: string;
}

const schoolMealSchema = new Schema<ISchoolMeal>(
  {
    src: {
      type: String,
      required: true,
    },
    place: {
      type: String,
    },
    rawLabel: {
      type: String,
    },
    description: {
      type: String,
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

export const SchoolMeal = model<ISchoolMeal>("SchoolMeal", schoolMealSchema);
