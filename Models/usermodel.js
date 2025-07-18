import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    // Basic User Information
    username: {
        type: String,
        required: true,
        unique: true,
    },
    fullname: {
        type: String,
        required: true,
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

    // Profile Information
    profilePicture: {   
        type: String,
        default: "Images/deafult.png",
    },
    bio: {
        type: String,
        default: null,
    },
    location: {
        type: String,
        default: null,
    },
    dateOfBirth: {
        type: Date,
        default: null,
    },
    phoneNumber: {
        type: String,
        default: ''
    },

    // Education & Experience
    education: [{
        degree: String,
        institution: String,    
        startDate: Date,
        endDate: Date,
        current: {
            type: Boolean,
            default: false
        }
    }],
    experience: [{
        jobTitle: String,
        company: String,        
        startDate: Date,
        endDate: Date,
        current: {
            type: Boolean,
            default: false
        },
        description: String,
    }],

    // Social Links
    socialLinks: {
        linkedin: String,
        github: String,
        twitter: String,
        personalWebsite: String,
    },

    // Verification & Security
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

    // Notifications
    notifications: [{
        message: String,
        date: {
            type: Date,
            default: Date.now,
        },
        read: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            enum: ['info', 'success', 'warning', 'error'],
            default: 'info'
        }
    }],

    // Account Status
    isActive: {
        type: Boolean,
        default: true,  
    },
    lastLogin: {
        type: Date,
        default: null,
    },

    // Skills & Achievements (for all users)
    skills: {
        type: [String], 
        default: [],
    },
    achievements: [{
        title: String,
        description: String,
        date: {
            type: Date,
            default: Date.now
        },
        category: {
            type: String,
            enum: ['academic', 'professional', 'personal', 'award', 'certification'],
            default: 'personal'
        },
        icon: String, // emoji or icon identifier
        verified: {
            type: Boolean,
            default: false
        }
    }],

    // Posts & Social Features
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],

    // Student-specific fields
    studentInfo: {
        university: String,
        major: String,
        graduationYear: Number,
        currentYear: {
            type: String,
            enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Alumni']
        },
        gpa: Number,
        academicStanding: {
            type: String,
            enum: ['Good Standing', 'Academic Probation', 'Dean\'s List', 'Honors']
        },
        internships: [{
            company: String,
            position: String,
            startDate: Date,
            endDate: Date,
            description: String,
            skills: [String]
        }],
        projects: [{
            title: String,
            description: String,
            technologies: [String],
            githubUrl: String,
            liveUrl: String,
            image: String,
            date: {
                type: Date,
                default: Date.now
            }
        }],
        certifications: [{
            name: String,
            issuer: String,
            date: Date,
            expiryDate: Date,
            credentialId: String,
            url: String
        }],
        languages: [{
            language: String,
            proficiency: {
                type: String,
                enum: ['Beginner', 'Intermediate', 'Advanced', 'Native']
            }
        }]
    },

    jobPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],

    // Recruiter-specific fields
    recruiterInfo: {
        companyName: String,
        companyDescription: String,
        companyWebsite: String,
        companyLogo: String,
        department: String,
        designation: String,
        hiringAuthority: {
            type: Boolean,
            default: false
        },
       
        hiringStats: {
            totalJobPosts: {
                type: Number,
                default: 0
            },
            totalApplications: {
                type: Number,
                default: 0
            },
            successfulHires: {
                type: Number,
                default: 0
            },
            averageTimeToHire: {
                type: Number, // in days
                default: 0
            }
        }
    },

    // Connections & Networking
    connections: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'blocked'],
            default: 'pending'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],

    // Job Applications (for students)
    jobApplications: [{
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'JobPost'
        },
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['Applied', 'Screening', 'Interviewing', 'Offer Sent', 'Hired', 'Rejected'],
            default: 'Applied'
        },
        appliedDate: {
            type: Date,
            default: Date.now
        },
        resume: String,
        coverLetter: String,
        notes: String
    }],

    // Profile Views & Analytics
    profileViews: [{
        viewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],

    // Settings & Preferences
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        },
        profileVisibility: {
            type: String,
            enum: ['public', 'connections', 'private'],
            default: 'public'
        },
        jobAlerts: {
            type: Boolean,
            default: true
        },
        newsletter: {
            type: Boolean,
            default: false
        }

    }
});

// Update the updatedAt field on save
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model.User || mongoose.model("User", userSchema, "users");

export default User;