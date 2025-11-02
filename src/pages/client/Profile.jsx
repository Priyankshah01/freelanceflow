// src/pages/client/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Building,
  Mail,
  MapPin,
  Phone,
  Upload,
  User,
  Users,
} from 'lucide-react';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

// 🔗 use SAME backend as rest of client portal
const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
  'https://freelanceflow-backend-01k4.onrender.com/api';

const ClientProfile = () => {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: '',
    avatar: '',
    profile: {
      company: '',
      industry: '',
      companySize: '',
      location: '',
      phone: '',
      website: '',
    },
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        avatar: user.avatar || '',
        profile: {
          company: user.profile?.company || '',
          industry: user.profile?.industry || '',
          companySize: user.profile?.companySize || '',
          location: user.profile?.location || '',
          phone: user.profile?.phone || '',
          website: user.profile?.website || '',
        },
      });
    }
  }, [user]);

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 5000);
  };

  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE}${endpoint}`;

    const res = await fetch(url, {
      headers: {
        // when sending FormData we will override headers, so keep it flexible
        ...(options.body instanceof FormData
          ? {}
          : {
              'Content-Type': 'application/json',
            }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
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

  const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj
        .map(cleanObject)
        .filter((v) => v !== '' && v !== null && v !== undefined);
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

  const validateFields = () => {
    const errs = {};
    const url = profileData.profile.website?.trim();
    if (url) {
      const urlOk = /^https?:\/\/.+\..+/.test(url);
      if (!urlOk) errs['profile.website'] = 'Enter a valid URL (https://example.com)';
    }
    const phoneVal = profileData.profile.phone?.trim();
    if (phoneVal) {
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
      const errs = validateFields();
      if (Object.keys(errs).length) {
        throw new Error('Please fix the highlighted fields.');
      }

      const payload = {
        name: profileData.name,
        profile: {
          company: profileData.profile.company,
          industry: profileData.profile.industry,
          companySize: profileData.profile.companySize,
          location: profileData.profile.location,
          phone: profileData.profile.phone,
          website: profileData.profile.website,
        },
      };

      const cleanPayload = cleanObject(payload);

      const response = await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(cleanPayload),
      });

      const updatedUser = response?.data?.user || response?.user || response;
      if (updatedUser) {
        updateUser(updatedUser);
        // refresh local
        setProfileData((prev) => ({
          ...prev,
          name: updatedUser.name || prev.name,
          avatar: updatedUser.avatar || prev.avatar,
          profile: {
            ...prev.profile,
            ...(updatedUser.profile || {}),
          },
        }));
      }

      showMessage('success', 'Profile updated successfully!');
      setFieldErrors({});
    } catch (error) {
      const serverErrors = error?.errors || error?.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length) {
        const errs = {};
        serverErrors.forEach((e) => {
          const key = e.param || e.path || 'form';
          errs[key] = e.msg || e.message || 'Invalid value';
        });
        setFieldErrors(errs);
        const msg = serverErrors
          .map((e) => `${e.param || e.path}: ${e.msg || e.message}`)
          .join(' • ');
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

    if (fieldErrors[name]) {
      const next = { ...fieldErrors };
      delete next[name];
      setFieldErrors(next);
    }

    if (name.startsWith('profile.')) {
      const profileField = name.replace('profile.', '');
      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 👇 handle logo upload
  const handleLogoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // reset so same file can be re-uploaded
      fileInputRef.current.click();
    }
  };

  const handleLogoSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      // ⬇️ if your backend expects another field name (e.g. "avatar" or "file"), change it here
      formData.append('logo', file);

      // ⬇️ if your backend route is different, change this:
      const res = await apiRequest('/users/profile/logo', {
        method: 'POST',
        body: formData,
      });

      const updatedUser = res?.data?.user || res?.user || res;
      if (updatedUser) {
        updateUser(updatedUser);
        setProfileData((prev) => ({
          ...prev,
          avatar: updatedUser.avatar || prev.avatar,
          profile: {
            ...prev.profile,
            ...(updatedUser.profile || {}),
          },
        }));
      }

      showMessage('success', 'Logo uploaded successfully!');
    } catch (err) {
      showMessage('error', err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
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
    'Other',
  ];

  const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '500+'];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
          <p className="text-gray-600">Manage your company information and hiring preferences</p>
        </div>

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
                {/* avatar / logo */}
                <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt={profileData.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <Building className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Company Logo</h3>
                    <p className="text-sm text-gray-500">Upload your company logo (PNG/JPG)</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      type="button"
                      onClick={handleLogoClick}
                      disabled={uploadingLogo}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                    {/* hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoSelected}
                    />
                  </div>
                </div>

                {/* form */}
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

                  {/* industry */}
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

                  {/* company size */}
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

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button type="submit" disabled={saving} className="flex items-center space-x-2">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Completeness</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Your profile is {user?.profileCompleteness || 0}% complete
              </span>
              <span className="text-sm font-medium text-indigo-600">
                {user?.profileCompleteness || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${user?.profileCompleteness || 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Complete your profile to attract better freelancers!
            </p>
          </div>

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
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center text-sm">
                <Building className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">Account type:</span>
                <span className="ml-2 font-medium text-gray-900 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Company overview card */}
        {(profileData.profile.company || profileData.profile.industry) && (
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {profileData.profile.company || 'Your Company'}
                </h3>
                <div className="flex items-center space-x-4 mt-2 text-indigo-100">
                  {profileData.profile.industry && (
                    <span className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
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
