import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const StatusBadge = ({ text }) => (
  <span className="px-2 py-1 rounded-full text-xs capitalize bg-gray-100 text-gray-700">{text}</span>
);

const OrderDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [order, setOrder] = useState(null);
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
        const res = await fetch(`${API_BASE_URL}/orders/${id}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load order");
        setOrder(data.data);
      } catch (e) {
        setError(e.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isAuthenticated, API_BASE_URL, getAuthHeaders, navigate]);

  if (loading) return <div className="min-h-screen bg-green-50 p-8">Loading...</div>;
  if (error) return <div className="min-h-screen bg-green-50 p-8 text-red-600">{error}</div>;
  if (!order) return null;

  const timeline = [
    { label: "Order placed", date: order.createdAt },
    order.paymentStatus === "completed" ? { label: "Payment confirmed", date: order.updatedAt } : null,
    order.orderStatus === "delivered" ? { label: "Delivered", date: order.deliveredAt } : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Order {order.orderNumber || order._id}
          </h1>
          <Link to="/orders" className="text-orange-600 hover:text-orange-700">Back to orders</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-lg font-semibold mb-4">Items</h2>
              <div className="space-y-3">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {it.image && <img src={it.image} alt={it.name} className="w-12 h-12 rounded object-cover" />}
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-sm text-gray-600">{it.selectedGrade || ""}</div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-700">
                      {it.quantity} {it.unit} × ₹{Number(it.price).toFixed(2)}
                      <div className="font-semibold">₹{Number(it.total).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-lg font-semibold mb-4">Timeline</h2>
              <div className="space-y-2">
                {timeline.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{t.label}</span>
                    <span className="text-gray-600">{new Date(t.date).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{Number(order.subtotal || 0).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>₹{Number(order.tax || 0).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>₹{Number(order.shippingCost || 0).toFixed(2)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span>₹{Number(order.total || 0).toFixed(2)}</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded shadow space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>Status</span><StatusBadge text={order.orderStatus} /></div>
              <div className="flex items-center justify-between"><span>Payment</span><StatusBadge text={order.paymentStatus} /></div>
              <div className="pt-2">
                <div className="text-gray-800 font-medium mb-1">Payment details</div>
                {order.payment ? (
                  <div className="text-gray-700 space-y-1">
                    <div>Provider: {order.payment.provider || 'stripe'}</div>
                    <div>Amount: ₹{Number(order.payment.amount || order.total || 0).toFixed(2)} {order.payment.currency?.toUpperCase() || ''}</div>
                    {order.payment.cardBrand && (
                      <div>Card: {order.payment.cardBrand?.toUpperCase()} •••• {order.payment.cardLast4}</div>
                    )}
                    {order.payment.receiptUrl && (
                      <a href={order.payment.receiptUrl} className="text-orange-600 hover:text-orange-700" target="_blank" rel="noreferrer">View receipt</a>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">No payment details.</div>
                )}
              </div>

              <div className="pt-2">
                <div className="text-gray-800 font-medium mb-1">Shipping</div>
                <div className="text-gray-700">
                  {order.shippingAddress?.firstName || ''}<br />
                  {order.shippingAddress?.street || ''}<br />
                  {order.shippingAddress?.city || ''} {order.shippingAddress?.state || ''} {order.shippingAddress?.zipCode || ''}
                  <div>Phone: {order.shippingAddress?.phone || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
