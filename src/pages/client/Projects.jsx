import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Filter,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Inbox,
} from 'lucide-react';
import Button from '../../components/common/Button';

const api = async (endpoint, options = {}) => {
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
const fmtMoney = (n = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(n) || 0
  );

const budgetText = (budget) => {
  if (!budget) return '—';
  if (budget.type === 'fixed') return fmtMoney(budget.amount || 0);
  const min = budget.hourlyRate?.min || 0;
  const max = budget.hourlyRate?.max || min || 0;
  return `${fmtMoney(min)} - ${fmtMoney(max)}/hr`;
};

const StatusPill = ({ status }) => {
  const map = {
    open: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    dispute: 'bg-yellow-100 text-yellow-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-800'}`}>
      {String(status || '').replace('-', ' ')}
    </span>
  );
};

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [msg, setMsg] = useState('');

  const status = params.get('status') || 'in-progress'; // default tab
  const page = Number(params.get('page') || 1);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const load = async () => {
    setLoading(true);
    setMsg('');
    try {
      // backend route suggestion:
      // GET /api/projects?mine=client&status=<status>&page=<page>&limit=20
      const qs = new URLSearchParams();
      qs.set('mine', 'client');
      if (status) qs.set('status', status);
      qs.set('page', String(page));
      qs.set('limit', '20');

      const res = await api(`/projects?${qs.toString()}`);
      setProjects(res?.data?.projects || []);
    } catch (e) {
      setMsg(e.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const markCompleted = async (projectId) => {
    try {
      await api(`/projects/${projectId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
      await load();
    } catch (e) {
      setMsg(e.message || 'Failed to update project');
    }
  };

  const cancelProject = async (projectId) => {
    try {
      await api(`/projects/${projectId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      await load();
    } catch (e) {
      setMsg(e.message || 'Failed to update project');
    }
  };

  const tabs = useMemo(
    () => [
      { key: 'open', label: 'Open' },
      { key: 'in-progress', label: 'In Progress' },
      { key: 'completed', label: 'Completed' },
      { key: 'cancelled', label: 'Cancelled' },
    ],
    []
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        </div>

        {msg && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">{msg}</div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2">
          {tabs.map((t) => {
            const active = status === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setFilter('status', t.key)}
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            );
          })}
          <div className="ml-auto text-sm text-gray-500 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Status: <span className="ml-1 font-medium">{tabs.find(t => t.key === status)?.label || 'In Progress'}</span>
          </div>
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">Projects • {tabs.find(t => t.key === status)?.label}</div>
          </div>

          {loading ? (
            <div className="p-10 flex items-center justify-center text-gray-500">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Loading...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-14 text-center text-gray-500">
              <Inbox className="w-10 h-10 mx-auto mb-2" />
              No projects found.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {projects.map((p) => {
                const projectId = String(p._id || p.id);
                const assigned = p.assignedFreelancer || p.freelancer || null; // depending on your model
                const milestones = Array.isArray(p.milestones) ? p.milestones : [];
                const completedMs = milestones.filter(m => m.status === 'completed' || m.status === 'approved').length;
                const progress = Number(p.workCompleted ?? 0);

                return (
                  <li key={projectId} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                          <StatusPill status={p.status} />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="inline-flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {budgetText(p.budget)}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mb-2 flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {assigned?.name ? (
                            <>
                              Assigned to <span className="ml-1 font-medium">{assigned.name}</span>
                            </>
                          ) : (
                            <span className="italic">No freelancer assigned</span>
                          )}
                        </div>

                        {/* Progress + milestones */}
                        <div className="mt-2">
                          <div className="w-40 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Progress: {Math.min(100, Math.max(0, progress))}% • Milestones: {completedMs}/{milestones.length}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {p.status === 'open' && (
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/client/proposals?project=${projectId}`)}
                          >
                            <Briefcase className="w-4 h-4 mr-1" />
                            View Proposals
                          </Button>
                        )}

                        {p.status === 'in-progress' && (
                          <>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => markCompleted(projectId)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Completed
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => cancelProject(projectId)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}

                        {(p.status === 'completed' || p.status === 'cancelled') && (
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/jobs/${projectId}`)}
                          >
                            View
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
      </div>
    </DashboardLayout>
  );
};

export default Projects;
