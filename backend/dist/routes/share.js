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
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const zodSchema_1 = require("../utils/zodSchema");
const link_1 = __importDefault(require("../model/link"));
const user_1 = __importDefault(require("../model/user"));
const content_1 = __importDefault(require("../model/content"));
const shareRouter = express_1.default.Router();
shareRouter.post('/share', auth_1.authMiddleware, (0, validate_1.validate)(zodSchema_1.shareSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { share } = req.body;
        if (share) {
            let newlink = yield link_1.default.findOne({ userId });
            if (!newlink) {
                newlink = new link_1.default({ userId });
                yield newlink.save();
            }
            const shareableLink = `${req.protocol}://${req.get('host')}/share/${newlink.hash}`;
            return res.status(200).json({
                link: shareableLink,
            });
        }
        else {
            yield link_1.default.deleteOne({ userId });
            return res.status(200).json({ message: 'Sharing  disabled.' });
        }
    }
    catch (error) {
        console.error("Error updating share settings:", error);
        res.status(500).json({ message: 'Server error.' });
    }
}));
shareRouter.get('/share/:shareLink', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shareLink } = req.params;
        const newLink = yield link_1.default.findOne({ hash: shareLink });
        if (!newLink) {
            return res.status(404).json({ message: 'link is invalid or sharing is disabled.' });
        }
        const userData = yield user_1.default.findById(newLink.userId);
        if (!userData) {
            return res.status(404).json({ message: 'user not be found.' });
        }
        const data = yield content_1.default.find({ userId: newLink.userId });
        //  .populate('tags', 'title')
        //  .sort({ createdAt: -1 });
        const formattedContent = data.map(item => ({
            id: item._id,
            type: item.type,
            link: item.link,
            title: item.title,
            // tags: item.tags.map((tag: any) => tag.title) 
        }));
        res.status(200).json({
            username: userData.username,
            content: formattedContent,
        });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Server error.' });
    }
}));
exports.default = shareRouter;
