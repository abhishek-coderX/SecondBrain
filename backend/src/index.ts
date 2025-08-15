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
dotenv.config()

const app=express()

const frontendURL = "http://localhost:5173"; 

app.use(cors({
  origin:frontendURL,
  credentials:true
}))
app.use(express.json())
app.use(cookieParser());


app.use('/', authRouter);
app.use('/',contentRouter)
app.use('/', tagRouter);
app.use('/', shareRouter)


connectToDb().then(()=>{
  console.log("connected to database");
  app.listen(4000,()=>{
    console.log("server running on port 4000");
  })
})
.catch((err:any)=>{
  console.log(err);
})