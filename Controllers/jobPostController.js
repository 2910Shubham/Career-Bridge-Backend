import Job from '../models/jobModel.js';
import mongoose from 'mongoose';
import User from '../models/usermodel.js';

// Create a new job post
export const createJob = async (req, res) => {
    try {
        const {
            jobTitle,
            jobDescription,
            jobLocation,
            jobType,
            salaryRange,
            companyName,
            companyDescription,
            companyWebsite,
            skillsRequired,
            applicationDeadline,
            jobStatus
        } = req.body;

        // Get recruiter ID from authenticated user (assuming you have auth middleware)
        const recruiterId = req.user.userId; // Adjust based on your auth implementation

        // Validate required fields
        if (!jobTitle || !jobDescription || !jobLocation || !salaryRange || !companyName || !applicationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Validate application deadline is in the future
        const deadline = new Date(applicationDeadline);
        if (deadline <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Application deadline must be in the future'
            });
        }

        // Create new job
        const newJob = new Job({
            jobTitle,
            jobDescription,
            jobLocation,
            jobType: jobType || 'Full-time',
            salaryRange,
            companyName,
            companyDescription,
            companyWebsite,
            recruiterId,
            skillsRequired: skillsRequired || [],
            applicationDeadline: deadline,
            jobStatus: jobStatus || 'Open'
        });

        const savedJob = await newJob.save();

        // Add job to recruiter's jobPosts array
        await User.findByIdAndUpdate(
            recruiterId,
            { $push: { jobPosts: savedJob._id } }
        );
     
        res.status(201).json({
            success: true,
            message: 'Job post created successfully',
            data: savedJob
        });

    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating job post',
            error: error.message
        });
    }
};

// Get all job posts with optional filters
export const getAllJobs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            jobType,
            jobLocation,
            jobStatus,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (jobType) filter.jobType = jobType;
        if (jobLocation) filter.jobLocation = { $regex: jobLocation, $options: 'i' };
        if (jobStatus) filter.jobStatus = jobStatus;
        
        // Search functionality
        if (search) {
            filter.$or = [
                { jobTitle: { $regex: search, $options: 'i' } },
                { jobDescription: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { skillsRequired: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get jobs with pagination and recruiter populated
        const jobs = await Job.find(filter)
            .populate('recruiterId', 'username fullname email profilePicture')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalJobs = await Job.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: jobs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalJobs / limit),
                totalJobs,
                hasNext: page < Math.ceil(totalJobs / limit),
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching jobs',
            error: error.message
        });
    }
};

// Get single job post by ID
export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        const job = await Job.findById(id)
            .populate('recruiterId', 'username fullname email profilePicture')
            .populate('applicants', 'name email');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        res.status(200).json({
            success: true,
            data: job
        });

    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching job',
            error: error.message
        });
    }
};

// Update job post
export const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const recruiterId = req.user.userId; // From auth middleware

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        // Find the job
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        // Check if the recruiter owns this job
        if (job.recruiterId.toString() !== recruiterId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this job post'
            });
        }

        // Validate application deadline if provided
        if (req.body.applicationDeadline) {
            const deadline = new Date(req.body.applicationDeadline);
            if (deadline <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Application deadline must be in the future'
                });
            }
        }

        // Update job with new data
        const updatedJob = await Job.findByIdAndUpdate(
            id,
            { 
                ...req.body,
                updatedAt: new Date()
            },
            { 
                new: true, 
                runValidators: true 
            }
        ).populate('recruiterId', 'name email');

        res.status(200).json({
            success: true,
            message: 'Job post updated successfully',
            data: updatedJob
        });

    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating job',
            error: error.message
        });
    }
};

// Delete job post
export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const recruiterId = req.user.userId; // From auth middleware

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        // Find the job
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        // Check if the recruiter owns this job
        if (job.recruiterId.toString() !== recruiterId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this job post'
            });
        }

        await Job.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Job post deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting job',
            error: error.message
        });
    }
};

// Get jobs posted by a specific recruiter
export const getJobsByRecruiter = async (req, res) => {
    try {
        const recruiterId = req.user.userId; // From auth middleware
        const { page = 1, limit = 10, jobStatus } = req.query;

        // Build filter
        const filter = { recruiterId };
        if (jobStatus) filter.jobStatus = jobStatus;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get jobs
        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const totalJobs = await Job.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: jobs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalJobs / limit),
                totalJobs,
                hasNext: page < Math.ceil(totalJobs / limit),
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching recruiter jobs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching recruiter jobs',
            error: error.message
        });
    }
};

// Update job status (Open/Closed/Pending)
export const updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { jobStatus } = req.body;
        const recruiterId = req.user.userId;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        // Validate status
        if (!['Open', 'Closed', 'Pending'].includes(jobStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job status'
            });
        }

        // Find and update job
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        // Check authorization
        if (job.recruiterId.toString() !== recruiterId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this job status'
            });
        }

        job.jobStatus = jobStatus;
        job.updatedAt = new Date();
        await job.save();

        res.status(200).json({
            success: true,
            message: 'Job status updated successfully',
            data: job
        });

    } catch (error) {
        console.error('Error updating job status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating job status',
            error: error.message
        });
    }
};