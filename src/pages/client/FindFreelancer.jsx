import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  MapPin,
  Star,
  Briefcase,
  DollarSign,
  User,
  Filter,
  Inbox,
  CheckCircle,
  X,
} from 'lucide-react';

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

const availabilityOptions = [
  { value: '', label: 'Any availability' },
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'away', label: 'Away' },
];

const sortOptions = [
  { value: 'best', label: 'Best match' },
  { value: '-ratings.average', label: 'Rating (high → low)' },
  { value: 'ratings.average', label: 'Rating (low → high)' },
  { value: '-earnings.total', label: 'Earnings (high → low)' },
  { value: 'profile.hourlyRate', label: 'Hourly rate (low → high)' },
  { value: '-profile.hourlyRate', label: 'Hourly rate (high → low)' },
];

const SkillChip = ({ children }) => (
  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
    {children}
  </span>
);

const AvailabilityPill = ({ value }) => {
  const map = {
    available: 'bg-green-100 text-green-800',
    busy: 'bg-yellow-100 text-yellow-800',
    away: 'bg-gray-100 text-gray-800',
  };
  if (!value) return null;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${map[value] || 'bg-gray-100 text-gray-800'}`}>
      {value[0].toUpperCase() + value.slice(1)}
    </span>
  );
};

const FindFreelancers = () => {
  const navigate = useNavigate();
  const { user, isClient } = useAuth();
  const [params, setParams] = useSearchParams();

  // query params
  const q = params.get('q') || '';
  const skills = params.get('skills') || '';
  const minRate = params.get('minRate') || '';
  const maxRate = params.get('maxRate') || '';
  const location = params.get('location') || '';
  const availability = params.get('availability') || '';
  const sort = params.get('sort') || 'best';
  const page = Number(params.get('page') || 1);

  const [loading, setLoading] = useState(true);
  const [freelancers, setFreelancers] = useState([]);
  const [total, setTotal] = useState(0);
  const [openProjects, setOpenProjects] = useState([]); // client’s open projects only
  const [inviteModal, setInviteModal] = useState({ open: false, freelancer: null });
  const [msg, setMsg] = useState('');

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const load = async () => {
    setLoading(true);
    setMsg('');
    try {
      // 1) freelancers
      const qs = new URLSearchParams();
      qs.set('role', 'freelancer');
      if (q) qs.set('q', q);
      if (skills) qs.set('skills', skills);
      if (minRate) qs.set('minRate', minRate);
      if (maxRate) qs.set('maxRate', maxRate);
      if (location) qs.set('location', location);
      if (availability) qs.set('availability', availability);
      if (sort) qs.set('sort', sort);
      qs.set('page', String(page));
      qs.set('limit', String(pageSize));

      const res = await api(`/users?${qs.toString()}`);
      setFreelancers(res?.data?.users || []);
      setTotal(res?.pagination?.total || 0);

      // 2) only this client's open projects (empty if none or not a client)
      if (isClient && user?._id) {
        // Try API filtering first
        const proQ = new URLSearchParams();
        proQ.set('mine', 'client');
        proQ.set('status', 'open');
        proQ.set('limit', '200');
        const proRes = await api(`/projects?${proQ.toString()}`);
        const all = proRes?.data?.projects || [];

        // Safety filter on FE (ensures only this client's)
        const mineOpen = all.filter((p) => {
          const cid = String(p.client?._id || p.client || '');
          return cid === String(user._id) && p.status === 'open';
        });

        setOpenProjects(mineOpen);
      } else {
        setOpenProjects([]);
      }
    } catch (e) {
      setMsg(e.message || 'Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, skills, minRate, maxRate, location, availability, sort, page, isClient, user?._id]);

  // Invite flow (requires backend route)
  const [inviteState, setInviteState] = useState({ projectId: '', sending: false, note: '' });

  const sendInvite = async () => {
    if (!inviteModal.freelancer || !inviteState.projectId) return;
    setInviteState((s) => ({ ...s, sending: true }));
    setMsg('');
    try {
      // POST /api/projects/:id/invite   body: { freelancerId, note? }
      await api(`/projects/${inviteState.projectId}/invite`, {
        method: 'POST',
        body: JSON.stringify({
          freelancerId: inviteModal.freelancer._id || inviteModal.freelancer.id,
          note: inviteState.note || '',
        }),
      });
      setInviteModal({ open: false, freelancer: null });
      setInviteState({ projectId: '', sending: false, note: '' });
      setMsg('Invite sent successfully.');
    } catch (e) {
      setInviteState((s) => ({ ...s, sending: false }));
      setMsg(e.message || 'Failed to send invite');
    }
  };

  const clearAll = () => {
    setParams(new URLSearchParams());
  };

  const pages = useMemo(() => {
    const arr = [];
    const max = totalPages;
    const start = Math.max(1, page - 2);
    const end = Math.min(max, page + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Find Freelancers</h1>
        </div>

        {msg && (
          <div className="mb-4 p-3 rounded border border-indigo-200 bg-indigo-50 text-indigo-800">
            {msg}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <div className="flex">
                <input
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                  placeholder="Name, title, bio…"
                  value={q}
                  onChange={(e) => setFilter('q', e.target.value)}
                />
                <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50">
                  <Search className="w-4 h-4 text-gray-500" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Skills (comma separated)</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="React, Node, Figma"
                value={skills}
                onChange={(e) => setFilter('skills', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Location</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="e.g. Remote, New York"
                value={location}
                onChange={(e) => setFilter('location', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Rate ($/hr)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={minRate}
                onChange={(e) => setFilter('minRate', e.target.value)}
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Rate ($/hr)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={maxRate}
                onChange={(e) => setFilter('maxRate', e.target.value)}
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Availability</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={availability}
                onChange={(e) => setFilter('availability', e.target.value)}
              >
                {availabilityOptions.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Sort By</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={sort}
                onChange={(e) => setFilter('sort', e.target.value)}
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-500">Showing page {page} of {totalPages}</div>
            <div className="space-x-2">
              <Button variant="ghost" onClick={clearAll}>Clear</Button>
              <Button onClick={() => load()}>Apply</Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">Freelancers</div>
          </div>

          {loading ? (
            <div className="p-10 flex items-center justify-center text-gray-500">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Loading...
            </div>
          ) : freelancers.length === 0 ? (
            <div className="p-14 text-center text-gray-500">
              <Inbox className="w-10 h-10 mx-auto mb-2" />
              No freelancers found.
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {freelancers.map((f) => {
                const id = String(f._id || f.id);
                const rate = f.profile?.hourlyRate;
                const rating = f.ratings?.average || 0;
                const reviews = f.ratings?.count || 0;
                const skillsArr = f.profile?.skills || [];
                const title = f.profile?.title || 'Freelancer';
                const bio = f.profile?.bio || '';
                const loc = f.profile?.location || 'Remote';
                const avail = f.profile?.availability || '';

                return (
                  <li key={id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {f.avatar ? (
                          <img src={f.avatar} alt={f.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-indigo-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <div className="font-semibold text-gray-900 truncate">{f.name || 'Unnamed'}</div>
                            <div className="text-sm text-gray-600 truncate">{title}</div>
                          </div>
                          <AvailabilityPill value={avail} />
                        </div>

                        <div className="mt-1 flex items-center text-sm text-gray-600 gap-3">
                          <span className="inline-flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {rate ? `$${rate}/hr` : 'Rate N/A'}
                          </span>
                          <span className="inline-flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {rating > 0 ? `${rating.toFixed(1)} (${reviews})` : 'No reviews'}
                          </span>
                          <span className="inline-flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {loc}
                          </span>
                        </div>

                        {bio && (
                          <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                            {bio}
                          </p>
                        )}

                        {skillsArr.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {skillsArr.slice(0, 6).map((s) => (
                              <SkillChip key={s}>{s}</SkillChip>
                            ))}
                            {skillsArr.length > 6 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                +{skillsArr.length - 6} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/client/freelancers/${id}`)}
                          >
                            <Briefcase className="w-4 h-4 mr-1" />
                            View Profile
                          </Button>
                          <Button
                            onClick={() => {
                              if (!isClient) {
                                setMsg('Only clients can invite freelancers.');
                                return;
                              }

                              if (!openProjects || openProjects.length === 0) {
                                setMsg('You have no open projects. Post a job first.');
                                return;
                              }

                              // Open invite modal if projects exist
                              setInviteModal({ open: true, freelancer: f });
                            }}
                            title={
                              !isClient
                                ? 'Only clients can invite'
                                : openProjects?.length === 0
                                  ? 'Post a job first'
                                  : undefined
                            }
                          >
                            Invite to Project
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setFilter('page', String(page - 1))}
            >
              Prev
            </Button>
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => setFilter('page', String(p))}
                className={`px-3 py-1.5 rounded border text-sm ${p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'
                  }`}
              >
                {p}
              </button>
            ))}
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setFilter('page', String(page + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {inviteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invite {inviteModal.freelancer?.name || 'Freelancer'}</h3>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setInviteModal({ open: false, freelancer: null })}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {openProjects.length === 0 ? (
              <div className="text-sm text-gray-600">
                You have no open projects. Post a job first.
              </div>
            ) : (
              <>
                <label className="block text-sm text-gray-700 mb-1">Select Project</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3"
                  value={inviteState.projectId}
                  onChange={(e) => setInviteState((s) => ({ ...s, projectId: e.target.value }))}
                >
                  <option value="">Choose project…</option>
                  {openProjects.map((p) => (
                    <option key={String(p._id || p.id)} value={String(p._id || p.id)}>
                      {p.title}
                    </option>
                  ))}
                </select>

                <label className="block text-sm text-gray-700 mb-1">Message (optional)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={4}
                  placeholder="Say hello and share a brief about the project…"
                  value={inviteState.note}
                  onChange={(e) => setInviteState((s) => ({ ...s, note: e.target.value }))}
                />

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button variant="ghost" onClick={() => setInviteModal({ open: false, freelancer: null })}>
                    Cancel
                  </Button>
                  <Button disabled={!inviteState.projectId || inviteState.sending} onClick={sendInvite}>
                    {inviteState.sending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Send Invite
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FindFreelancers;
