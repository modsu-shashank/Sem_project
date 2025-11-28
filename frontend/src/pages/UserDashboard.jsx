import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { ShoppingCart, ShoppingBag, Trash2 } from "lucide-react";

const UserDashboard = () => {
  const { user, isAuthenticated, getAuthHeaders } = useAuth();
  const { items, totalItems, totalPrice, removeFromCart, clearCart } = useCart();
  const [ordersCount, setOrdersCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL =
    import.meta?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:5001/api";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/orders`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load orders");
        }
        const list = Array.isArray(data.data) ? data.data : [];
        setOrders(list);
        setOrdersCount(list.length);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [API_BASE_URL, getAuthHeaders]);

  const cartLines = useMemo(() => items || [], [items]);

  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome{user ? `, ${user.username || user.firstName || "User"}` : ""}</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Orders</div>
            <div className="text-3xl font-bold">{loadingOrders ? "..." : ordersCount}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Cart Items</div>
            <div className="text-3xl font-bold">{totalItems}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Cart Total</div>
            <div className="text-3xl font-bold">₹{totalPrice.toFixed(2)}</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        {/* Cart Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Your Cart
            </h2>
            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Go to Cart
              </Link>
              <button
                onClick={clearCart}
                className="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {cartLines.length === 0 ? (
            <div className="text-gray-600">No items in your cart.</div>
          ) : (
            <div className="space-y-3">
              {cartLines.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedGrade.name}`}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-gray-600">
                        Grade: {item.selectedGrade.name} • Qty: {item.quantity} • ₹
                        {((item.selectedGrade?.price ?? item.product.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      removeFromCart(`${item.product.id}-${item.selectedGrade.name}`)
                    }
                    className="text-red-500 hover:text-red-700"
                    title="Remove"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <ShoppingBag className="h-5 w-5" /> Orders ({ordersCount})
          </h2>
          {orders.length === 0 ? (
            <p className="text-gray-600 mb-4">You have no orders yet.</p>
          ) : (
            <div className="space-y-3 mb-4">
              {orders.slice(0, 5).map((o) => (
                <div key={o._id} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{o.orderNumber || o._id}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(o.createdAt).toLocaleString()} • {o.items?.length || 0} items
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{Number(o.total || 0).toFixed(2)}</div>
                      <div className="text-sm text-gray-600 capitalize">{o.paymentStatus}</div>
                    </div>
                  </div>
                  {Array.isArray(o.items) && o.items.length > 0 && (
                    <div className="mt-3 border-t pt-3 space-y-2">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="text-gray-800">
                            {it.name}
                            {it.selectedGrade ? (
                              <span className="text-gray-600"> • Grade: {it.selectedGrade}</span>
                            ) : null}
                            <span className="text-gray-600"> • Qty: {it.quantity}</span>
                          </div>
                          <div className="font-medium">₹{Number(it.total ?? (it.price * it.quantity)).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Link
              to="/orders"
              className="inline-block px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              View all orders
            </Link>
            <Link
              to="/checkout"
              className="inline-block px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600"
            >
              Continue Shopping / Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
