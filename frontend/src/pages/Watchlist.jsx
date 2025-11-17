import React from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "../context/WatchlistContext.jsx";

const Watchlist = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-bold mb-6 text-green-800 text-center">
        Your Watchlist
      </h1>
      {watchlist.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-800 p-6 rounded shadow text-center">
          <span role="img" aria-label="watchlist" className="text-3xl mr-2">
            👀
          </span>
          No products in your watchlist yet.
        </div>
      ) : (
        <div className="space-y-6">
          {watchlist.map((product) => (
            <div
              key={product.id}
              className="flex items-center bg-white rounded shadow p-4 justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <Link
                    to={`/product/${product.id}`}
                    className="text-lg font-semibold text-green-800 hover:text-orange-600"
                  >
                    {product.name}
                  </Link>
                  <div className="text-gray-600 text-sm">
                    {product.category}
                  </div>
                  <div className="text-green-700 font-bold">
                    ₹{product.price}
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeFromWatchlist(product.id)}
                className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
