import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Review from '../models/Review.js';

const router = express.Router();

// @desc    Get reviews for a product by productClientId
// @route   GET /api/reviews?productClientId=123
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { productClientId } = req.query;
    if (!productClientId) {
      return res.status(400).json({ success: false, message: 'productClientId is required' });
    }
    const reviews = await Review.find({ productClientId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @desc    Create a review for a product
// @route   POST /api/reviews
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productClientId, rating, comment } = req.body || {};
    if (!productClientId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'productClientId, rating and comment are required' });
    }

    // Optional: prevent duplicate reviews per user per product
    const existing = await Review.findOne({ productClientId, user: req.user._id });
    if (existing) {
      // Update existing review
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
      return res.status(200).json({ success: true, data: existing });
    }

    const review = new Review({
      productClientId,
      user: req.user._id,
      userName: req.user.name || req.user.username || req.user.email,
      rating: Number(rating),
      comment: String(comment),
    });
    await review.save();
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
