//src/app/backend/models/session.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISession extends Document {
  sessionToken: string;
  userId: string;
  userData: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    sessionToken: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userData: {
      id: String,
      name: String,
      email: String,
      createdAt: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create TTL index for automatic session cleanup
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);

export default Session;