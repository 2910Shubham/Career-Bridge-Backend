import Post from '../models/postsModel.js';
import User from '../models/usermodel.js';
import mongoose from 'mongoose';

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { content, images, visibility } = req.body;
        const userId = req.user.userId;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        const newPost = new Post({
            userId,
            content,
            images: images || [],
            visibility: visibility || 'public',
        });
        const savedPost = await newPost.save();

        // Add post to user's posts array
        await User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } });

        res.status(201).json({ success: true, message: 'Post created', data: savedPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get all posts (optionally filter by user)
export const getAllPosts = async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { userId } : {};
        const posts = await Post.find(filter).populate('userId', 'username fullname profilePicture').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid post ID' });
        }
        const post = await Post.findById(id).populate('userId', 'username fullname profilePicture');
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Update a post
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid post ID' });
        }
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const { content, images, visibility } = req.body;
        if (content !== undefined) post.content = content;
        if (images !== undefined) post.images = images;
        if (visibility !== undefined) post.visibility = visibility;
        post.updatedAt = new Date();
        const updatedPost = await post.save();
        res.status(200).json({ success: true, message: 'Post updated', data: updatedPost });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Delete a post
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid post ID' });
        }
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        await Post.findByIdAndDelete(id);
        // Remove post from user's posts array
        await User.findByIdAndUpdate(userId, { $pull: { posts: id } });
        res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}; 