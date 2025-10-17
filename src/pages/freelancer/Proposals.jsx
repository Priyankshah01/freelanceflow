// src/pages/freelancer/Proposals.jsx
import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Filter, Eye, RefreshCcw, FileText } from 'lucide-react';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`https://freelanceflow-backend-01k4.onrender.com/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
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

export default function FreelancerProposals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [msg, setMsg] = useState('');
  const [lastLoadedAt, setLastLoadedAt] = useState(null);

  const statusFilter = params.get('status') || '';
  const page = Number(params.get('page') || 1);

  const canSee = useMemo(
    () => user?.role === 'freelancer' || user?.role === 'admin',
    [user]
  );

  const loadProposals = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (statusFilter) qs.set('status', statusFilter);
      qs.set('page', String(page));
      qs.set('limit', '20');

      const res = await apiRequest(`/proposals?${qs.toString()}`);
      setProposals(res?.data?.proposals || []);
      setMsg('');
      setLastLoadedAt(new Date());
    } catch (e) {
      setMsg(e.message || 'Failed to load proposals');
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
    const interval = setInterval(loadProposals, 30000); // refresh every 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  if (!canSee) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600">Only freelancers can view this page.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
          <div className="flex items-center gap-2">
            {lastLoadedAt && (
              <span className="text-xs text-gray-500">
                Updated {lastLoadedAt.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" onClick={loadProposals} className="flex items-center space-x-2">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {msg && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">{msg}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
              </div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setFilter('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </aside>

          {/* Main list */}
          <section className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="text-sm text-gray-700">Proposals you submitted</div>
              </div>

              {loading ? (
                <div className="p-8 flex items-center justify-center text-gray-500">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading...
                </div>
              ) : proposals.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <FileText className="w-10 h-10 mx-auto mb-2" />
                  You haven’t submitted any proposals yet.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {proposals.map((p, idx) => {
                    const pid = p?.id || p?._id;
                    const projectId = p?.project?._id || p?.project?.id || p?.project;
                    const key = pid || `${projectId}-${p?.freelancer?._id || p?.freelancer}-${idx}`;

                    return (
                      <li key={key} className="p-4 hover:bg-gray-50 rounded transition">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 line-clamp-1">
                                {p.project?.title || 'Project'}
                              </span>
                              <StatusPill status={p.status} />
                            </div>

                            <div className="mt-1 text-sm text-gray-600">
                              Bid:&nbsp;
                              <span className="font-medium text-gray-900">
                                ${Number(p.bidAmount || 0)}
                              </span>
                              &nbsp;•&nbsp; Submitted:&nbsp;
                              {p.submittedAt ? new Date(p.submittedAt).toLocaleString() : '—'}
                            </div>

                            {p.clientResponse && (
                              <div className="mt-1 text-xs text-gray-600">
                                Client note: <span className="italic">{p.clientResponse}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {projectId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/jobs/${projectId}`)}
                              >
                                <Eye className="w-4 h-4 mr-1" /> Job
                              </Button>
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
}
