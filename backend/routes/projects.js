const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Get all projects for the current user
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id })
      .sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  const project = new Project({
    userId: req.user.id,
    name: req.body.name,
    modelUrl: req.body.modelUrl,
    materialSelections: req.body.materialSelections || new Map(),
    totalPrice: req.body.totalPrice || 0
  });

  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.body.name) project.name = req.body.name;
    if (req.body.modelUrl) project.modelUrl = req.body.modelUrl;
    if (req.body.materialSelections) project.materialSelections = req.body.materialSelections;
    if (req.body.totalPrice) project.totalPrice = req.body.totalPrice;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 