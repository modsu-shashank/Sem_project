import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
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

const ProductReviews = ({ product }) => {
  const { user, isAuthenticated, getAuthHeaders } = useAuth();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL =
    import.meta?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:5001/api";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/reviews?productClientId=${encodeURIComponent(product.id)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load reviews");
        if (mounted) setReviews(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load reviews");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [API_BASE_URL, product.id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newRating === 0 || newComment.trim() === "") {
      alert("Please provide a rating and a comment.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productClientId: product.id,
          rating: newRating,
          comment: newComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");
      // Prepend or update user's review
      setReviews((prev) => {
        const others = prev.filter((r) => r.user !== user?._id);
        return [data.data, ...others];
      });
      setNewRating(0);
      setNewComment("");
    } catch (e) {
      alert(e.message || "Failed to submit review");
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        Customer Reviews
      </h3>

      {loading && <div className="text-gray-600">Loading reviews...</div>}
      {error && <div className="text-red-600 bg-red-50 p-2 rounded mb-2">{error}</div>}
      <div className="space-y-6">
        {(!loading && reviews.length > 0) ? (
          reviews.map((review) => (
            <div key={review._id} className="border-b pb-4">
              <div className="flex items-center mb-2">
                <p className="font-semibold mr-4">{review.userName || 'User'}</p>
                <StarRating rating={review.rating} clickable={false} />
              </div>
              <p className="text-gray-600 mb-1">{review.comment}</p>
              <p className="text-xs text-gray-400">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
              </p>
            </div>
          ))
        ) : (!loading && (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ))}
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
