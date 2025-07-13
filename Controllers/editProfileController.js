import User from '../models/usermodel.js'; 
import mongoose from 'mongoose';

export const editProfile = async (req, res) => {
    try {
        // Debug logs
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);

        // Defensive: fallback to empty object if req.body is undefined
        const updateData = req.body || {};

        const userId = req.user.userId; 

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prepare update object
        const updateFields = {};

        // Basic user information
        if (updateData.fullname) updateFields.fullname = updateData.fullname;
        if (updateData.username) {
            // Check if username is already taken by another user
            const existingUser = await User.findOne({ 
                username: updateData.username,
                _id: { $ne: userId }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }
            updateFields.username = updateData.username;
        }
        if (updateData.email) {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ 
                email: updateData.email,
                _id: { $ne: userId }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
            updateFields.email = updateData.email;
        }

        // Profile information
        // Debug log for file and body
        console.log('editProfile req.file:', req.file);
        console.log('editProfile req.body:', updateData);
        if (req.file && req.file.path) {
            updateFields.profilePicture = req.file.path;
        } else if (updateData.profilePicture) {
            updateFields.profilePicture = updateData.profilePicture;
        }
        if (updateData.bio !== undefined) updateFields.bio = updateData.bio;
        if (updateData.location !== undefined) updateFields.location = updateData.location;
        if (updateData.dateOfBirth) updateFields.dateOfBirth = new Date(updateData.dateOfBirth);
        if (updateData.phoneNumber) updateFields.phoneNumber = updateData.phoneNumber;

        // Skills
        if (updateData.skills) {
            updateFields.skills = Array.isArray(updateData.skills) ? updateData.skills : [];
        }

        // Achievements
        if (updateData.achievements) {
            const achievements = updateData.achievements.map(achievement => ({
                title: achievement.title,
                description: achievement.description,
                category: achievement.category || 'personal',
                icon: achievement.icon || '',
                date: achievement.date || new Date(),
                verified: achievement.verified || false
            }));
            updateFields.achievements = achievements;
        }



        // Education
        if (updateData.education) {
            const education = updateData.education.map(edu => ({
                degree: edu.degree,
                institution: edu.institution,
                startDate: edu.startDate ? new Date(edu.startDate) : undefined,
                endDate: edu.endDate ? new Date(edu.endDate) : undefined,
                current: edu.current || false
            }));
            updateFields.education = education;
        }

        // Experience
        if (updateData.experience) {
            const experience = updateData.experience.map(exp => ({
                jobTitle: exp.jobTitle,
                company: exp.company,
                startDate: exp.startDate ? new Date(exp.startDate) : undefined,
                endDate: exp.endDate ? new Date(exp.endDate) : undefined,
                current: exp.current || false,
                description: exp.description || ''
            }));
            updateFields.experience = experience;
        }

        // Social Links
        if (updateData.socialLinks) {
            updateFields.socialLinks = {
                linkedin: updateData.socialLinks.linkedin || '',
                github: updateData.socialLinks.github || '',
                twitter: updateData.socialLinks.twitter || '',
                personalWebsite: updateData.socialLinks.personalWebsite || ''
            };
        }

        // Student-specific information
        if (updateData.studentInfo && user.role === 'student') {
            const studentInfo = {
                university: updateData.studentInfo.university || user.studentInfo?.university,
                major: updateData.studentInfo.major || user.studentInfo?.major,
                graduationYear: updateData.studentInfo.graduationYear || user.studentInfo?.graduationYear,
                currentYear: updateData.studentInfo.currentYear || user.studentInfo?.currentYear,
                gpa: updateData.studentInfo.gpa || user.studentInfo?.gpa,
                academicStanding: updateData.studentInfo.academicStanding || user.studentInfo?.academicStanding
            };
            updateFields.studentInfo = studentInfo;
        }

        // Recruiter-specific information
        if (updateData.recruiterInfo && user.role === 'recruiter') {
            const recruiterInfo = {
                companyName: updateData.recruiterInfo.companyName || user.recruiterInfo?.companyName,
                companyDescription: updateData.recruiterInfo.companyDescription || user.recruiterInfo?.companyDescription,
                companyWebsite: updateData.recruiterInfo.companyWebsite || user.recruiterInfo?.companyWebsite,
                companyLogo: updateData.recruiterInfo.companyLogo || user.recruiterInfo?.companyLogo,
                department: updateData.recruiterInfo.department || user.recruiterInfo?.department,
                designation: updateData.recruiterInfo.designation || user.recruiterInfo?.designation,
                hiringAuthority: updateData.recruiterInfo.hiringAuthority !== undefined 
                    ? updateData.recruiterInfo.hiringAuthority 
                    : user.recruiterInfo?.hiringAuthority || false
            };
            updateFields.recruiterInfo = recruiterInfo;
        }

        // Prepare complete update object with defaults for missing fields
        const completeUpdateFields = {
            ...updateFields,
            // Ensure these fields exist with defaults if they don't exist
            bio: updateFields.bio !== undefined ? updateFields.bio : (user.bio || null),
            location: updateFields.location !== undefined ? updateFields.location : (user.location || null),
            skills: updateFields.skills || user.skills || [],
            achievements: updateFields.achievements || user.achievements || [],
            education: updateFields.education || user.education || [],
            experience: updateFields.experience || user.experience || [],
            socialLinks: updateFields.socialLinks || user.socialLinks || {
                linkedin: '',
                github: '',
                twitter: '',
                personalWebsite: ''
            },
            notifications: updateFields.notifications || user.notifications || [],
            posts: updateFields.posts || user.posts || [],
            connections: updateFields.connections || user.connections || [],
            jobApplications: updateFields.jobApplications || user.jobApplications || [],
            profileViews: updateFields.profileViews || user.profileViews || [],
            preferences: updateFields.preferences || user.preferences || {
                emailNotifications: true,
                pushNotifications: true,
                profileVisibility: 'public',
                jobAlerts: true,
                newsletter: false,
                phoneNumber: ''
            }
        };

        // Add role-specific fields
        if (user.role === 'student') {
            completeUpdateFields.studentInfo = updateFields.studentInfo || user.studentInfo || {
                university: '',
                major: '',
                graduationYear: null,
                currentYear: null,
                gpa: null,
                academicStanding: null,
                internships: [],
                projects: [],
                certifications: [],
                languages: []
            };
        }

        if (user.role === 'recruiter') {
            completeUpdateFields.recruiterInfo = updateFields.recruiterInfo || user.recruiterInfo || {
                companyName: '',
                companyDescription: '',
                companyWebsite: '',
                companyLogo: '',
                department: '',
                designation: '',
                hiringAuthority: false,
                jobPosts: [],
                hiringStats: {
                    totalJobPosts: 0,
                    totalApplications: 0,
                    successfulHires: 0,
                    averageTimeToHire: 0
                }
            };
        }

        // Update the user with complete fields
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: completeUpdateFields },
            { 
                new: true, 
                runValidators: true,
                select: '-password -resetPasswordToken -resetPasswordExpires -verificationToken'
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Failed to update user'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: updatedUser
            }
        });

    } catch (error) {
        console.error('Edit profile error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get current user profile
export const getCurrentUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: user
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Utility function to validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Utility function to validate URL format
const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};










