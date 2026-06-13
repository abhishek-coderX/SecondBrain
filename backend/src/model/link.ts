

import mongoose, { Schema, Types } from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

export interface ILink extends mongoose.Document {
  hash: string;
  userId: Types.ObjectId;
  contents: Types.ObjectId[];
}

const linkSchema = new Schema<ILink>(
  {
    hash: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(), 
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Content',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Link = mongoose.model<ILink>('Link', linkSchema);
export default Link;
