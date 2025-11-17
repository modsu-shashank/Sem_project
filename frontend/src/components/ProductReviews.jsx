import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Star } from "lucide-react";

const StarRating = ({ rating, onRate, clickable = true }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          } ${clickable ? "cursor-pointer" : ""}`}
          onClick={() => clickable && onRate(star)}
        />
      ))}
    </div>
  );
};

const ProductReviews = ({ product, onAddReview }) => {
  const { user, isAuthenticated } = useAuth();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (newRating === 0 || newComment.trim() === "") {
      alert("Please provide a rating and a comment.");
      return;
    }

    const reviewData = {
      userId: user.id,
      userName: user.name || "Anonymous",
      rating: newRating,
      comment: newComment,
    };

    onAddReview(product.id, reviewData);

    setNewRating(0);
    setNewComment("");
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        Customer Reviews
      </h3>

      <div className="space-y-6">
        {product.reviews && product.reviews.length > 0 ? (
          product.reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center mb-2">
                <p className="font-semibold mr-4">{review.userName}</p>
                <StarRating rating={review.rating} clickable={false} />
              </div>
              <p className="text-gray-600 mb-1">{review.comment}</p>
              <p className="text-xs text-gray-400">
                {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>

      {isAuthenticated && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h4 className="text-xl font-semibold mb-4">Write a Review</h4>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Rating</label>
              <StarRating rating={newRating} onRate={setNewRating} />
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="block text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="4"
                className="w-full p-2 border rounded-md"
                placeholder="Share your thoughts on this product..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Submit Review
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
