// src/pages/client/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Building,
  Mail,
  MapPin,
  Phone,
  Globe,
  Users,
  Save,
  Upload,
  User,
  Building2 as IndustryIcon
} from 'lucide-react';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

const ClientProfile = () => {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const [profileData, setProfileData] = useState({
    name: '',
    profile: {
      company: '',
      industry: '',
      companySize: '',
      location: '',
      phone: '',
      website: ''
    }
  });

  // simple UI validation state
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        profile: {
          company: user.profile?.company || '',
          industry: user.profile?.industry || '',
          companySize: user.profile?.companySize || '',
          location: user.profile?.location || '',
          phone: user.profile?.phone || '',
          website: user.profile?.website || ''
        }
      });
    }
  }, [user]);

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 5000);
  };

  // ---------- helpers ----------
  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5000/api${endpoint}`;

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...options
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data?.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.errors = data?.errors;
      err.response = { status: res.status, data };
      throw err;
    }
    return data;
  };

  // remove "", null, undefined recursively
  const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(cleanObject).filter(v => v !== '' && v !== null && v !== undefined);
    }
    if (obj && typeof obj === 'object') {
      const out = {};
      for (const k of Object.keys(obj)) {
        const v = cleanObject(obj[k]);
        if (v !== '' && v !== null && v !== undefined) out[k] = v;
      }
      return out;
    }
    return obj;
  };

  // basic client validations (non-blocking but helpful)
  const validateFields = () => {
    const errs = {};
    const url = profileData.profile.website?.trim();
    if (url) {
      // must start with http(s) and have a dot
      const urlOk = /^https?:\/\/.+\..+/.test(url);
      if (!urlOk) errs['profile.website'] = 'Enter a valid URL (https://example.com)';
    }
    const phoneVal = profileData.profile.phone?.trim();
    if (phoneVal) {
      // very loose phone check: digits, spaces, +, -, parentheses
      const phoneOk = /^[0-9+\- ()]{7,}$/.test(phoneVal);
      if (!phoneOk) errs['profile.phone'] = 'Enter a valid phone number';
    }
    if (!profileData.name?.trim()) {
      errs['name'] = 'Contact name is required';
    }
    if (!profileData.profile.company?.trim()) {
      errs['profile.company'] = 'Company name is required';
    }
    if (!profileData.profile.industry?.trim()) {
      errs['profile.industry'] = 'Industry is required';
    }
    setFieldErrors(errs);
    return errs;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // client-side checks
      const errs = validateFields();
      if (Object.keys(errs).length) {
        throw new Error('Please fix the highlighted fields.');
      }

      // build payload, drop empties
      const payload = {
        name: profileData.name,
        profile: {
          company: profileData.profile.company,
          industry: profileData.profile.industry,
          companySize: profileData.profile.companySize,
          location: profileData.profile.location,
          phone: profileData.profile.phone,
          website: profileData.profile.website
        }
      };
      const cleanPayload = cleanObject(payload);

      const response = await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(cleanPayload)
      });

      const updatedUser = response?.data?.user || response?.user || response;
      if (updatedUser) updateUser(updatedUser);

      showMessage('success', 'Profile updated successfully!');
      setFieldErrors({});
    } catch (error) {
      // show server validation array if present
      const serverErrors = error?.errors || error?.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length) {
        const errs = {};
        serverErrors.forEach(e => {
          const key = e.param || e.path || 'form';
          errs[key] = e.msg || e.message || 'Invalid value';
        });
        setFieldErrors(errs);
        const msg = serverErrors.map(e => `${e.param || e.path}: ${e.msg || e.message}`).join(' • ');
        showMessage('error', `Update failed: ${msg}`);
      } else {
        showMessage('error', error.message || 'Update failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // clear per-field error when editing
    if (fieldErrors[name]) {
      const next = { ...fieldErrors };
      delete next[name];
      setFieldErrors(next);
    }

    if (name.startsWith('profile.')) {
      const profileField = name.replace('profile.', '');
      setProfileData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const industryOptions = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'E-commerce',
    'Marketing & Advertising',
    'Real Estate',
    'Manufacturing',
    'Consulting',
    'Non-profit',
    'Entertainment',
    'Other'
  ];

  const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '500+'];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
          <p className="text-gray-600">Manage your company information and hiring preferences</p>
        </div>

        {/* Message */}
        {message.content && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.content}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <form onSubmit={handleUpdateProfile} noValidate>
              <div className="space-y-6">
                {/* Profile Photo Section */}
                <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      <Building className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Company Logo</h3>
                    <p className="text-sm text-gray-500">Upload your company logo</p>
                    <Button variant="outline" size="sm" className="mt-2" type="button">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Contact Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                    error={fieldErrors['name']}
                  />

                  <FormField
                    label="Email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />

                  <FormField
                    label="Company Name"
                    name="profile.company"
                    value={profileData.profile.company}
                    onChange={handleInputChange}
                    required
                    placeholder="Your company name"
                    error={fieldErrors['profile.company']}
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="profile.industry"
                      value={profileData.profile.industry}
                      onChange={handleInputChange}
                      required
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        fieldErrors['profile.industry'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select industry</option>
                      {industryOptions.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                    {fieldErrors['profile.industry'] && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors['profile.industry']}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                    <select
                      name="profile.companySize"
                      value={profileData.profile.companySize}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select company size</option>
                      {companySizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size} employees
                        </option>
                      ))}
                    </select>
                  </div>

                  <FormField
                    label="Location"
                    name="profile.location"
                    value={profileData.profile.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Toronto, ON"
                  />

                  <FormField
                    label="Phone"
                    name="profile.phone"
                    value={profileData.profile.phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                    error={fieldErrors['profile.phone']}
                  />

                  <FormField
                    label="Website"
                    name="profile.website"
                    value={profileData.profile.website}
                    onChange={handleInputChange}
                    placeholder="https://yourcompany.com"
                    error={fieldErrors['profile.website']}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button type="submit" disabled={saving} className="flex items-center space-x-2">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Profile Completeness & Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Completeness */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Completeness</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Your profile is {user?.profileCompleteness || 0}% complete
              </span>
              <span className="text-sm font-medium text-indigo-600">{user?.profileCompleteness || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${user?.profileCompleteness || 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Complete your profile to attract better freelancers!</p>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">Member since:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium text-gray-900">{user?.email}</span>
                {user?.isVerified && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Verified</span>
                )}
              </div>
              <div className="flex items-center text-sm">
                <Building className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">Account type:</span>
                <span className="ml-2 font-medium text-gray-900 capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Overview Card */}
        {(profileData.profile.company || profileData.profile.industry) && (
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {profileData.profile.company || 'Your Company'}
                </h3>
                <div className="flex items-center space-x-4 mt-2 text-indigo-100">
                  {profileData.profile.industry && (
                    <span className="flex items-center">
                      <IndustryIcon className="w-4 h-4 mr-1" />
                      {profileData.profile.industry}
                    </span>
                  )}
                  {profileData.profile.companySize && (
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {profileData.profile.companySize} employees
                    </span>
                  )}
                  {profileData.profile.location && (
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profileData.profile.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;
