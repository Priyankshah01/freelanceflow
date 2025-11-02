// src/pages/client/PostJob.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  FileText,
  DollarSign,
  Clock,
  Users,
  Plus,
  X,
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

// 🔗 use SAME backend as other client pages
const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
  'https://freelanceflow-backend-01k4.onrender.com/api';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState({ type: '', content: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: [],
    budget: {
      type: 'fixed',
      amount: '',
      hourlyRate: {
        min: '',
        max: '',
      },
    },
    timeline: {
      duration: '',
      startDate: '',
      endDate: '',
    },
    experienceLevel: '',
    projectSize: '',
    location: 'Remote',
    isRemote: true,
    isUrgent: false,
    requirements: [],
    deliverables: [],
    tags: [],
    applicationDeadline: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [deliverableInput, setDeliverableInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const categories = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'ui-ux-design', label: 'UI/UX Design' },
    { value: 'graphic-design', label: 'Graphic Design' },
    { value: 'content-writing', label: 'Content Writing' },
    { value: 'digital-marketing', label: 'Digital Marketing' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'devops', label: 'DevOps' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'ai-ml', label: 'AI/Machine Learning' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'other', label: 'Other' },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level', description: 'Looking for someone relatively new to this field' },
    { value: 'intermediate', label: 'Intermediate', description: 'Looking for substantial experience in this field' },
    { value: 'expert', label: 'Expert', description: 'Looking for comprehensive and deep expertise in this field' },
  ];

  const projectSizes = [
    { value: 'small', label: 'Small', description: 'Quick and straightforward' },
    { value: 'medium', label: 'Medium', description: 'Well-defined project' },
    { value: 'large', label: 'Large', description: 'Larger or more complex project' },
  ];

  const timelineDurations = [
    { value: 'less-than-1-month', label: 'Less than 1 month' },
    { value: '1-3-months', label: '1 to 3 months' },
    { value: '3-6-months', label: '3 to 6 months' },
    { value: 'more-than-6-months', label: 'More than 6 months' },
  ];

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 5000);
  };

  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // nested fields
    if (name.startsWith('budget.hourlyRate.')) {
      const field = name.replace('budget.hourlyRate.', '');
      setFormData((prev) => ({
        ...prev,
        budget: {
          ...prev.budget,
          hourlyRate: {
            ...prev.budget.hourlyRate,
            [field]: value,
          },
        },
      }));
      return;
    }

    if (name.startsWith('timeline.')) {
      const field = name.replace('timeline.', '');
      setFormData((prev) => ({
        ...prev,
        timeline: {
          ...prev.timeline,
          [field]: value,
        },
      }));
      return;
    }

    if (name.startsWith('budget.')) {
      const field = name.replace('budget.', '');
      setFormData((prev) => ({
        ...prev,
        budget: {
          ...prev.budget,
          [field]: type === 'checkbox' ? checked : value,
        },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addItem = (type, input, setInput) => {
    if (!input.trim()) return;

    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], input.trim()],
    }));
    setInput('');
  };

  const removeItem = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.title.length >= 10 && formData.description.length >= 50 && formData.category;
      case 2:
        return formData.skills.length > 0 && formData.experienceLevel && formData.projectSize;
      case 3:
        if (formData.budget.type === 'fixed') {
          return Number(formData.budget.amount) >= 5;
        } else {
          return (
            Number(formData.budget.hourlyRate.min) >= 5 &&
            Number(formData.budget.hourlyRate.max) > Number(formData.budget.hourlyRate.min)
          );
        }
      case 4:
        return !!formData.timeline.duration;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    } else {
      showMessage('error', 'Please fill in all required fields before continuing');
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      showMessage('error', 'Please complete all required fields');
      return;
    }

    setSaving(true);
    try {
      // clean up payload for backend
      const payload = {
        ...formData,
        client: user?._id || user?.id || undefined,
      };

      await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showMessage('success', 'Job posted successfully!');

      // 👇 keep client routes consistent
      setTimeout(() => {
        navigate('/dashboard/client/manage-jobs');
      }, 1500);
    } catch (error) {
      showMessage('error', `Failed to post job: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { number: 1, title: 'Project Details', icon: FileText },
    { number: 2, title: 'Skills & Experience', icon: Users },
    { number: 3, title: 'Budget', icon: DollarSign },
    { number: 4, title: 'Timeline', icon: Clock },
    { number: 5, title: 'Review & Post', icon: Eye },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
          <p className="text-gray-600">Find the perfect freelancer for your project</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step.number
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <div
                      className={`text-sm font-medium ${
                        currentStep >= step.number ? 'text-indigo-600' : 'text-gray-400'
                      }`}
                    >
                      Step {step.number}
                    </div>
                    <div
                      className={`text-sm ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                      {step.title}
                    </div>
                  </div>
                  {step.number < steps.length && (
                    <div
                      className={`hidden md:block w-20 h-0.5 ml-6 ${
                        currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Message */}
        {message.content && (
          <div
            className={`mb-6 p-4 rounded-md flex items-center ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
            {message.content}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>

              <FormField
                label="Project Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="I need a responsive website for my business"
                required
                className="mb-4"
              />
              <p className="text-xs text-gray-500 -mt-3 mb-4">{formData.title.length}/100 characters (minimum 10)</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your project in detail. What do you want to accomplish? What are your requirements and expectations?"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/5000 characters (minimum 50)
                </p>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Experience Required</h2>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill (e.g., React, Node.js, UI Design)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('skills', skillInput, setSkillInput);
                      }
                    }}
                  />
                  <Button type="button" onClick={() => addItem('skills', skillInput, setSkillInput)} disabled={!skillInput.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeItem('skills', index)}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {formData.skills.length === 0 && <p className="text-sm text-gray-500 mt-2">Add at least one skill</p>}
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {experienceLevels.map((level) => (
                    <div key={level.value} className="flex items-start">
                      <input
                        type="radio"
                        name="experienceLevel"
                        value={level.value}
                        checked={formData.experienceLevel === level.value}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <label className="font-medium text-gray-900">{level.label}</label>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Project Size <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {projectSizes.map((size) => (
                    <div key={size.value} className="flex items-start">
                      <input
                        type="radio"
                        name="projectSize"
                        value={size.value}
                        checked={formData.projectSize === size.value}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <label className="font-medium text-gray-900">{size.label}</label>
                        <p className="text-sm text-gray-600">{size.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget</h2>

              {/* Budget Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How do you want to pay? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="budget.type"
                      value="fixed"
                      checked={formData.budget.type === 'fixed'}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <label className="font-medium text-gray-900">Fixed Price</label>
                      <p className="text-sm text-gray-600">Pay a fixed amount for the entire project</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="budget.type"
                      value="hourly"
                      checked={formData.budget.type === 'hourly'}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <label className="font-medium text-gray-900">Hourly Rate</label>
                      <p className="text-sm text-gray-600">Pay an hourly rate for time worked</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Budget */}
              {formData.budget.type === 'fixed' && (
                <FormField
                  label="Fixed Budget ($)"
                  type="number"
                  name="budget.amount"
                  value={formData.budget.amount}
                  onChange={handleInputChange}
                  min="5"
                  placeholder="500"
                  required
                  className="mb-4"
                />
              )}

              {/* Hourly Budget */}
              {formData.budget.type === 'hourly' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Minimum Rate ($/hour)"
                    type="number"
                    name="budget.hourlyRate.min"
                    value={formData.budget.hourlyRate.min}
                    onChange={handleInputChange}
                    min="5"
                    placeholder="15"
                    required
                  />
                  <FormField
                    label="Maximum Rate ($/hour)"
                    type="number"
                    name="budget.hourlyRate.max"
                    value={formData.budget.hourlyRate.max}
                    onChange={handleInputChange}
                    min="5"
                    placeholder="50"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Timeline</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How long will this project take? <span className="text-red-500">*</span>
                </label>
                <select
                  name="timeline.duration"
                  value={formData.timeline.duration}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select timeline</option>
                  {timelineDurations.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Preferred Start Date"
                  type="date"
                  name="timeline.startDate"
                  value={formData.timeline.startDate}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Application Deadline"
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">This is an urgent project</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRemote"
                    checked={formData.isRemote}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Remote work is acceptable</label>
                </div>
              </div>

              {!formData.isRemote && (
                <FormField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State/Country"
                />
              )}
            </div>
          )}

          {/* Step 5 */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Job Post</h2>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{formData.title}</h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <p className="text-sm text-gray-900 capitalize">
                      {formData.category ? formData.category.replace(/-/g, ' ') : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Budget:</span>
                    <p className="text-sm text-gray-900">
                      {formData.budget.type === 'fixed'
                        ? `$${formData.budget.amount || 0}`
                        : `$${formData.budget.hourlyRate.min || 0} - $${formData.budget.hourlyRate.max || 0}/hr`}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Experience:</span>
                    <p className="text-sm text-gray-900 capitalize">{formData.experienceLevel || '—'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Timeline:</span>
                    <p className="text-sm text-gray-900">
                      {timelineDurations.find((d) => d.value === formData.timeline.duration)?.label || '—'}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500">Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                    {formData.skills.length === 0 && <span className="text-sm text-gray-500">No skills added</span>}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <p className="text-sm text-gray-900 mt-1 leading-relaxed">{formData.description}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Before you post</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Make sure your job post is clear and detailed. Good job posts receive more quality proposals.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
            <Button type="button" variant="secondary" onClick={handlePrevious} disabled={currentStep === 1}>
              Previous
            </Button>

            <div className="flex space-x-3">
              {currentStep < 5 ? (
                <Button type="button" onClick={handleNext} disabled={!validateStep(currentStep)}>
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Posting Job...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Post Job</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PostJob;
