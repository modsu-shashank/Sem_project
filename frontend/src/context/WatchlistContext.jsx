import React, { createContext, useContext, useState } from "react";

const WatchlistContext = createContext(undefined);

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("rgo_watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  const addToWatchlist = (product) => {
    setWatchlist((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      const updated = [...prev, product];
      localStorage.setItem("rgo_watchlist", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromWatchlist = (productId) => {
    setWatchlist((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      localStorage.setItem("rgo_watchlist", JSON.stringify(updated));
      return updated;
    });
  };

  const isInWatchlist = (productId) =>
    watchlist.some((p) => p.id === productId);

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};
