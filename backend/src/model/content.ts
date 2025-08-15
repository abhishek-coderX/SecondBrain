import mongoose, { Types } from "mongoose";

const contentTypes = ["youtube", "twitter", "article"];

const contentSchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: contentTypes,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    tags: [{ type: Types.ObjectId, ref: "Tag" }],
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Content", contentSchema);
