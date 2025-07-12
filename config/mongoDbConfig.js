import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();    

console.log("Current NODE_ENV:", process.env.NODE_ENV);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(function(){
        console.log("MongoDB connected successfully");
    })
    .catch(function(err){
        console.error("MongoDB connection error:", err);
    })

export default mongoose.connection;