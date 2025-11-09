import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    title: { type: String, required: true },
    uid: { type: String, required: true, unique: true },
    price: { type: String, required: true },
    status: { type: String, required: true },
    state: { type: String, required: true },
    materials: { type: String },
    duration: { type: String },
    type: { type: String },
    inspiration: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);
