import dotenv from 'dotenv';
dotenv.config();

import db from './config/mongoDbConfig.js';
import indexRouter from './routes/indexRouter.js';
import userRouter from './routes/userRouter.js';
import adminRouter from './routes/adminRouter.js';
import authRouter from './routes/authRouter.js';
import express from 'express';
import path from 'path';
// import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => {
//     console.log('MongoDB connected successfully');
// }).catch((err) => {
//     console.error('MongoDB connection error:', err);
// });

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());


app.use('/', indexRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);


app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});

