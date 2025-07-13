import express from "express";
import path from "path";
import isLoggedIn from '../middlewares/isLoggedIn.js';
import { editProfile, getCurrentUserProfile } from '../controllers/editProfileController.js';
const router = express.Router();

// Edit user profile (frontend should submit to this route)
router.put('/profile', isLoggedIn, editProfile);

// Get current user profile
router.get('/profile', isLoggedIn, getCurrentUserProfile);

export default router;