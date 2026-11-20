import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { 
  CheckCircle2, XCircle, AlertTriangle, FileText, 
  ShieldCheck, MessageSquare, ArrowRight, Check, X 
} from 'lucide-react';

export const ReviewerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionStatus, setDecisionStatus] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');
  const { success, error } = useToast();

  const fetchReviewerData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/reviewer');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load reviewer dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewerData();
  }, []);

  const openDecisionModal = (app, defaultStatus) => {
    setSelectedApp(app);
    setDecisionStatus(defaultStatus);
    setRemarks('');
    setDecisionModalOpen(true);
  };

  const handleRecordDecision = async () => {
    if (!selectedApp) return;
    try {
      await api.put(`/applications/${selectedApp.applicationId}/status`, {
        status: decisionStatus,
        remarks: remarks || `Reviewer recorded ${decisionStatus} decision.`,
      });
      success(`Application #${selectedApp.applicationId} updated to ${decisionStatus}`);
      setDecisionModalOpen(false);
      fetchReviewerData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record decision');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-lg">
        <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">Senior Credit Committee</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Underwriter &amp; Manager Review Portal</h1>
        <p className="text-purple-100 text-sm mt-1">Review complex files, verify eligibility indicators, and record binding lending decisions</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Applications for Review" value={data?.totalToReview || 0} icon={FileText} color="purple" />
        <StatCard title="Pending Decisions" value={data?.pendingDecision || 0} icon={AlertTriangle} color="amber" />
        <StatCard title="Approved Applications" value={data?.approvedApplications || 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Rejected Applications" value={data?.rejectedApplications || 0} icon={XCircle} color="rose" />
      </div>

      {/* Review Queue */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Underwriting Decision Queue</h3>
            <p className="text-xs text-slate-500">Requires Senior Loan Manager sign-off or remarks</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-750">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Loan Type</th>
                <th className="px-6 py-4">Requested Amount</th>
                <th className="px-6 py-4">Eligibility Engine Result</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4 text-right">Quick Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {data?.applicationsForReview?.map((app) => (
                <tr key={app.applicationId} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-600 dark:text-slate-400">
                    #{app.applicationId}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {app.customerName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {app.loanType}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    ${Number(app.requestedAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {app.eligibilityStatus ? (
                      <div className="flex items-center space-x-1.5">
                        <StatusBadge status={app.eligibilityStatus} />
                        {app.eligibilityScore && (
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {app.eligibilityScore}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Pending Evaluation</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openDecisionModal(app, 'APPROVED')}
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 transition"
                      title="Quick Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDecisionModal(app, 'REJECTED')}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition"
                      title="Quick Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/applications/${app.applicationId}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition inline-flex items-center space-x-1"
                    >
                      <span>Full Audit</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Recording Modal */}
      {decisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Record Decision for #{selectedApp?.applicationId}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Applicant: <strong>{selectedApp?.customerName}</strong> | Amount: <strong>${Number(selectedApp?.requestedAmount).toLocaleString()}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Decision Status
                </label>
                <select
                  value={decisionStatus}
                  onChange={(e) => setDecisionStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  <option value="APPROVED">APPROVED (Disbursement Authorized)</option>
                  <option value="REQUIRES_REVIEW">REQUIRES_REVIEW (Request More Details)</option>
                  <option value="REJECTED">REJECTED (Decline Application)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Manager Remarks &amp; Justification
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Enter detailed reasoning for this decision..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRecordDecision}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Confirm Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
