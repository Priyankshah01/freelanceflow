// src/pages/client/ProposalDetail.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

// 🔗 unified API base (same as other client pages)
const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
  'https://freelanceflow-backend-01k4.onrender.com/api';

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${endpoint}`, {
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

export default function ProposalDetail() {
  const params = useParams(); // /client/proposals/:id
  const location = useLocation();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // ✅ resolve id from 3 places: /:id → ?id= → state
  const proposalId = useMemo(() => {
    const paramId = params?.id || '';
    const queryId = new URLSearchParams(location.search).get('id') || '';
    const stateId = location.state?.proposalId || '';
    return paramId || queryId || stateId || '';
  }, [params?.id, location.search, location.state]);

  const goBackToList = () => {
    // try history first, else go to list
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/client/proposals');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        if (!proposalId) {
          setMsg('Invalid proposal URL (no id).');
          setProposal(null);
          return;
        }
        const res = await api(`/proposals/${proposalId}`);
        if (!cancelled) {
          setProposal(res?.data?.proposal || null);
          setMsg('');
        }
      } catch (e) {
        if (!cancelled) {
          setProposal(null);
          setMsg(e.message || 'Failed to load proposal');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [proposalId]);

  const updateStatus = async (newStatus) => {
    try {
      if (!proposalId) throw new Error('Missing proposal id.');
      await api(`/proposals/${proposalId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      // re-fetch to show updated data
      const res = await api(`/proposals/${proposalId}`);
      setProposal(res?.data?.proposal || null);
      setMsg(`Status updated to ${newStatus}`);
    } catch (e) {
      setMsg(e.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!proposal) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button variant="ghost" onClick={goBackToList}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to proposals
          </Button>
          <div className="mt-4 text-red-600">{msg || 'Proposal not found.'}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={goBackToList}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {msg && (
          <div className="p-3 border rounded bg-gray-50 text-sm">{msg}</div>
        )}

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                {proposal.project?.title || 'Project'}
              </h1>
              <p className="text-sm text-gray-600">
                Submitted:{' '}
                {proposal.submittedAt
                  ? new Date(proposal.submittedAt).toLocaleString()
                  : '—'}
              </p>
              {proposal.status && (
                <p className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 capitalize">
                  {proposal.status}
                </p>
              )}
            </div>

            <div className="space-x-2">
              {proposal.status === 'pending' && (
                <>
                  <Button
                    onClick={() => updateStatus('accepted')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Accept
                  </Button>
                  <Button
                    onClick={() => updateStatus('rejected')}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Freelancer */}
            <div>
              <div className="text-sm text-gray-500">Freelancer</div>
              <div className="text-gray-900 font-medium">
                {proposal.freelancer?.name || 'Freelancer'}
              </div>
            </div>

            {/* Bid */}
            <div>
              <div className="text-sm text-gray-500">Bid Amount</div>
              <div className="text-gray-900 font-medium">
                ${proposal.bidAmount ?? 0}
              </div>
            </div>

            {/* Timeline */}
            {proposal.timeline && (
              <div>
                <div className="text-sm text-gray-500">Timeline</div>
                <div className="text-gray-900">{proposal.timeline}</div>
              </div>
            )}

            {/* Cover letter */}
            <div>
              <div className="text-sm text-gray-500">Cover Letter</div>
              <div className="text-gray-900 whitespace-pre-wrap">
                {proposal.coverLetter || '—'}
              </div>
            </div>

            {/* Milestones */}
            {proposal.milestones?.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  Milestones
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                  {proposal.milestones.map((m, i) => (
                    <li key={i}>
                      {m.description} — ${m.amount}{' '}
                      {m.dueDate && (
                        <> • due {new Date(m.dueDate).toLocaleDateString()}</>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attachments */}
            {proposal.attachments?.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  Attachments
                </div>
                <ul className="list-disc pl-5 text-sm text-blue-700">
                  {proposal.attachments.map((a, i) => (
                    <li key={i}>
                      <a href={a.url} target="_blank" rel="noreferrer">
                        {a.filename || a.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
