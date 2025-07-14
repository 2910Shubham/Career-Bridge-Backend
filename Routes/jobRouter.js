import express from 'express';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsByRecruiter,
  updateJobStatus
} from '../controllers/jobPostController.js';

const router = express.Router();

// Create a new job post (Recruiter only)
router.post('/', isLoggedIn, createJob);

// Get all job posts (Public, with filters)
router.get('/', getAllJobs);

// Get a single job post by ID (Public)
router.get('/:id', getJobById);

// Update a job post (Recruiter only)
router.put('/:id', isLoggedIn, updateJob);

// Delete a job post (Recruiter only)
router.delete('/:id', isLoggedIn, deleteJob);

// Get jobs posted by the logged-in recruiter
router.get('/recruiter/me', isLoggedIn, getJobsByRecruiter);

// Update job status (Recruiter only)
router.patch('/:id/status', isLoggedIn, updateJobStatus);

export default router;
