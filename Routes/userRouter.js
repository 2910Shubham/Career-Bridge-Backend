import express from "express";
import path from "path";
import isLoggedIn from '../middlewares/isLoggedIn.js';
import { editProfile, getCurrentUserProfile } from '../controllers/editProfileController.js';
import upload from '../config/multer.js';
import User from '../models/usermodel.js';
const router = express.Router();

// Edit user profile (frontend should submit to this route)
router.put('/profile', isLoggedIn, upload.single('profilePicture'), editProfile);

// Get current user profile
router.get('/profile', isLoggedIn, getCurrentUserProfile);

// Upload profile picture
router.post('/profile/upload', isLoggedIn, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    // Update user's profilePicture field
    const userId = req.user.userId;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePicture: req.file.path } },
      { new: true, select: '-password -resetPasswordToken -resetPasswordExpires -verificationToken' }
    );
    res.json({ success: true, imageUrl: req.file.path, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Image upload failed', error: err.message });
  }
});

export default router;