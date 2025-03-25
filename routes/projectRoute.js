const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateUser } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateUser);

router.post('/save', projectController.createProject);
router.get('/:userId', projectController.getUserProjects);
router.get('/project/:id', projectController.getProjectById);

module.exports = router; 