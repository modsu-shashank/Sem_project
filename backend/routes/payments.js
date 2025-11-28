import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { config } from '../config/config.js';
import Stripe from 'stripe';
import Order from '../models/Order.js';

const router = express.Router();

const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// @desc    Create a PaymentIntent
// @route   POST /api/payments/create-intent
// @access  Private
router.post('/create-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'inr', description, orderNumber } = req.body;

    if (!config.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Stripe is not configured on the server',
      });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount (in the smallest currency unit) is required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description: description || `Order for user ${req.user.email}`,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(req.user._id),
        email: req.user.email,
        orderNumber: orderNumber || '',
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe create-intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
    });
  }
});

export default router;

// Stripe webhook handler (exported for server.js to mount before json parser)
export const stripeWebhookHandler = async (req, res) => {
  try {
    if (!config.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).send('Stripe webhook secret not configured');
    }

    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, config.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata?.userId;
      const orderNumber = paymentIntent.metadata?.orderNumber;
      // If we had created an order earlier and stored orderNumber in metadata,
      // we could mark it completed here. For now, just log success.
      console.log('Payment succeeded for user:', userId, 'order:', orderNumber);
      // Optionally find and update order by orderNumber
      if (orderNumber) {
        await Order.findOneAndUpdate(
          { orderNumber },
          { paymentStatus: 'completed', orderStatus: 'confirmed' }
        );
      }
    }

    res.json({ received: true });
  } catch (e) {
    console.error('Stripe webhook handler error:', e);
    res.status(500).send('Server error');
  }
};
