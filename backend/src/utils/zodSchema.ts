import { z } from 'zod';
import mongoose from 'mongoose';
const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,20}$/
);

export const signupSchema = z.object({
  username: z
    .string()
    .nonempty("Username is required")
    .min(3, "Username must be between 3 and 10 characters")
    .max(10, "Username must be between 3 and 10 characters"),
  password: z
    .string()
    .nonempty("Password is required")
    .regex(passwordValidation, {
      message: 'Password must be 8-20 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }),
});

export const signinSchema = z.object({
    username: z.string().nonempty("Username is required"),
    password: z.string().nonempty("Password is required"),
});

export const createContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  type: z.enum(['image', 'video', 'article', 'audio']),
  link: z.url({ message: "A valid link URL is required" }), 
  tags: z.array(z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid tag ID format"
  })).optional().default([]),
});

export const shareSchema = z.object({
  share: z.boolean(),
});