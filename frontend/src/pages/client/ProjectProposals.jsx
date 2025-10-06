// src/pages/client/ProjectProposals.jsx
import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Eye, Loader2, Filter, Users, Inbox } from 'lucide-react';

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:5000/api${endpoint}`, {
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
    throw err;
  }
  return data;
};

const StatusPill = ({ status }) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const ProjectProposals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState([]);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState('');

  const projectId = params.get('project') || '';
  const status = params.get('status') || '';
  const page = Number(params.get('page') || 1);

  const canManage = useMemo(() => user?.role === 'client' || user?.role === 'admin', [user]);

  const load = async () => {
    setLoading(true);
    try {
      // Sidebar stats + project list
      const statRes = await api('/proposals/stats/my-projects');
      setStats(statRes?.data?.stats || []);
      setProjects(statRes?.data?.projects || []);

      // Proposals list
      const qs = new URLSearchParams();
      if (projectId) qs.set('project', projectId);
      if (status) qs.set('status', status);
      qs.set('page', String(page));
      qs.set('limit', '20');

      const listRes = await api(`/proposals?${qs.toString()}`);
      setProposals(listRes?.data?.proposals || []);
      setMessage('');
    } catch (e) {
      setMessage(e.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, status, page]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      if (!id) {
        console.warn('updateStatus called with empty id');
        return;
      }
      await api(`/proposals/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      await load();
    } catch (e) {
      setMessage(e.message || 'Failed to update status');
    }
  };

  if (!canManage) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600">Only clients can manage proposals.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">{message}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar filters & stats */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
              </div>

              <label className="block text-xs text-gray-500 mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setFilter('project', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
              >
                <option value="">All my projects</option>
                {projects.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.title}
                  </option>
                ))}
              </select>

              <label className="block text-xs text-gray-500 mt-3 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setFilter('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Per-Project Stats</h3>
              </div>
              {stats.length === 0 ? (
                <p className="text-xs text-gray-500">No proposals yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.map((s) => (
                    <div key={s.projectId || s.id} className="text-sm">
                      <div className="font-medium text-gray-900">{s.title}</div>
                      <div className="text-xs text-gray-600">
                        total {s.total} • pending {s.pending || 0} • accepted {s.accepted || 0} • rejected{' '}
                        {s.rejected || 0}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main list */}
          <section className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {projectId ? 'Proposals for selected project' : 'Proposals across your projects'}
                </div>
              </div>

              {loading ? (
                <div className="p-8 flex items-center justify-center text-gray-500">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading...
                </div>
              ) : proposals.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Inbox className="w-10 h-10 mx-auto mb-2" />
                  No proposals found.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {proposals.map((p, idx) => {
                    const pid = p?.id || p?._id; // <-- API returns id via transform; fall back to _id just in case
                    const key =
                      pid ||
                      `${p?.project?._id || p?.project}-${p?.freelancer?._id || p?.freelancer}-${idx}`;

                    return (
                      <li key={key} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">
                                {p.project?.title || 'Untitled Project'}
                              </span>
                              <StatusPill status={p.status} />
                            </div>
                            <div className="text-sm text-gray-600">
                              Bid:{' '}
                              <span className="font-medium text-gray-900">
                                ${Number(p.bidAmount || 0)}
                              </span>{' '}
                              • Submitted:{' '}
                              {p.submittedAt ? new Date(p.submittedAt).toLocaleString() : '—'}
                            </div>
                            <div className="text-sm text-gray-600">
                              By:{' '}
                              <span className="font-medium">
                                {p.freelancer?.name || 'Freelancer'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                if (!pid) {
                                  console.warn('No id on proposal:', p);
                                  return;
                                }
                                navigate(`/client/proposals/${pid}`, { state: { proposalId: pid } });
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" /> View
                            </Button>

                            {p.status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => updateStatus(pid, 'accepted')}
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={!pid}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" /> Accept
                                </Button>
                                <Button
                                  onClick={() => updateStatus(pid, 'rejected')}
                                  variant="destructive"
                                  disabled={!pid}
                                >
                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectProposals;
