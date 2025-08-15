
import express from 'express';
import User from '../model/user';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { validate } from '../middlewares/validate';
import { signupSchema, signinSchema } from '../utils/zodSchema';
import { authMiddleware, AuthRequest } from '../middlewares/auth';

const authRouter = express.Router();

authRouter.post("/signup", validate(signupSchema), async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(403).json({ message: "User already exists with this username" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            username,
            password: passwordHash
        });

        const savedUser = await newUser.save();
        const token = await jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
        
        // Set a secure cookie
        res.cookie("token", token)
        //  {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: 'strict'
        // });

        res.status(200).json({ message: "Signed up successfully" });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

authRouter.post("/login", validate(signinSchema), async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username }).select("+password");

        if (!user) {
            return res.status(403).json({ message: "Wrong username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (isPasswordValid) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

            // Set a secure cookie
            res.cookie("token", token,)
            //      {
            //     httpOnly: true,
            //     secure: process.env.NODE_ENV === "production",
            //     sameSite: 'strict'
            // });

            res.status(200).json({ message: "Logged in successfully" });
        } else {
            return res.status(403).json({ message: "Wrong username or password" });
        }

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

authRouter.post('/logout', async (req, res) => {
    res.cookie('token', '', { // Set token to empty
        httpOnly: true,
        expires: new Date(0) // Expire the cookie immediately
    });
    res.status(200).json({ message: "Logged Out Successfully" });
});

authRouter.get('/profile', authMiddleware,async(req:AuthRequest,res)=>{
      try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.send(user);
  } catch (err:any) {
    res.status(500).send("ERROR: " + err.message);
  }
})

export default authRouter;