import mongoose from "mongoose";

const jopSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true,
    },
    jobDescription: {   
        type: String,
        required: true,
    },
    jobLocation: {
        type: String,   
        required: true,
    },
    jobType: {
        type: String,
        required: true,
        enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
    },
    salaryRange: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    companyDescription: {
        type: String,
        default: null,
    },
    companyWebsite: {
        type: String,
        default: null,
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    skillsRequired: {
        type: [String],
        default: [],
    },
    applicationDeadline: {
        type: Date,
        required: true,         
    },
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    jobStatus: {
        type: String,
        required: true, 
        enum: ['Open', 'Closed', 'Pending'],
        default: 'Open',
    },
    totalApplications: {
        type: Number,
        default: 0,
    },  
});

const Job = mongoose.model('Job', jopSchema);

export default Job;