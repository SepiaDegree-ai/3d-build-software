const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

// Get all materials
router.get('/', async (req, res) => {
  try {
    const materials = await Material.find().sort('name');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific material
router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new material
router.post('/', async (req, res) => {
  const material = new Material({
    name: req.body.name,
    color: req.body.color,
    pricePerSquareMeter: req.body.pricePerSquareMeter,
    description: req.body.description,
    properties: {
      roughness: req.body.properties?.roughness ?? 0.5,
      metalness: req.body.properties?.metalness ?? 0
    }
  });

  try {
    const newMaterial = await material.save();
    res.status(201).json(newMaterial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a material
router.put('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (req.body.name) material.name = req.body.name;
    if (req.body.color) material.color = req.body.color;
    if (req.body.pricePerSquareMeter) material.pricePerSquareMeter = req.body.pricePerSquareMeter;
    if (req.body.description) material.description = req.body.description;
    if (req.body.properties) {
      material.properties.roughness = req.body.properties.roughness ?? material.properties.roughness;
      material.properties.metalness = req.body.properties.metalness ?? material.properties.metalness;
    }

    const updatedMaterial = await material.save();
    res.json(updatedMaterial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a material
router.delete('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    await material.remove();
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 