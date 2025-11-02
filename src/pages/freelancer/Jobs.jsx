// src/pages/freelancer/Jobs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Eye,
  Heart,
  Star,
  Building,
  ChevronDown,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { get } from '../../services/apiService'; // 👈 use shared API

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    budget_type: '',
    budget_min: '',
    budget_max: '',
    experience_level: '',
    project_size: '',
    timeline: '',
    is_remote: '',
    is_urgent: '',
    sort: 'newest',
  });

  const categories = [
    { value: '', label: 'All Categories' },
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
    { value: '', label: 'Any Level' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' },
  ];

  const projectSizes = [
    { value: '', label: 'Any Size' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  const timelines = [
    { value: '', label: 'Any Timeline' },
    { value: 'less-than-1-month', label: 'Less than 1 month' },
    { value: '1-3-months', label: '1 to 3 months' },
    { value: '3-6-months', label: '3 to 6 months' },
    { value: 'more-than-6-months', label: 'More than 6 months' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'budget_high', label: 'Highest Budget' },
    { value: 'budget_low', label: 'Lowest Budget' },
    { value: 'most_proposals', label: 'Most Proposals' },
  ];

  useEffect(() => {
    fetchJobs();
  }, [currentPage, filters, searchQuery]);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 12);

      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await get(`/projects?${params.toString()}`);

      setJobs(response?.data?.projects || []);
      setTotalPages(response?.data?.pagination?.totalPages || 1);
      setTotalJobs(response?.data?.pagination?.totalProjects || 0);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      budget_type: '',
      budget_min: '',
      budget_max: '',
      experience_level: '',
      project_size: '',
      timeline: '',
      is_remote: '',
      is_urgent: '',
      sort: 'newest',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  const formatBudget = (budget) =>
    budget?.type === 'fixed'
      ? `${budget.amount}`
      : `${budget.hourlyRate?.min}-${budget.hourlyRate?.max}/hr`;

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    return diffDays > 0
      ? `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      : diffHours > 0
      ? `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      : 'Just posted';
  };

  const JobCard = ({ job }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <button onClick={() => navigate(`/jobs/${job._id}`)} className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600 cursor-pointer line-clamp-2">
              {job.title}
            </h3>
          </button>
        </div>
        <button
          onClick={() => toggleSaveJob(job._id)}
          className={`p-1 rounded-full hover:bg-gray-100 ml-2 flex-shrink-0 ${
            savedJobs.has(job._id) ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          <Heart className={`w-5 h-5 ${savedJobs.has(job._id) ? 'fill-current' : ''}`} />
        </button>
      </div>

      {job.isUrgent && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-2">
          Urgent
        </span>
      )}

      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills?.slice(0, 4).map((skill, i) => (
          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {skill}
          </span>
        ))}
        {job.skills?.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
            +{job.skills.length - 4} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            {formatBudget(job.budget)}
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {job.timeline?.duration}
          </span>
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {job.experienceLevel}
          </span>
        </div>
        <span className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {job.isRemote ? 'Remote' : job.location}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {job.client?.avatar ? (
              <img
                src={job.client.avatar}
                alt={job.client.name}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <Building className="w-4 h-4 text-gray-400 mr-2" />
            )}
            <span className="text-sm text-gray-600">
              {job.client?.profile?.company || job.client?.name}
            </span>
            {job.client?.isVerified && <Star className="w-4 h-4 text-yellow-500 ml-1" />}
          </div>
          <span className="text-xs text-gray-500">{formatTimeAgo(job.createdAt)}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            {job.viewCount || 0}
          </span>
          <span className="text-xs text-gray-500">{job.proposalCount} proposals</span>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/jobs/${job._id}`)}
        >
          <ExternalLink className="w-4 h-4 mr-1" /> View Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/jobs/${job._id}#apply`)}
        >
          Apply Now
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-600">Find your next freelance project</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <Button type="submit" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </form>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Filters JSX same as your current code */}
            </div>
          )}
        </div>

        {/* Jobs Listing */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.values(filters).some((f) => f)
                ? 'Try adjusting your search criteria or filters'
                : 'No jobs are currently available'}
            </p>
            {(searchQuery || Object.values(filters).some((f) => f)) && (
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
