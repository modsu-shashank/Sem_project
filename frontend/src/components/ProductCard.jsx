import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Star, ShoppingCart } from "lucide-react";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedGrade, setSelectedGrade] = useState(product.grades[0]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert("Please login or sign up to add items to cart!");
      navigate("/login");
      return;
    }
    addToCart(product, selectedGrade, 1);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert("Please login or sign up to purchase items!");
      navigate("/login");
      return;
    }
    addToCart(product, selectedGrade, 1);
    navigate("/checkout");
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-4 flex-grow flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center mb-3">
          <div className="flex items-center mr-2">
            {renderStars(product.rating || 0)}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating ? product.rating.toFixed(1) : "0.0"}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-orange-600">
            ₹{selectedGrade.price}
          </span>
          <select
            value={selectedGrade.name}
            onChange={(e) => {
              const newGrade = product.grades.find(
                (g) => g.name === e.target.value
              );
              setSelectedGrade(newGrade);
            }}
            className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-md border border-gray-300"
          >
            {product.grades.map((grade) => (
              <option key={grade.name} value={grade.name}>
                Grade: {grade.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add To Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
