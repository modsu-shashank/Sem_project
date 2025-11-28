import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import Order from "../models/Order.js";
import { sendOrderReceipt, sendPaymentConfirmation } from "../utils/email.js";

const router = express.Router();

// @desc    Get current user's orders
// @route   GET /api/orders
// @access  Private
router.get("/", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin
// @access  Admin
router.get("/admin", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query || {};
    const filter = {};
    if (status) filter.orderStatus = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Admin list orders error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @desc    Prepare a new order (pending) and return orderNumber
// @route   POST /api/orders/prepare
// @access  Private
router.post("/prepare", authenticateToken, async (req, res) => {
  try {
    const { items = [], shippingAddress = {}, paymentMethod = "card", notes } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required" });
    }

    const mappedItems = items.map((it) => ({
      productClientId: it.productClientId || String(it.product?.id || it.productId || ""),
      selectedGrade: it.selectedGrade?.name || it.grade || "",
      name: it.name || it.product?.name || "Item",
      quantity: Number(it.quantity) || 1,
      price: Number(it.price) || Number(it.selectedGrade?.price) || Number(it.product?.price) || 0,
      unit: it.unit || "kg",
      total: ((Number(it.price) || Number(it.selectedGrade?.price) || Number(it.product?.price) || 0) * (Number(it.quantity) || 1)),
      image: it.image || it.product?.image,
    }));

    const order = new Order({
      user: req.user._id,
      items: mappedItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      notes: { customer: notes }
    });

    await order.save();

    res.status(201).json({ success: true, data: { orderNumber: order.orderNumber, _id: order._id } });
  } catch (error) {
    console.error("Prepare order error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { items = [], shippingAddress = {}, paymentMethod = "cod", notes, payment } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required" });
    }

    // Map items to OrderItem schema
    const mappedItems = items.map((it) => ({
      productClientId: it.productClientId || String(it.product?.id || it.productId || ""),
      selectedGrade: it.selectedGrade?.name || it.grade || "",
      name: it.name || it.product?.name || "Item",
      quantity: Number(it.quantity) || 1,
      price: Number(it.price) || Number(it.selectedGrade?.price) || Number(it.product?.price) || 0,
      unit: it.unit || "kg",
      total: ((Number(it.price) || Number(it.selectedGrade?.price) || Number(it.product?.price) || 0) * (Number(it.quantity) || 1)),
      image: it.image || it.product?.image,
    }));

    const order = new Order({
      user: req.user._id,
      items: mappedItems,
      shippingAddress,
      paymentMethod,
      payment: payment ? {
        provider: payment.provider || 'stripe',
        intentId: payment.intentId,
        methodId: payment.methodId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        cardBrand: payment.cardBrand,
        cardLast4: payment.cardLast4,
        receiptUrl: payment.receiptUrl,
      } : undefined,
      paymentStatus: payment?.status === 'succeeded' || paymentMethod === "card" ? "completed" : "pending",
      orderStatus: "pending",
      // subtotal/total computed in pre-save
      notes: { customer: notes }
    });

    await order.save();
    // Send order receipt (pending or completed)
    try { await sendOrderReceipt(req.user, order); } catch (e) { console.warn('Order receipt email failed:', e.message); }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Get order by id error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put("/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    await order.updateStatus(status, req.user._id);
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @desc    Mark order paid and store payment details
// @route   PUT /api/orders/:orderNumber/mark-paid
// @access  Private
router.put("/:orderNumber/mark-paid", authenticateToken, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { payment } = req.body || {};
    const order = await Order.findOne({ orderNumber, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.paymentStatus = "completed";
    order.orderStatus = "confirmed";
    if (payment) {
      order.payment = {
        provider: payment.provider || order.payment?.provider || 'stripe',
        intentId: payment.intentId || order.payment?.intentId,
        methodId: payment.methodId || order.payment?.methodId,
        amount: payment.amount ?? order.payment?.amount,
        currency: payment.currency || order.payment?.currency,
        status: payment.status || order.payment?.status,
        cardBrand: payment.cardBrand || order.payment?.cardBrand,
        cardLast4: payment.cardLast4 || order.payment?.cardLast4,
        receiptUrl: payment.receiptUrl || order.payment?.receiptUrl,
      };
    }

    await order.save();
    // Send payment confirmation
    try { await sendPaymentConfirmation(req.user, order); } catch (e) { console.warn('Payment confirmation email failed:', e.message); }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Mark paid error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
