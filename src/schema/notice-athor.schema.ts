import { Schema, model, Document } from "mongoose";

// export const NoticeAuthor = model('NoticeAuthors', NoticeAuthorSchema);

// NoticeAuthors 스키마를 미리 정의했다고 가정하고,
// ObjectId 또는 String으로 참조하는 예시입니다.
export interface INoticeAuthors extends Document {
  name: string;
}

const noticeAuthorSchema = new Schema<INoticeAuthors>(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
); // TypeORM의 TimeStampEntity에 해당하는 옵션

// toJSON 메소드 정의

export const NoticeAuthor = model<INoticeAuthors>(
  "NoticeAuthor",
  noticeAuthorSchema
);
