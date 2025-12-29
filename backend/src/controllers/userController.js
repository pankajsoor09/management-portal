const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const getProfile = async (req, res, next) => {
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
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { email, fullName } = req.body;
    const updateData = {};

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return sendError(res, 'Email already in use', 400);
      }
      updateData.email = email;
    }

    if (fullName) {
      updateData.fullName = fullName;
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'No valid fields to update', 400);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
