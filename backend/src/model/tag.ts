import mongoose, { Types } from "mongoose";

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  }
});

tagSchema.index({ name: 1, userId: 1 }, { unique: true });

export default mongoose.model("Tag", tagSchema);