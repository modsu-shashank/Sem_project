import User from '../models/User.js';
import { generateToken, validatePassword } from '../middleware/auth.js';
import { config } from '../config/config.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

// @desc    Check if any admin exists
// @route   GET /api/auth/has-admin
// @access  Public
export const hasAdmin = async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'admin' }).limit(1);
    return res.json({ success: true, data: { hasAdmin: count > 0 } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Create an admin user (one-time/setup guarded by ADMIN_SETUP_KEY)
// @route   POST /api/auth/create-admin
// @access  Protected by setup key
export const createAdmin = async (req, res) => {
  try {
    const { setupKey, username, password } = req.body || {};

    if (!config.ADMIN_SETUP_KEY) {
      return res.status(500).json({ success: false, message: 'Admin setup key not configured on server' });
    }
    if (!setupKey || setupKey !== config.ADMIN_SETUP_KEY) {
      return res.status(403).json({ success: false, message: 'Invalid setup key' });
    }
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ success: false, message: 'Password validation failed', errors: passwordValidation.errors });
    }

    const normalizedUsername = String(username).toLowerCase();
    let user = await User.findOne({ username: normalizedUsername });

    if (user) {
      // Upgrade existing user to admin
      user.role = 'admin';
      user.isVerified = true;
      if (password) {
        user.password = password;
      }
      await user.save();
    } else {
      user = new User({
        username: normalizedUsername,
        password,
        role: 'admin',
        isVerified: true,
      });
      await user.save();
    }

    const token = generateToken(user._id, user.email, user.role);
    return res.status(201).json({ success: true, message: 'Admin account ready', data: { user: user.getPublicProfile(), token } });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, settings, addresses, paymentMethods } = req.body;

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors: passwordValidation.errors
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate a unique username if the requested one is taken
    const slugify = (str) =>
      String(str || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-_]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

    const desiredBase = username && username.trim().length > 0
      ? username
      : (email.split('@')[0] || 'user');
    const baseUsername = slugify(desiredBase) || 'user';

    let finalUsername = baseUsername;
    let suffix = 1;
    // Ensure uniqueness by appending incrementing suffix if necessary
    while (await User.findOne({ username: finalUsername })) {
      suffix += 1;
      finalUsername = `${baseUsername}-${suffix}`;
    }

    // Generate verification token (disabled in development)
    const isDev = config.NODE_ENV === 'development';
    const verificationToken = isDev ? undefined : crypto.randomBytes(32).toString('hex');

    // Create user
    const user = new User({
      username: finalUsername,
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone,
      verificationToken,
      isVerified: isDev ? true : false,
      role: 'user',
      settings: settings || undefined,
      addresses: addresses || undefined,
      paymentMethods: paymentMethods || undefined
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    // Send verification email (implement email service)
    // await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: isDev
        ? 'User registered successfully (auto-verified in development).'
        : 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Login/Register with Google ID token
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }

    if (!config.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'Google auth not configured on server' });
    }

    const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: config.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = (payload.email || '').toLowerCase();
    const name = payload.name || email.split('@')[0] || 'user';
    const given_name = payload.given_name || '';
    const family_name = payload.family_name || '';

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google token missing email' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex') + 'Aa1!';
      const slugify = (str) => String(str || '').toLowerCase().trim().replace(/[^a-z0-9\s-_]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      const baseUsername = slugify(name) || 'user';
      let finalUsername = baseUsername;
      let suffix = 1;
      while (await User.findOne({ username: finalUsername })) {
        suffix += 1;
        finalUsername = `${baseUsername}-${suffix}`;
      }

      user = new User({
        username: finalUsername,
        email,
        password: randomPassword,
        firstName: given_name,
        lastName: family_name,
        isVerified: true,
        role: email === 'admin@rgo.com' ? 'admin' : 'user'
      });
      await user.save();
    }

    const token = generateToken(user._id, user.email, user.role);
    return res.json({ success: true, message: 'Login successful', data: { user: user.getPublicProfile(), token } });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const identifier = String(email || '').trim();
    console.log('[login] identifier:', identifier);
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/username and password are required' });
    }

    // Find user by email or username
    let user = null;
    if (identifier.includes('@')) {
      user = await User.findOne({ email: identifier.toLowerCase() });
      console.log('[login] searched by email, found:', !!user);
    }
    if (!user) {
      user = await User.findOne({ username: identifier.toLowerCase() });
      console.log('[login] searched by username, found:', !!user);
    }
    if (!user) {
      console.log('[login] no user found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    console.log('[login] password valid:', isValidPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is verified (required in production only)
    if (!user.isVerified && config.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, preferences } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors: passwordValidation.errors
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send reset email (implement email service)
    // await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: 'Password reset email sent. Please check your email.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors: passwordValidation.errors
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
