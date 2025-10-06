// routes/projects.js - COMPLETE VERSION
const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getCategories
} = require('../controllers/projectController');

const router = express.Router();

// Validation middleware for creating/updating projects
const projectValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage('Title must be between 10 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),
  
  body('category')
    .isIn([
      'web-development',
      'mobile-development', 
      'ui-ux-design',
      'graphic-design',
      'content-writing',
      'digital-marketing',
      'data-science',
      'devops',
      'blockchain',
      'ai-ml',
      'consulting',
      'other'
    ])
    .withMessage('Invalid category'),
  
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  
  body('budget.type')
    .isIn(['fixed', 'hourly'])
    .withMessage('Budget type must be fixed or hourly'),
  
  body('budget.amount')
    .if(body('budget.type').equals('fixed'))
    .isNumeric()
    .custom((value) => value >= 5)
    .withMessage('Fixed budget must be at least $5'),
  
  body('budget.hourlyRate.min')
    .if(body('budget.type').equals('hourly'))
    .isNumeric()
    .custom((value) => value >= 5)
    .withMessage('Minimum hourly rate must be at least $5'),
  
  body('budget.hourlyRate.max')
    .if(body('budget.type').equals('hourly'))
    .isNumeric()
    .custom((value, { req }) => {
      if (value <= req.body.budget.hourlyRate.min) {
        throw new Error('Maximum hourly rate must be greater than minimum');
      }
      return true;
    }),
  
  body('timeline.duration')
    .isIn(['less-than-1-month', '1-3-months', '3-6-months', 'more-than-6-months'])
    .withMessage('Invalid timeline duration'),
  
  body('experienceLevel')
    .isIn(['entry', 'intermediate', 'expert'])
    .withMessage('Invalid experience level'),
  
  body('projectSize')
    .isIn(['small', 'medium', 'large'])
    .withMessage('Invalid project size'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  
  body('applicationDeadline')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) {
        throw new Error('Application deadline must be in the future');
      }
      return true;
    })
];

// Public Routes

// @route   GET /api/projects
// @desc    Get all projects with filters and search
// @access  Public
router.get('/', getProjects);

// @route   GET /api/projects/categories
// @desc    Get project categories and stats
// @access  Public  
router.get('/categories', getCategories);

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Public
router.get('/:id', getProject);

// Private Routes (Authentication Required)

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Client only)
router.post('/', authenticate, authorize('client'), projectValidation, createProject);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Project owner or admin)
router.put('/:id', authenticate, projectValidation, updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Project owner or admin)
router.delete('/:id', authenticate, deleteProject);

module.exports = router;