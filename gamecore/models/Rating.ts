import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface RatingDocument extends Document {
  gameId: number;
  user: Types.ObjectId;
  value: number; // 1..5 estrelas
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<RatingDocument>(
  {
    gameId: { type: Number, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

// Cada usuário tem no máximo uma nota por jogo.
RatingSchema.index({ gameId: 1, user: 1 }, { unique: true });

export const Rating: Model<RatingDocument> =
  (mongoose.models.Rating as Model<RatingDocument>) ||
  mongoose.model<RatingDocument>("Rating", RatingSchema);
