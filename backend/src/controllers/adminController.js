const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .select('email fullName role status lastLogin createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendSuccess(res, {
      users: users.map((user) => ({
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const activateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.status === 'active') {
      return sendError(res, 'User is already active', 400);
    }

    user.status = 'active';
    await user.save();

    sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    }, 'User activated successfully');
  } catch (error) {
    next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'You cannot deactivate your own account', 400);
    }

    if (user.status === 'inactive') {
      return sendError(res, 'User is already inactive', 400);
    }

    user.status = 'inactive';
    await user.save();

    sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    }, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  activateUser,
  deactivateUser,
};
