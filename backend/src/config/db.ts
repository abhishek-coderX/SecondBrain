import mongoose from "mongoose";

const connectToDb=async()=>{
    mongoose.connect("mongodb://localhost:27017/secondBrain")
}

export default connectToDb