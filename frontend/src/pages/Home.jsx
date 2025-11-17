import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ProductCard from "../components/ProductCard.jsx";

const Home = () => {
  const { products, searchProducts } = useProducts();
  const { user, userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize filtered products when products change
  useEffect(() => {
    if (products && products.length > 0) {
      setFilteredProducts(products);
    }
  }, [products]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (!products || products.length === 0) return;

    let filtered = [...products];

    // Apply category filter
    if (selectedCategory !== "All Products") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const searchResults = searchProducts(searchQuery);
      // If category is also selected, filter by both
      if (selectedCategory !== "All Products") {
        filtered = searchResults.filter(
          (product) => product.category === selectedCategory
        );
      } else {
        filtered = searchResults;
      }
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, searchProducts]);

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    const searchParams = new URLSearchParams(location.search);
    if (category === "All Products") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    navigate(`/?${searchParams.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams(location.search);
    if (searchQuery.trim()) {
      searchParams.set("search", searchQuery.trim());
    } else {
      searchParams.delete("search");
    }
    navigate(`/?${searchParams.toString()}`);
  };

  const categories = [
    "All Products",
    "Rice",
    "Millets",
    "Grains",
    "Pulses",
    "Seeds",
  ];

  return (
    <div className="min-h-screen bg-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to RGO Organic Millets
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Discover the finest organic millets, grains, and pulses for a
            healthier lifestyle
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-6 py-3 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                selectedCategory === category
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : selectedCategory}
          </h2>

          {!filteredProducts || filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery
                  ? `No products found for "${searchQuery}"`
                  : "No products available in this category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 py-12">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌾</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              100% Organic
            </h3>
            <p className="text-gray-600">
              Certified organic products from trusted farmers
            </p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Fast Delivery
            </h3>
            <p className="text-gray-600">
              Quick and reliable delivery to your doorstep
            </p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Quality Assured
            </h3>
            <p className="text-gray-600">
              Premium quality products with guaranteed satisfaction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
