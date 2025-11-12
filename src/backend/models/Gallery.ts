import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    title: { type: String, required: true },
    uid: { type: String, required: true, unique: true },
    price: { type: String, required: true },

    // Updated fields with enums for filtering
    status: { 
      type: String, 
      required: true, 
      enum: ["Sold", "Exhibition", "Available"], 
      default: "Available" 
    },
    state: { 
      type: String, 
      required: true, 
      enum: ["Completed", "In Progress"], 
      default: "In Progress" 
    },

    materials: { type: String },
    duration: { type: String },
    type: { type: String },
    inspiration: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);
