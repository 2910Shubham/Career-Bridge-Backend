import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true, 
    },
    email: {
        type: String,
        required: true, 
        unique: true,
    },
    role: {
        type: String,   
        required: true, 
        enum: ['student', 'recruiter', 'admin'],
    }, 
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,  
    },
    // Shared Fields
    profilePicture: {   
        type: String,
        default: "C:/Users/Shubham2/Desktop/Backend Career Bridge/Public/Images/deafult.png",
    },
    about: {
        type: String,
        default: null,
    },
    education: [{
        degree: String,
        institution: String,    
        startDate: Date,
        endDate: Date,
    }],
    experience: [{
        jobTitle: String,
        company: String,        
        startDate: Date,
        endDate: Date,
        description: String,
    }],
    socialLinks: {
        linkedin: String,
        github: String,
        twitter: String,
        personalWebsite: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        default: null,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
    notifications: [{
        message: String,
        date: {
            type: Date,
            default: Date.now,
        },
        read: {
            type: Boolean,
            default: false,
        }
    }],
    isActive: {
        type: Boolean,
        default: true,  
    },
    lastLogin: {
        type: Date,
        default: null,
    },

    // Role-specific fields (optional based on `role`)
    // Student
    skills: {
        type: [String], 
        default: [],
    },

    // Recruiter
    companyName: {
        type: String,
        default: null,
    },
    companyDescription: {
        type: String,
        default: null,
    },
    companyWebsite: {
        type: String,
        default: null,
    },
    department: {
        type: String,
        default: null,
    },
    designation: {
        type: String,
        default: null,
    },
});

const User = mongoose.model("User", userSchema, "users");

export default User;
