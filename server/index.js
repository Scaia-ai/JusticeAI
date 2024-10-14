import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dotevn from "dotenv";
import roleRoute from './routes/role.js'
import authRoute from './routes/auth.js'
import caseRoute from './routes/case.js'
import fileRoute from './routes/file.js'
import justiceaiRoute from './routes/justiceai.js'

import cors from 'cors'
const app = express();
dotevn.config();
const connectMongoDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to Database!");
    }
    catch (error){
        throw error;
    }
}
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(cors());
app.use("/api/role", roleRoute);
app.use("/api/auth", authRoute);
app.use("/api/case", caseRoute);
app.use("/api/file", fileRoute);
app.use("/api/justiceai", justiceaiRoute);

app.use((obj, req, res, next)=>{
    const statusCode = obj.status || 500;
    const message = obj.message || "Something went wrong!";
    return res.status(statusCode).json({
        success: [200,201,204].some(a=> a === obj.status) ? true : false,
        status: statusCode, 
        message: message,
        data: obj.data
    });

})

app.listen('8000', ()=>{
    connectMongoDB();
    console.log("Connected to Backend!");

})