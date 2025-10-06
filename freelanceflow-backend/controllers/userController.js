// controllers/userController.js
const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const updateData = { ...req.body };

    // Don't allow updating sensitive fields through this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData.earnings;
    delete updateData.ratings;

    // Handle nested profile updates
    if (updateData.profile) {
      // Merge with existing profile data
      const user = await User.findById(userId);
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

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
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

// @desc    Update user avatar
// @route   PUT /api/users/avatar
// @access  Private
exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating avatar'
    });
  }
};

// @desc    Add skill to freelancer profile
// @route   POST /api/users/skills
// @access  Private (Freelancer only)
exports.addSkill = async (req, res) => {
  try {
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

// @desc    Remove skill from freelancer profile
// @route   DELETE /api/users/skills/:skill
// @access  Private (Freelancer only)
exports.removeSkill = async (req, res) => {
  try {
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

// @desc    Add portfolio item
// @route   POST /api/users/portfolio
// @access  Private (Freelancer only)
exports.addPortfolioItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, imageUrl, projectUrl, technologies } = req.body;

    const user = await User.findById(req.user._id);
    
    if (user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can add portfolio items'
      });
    }

    const portfolioItem = {
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl || null,
      projectUrl: projectUrl || null,
      technologies: Array.isArray(technologies) ? technologies : []
    };

    if (!user.profile.portfolio) {
      user.profile.portfolio = [];
    }

    user.profile.portfolio.push(portfolioItem);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Portfolio item added successfully',
      data: { 
        portfolio: user.profile.portfolio,
        user: user
      }
    });

  } catch (error) {
    console.error('Add portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding portfolio item'
    });
  }
};

// @desc    Remove portfolio item
// @route   DELETE /api/users/portfolio/:index
// @access  Private (Freelancer only)
exports.removePortfolioItem = async (req, res) => {
  try {
    const { index } = req.params;
    const portfolioIndex = parseInt(index);

    if (isNaN(portfolioIndex) || portfolioIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid portfolio index'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can remove portfolio items'
      });
    }

    if (!user.profile.portfolio || portfolioIndex >= user.profile.portfolio.length) {
      return res.status(400).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    user.profile.portfolio.splice(portfolioIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Portfolio item removed successfully',
      data: { 
        portfolio: user.profile.portfolio,
        user: user
      }
    });

  } catch (error) {
    console.error('Remove portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing portfolio item'
    });
  }
};

// @desc    Get public user profile
// @route   GET /api/users/:id
// @access  Public
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email -earnings -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get public profile error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};