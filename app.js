import dotenv from 'dotenv';
dotenv.config();

import db from './config/mongoDbConfig.js';
import indexRouter from './Routes/indexRouter.js';
import userRouter from './Routes/userRouter.js';
import adminRouter from './routes/adminRouter.js';
import authRouter from './routes/authRouter.js';
import jobRouter from './routes/jobRouter.js';

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
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:8080'],
  credentials: true
}));

// Custom middleware to handle both JSON and FormData
app.use((req, res, next) => {
  // Skip JSON parsing for routes that handle file uploads
  if (req.path.includes('/profile') && req.method === 'PUT') {
    return next();
  }
  
  // Apply JSON parsing for other routes
  express.json()(req, res, next);
});

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/job', jobRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});