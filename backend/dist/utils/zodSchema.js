"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareSchema = exports.createContentSchema = exports.signinSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const passwordValidation = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,20}$/);
exports.signupSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .nonempty("Username is required")
        .min(3, "Username must be between 3 and 10 characters")
        .max(10, "Username must be between 3 and 10 characters"),
    password: zod_1.z
        .string()
        .nonempty("Password is required")
        .regex(passwordValidation, {
        message: 'Password must be 8-20 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }),
});
exports.signinSchema = zod_1.z.object({
    username: zod_1.z.string().nonempty("Username is required"),
    password: zod_1.z.string().nonempty("Password is required"),
});
exports.createContentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(300),
    type: zod_1.z.enum(['image', 'video', 'article', 'audio']),
    link: zod_1.z.url({ message: "A valid link URL is required" }),
    tags: zod_1.z.array(zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
        message: "Invalid tag ID format"
    })).optional().default([]),
});
exports.shareSchema = zod_1.z.object({
    share: zod_1.z.boolean(),
});
