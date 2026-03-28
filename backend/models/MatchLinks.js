import mongoose from "mongoose";

const MatchLinksSchema = new mongoose.Schema(
  {
    matchId: { type: String, required: true, unique: true, trim: true, index: true },
    links: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const MatchLinks = mongoose.models.MatchLinks || mongoose.model("MatchLinks", MatchLinksSchema);

