import express from 'express'
import mongoose from 'mongoose'
import connectToDb from "./config/db"
import authRouter from './routes/auth'
import dotenv from "dotenv"
import contentRouter from './routes/contents'
import shareRouter from './routes/share'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import tagRouter from './routes/tags'
import searchRouter from './routes/search'
import askRouter from './routes/ask'
import twitterRouter from './routes/twitter'
dotenv.config()

const app=express()

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.ALLOWED_ORIGIN,
].filter(Boolean) as string[];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS blocked for this origin"));
  },
  credentials:true
}))
app.use(express.json())
app.use(cookieParser());


app.use('/', authRouter);
app.use('/',contentRouter)
app.use('/', tagRouter);
app.use('/', shareRouter)
app.use('/', searchRouter)
app.use('/', askRouter)
app.use('/', twitterRouter)


connectToDb().then(()=>{
  console.log("connected to database");
  app.listen(4000,()=>{
    console.log("server running on port 4000");
  })
})
.catch((err:any)=>{
  console.log(err);
})
