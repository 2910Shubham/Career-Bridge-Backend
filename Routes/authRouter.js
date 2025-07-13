import express from 'express';
import { register, login, logout, resendVerificationEmail, forgotPassword, changePassword, verifyEmail, getCurrentUser }  from '../Controllers/authController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', isLoggedIn, getCurrentUser);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', isLoggedIn, changePassword);

export default router;