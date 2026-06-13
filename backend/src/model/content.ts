import mongoose, { Types } from "mongoose";

const contentTypes = ["youtube", "twitter", "article", "thought"];

const contentSchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: contentTypes,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    tags: [{ type: Types.ObjectId, ref: "Tag" }],
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
      select: false, // don't return embedding in normal queries (it's large)
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Content", contentSchema);
