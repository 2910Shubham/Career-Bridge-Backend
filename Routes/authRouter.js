import express from 'express';
import { register, login, logout, resendVerificationEmail, forgotPassword, changePassword, verifyEmail }  from '../Controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', changePassword);

export default router;