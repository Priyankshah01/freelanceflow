import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import { User, MapPin, Star, DollarSign } from 'lucide-react';

const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
};

const FreelancerPublicProfile = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [freelancer, setFreelancer] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await api(`/users/${id}`);
      setFreelancer(res?.data?.user || null);
    } catch (e) {
      setMsg(e.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading profile…</div>
      </DashboardLayout>
    );
  }

  if (!freelancer) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600">{msg || 'Freelancer not found.'}</div>
      </DashboardLayout>
    );
  }

  const rate = freelancer.profile?.hourlyRate;
  const rating = freelancer.ratings?.average || 0;
  const reviews = freelancer.ratings?.count || 0;
  const skills = freelancer.profile?.skills || [];
  const loc = freelancer.profile?.location || 'Remote';
  const title = freelancer.profile?.title || 'Freelancer';

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {msg && <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded">{msg}</div>}

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
              {freelancer.avatar ? (
                <img src={freelancer.avatar} alt={freelancer.name} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-indigo-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{freelancer.name}</h1>
                  <div className="text-gray-600">{title}</div>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4 text-sm text-gray-700">
                <span className="inline-flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {loc}
                </span>
                <span className="inline-flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {rating > 0 ? `${rating.toFixed(1)} (${reviews})` : 'No reviews'}
                </span>
                <span className="inline-flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {rate ? `$${rate}/hr` : 'Rate N/A'}
                </span>
              </div>
            </div>
          </div>

          {freelancer.profile?.bio && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Bio</h3>
              <p className="text-gray-800">{freelancer.profile.bio}</p>
            </div>
          )}

          {skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button onClick={() => window.history.back()} variant="outline">
              Back
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerPublicProfile;
