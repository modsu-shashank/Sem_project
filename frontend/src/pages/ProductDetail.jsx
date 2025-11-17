import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useWatchlist } from "../context/WatchlistContext.jsx";
import { Star, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
// ✅ IMPORT: Make sure to import the ProductReviews component if you use it here
import ProductReviews from "../components/ProductReviews.jsx";

const ProductDetail = () => {
  const { id } = useParams();
  // ✅ MODIFIED: Destructure addReview to pass to the reviews component
  const { products, addReview } = useProducts();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  // ✅ ADDED: State to manage the selected grade
  const [selectedGrade, setSelectedGrade] = useState(null);

  useEffect(() => {
    if (products && products.length > 0) {
      const foundProduct = products.find((p) => p.id === id);
      setProduct(foundProduct);
      // ✅ ADDED: Set the initial selected grade to the first one available
      if (
        foundProduct &&
        foundProduct.grades &&
        foundProduct.grades.length > 0
      ) {
        setSelectedGrade(foundProduct.grades[0]);
      }
    }
  }, [id, products]);

  // ✅ MODIFIED: Pass the selectedGrade to the cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert("Please login or sign up to add items to cart!");
      navigate("/login");
      return;
    }
    addToCart(product, selectedGrade, quantity);
  };

  // ✅ MODIFIED: Pass the selectedGrade to the cart before checkout
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert("Please login or sign up to purchase items!");
      navigate("/login");
      return;
    }
    addToCart(product, selectedGrade, quantity);
    navigate("/checkout");
  };

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      alert("Please login or sign up to add items to watchlist!");
      navigate("/login");
      return;
    }

    if (isInWatchlist(product.id)) {
      removeFromWatchlist(product.id);
    } else {
      addToWatchlist(product);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  // ✅ MODIFIED: Updated loading check for product and selectedGrade
  if (!product || !selectedGrade) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Products
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-3">
                    {renderStars(product.rating || 0)}
                  </div>
                  <span className="text-lg text-gray-600">
                    {product.rating ? product.rating.toFixed(1) : "0.0"} out of
                    5
                  </span>
                </div>
              </div>

              <div>
                {/* ✅ MODIFIED: Display price from selectedGrade state */}
                <h2 className="text-2xl font-bold text-orange-600 mb-2">
                  ₹{selectedGrade.price}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* ✅ ADDED: Grade Selector Dropdown */}
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="grade-select"
                  className="text-gray-700 font-medium"
                >
                  Grade:
                </label>
                <select
                  id="grade-select"
                  value={selectedGrade.name}
                  onChange={(e) => {
                    const newGrade = product.grades.find(
                      (g) => g.name === e.target.value
                    );
                    setSelectedGrade(newGrade);
                  }}
                  className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg"
                >
                  {product.grades.map((grade) => (
                    <option key={grade.name} value={grade.name}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-gray-700 font-medium">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleWatchlistToggle}
                  className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                    isInWatchlist(product.id)
                      ? "border-red-500 text-red-500 hover:bg-red-50"
                      : "border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isInWatchlist(product.id) ? "fill-current" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Product Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">{product.category}</span>
                  </div>
                  <div>
                    {/* ✅ MODIFIED: Display grade from selectedGrade state */}
                    <span className="text-gray-600">Grade:</span>
                    <span className="ml-2 font-medium">
                      {selectedGrade.name}
                    </span>
                  </div>
                  <div>
                    {/* ✅ MODIFIED: Display price from selectedGrade state */}
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-2 font-medium">
                      ₹{selectedGrade.price} per kg
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rating:</span>
                    <span className="ml-2 font-medium">
                      {product.rating ? product.rating.toFixed(1) : "0.0"} / 5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ ADDED: Customer Reviews Section */}
        <div className="mt-8">
          <ProductReviews product={product} onAddReview={addReview} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
