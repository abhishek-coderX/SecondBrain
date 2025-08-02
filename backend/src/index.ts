import express from 'express'
import mongoose from 'mongoose'
import connectToDb from "./config/db"
import authRouter from './routes/auth'
import dotenv from "dotenv"
import contentRouter from './routes/contents'
import shareRouter from './routes/share'
import cookieParser from 'cookie-parser';

dotenv.config()

const app=express()
app.use(express.json())
app.use(cookieParser());


app.use('/', authRouter);
app.use('/',contentRouter)
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