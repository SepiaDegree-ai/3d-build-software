const Project = require('../models/Project');
const catchAsync = require('../utils/catchAsync');

exports.createProject = catchAsync(async (req, res) => {
  const { projectName, modelUrl, selections, totalPrice } = req.body;
  const userId = req.user.uid; // From Firebase auth middleware

  const project = await Project.create({
    userId,
    projectName,
    modelUrl,
    selections,
    totalPrice
  });

  res.status(201).json({
    status: 'success',
    data: project
  });
});

exports.getUserProjects = catchAsync(async (req, res) => {
  const userId = req.user.uid; // From Firebase auth middleware

  const projects = await Project.find({ userId })
    .sort({ createdAt: -1 })
    .select('projectName createdAt totalPrice');

  res.status(200).json({
    status: 'success',
    data: projects
  });
});

exports.getProjectById = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('selections.material');

  if (!project) {
    return res.status(404).json({
      status: 'error',
      message: 'Project not found'
    });
  }

  // Check if user owns this project
  if (project.userId !== req.user.uid) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to access this project'
    });
  }

  res.status(200).json({
    status: 'success',
    data: project
  });
}); 