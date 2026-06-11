import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface CommentDocument extends Document {
  gameId: number;
  user: Types.ObjectId;
  authorName: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<CommentDocument>(
  {
    gameId: { type: Number, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export const Comment: Model<CommentDocument> =
  (mongoose.models.Comment as Model<CommentDocument>) ||
  mongoose.model<CommentDocument>("Comment", CommentSchema);
