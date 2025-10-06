// routes/users.js - FIXED VERSION
const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Simple profile update controller (inline for now)
const updateProfile = async (req, res) => {
  try {
    console.log('📝 Profile update request:', {
      userId: req.user._id,
      body: req.body
    });

    const User = require('../models/User');
    const { validationResult } = require('express-validator');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const updateData = { ...req.body };

    // Don't allow updating sensitive fields
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData.earnings;
    delete updateData.ratings;

    console.log('🔄 Update data after filtering:', updateData);

    // Handle nested profile updates
    if (updateData.profile) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Merge with existing profile data
      updateData.profile = {
        ...user.profile.toObject(),
        ...updateData.profile
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Profile updated successfully');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    // Handle validation errors
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
      message: 'Server error updating profile'
    });
  }
};

// Get profile controller
const getProfile = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).select('-password');
    
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// Add skill controller
const addSkill = async (req, res) => {
  try {
    const User = require('../models/User');
    const { skill } = req.body;

    if (!skill || typeof skill !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid skill name is required'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can add skills'
      });
    }

    // Initialize skills array if it doesn't exist
    if (!user.profile.skills) {
      user.profile.skills = [];
    }

    // Check if skill already exists
    const skillLower = skill.toLowerCase().trim();
    const existingSkill = user.profile.skills.find(s => 
      s.toLowerCase() === skillLower
    );

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists'
      });
    }

    // Add new skill
    user.profile.skills.push(skill.trim());
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill added successfully',
      data: { 
        skills: user.profile.skills,
        user: user
      }
    });

  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding skill'
    });
  }
};

// Remove skill controller
const removeSkill = async (req, res) => {
  try {
    const User = require('../models/User');
    const { skill } = req.params;

    const user = await User.findById(req.user._id);
    
    if (user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can remove skills'
      });
    }

    if (!user.profile.skills || user.profile.skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No skills to remove'
      });
    }

    // Remove skill (case insensitive)
    const skillLower = skill.toLowerCase();
    user.profile.skills = user.profile.skills.filter(s => 
      s.toLowerCase() !== skillLower
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill removed successfully',
      data: { 
        skills: user.profile.skills,
        user: user
      }
    });

  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing skill'
    });
  }
};

// Validation middleware
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
  
  body('profile.hourlyRate')
    .optional()
    .isNumeric()
    .custom((value) => value >= 1)
    .withMessage('Hourly rate must be a positive number'),
  
  body('profile.location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  
  body('profile.phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('profile.website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('profile.company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters')
];

// Routes

// @route   GET /api/users/profile
router.get('/profile', authenticate, getProfile);

// @route   PUT /api/users/profile  
router.put('/profile', authenticate, updateProfileValidation, updateProfile);

// @route   POST /api/users/skills
router.post('/skills', authenticate, addSkill);

// @route   DELETE /api/users/skills/:skill
router.delete('/skills/:skill', authenticate, removeSkill);

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'User routes are working!'
  });
});

module.exports = router;