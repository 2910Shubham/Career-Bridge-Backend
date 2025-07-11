import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../Models/usermodel.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../Utils/emailService.js';

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// Generate Verification Token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const {
            username,
            password,
            email,
            role,
            profilePicture,
            about,
            education,
            experience,
            socialLinks,
            skills,
            companyName,
            companyDescription,
            companyWebsite,
            department,
            designation
        } = req.body;

        // Validate required fields
        if (!username || !password || !email || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, password, email, and role'
            });
        }

        // Validate role
        if (!['student', 'recruiter', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be student, recruiter, or admin'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create user object
        const userData = {
            username,
            password: hashedPassword,
            email,
            role,
            verificationToken,
            updatedAt: new Date()
        };

        // Add optional fields if provided
        if (profilePicture) userData.profilePicture = profilePicture;
        if (about) userData.about = about;
        if (education) userData.education = education;
        if (experience) userData.experience = experience;
        if (socialLinks) userData.socialLinks = socialLinks;

        // Role-specific fields
        if (role === 'student' && skills) {
            userData.skills = skills;
        }

        if (role === 'recruiter') {
            if (companyName) userData.companyName = companyName;
            if (companyDescription) userData.companyDescription = companyDescription;
            if (companyWebsite) userData.companyWebsite = companyWebsite;
            if (department) userData.department = department;
            if (designation) userData.designation = designation;
        }

        // Create user
        const user = new User(userData);
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(user.email, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for verification.',
            data: {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified,
                    profilePicture: user.profilePicture,
                    lastLogin: user.lastLogin
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        // In a stateless JWT system, logout is typically handled client-side
        // by removing the token from storage
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.updatedAt = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        });
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'User is already verified'
            });
        }

        // Generate new verification token
        const verificationToken = generateVerificationToken();
        user.verificationToken = verificationToken;
        user.updatedAt = new Date();
        await user.save();

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending verification email'
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        user.updatedAt = new Date();
        await user.save();

        // Send password reset email
        await sendPasswordResetEmail(user.email, resetToken);

        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing forgot password request'
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide new password'
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.updatedAt = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resetting password'
        });
    }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current password and new password'
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedNewPassword;
        user.updatedAt = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -verificationToken -resetPasswordToken');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user data'
        });
    }
};

// @desc    Deactivate user account
// @route   POST /api/auth/deactivate
// @access  Private
export const deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = false;
        user.updatedAt = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Account deactivated successfully'
        });

    } catch (error) {
        console.error('Deactivate account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deactivating account'
        });
    }
};