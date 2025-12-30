const express = require('express');
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileValidation, changePasswordValidation } = require('../utils/validators');
const { strictLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.put('/change-password', strictLimiter, changePasswordValidation, validate, changePassword);

module.exports = router;
