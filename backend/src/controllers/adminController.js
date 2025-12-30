const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build query filter
    const filter = {};

    // If current user is admin (not superadmin), hide superadmin users
    if (req.user.role === 'admin') {
      filter.role = { $ne: 'superadmin' };
    }

    // Add search filter for name or email
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
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

    // Superadmin cannot be activated/deactivated
    if (user.role === 'superadmin') {
      return sendError(res, 'Cannot modify superadmin status', 403);
    }

    // Admin can only activate users, not other admins
    if (req.user.role === 'admin' && user.role === 'admin') {
      return sendError(res, 'Admins cannot modify other admins', 403);
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

    // Superadmin cannot be deactivated
    if (user.role === 'superadmin') {
      return sendError(res, 'Cannot deactivate superadmin', 403);
    }

    // Admin can only deactivate users, not other admins
    if (req.user.role === 'admin' && user.role === 'admin') {
      return sendError(res, 'Admins cannot deactivate other admins', 403);
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

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Only superadmin can delete users
    if (req.user.role !== 'superadmin') {
      return sendError(res, 'Only superadmin can delete users', 403);
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'You cannot delete your own account', 400);
    }

    // Superadmin cannot be deleted
    if (user.role === 'superadmin') {
      return sendError(res, 'Cannot delete superadmin', 403);
    }

    await User.findByIdAndDelete(userId);

    sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  activateUser,
  deactivateUser,
  deleteUser,
};
