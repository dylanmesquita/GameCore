import mongoose, { Schema, Document, Model } from "mongoose";

/** Um jogo salvo na biblioteca do usuário. Guardamos o mínimo da RAWG API. */
export interface SavedGame {
  gameId: number;
  name: string;
  background_image: string;
  rating: number;
  addedAt: Date;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  savedGames: SavedGame[];
  createdAt: Date;
  updatedAt: Date;
}

const SavedGameSchema = new Schema<SavedGame>(
  {
    gameId: { type: Number, required: true },
    name: { type: String, required: true },
    background_image: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    savedGames: { type: [SavedGameSchema], default: [] },
  },
  { timestamps: true }
);

// Evita recompilar o model durante hot-reload do Next.js
export const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", UserSchema);
