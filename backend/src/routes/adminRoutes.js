const express = require('express');
const { getAllUsers, activateUser, deactivateUser, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('superadmin', 'admin'));

router.get('/users', getAllUsers);
router.put('/users/:userId/activate', activateUser);
router.put('/users/:userId/deactivate', deactivateUser);
router.delete('/users/:userId', deleteUser);

module.exports = router;
