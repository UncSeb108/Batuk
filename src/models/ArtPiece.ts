// src/models/ArtPiece.ts
import mongoose, { Schema, models, model } from "mongoose";

const ArtPieceSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number },
    state: { type: String, default: "Available" },
    type: { type: String, required: true },
    image: { type: String, required: true },
    series: { type: String },
    message: { type: String },
    uid: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const ArtPiece = models.ArtPiece || model("ArtPiece", ArtPieceSchema);
export default ArtPiece;
