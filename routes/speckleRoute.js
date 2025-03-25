const express = require('express');
const router = express.Router();
const speckleController = require('../controllers/speckleController');
const { authenticateUser } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateUser);

router.post('/import-from-speckle', speckleController.importFromSpeckle);

module.exports = router; 