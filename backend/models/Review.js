import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productClientId: {
    type: String,
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userName: {
    type: String,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 500,
  },
}, { timestamps: true });

reviewSchema.index({ productClientId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
