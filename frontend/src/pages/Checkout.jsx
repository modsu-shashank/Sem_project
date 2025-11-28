import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Smartphone, Banknote, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const StripeCardForm = ({ orderData, totalPrice, items, onSuccess, onError, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { getAuthHeaders } = useAuth();

  const handleCardPayment = async () => {
    if (!stripe || !elements) return;
    try {
      setLoading(true);
      const API_BASE_URL =
        import.meta?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
        "http://localhost:5001/api";
      const amountPaise = Math.round(Number(totalPrice || 0) * 100);

      // 1) Prepare order to get orderNumber
      const preparePayload = {
        items: items.map((it) => ({
          productClientId: `${it.product.id}`,
          selectedGrade: it.selectedGrade?.name,
          name: it.product.name,
          quantity: it.quantity,
          price: it.selectedGrade?.price ?? it.product.price,
          unit: "kg",
          image: it.product.image,
        })),
        shippingAddress: {
          firstName: orderData.name,
          street: orderData.address,
          city: orderData.city,
          state: orderData.state,
          zipCode: orderData.pincode,
          phone: orderData.phone,
        },
        paymentMethod: "card",
      };
      const prepareRes = await fetch(`${API_BASE_URL}/orders/prepare`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(preparePayload),
      });
      const prepareJson = await prepareRes.json();
      if (!prepareRes.ok) {
        throw new Error(prepareJson.message || "Failed to prepare order");
      }
      const orderNumber = prepareJson?.data?.orderNumber;

      // 2) Create PaymentIntent including orderNumber in metadata
      const res = await fetch(`${API_BASE_URL}/payments/create-intent`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: amountPaise, currency: "inr", description: `Order ${orderNumber} for ${orderData.email}`, orderNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.message || "Failed to create payment intent");
      }
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: orderData.name,
            email: orderData.email,
            phone: orderData.phone,
          },
        },
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        // 3) Mark prepared order as paid with payment details
        try {
          const pi = result.paymentIntent;
          const charge = pi.charges?.data?.[0];
          const card = charge?.payment_method_details?.card;
          const markRes = await fetch(`${API_BASE_URL}/orders/${orderNumber}/mark-paid`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              payment: {
                provider: "stripe",
                intentId: pi.id,
                methodId: typeof pi.payment_method === "string" ? pi.payment_method : pi.payment_method?.id,
                amount: (pi.amount || 0) / 100,
                currency: pi.currency,
                status: pi.status,
                cardBrand: card?.brand,
                cardLast4: card?.last4,
                receiptUrl: charge?.receipt_url,
              },
            }),
          });
          const markJson = await markRes.json();
          if (!markRes.ok) throw new Error(markJson.message || "Failed to mark order paid");
        } catch (e) {
          console.error("Mark order paid failed:", e);
        }
        onSuccess();
      } else {
        throw new Error("Payment not completed");
      }
    } catch (err) {
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button
        type="button"
        onClick={handleCardPayment}
        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
      >
        Pay ₹{Number(totalPrice || 0).toFixed(2)}
      </button>
    </div>
  );
};

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod",
  });

  const [loading, setLoading] = useState(false);
  const stripePromise = loadStripe(import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY || "");

  const handleInputChange = (e) => {
    setOrderData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (orderData.paymentMethod === "card") {
        // Card flow handled by StripeCardForm button; no action here
        return;
      }
      // Create order for COD/UPI
      const API_BASE_URL =
        import.meta?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
        "http://localhost:5000/api";
      const payload = {
        items: items.map((it) => ({
          productClientId: `${it.product.id}`,
          selectedGrade: it.selectedGrade?.name,
          name: it.product.name,
          quantity: it.quantity,
          price: it.selectedGrade?.price ?? it.product.price,
          unit: "kg",
          image: it.product.image,
        })),
        shippingAddress: {
          firstName: orderData.name,
          street: orderData.address,
          city: orderData.city,
          state: orderData.state,
          zipCode: orderData.pincode,
          phone: orderData.phone,
        },
        paymentMethod: orderData.paymentMethod,
      };
      // Try to save order, but don't block UX if it fails
      try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const j = await res.json();
          console.warn("Order save failed:", j.message);
        }
      } catch (e) {
        console.warn("Order save error:", e);
      }
      clearCart();
      alert("Order placed successfully! You will receive a confirmation email shortly.");
      navigate("/");
    } catch (error) {
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Items in Cart
          </h2>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: Banknote,
      description: "Pay when you receive your order",
    },
    {
      id: "upi",
      name: "UPI Payment",
      icon: Smartphone,
      description: "Pay using UPI apps like GPay, PhonePe",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Secure card payment",
    },
  ];

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Cart
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Checkout Details
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Personal Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={orderData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={orderData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={orderData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Shipping Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Street Address *
                      </label>
                      <textarea
                        name="address"
                        value={orderData.address}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter your complete address"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={orderData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={orderData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={orderData.pincode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="PIN Code"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <label
                          key={method.id}
                          className="flex items-start space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={orderData.paymentMethod === method.id}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                          <IconComponent className="h-6 w-6 text-gray-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-800">
                              {method.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {method.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {orderData.paymentMethod === "card" && (
                  <div className="mt-4">
                    <Elements stripe={stripePromise}>
                      <StripeCardForm
                        orderData={orderData}
                        totalPrice={totalPrice}
                        items={items}
                        setLoading={setLoading}
                        onSuccess={() => {
                          clearCart();
                          alert("Payment successful! Order placed.");
                          navigate("/");
                        }}
                        onError={(err) => alert(err.message || "Payment failed")}
                      />
                    </Elements>
                  </div>
                )}
                {orderData.paymentMethod !== "card" && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing Order..." : "Place Order"}
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center space-x-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.quantity} kg × ₹{item.product.price}
                      </p>
                    </div>
                    <span className="font-semibold">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">₹0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">
                      ₹{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Secure checkout
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Free shipping
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    7-day return policy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
