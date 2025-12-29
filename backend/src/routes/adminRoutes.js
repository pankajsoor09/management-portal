const express = require('express');
const { getAllUsers, activateUser, deactivateUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:userId/activate', activateUser);
router.put('/users/:userId/deactivate', deactivateUser);

module.exports = router;
