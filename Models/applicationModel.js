import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // recruiter is still a user
        required: true,
    },
    resume: {
        type: String,
        default: null,
    },
    coverLetter: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted'],
        default: 'Applied',
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        default: null,
    },
    interviewDate: {
        type: Date,
        default: null,
    },
    interviewTime: {
        type: String,   
        default: null,
    },
    feedback: {
        type: String,
        default: null,
    },

});

const Application = mongoose.model('Application', applicationSchema, 'applications');

export default Application;
