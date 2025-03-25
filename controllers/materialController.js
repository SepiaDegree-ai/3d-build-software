const Material = require('../models/Material');
const { unlink } = require('fs').promises;
const path = require('path');

// Helper function to handle errors
const catchAsync = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper to remove texture file
const removeTextureFile = async (textureUrl) => {
  if (textureUrl) {
    try {
      const filePath = path.join(__dirname, '..', 'public', textureUrl);
      await unlink(filePath);
    } catch (error) {
      console.error('Error deleting texture file:', error);
    }
  }
};

exports.createMaterial = catchAsync(async (req, res) => {
  const materialData = { ...req.body };
  
  // Add texture URL if file was uploaded
  if (req.file) {
    materialData.textureUrl = `/uploads/textures/${req.file.filename}`;
  }

  const material = await Material.create(materialData);

  res.status(201).json({
    success: true,
    data: material
  });
});

exports.getAllMaterials = catchAsync(async (req, res) => {
  const query = { active: true };
  
  // Filter by category if provided
  if (req.query.category) {
    query.category = req.query.category;
  }

  const materials = await Material.find(query)
    .sort({ category: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: materials.length,
    data: materials
  });
});

exports.getMaterialById = catchAsync(async (req, res) => {
  const material = await Material.findById(req.params.id);

  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Material not found'
    });
  }

  res.status(200).json({
    success: true,
    data: material
  });
});

exports.updateMaterial = catchAsync(async (req, res) => {
  const materialData = { ...req.body };
  
  // Handle texture file update
  if (req.file) {
    const material = await Material.findById(req.params.id);
    if (material && material.textureUrl) {
      await removeTextureFile(material.textureUrl);
    }
    materialData.textureUrl = `/uploads/textures/${req.file.filename}`;
  }

  const material = await Material.findByIdAndUpdate(
    req.params.id,
    materialData,
    {
      new: true,
      runValidators: true
    }
  );

  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Material not found'
    });
  }

  res.status(200).json({
    success: true,
    data: material
  });
});

exports.deleteMaterial = catchAsync(async (req, res) => {
  const material = await Material.findById(req.params.id);

  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Material not found'
    });
  }

  // Soft delete by setting active to false
  material.active = false;
  await material.save();

  // Remove texture file if exists
  await removeTextureFile(material.textureUrl);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Error handler middleware
exports.handleErrors = (err, req, res, next) => {
  console.error('Material Controller Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Material with this name already exists'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Server error'
  });
}; 