// src/pages/freelancer/Projects.jsx
import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  Briefcase,
  DollarSign,
  Calendar,
  User,
  Eye,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

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
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
};

export default function FreelancerActiveProjects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');

  const canSee = useMemo(
    () => user?.role === 'freelancer' || user?.role === 'admin',
    [user]
  );

  const load = async () => {
    setLoading(true);
    try {
      // Active = proposals you made that are accepted
      const res = await api('/proposals?status=accepted&limit=100&page=1');
      setItems(res?.data?.proposals || []);
      setMsg('');
    } catch (e) {
      setMsg(e.message || 'Failed to load active projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // optional: refresh every 30s
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Active Projects</h1>
          <Button variant="outline" onClick={load}>
            <Loader2 className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {msg && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {msg}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center text-sm text-gray-700">
            <Briefcase className="w-4 h-4 mr-2" />
            Projects from your accepted proposals
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              You don’t have any active projects yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map((p, idx) => {
                const proposalId = p?.id || p?._id;
                const projectId = p?.project?._id || p?.project?.id || p?.project;
                const clientName =
                  p?.project?.client?.name || p?.freelancer?.client?.name || 'Client';

                // virtual available if you used it; otherwise compute quick total
                const milestonesTotal = Array.isArray(p?.milestones)
                  ? p.milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0)
                  : 0;

                const key =
                  proposalId ||
                  `${projectId}-${p?.freelancer?._id || p?.freelancer}-${idx}`;

                return (
                  <li key={key} className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {p?.project?.title || 'Project'}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {clientName}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Agreed: ${Number(p?.bidAmount || 0)}
                            {milestonesTotal > 0 && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Milestones total: ${milestonesTotal})
                              </span>
                            )}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {p?.timeline || '—'}
                          </span>
                          {p?.submittedAt && (
                            <span className="text-xs text-gray-500">
                              Accepted on: {new Date(p?.respondedAt || p?.updatedAt || p?.submittedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {projectId && (
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/jobs/${projectId}`)}
                            title="View job post"
                          >
                            <Eye className="w-4 h-4 mr-1" /> View Job
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={() => alert('Messaging coming soon')}
                          title="Contact client (coming soon)"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" /> Message
                        </Button>
                        {/* Optional: allow withdraw after accept? usually disabled */}
                        {/* <Button variant="destructive" onClick={() => ...}>Withdraw</Button> */}
                      </div>
                    </div>

                    {/* Optional: show milestones */}
                    {Array.isArray(p?.milestones) && p.milestones.length > 0 && (
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          Milestones
                        </div>
                        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                          {p.milestones.map((m, i) => (
                            <li key={`${proposalId || idx}-m${i}`}>
                              {m.description || 'Milestone'} — ${Number(m.amount || 0)}
                              {m.dueDate && (
                                <> • due {new Date(m.dueDate).toLocaleDateString()}</>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
