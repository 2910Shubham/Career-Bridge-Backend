import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

// Create reusable transporter using SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Send verification email
export const sendVerificationEmail = async (to, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${token}`;
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'no-reply@careerbridge.com',
        to,
        subject: 'Verify your email address',
        html: `<p>Thank you for registering!</p>
               <p>Please verify your email by clicking the link below:</p>
               <a href="${verificationUrl}">${verificationUrl}</a>
               <p>If you did not create an account, you can ignore this email.</p>`
    };
    await transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (to, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'no-reply@careerbridge.com',
        to,
        subject: 'Reset your password',
        html: `<p>You requested a password reset.</p>
               <p>Click the link below to reset your password. This link is valid for 1 hour:</p>
               <a href="${resetUrl}">${resetUrl}</a>
               <p>If you did not request a password reset, you can ignore this email.</p>`
    };
    await transporter.sendMail(mailOptions);
};
