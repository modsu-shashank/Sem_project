import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Get all users route working',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Update current user's settings
// @route   PUT /api/users/settings
// @access  Private
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { settings, firstName, lastName, phone, addresses, paymentMethods } = req.body || {};

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (settings) {
      user.settings = {
        ...user.settings?.toObject?.() || user.settings || {},
        ...settings,
        notifications: { ...(user.settings?.notifications || {}), ...(settings.notifications || {}) },
        preferences: { ...(user.settings?.preferences || {}), ...(settings.preferences || {}) },
        privacy: { ...(user.settings?.privacy || {}), ...(settings.privacy || {}) },
      };
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (addresses !== undefined) user.addresses = addresses;
    if (paymentMethods !== undefined) user.paymentMethods = paymentMethods;

    await user.save();

    return res.json({
      success: true,
      message: 'Settings updated',
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      message: `Get user ${id} route working`,
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      message: `Update user ${id} route working`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      message: `Delete user ${id} route working`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
