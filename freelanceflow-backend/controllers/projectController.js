// controllers/projectController.js
const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects with filters and search
// @route   GET /api/projects
// @access  Public (for browsing) / Private (for user's projects)
exports.getProjects = async (req, res) => {
  try {
    const {
      category,
      skills,
      budget_min,
      budget_max,
      budget_type,
      experience_level,
      project_size,
      timeline,
      status,
      client,
      freelancer,
      search,
      location,
      is_remote,
      is_urgent,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = {};

    // Basic filters
    if (category) filter.category = category;
    if (status) {
      filter.status = status;
    } else {
      // Default to showing only open projects for public browsing
      if (!client && !freelancer) {
        filter.status = 'open';
      }
    }
    if (client) filter.client = client;
    if (freelancer) filter.freelancer = freelancer;
    if (experience_level) filter.experienceLevel = experience_level;
    if (project_size) filter.projectSize = project_size;
    if (timeline) filter['timeline.duration'] = timeline;
    if (location && location !== 'remote') filter.location = new RegExp(location, 'i');
    if (is_remote === 'true') filter.isRemote = true;
    if (is_urgent === 'true') filter.isUrgent = true;

    // Skills filter (array contains any of the specified skills)
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      filter.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    // Budget filter
    if (budget_type && (budget_min || budget_max)) {
      if (budget_type === 'fixed') {
        filter['budget.type'] = 'fixed';
        if (budget_min) filter['budget.amount'] = { $gte: Number(budget_min) };
        if (budget_max) filter['budget.amount'] = { ...filter['budget.amount'], $lte: Number(budget_max) };
      } else if (budget_type === 'hourly') {
        filter['budget.type'] = 'hourly';
        if (budget_min) filter['budget.hourlyRate.min'] = { $gte: Number(budget_min) };
        if (budget_max) filter['budget.hourlyRate.max'] = { $lte: Number(budget_max) };
      }
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    console.log('🔍 Project filter:', filter);

    // Pagination
    const skip = (page - 1) * limit;

    // Build sort object
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'budget_high':
        sortOptions = { 'budget.amount': -1 };
        break;
      case 'budget_low':
        sortOptions = { 'budget.amount': 1 };
        break;
      case 'most_proposals':
        sortOptions = { proposalCount: -1 };
        break;
      default:
        if (search) {
          sortOptions = { score: { $meta: 'textScore' }, createdAt: -1 };
        } else {
          sortOptions = { isUrgent: -1, featured: -1, createdAt: -1 };
        }
    }

    // Execute query with population
    const projects = await Project.find(filter)
      .populate('client', 'name avatar profile.company profile.location ratings isVerified')
      .populate('freelancer', 'name avatar profile.skills ratings')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalProjects = await Project.countDocuments(filter);
    const totalPages = Math.ceil(totalProjects / limit);

    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalProjects,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          limit: Number(limit)
        },
        filters: {
          applied: Object.keys(req.query).length > 0,
          count: Object.keys(filter).length
        }
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching projects'
    });
  }
};

// @desc    Get single project with view increment
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name avatar profile.company profile.location profile.website ratings isVerified createdAt')
      .populate('freelancer', 'name avatar profile.skills profile.hourlyRate ratings');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Increment view count (don't await to avoid slowing response)
    project.incrementViews().catch(err => console.error('View count increment failed:', err));

    res.status(200).json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('Get project error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching project'
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Client only)
exports.createProject = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Only clients can create projects
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can create projects'
      });
    }

    const projectData = {
      ...req.body,
      client: req.user._id
    };

    // Process skills array
    if (typeof projectData.skills === 'string') {
      projectData.skills = projectData.skills.split(',').map(skill => skill.trim()).filter(Boolean);
    }

    // Process tags array
    if (typeof projectData.tags === 'string') {
      projectData.tags = projectData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
    }

    // Process requirements and deliverables
    if (typeof projectData.requirements === 'string') {
      projectData.requirements = projectData.requirements.split('\n').map(req => req.trim()).filter(Boolean);
    }
    if (typeof projectData.deliverables === 'string') {
      projectData.deliverables = projectData.deliverables.split('\n').map(del => del.trim()).filter(Boolean);
    }

    console.log('📝 Creating project:', projectData);

    const project = await Project.create(projectData);
    
    // Populate client data
    await project.populate('client', 'name avatar profile.company ratings');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });

  } catch (error) {
    console.error('Create project error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating project'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Client who owns the project)
exports.updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check ownership (client who created the project or admin)
    if (project.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Don't allow updating client field or changing status to certain values
    delete req.body.client;
    delete req.body.proposalCount;
    delete req.body.viewCount;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('client', 'name avatar profile.company ratings')
     .populate('freelancer', 'name avatar profile.skills ratings');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });

  } catch (error) {
    console.error('Update project error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating project'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Client who owns the project or admin)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check ownership
    if (project.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    // Don't allow deletion if project is in progress
    if (project.status === 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete project that is in progress'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error deleting project'
    });
  }
};

// @desc    Get project categories and stats
// @route   GET /api/projects/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Project.aggregate([
      { $match: { status: 'open' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const stats = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          openProjects: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          avgBudget: { $avg: '$budget.amount' },
          totalBudget: { $sum: '$budget.amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories: categories.map(cat => ({
          name: cat._id,
          count: cat.count,
          label: cat._id.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        })),
        stats: stats[0] || {
          totalProjects: 0,
          openProjects: 0,
          avgBudget: 0,
          totalBudget: 0
        }
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
};