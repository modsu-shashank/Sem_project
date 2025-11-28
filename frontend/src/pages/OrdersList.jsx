import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const OrdersList = () => {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
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
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/orders`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load orders");
        setOrders(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        setError(e.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, API_BASE_URL, getAuthHeaders, navigate]);

  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Orders</h1>
        {loading && <div className="text-gray-600">Loading...</div>}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}
        {(!loading && orders.length === 0) && (
          <div className="bg-white p-6 rounded shadow">No orders yet.</div>
        )}
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              to={`/orders/${o._id}`}
              key={o._id}
              className="block p-4 bg-white rounded shadow hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{o.orderNumber || o._id}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(o.createdAt).toLocaleString()} • {o.items?.length || 0} items
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{Number(o.total || 0).toFixed(2)}</div>
                  <div className="text-sm capitalize text-gray-600">{o.paymentStatus}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersList;
