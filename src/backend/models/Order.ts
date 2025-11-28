import mongoose from "mongoose";

// Define a clean item schema
const ItemSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  title: { type: String, required: true },
  artist: { type: String, default: "Batuk" },
  price: { type: String, required: true },
  src: { type: String, required: true },
  typeCode: { type: String, default: "ART" },
  materials: { type: String, default: "Not specified" },
  duration: { type: String, default: "Not specified" },
  type: { type: String, default: "Artwork" },
  inspiration: { type: String, default: "Not specified" }
});

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    userId: String,
    name: String,
    email: String,
    phone: String,
  },
  items: [ItemSchema], // Use the subdocument schema
  shippingInfo: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    country: { type: String, default: "Kenya" },
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ["mpesa"],
      default: "mpesa",
    },
    transactionCode: String,
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    amount: Number,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  total: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

// Delete any existing model to avoid conflicts
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.model("Order", OrderSchema);
