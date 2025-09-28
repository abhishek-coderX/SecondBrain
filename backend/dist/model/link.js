"use strict";
// import mongoose, { Types } from "mongoose";
// import { customAlphabet } from 'nanoid';
// import tr from "zod/v4/locales/tr.cjs";
// const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
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
const mongoose_1 = __importStar(require("mongoose"));
const nanoid_1 = require("nanoid");
const nanoid = (0, nanoid_1.customAlphabet)('abcdefghijklmnopqrstuvwxyz0123456789', 10);
const linkSchema = new mongoose_1.Schema({
    hash: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid(),
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    contents: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Content',
        },
    ],
}, {
    timestamps: true,
});
const Link = mongoose_1.default.model('Link', linkSchema);
exports.default = Link;
