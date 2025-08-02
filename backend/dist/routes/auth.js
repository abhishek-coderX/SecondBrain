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
const user_1 = __importDefault(require("../model/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validate_1 = require("../middlewares/validate");
const zodSchema_1 = require("../utils/zodSchema");
const authRouter = express_1.default.Router();
authRouter.post("/signup", (0, validate_1.validate)(zodSchema_1.signupSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const existingUser = yield user_1.default.findOne({ username });
        if (existingUser) {
            return res.status(403).json({ message: "User already exists with this username" });
        }
        const passwordHash = yield bcrypt_1.default.hash(password, 10);
        const newUser = new user_1.default({
            username,
            password: passwordHash
        });
        const savedUser = yield newUser.save();
        const token = yield jsonwebtoken_1.default.sign({ userId: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Set a secure cookie
        res.cookie("token", token);
        //  {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: 'strict'
        // });
        res.status(200).json({ message: "Signed up successfully" });
    }
    catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
authRouter.post("/login", (0, validate_1.validate)(zodSchema_1.signinSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield user_1.default.findOne({ username }).select("+password");
        if (!user) {
            return res.status(403).json({ message: "Wrong username or password" });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (isPasswordValid) {
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            // Set a secure cookie
            res.cookie("token", token);
            //      {
            //     httpOnly: true,
            //     secure: process.env.NODE_ENV === "production",
            //     sameSite: 'strict'
            // });
            res.status(200).json({ message: "Logged in successfully" });
        }
        else {
            return res.status(403).json({ message: "Wrong username or password" });
        }
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
authRouter.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0) // Expire the cookie immediately
    });
    res.status(200).json({ message: "Logged Out Successfully" });
}));
exports.default = authRouter;
