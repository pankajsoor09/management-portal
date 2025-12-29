const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const signup = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already registered', 400);
    }

    const user = await User.create({
      email,
      password,
      fullName,
    });

    const token = generateToken(user._id);

    sendSuccess(
      res,
      {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
        },
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (user.status === 'inactive') {
      return sendError(res, 'Your account has been deactivated', 401);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    sendSuccess(
      res,
      {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
          lastLogin: user.lastLogin,
        },
        token,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  logout,
};
