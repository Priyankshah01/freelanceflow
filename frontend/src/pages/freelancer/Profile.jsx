// src/pages/freelancer/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  User,
  Star,
  Plus,
  X,
  Save
} from 'lucide-react';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

const FreelancerProfile = () => {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [message, setMessage] = useState({ type: '', content: '' });

  // Form state
  const [profileData, setProfileData] = useState({
    name: '',
    profile: {
      bio: '',
      location: '',
      phone: '',
      hourlyRate: '',
      availability: 'available',
      skills: [],
      portfolio: []
    }
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        profile: {
          bio: user.profile?.bio || '',
          location: user.profile?.location || '',
          phone: user.profile?.phone || '',
          hourlyRate: user.profile?.hourlyRate ?? '',
          availability: user.profile?.availability || 'available',
          skills: user.profile?.skills || [],
          portfolio: user.profile?.portfolio || []
        }
      });
    }
  }, [user]);

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 5000);
  };

  // -------- API helper with better error data --------
  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5000/api${endpoint}`;

    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...options
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const err = new Error(data?.message || `HTTP ${res.status}: ${res.statusText}`);
        err.status = res.status;
        err.errors = data?.errors;
        err.response = { status: res.status, data };
        throw err;
      }
      return data;
    } catch (error) {
      // Keep original error object to surface server validation messages
      throw error;
    }
  };

  // -------- utils: deep clean (remove "", null, undefined) --------
  const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj
        .map(cleanObject)
        .filter((v) => v !== '' && v !== null && v !== undefined);
    }
    if (obj && typeof obj === 'object') {
      const out = {};
      Object.keys(obj).forEach((k) => {
        const v = cleanObject(obj[k]);
        if (v !== '' && v !== null && v !== undefined) out[k] = v;
      });
      return out;
    }
    return obj;
  };

  // -------- input change --------
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('profile.')) {
      const field = name.replace('profile.', '');
      setProfileData((prev) => ({
        ...prev,
        profile: { ...prev.profile, [field]: value }
      }));
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // -------- submit profile --------
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Coerce hourlyRate to a Number if present
      const rawHr = profileData.profile.hourlyRate;
      const coercedHr =
        rawHr === '' || rawHr === null || rawHr === undefined ? undefined : Number(rawHr);

      const payload = {
        name: profileData.name,
        profile: {
          bio: profileData.profile.bio,
          location: profileData.profile.location,
          phone: profileData.profile.phone,
          availability: profileData.profile.availability,
          ...(Number.isFinite(coercedHr) ? { hourlyRate: coercedHr } : {})
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
    } catch (error) {
      const serverErrors = error?.errors || error?.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length) {
        const msg = serverErrors
          .map((e) => `${e.param || e.path || 'field'}: ${e.msg || e.message}`)
          .join(' • ');
        showMessage('error', `Update failed: ${msg}`);
      } else {
        showMessage('error', `Update failed: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // -------- skills: add --------
  const handleAddSkill = async (e) => {
    e.preventDefault();
    const skill = newSkill.trim();
    if (!skill) return;

    try {
      const response = await apiRequest('/users/skills', {
        method: 'POST',
        body: JSON.stringify({ skill })
      });

      const updatedUser = response?.data?.user || response?.user || response;
      if (updatedUser) updateUser(updatedUser);

      const skills =
        response?.data?.skills ||
        response?.data?.user?.profile?.skills ||
        updatedUser?.profile?.skills ||
        [];

      setProfileData((prev) => ({
        ...prev,
        profile: { ...prev.profile, skills }
      }));

      setNewSkill('');
      showMessage('success', 'Skill added successfully!');
    } catch (error) {
      const serverErrors = error?.errors || error?.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length) {
        const msg = serverErrors
          .map((e) => `${e.param || e.path || 'skill'}: ${e.msg || e.message}`)
          .join(' • ');
        showMessage('error', `Failed to add skill: ${msg}`);
      } else {
        showMessage('error', `Failed to add skill: ${error.message}`);
      }
    }
  };

  // -------- skills: remove --------
  const handleRemoveSkill = async (skill) => {
    try {
      const response = await apiRequest(`/users/skills/${encodeURIComponent(skill)}`, {
        method: 'DELETE'
      });

      const updatedUser = response?.data?.user || response?.user || response;
      if (updatedUser) updateUser(updatedUser);

      const skills =
        response?.data?.skills ||
        response?.data?.user?.profile?.skills ||
        updatedUser?.profile?.skills ||
        [];

      setProfileData((prev) => ({
        ...prev,
        profile: { ...prev.profile, skills }
      }));

      showMessage('success', 'Skill removed successfully!');
    } catch (error) {
      const serverErrors = error?.errors || error?.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length) {
        const msg = serverErrors
          .map((e) => `${e.param || e.path || 'skill'}: ${e.msg || e.message}`)
          .join(' • ');
        showMessage('error', `Failed to remove skill: ${msg}`);
      } else {
        showMessage('error', `Failed to remove skill: ${error.message}`);
      }
    }
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: User },
    { id: 'skills', name: 'Skills', icon: Star }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your freelancer profile information</p>
        </div>

        {/* Debug Info (remove in production) */}


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
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Basic Info */}
            {activeTab === 'basic' && (
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Full Name"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      required
                    />

                    <FormField
                      label="Email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />

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
                    />

                    <FormField
                      label="Hourly Rate ($)"
                      type="number"
                      name="profile.hourlyRate"
                      value={profileData.profile.hourlyRate}
                      onChange={(e) => {
                        const v = e.target.value;
                        // allow empty, else keep non-negative numeric string
                        if (v === '' || Number(v) >= 0) {
                          handleInputChange(e);
                        }
                      }}
                      min="0"
                      placeholder="50"
                    />

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                      </label>
                      <select
                        name="profile.availability"
                        value={profileData.profile.availability}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="profile.bio"
                      value={profileData.profile.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(profileData.profile.bio || '').length}/1000 characters
                    </p>
                  </div>

                  <div className="flex justify-end">
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
            )}

            {/* Skills */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Skills</h3>

                  {/* Add Skill */}
                  <form onSubmit={handleAddSkill} className="flex space-x-2 mb-6">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a new skill (e.g., React, Node.js, Python)"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <Button type="submit" disabled={!newSkill.trim()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Skill
                    </Button>
                  </form>

                  {/* Skills List */}
                  <div className="space-y-4">
                    {profileData.profile.skills.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="font-medium text-gray-900 mb-2">No skills added yet</h4>
                        <p className="text-gray-600">Add your skills to help clients find you</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {profileData.profile.skills.map((skill, idx) => (
                          <div
                            key={`${skill}-${idx}`}
                            className="flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-3 py-2 rounded-full text-sm font-medium"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-indigo-600 hover:text-indigo-800 ml-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerProfile;
