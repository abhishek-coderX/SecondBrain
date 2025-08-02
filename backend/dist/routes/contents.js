"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const zodSchema_1 = require("../utils/zodSchema");
const content_1 = __importDefault(require("../model/content"));
// import Tag from '../model/tag';
const contentRouter = (0, express_1.Router)();
contentRouter.use(auth_1.authMiddleware);
contentRouter.post("/content", (0, validate_1.validate)(zodSchema_1.createContentSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, type, link, tags } = req.body;
        const userId = req.userId;
        //   const userTags = await Tag.find({ _id: { $in: tags }, userId });
        //   if (userTags.length !== tags.length) {
        //     return res
        //       .status(400)
        //       .json({
        //         message: "One or more tags are invalid or do not belong to you.",
        //       });
        //   }
        const newContent = new content_1.default({
            title,
            type,
            link,
            tags: tags || [],
            userId,
        });
        const savedContent = yield newContent.save();
        res.status(201).json({ message: "content added successfully" });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Duplicate title." });
        }
        console.error("Error creating content:", error);
        res.status(500).json({ message: "Server error while creating content." });
    }
}));
contentRouter.get("/content", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const contents = yield content_1.default.find({ userId })
            .populate("userId", "username")
            .sort({ createdAt: -1 });
        res.status(200).json(contents);
    }
    catch (error) {
        res.status(500).json({ message: "Server error while fetching content." });
    }
}));
contentRouter.delete("/content/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contentId = req.params.id;
        const userId = req.userId;
        const result = yield content_1.default.deleteOne({ _id: contentId, userId: userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Content not found." });
        }
        res.status(200).json({ message: "Content deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ message: "Server error while deleting content." });
    }
}));
exports.default = contentRouter;
