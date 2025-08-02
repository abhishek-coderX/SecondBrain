// import mongoose, { Types } from "mongoose";
// import { customAlphabet } from 'nanoid';
// import tr from "zod/v4/locales/tr.cjs";
// const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);


// export interface ILink extends mongoose.Document {
//   hash: string;
//   userId: Types.ObjectId;
// }
// const linkSchema = new mongoose.Schema({
//   hash: {
//     type: String,
//     required: true,
//     unique: true,
//     default: () => nanoid(),
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//     unique: true,

//   },
// },
// {
//   timestamps:true,
// });

// export default mongoose.model("Link", linkSchema);


import mongoose, { Schema, Types } from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

export interface ILink extends mongoose.Document {
  hash: string;
  userId: Types.ObjectId;
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
      unique: true, 
    },
  },
  {
    timestamps: true,
  }
);

const Link = mongoose.model<ILink>('Link', linkSchema);
export default Link;
