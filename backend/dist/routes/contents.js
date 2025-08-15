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
const tag_1 = __importDefault(require("../model/tag"));
const contentRouter = (0, express_1.Router)();
contentRouter.use(auth_1.authMiddleware);
contentRouter.post("/content", (0, validate_1.validate)(zodSchema_1.createContentSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, type, link, tags, description, thumbnail } = req.body;
        const userId = req.userId;
        const tagIds = yield Promise.all((tags || []).map((tagName) => __awaiter(void 0, void 0, void 0, function* () {
            const name = tagName.toLowerCase().trim();
            let tag = yield tag_1.default.findOne({ name, userId });
            if (!tag) {
                tag = new tag_1.default({ name, userId });
                yield tag.save();
            }
            return tag._id;
        })));
        const newContent = new content_1.default({
            title, type, link, description, thumbnail,
            tags: tagIds,
            userId,
        });
        const savedContent = yield newContent.save();
        const populatedContent = yield content_1.default.findById(savedContent._id)
            .populate("userId", "username")
            .populate("tags", "name");
        res.status(201).json(populatedContent);
    }
    catch (error) {
        console.error("Error creating content:", error);
        res.status(500).json({ message: "Server error while creating content." });
    }
}));
contentRouter.get("/content", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const contents = yield content_1.default.find({ userId })
            .populate("userId", "username")
            .populate("tags", "name")
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
