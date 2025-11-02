// src/pages/JobDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Eye,
  Heart,
  Star,
  Calendar,
  Building,
  CheckCircle,
  AlertTriangle,
  FileText,
  Send,
  Paperclip,
  X,
} from 'lucide-react';
import Button from '../components/common/Button';
import FormField from '../components/common/FormField';
import { get, post } from '../services/api'; // 👈 use shared API

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Application form state
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    bidAmount: '',
    timeline: '',
    milestones: [],
    questions: [],
  });

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 5000);
  };

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      // 👇 this will now call Render, not localhost
      const res = await get(`/projects/${id}`);

      // backend could respond in several shapes
      const project =
        res?.data?.project || res?.data || res?.project || res || null;

      setJob(project);
    } catch (error) {
      console.error('❌ Error fetching job details:', error);
      showMessage('error', 'Failed to load job details');
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();

    if (
      !applicationData.coverLetter.trim() ||
      !applicationData.bidAmount ||
      !applicationData.timeline
    ) {
      showMessage('error', 'Please fill in all required fields');
      return;
    }

    if (!job?._id) {
      showMessage('error', 'Job is not loaded yet.');
      return;
    }

    setSubmittingApplication(true);
    try {
      // 👇 use shared API — will hit Render
      await post('/proposals', {
        project: job._id,
        coverLetter: applicationData.coverLetter,
        bidAmount: Number(applicationData.bidAmount),
        timeline: applicationData.timeline,
        milestones: applicationData.milestones,
        questions: applicationData.questions,
      });

      showMessage('success', 'Application submitted successfully!');
      setShowApplicationModal(false);

      // reset form
      setApplicationData({
        coverLetter: '',
        bidAmount: '',
        timeline: '',
        milestones: [],
        questions: [],
      });
    } catch (error) {
      console.error('❌ Application submission failed:', error);
      showMessage(
        'error',
        `Failed to submit application: ${error.message || 'Unknown error'}`
      );
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Budget not specified';
    if (budget.type === 'fixed') {
      const amt = Number(budget.amount || 0);
      return `$${amt.toLocaleString()}`;
    }
    if (budget.type === 'hourly') {
      const min = budget.hourlyRate?.min ?? 0;
      const max = budget.hourlyRate?.max ?? min;
      return `$${min}-${max}/hr`;
    }
    return 'Budget not specified';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '—';
    const now = new Date();
    const posted = new Date(dateString);
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just posted';
    }
  };

  const getCategoryLabel = (category) => {
    if (!category) return '—';
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getExperienceLabel = (level) => {
    if (!level) return '—';
    const labels = {
      entry: 'Entry Level',
      intermediate: 'Intermediate',
      expert: 'Expert',
    };
    return labels[level] || level;
  };

  const getProjectSizeLabel = (size) => {
    if (!size) return '—';
    const labels = {
      small: 'Small Project',
      medium: 'Medium Project',
      large: 'Large Project',
    };
    return labels[size] || size;
  };

  const getTimelineLabel = (duration) => {
    if (!duration) return '—';
    const labels = {
      'less-than-1-month': 'Less than 1 month',
      '1-3-months': '1 to 3 months',
      '3-6-months': '3 to 6 months',
      'more-than-6-months': 'More than 6 months',
    };
    return labels[duration] || duration;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const canApply =
    user?.role === 'freelancer' && (job.status === 'open' || !job.status);
  const isOwnJob =
    user?.role === 'client' &&
    job.client &&
    (job.client._id === user._id || job.client === user._id);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Message */}
        {message.content && (
          <div
            className={`mb-6 p-4 rounded-md flex items-center ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            {message.content}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mr-4">
                  {job.title}
                </h1>
                <div className="flex items-center space-x-2">
                  {job.isUrgent && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Urgent
                    </span>
                  )}
                  {job.featured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <Star className="w-4 h-4 mr-1" />
                      Featured
                    </span>
                  )}
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`p-2 rounded-full hover:bg-gray-100 ${
                      saved ? 'text-red-500' : 'text-gray-400'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${saved ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500 space-x-6 mb-4">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Posted {formatTimeAgo(job.createdAt)}
                </span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {job.viewCount || 0} views
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {job.proposalCount || 0} proposals
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.isRemote ? 'Remote' : job.location || '—'}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-lg">
                <span className="flex items-center text-green-600 font-semibold">
                  <DollarSign className="w-5 h-5 mr-1" />
                  {formatBudget(job.budget)}
                </span>
                <span className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-1" />
                  {getTimelineLabel(job.timeline?.duration)}
                </span>
                <span className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-1" />
                  {getExperienceLabel(job.experienceLevel)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Description
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {job.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Skills Required */}
            {Array.isArray(job.skills) && job.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Skills Required
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements & Deliverables */}
            {(Array.isArray(job.requirements) && job.requirements.length > 0) ||
            (Array.isArray(job.deliverables) && job.deliverables.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.isArray(job.requirements) &&
                  job.requirements.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Requirements
                      </h3>
                      <ul className="space-y-2">
                        {job.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {Array.isArray(job.deliverables) &&
                  job.deliverables.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Deliverables
                      </h3>
                      <ul className="space-y-2">
                        {job.deliverables.map((deliverable, index) => (
                          <li key={index} className="flex items-start">
                            <FileText className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">
                              {deliverable}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ) : null}

            {/* Attachments */}
            {Array.isArray(job.attachments) && job.attachments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Attachments
                </h2>
                <div className="space-y-2">
                  {job.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Paperclip className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-700">
                        {attachment.filename}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            {canApply && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Button
                  onClick={() => setShowApplicationModal(true)}
                  className="w-full mb-4"
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Apply for this Job
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Submit a proposal to show your interest
                </p>
              </div>
            )}

            {isOwnJob && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Building className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Your Job Post
                  </p>
                  <p className="text-xs text-gray-500">
                    You are the client for this project
                  </p>
                </div>
              </div>
            )}

            {/* Job Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Category</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getCategoryLabel(job.category)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Project Size</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getProjectSizeLabel(job.projectSize)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Experience Level</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getExperienceLabel(job.experienceLevel)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Budget Type</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {job.budget?.type ? `${job.budget.type} Price` : '—'}
                  </span>
                </div>
                {job.applicationDeadline && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Apply By</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* About the Client */}
            {job.client && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  About the Client
                </h3>
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {job.client.avatar ? (
                      <img
                        src={job.client.avatar}
                        alt={job.client.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {job.client.name}
                    </h4>
                    {job.client.profile?.company && (
                      <p className="text-sm text-gray-600">
                        {job.client.profile.company}
                      </p>
                    )}
                    <div className="flex items-center mt-1">
                      {job.client.isVerified && (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      )}
                      <span className="text-xs text-gray-500">
                        Member since{' '}
                        {job.client.createdAt
                          ? new Date(job.client.createdAt).getFullYear()
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {job.client.profile?.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.client.profile.location}
                    </div>
                  )}
                  {job.client.ratings?.count > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      {job.client.ratings.average.toFixed(1)} (
                      {job.client.ratings.count} reviews)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {Array.isArray(job.tags) && job.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Apply for this Job
                  </h2>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleApplicationSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="coverLetter"
                      value={applicationData.coverLetter}
                      onChange={handleInputChange}
                      rows={6}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Explain why you're the perfect fit for this project. Highlight your relevant experience and how you plan to approach the work."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {applicationData.coverLetter.length}/1500 characters
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label={`Your Bid Amount ${
                        job.budget?.type === 'hourly' ? '($/hr)' : '($)'
                      }`}
                      type="number"
                      name="bidAmount"
                      value={applicationData.bidAmount}
                      onChange={handleInputChange}
                      min="1"
                      required
                      placeholder={
                        job.budget?.type === 'fixed'
                          ? job.budget?.amount
                          : job.budget?.hourlyRate?.min
                      }
                    />

                    <FormField
                      label="Timeline"
                      name="timeline"
                      value={applicationData.timeline}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 2 weeks, 1 month"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Before you apply
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Make sure you understand the project requirements
                            and can deliver within the specified timeline.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowApplicationModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submittingApplication}
                      className="flex items-center space-x-2"
                    >
                      {submittingApplication ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobDetail;
