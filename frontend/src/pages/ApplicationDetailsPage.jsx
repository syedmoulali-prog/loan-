import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { 
  FileText, User, CreditCard, FolderOpen, CheckCircle2, 
  XCircle, AlertTriangle, Cpu, ArrowLeft, RefreshCw, Check, X, 
  Shield, DollarSign, Calendar, Percent, MessageSquare 
} from 'lucide-react';

export const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const { user, isAdmin, isStaff, isReviewer } = useAuth();
  const { success, error } = useToast();

  const [app, setApp] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Decision Modal State
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [interestRate, setInterestRate] = useState(10.0);
  const [remarks, setRemarks] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const appRes = await api.get(`/applications/${id}`);
      setApp(appRes.data);

      if (appRes.data.customerId) {
        try {
          const finRes = await api.get(`/customers/${appRes.data.customerId}/financial`);
          setFinancials(finRes.data);
        } catch (e) {}
      }

      try {
        const docRes = await api.get(`/applications/${id}/documents`);
        setDocuments(docRes.data || []);
      } catch (e) {}

      try {
        const eligRes = await api.get(`/applications/${id}/eligibility`);
        setEligibility(eligRes.data);
      } catch (e) {
        setEligibility(null);
      }
    } catch (err) {
      console.error('Error fetching application details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEvaluate = async () => {
    try {
      setEvaluating(true);
      const res = await api.post(`/applications/${id}/evaluate`);
      setEligibility(res.data);
      setApp((prev) => ({
        ...prev,
        eligibilityStatus: res.data.eligibilityStatus,
        eligibilityScore: res.data.eligibilityScore,
      }));
      success(`Eligibility evaluated: ${res.data.eligibilityStatus} (Score: ${res.data.eligibilityScore}%)`);
    } catch (err) {
      error(err.response?.data?.message || 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/applications/${id}/approve`, {
        interestRate: Number(interestRate),
        remarks: remarks || 'Underwriting approval granted with backend EMI repayment schedule',
      });
      setApp(res.data);
      setShowApproveModal(false);
      success(`Application approved! Monthly Payment: ₹${res.data.repayment?.monthlyPayment}`);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/applications/${id}/reject`, {
        remarks: remarks || 'Application did not meet underwriting criteria.',
      });
      setApp(res.data);
      setShowRejectModal(false);
      success('Application marked as NOT_ELIGIBLE');
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status, defaultRemarks) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/applications/${id}/status`, {
        status,
        remarks: remarks || defaultRemarks,
      });
      setApp(res.data);
      success(`Application status updated to ${status}`);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyDocument = async (docId, verificationStatus) => {
    try {
      await api.put(`/documents/${docId}/verify`, {
        verificationStatus,
        remarks: `Document ${verificationStatus.toLowerCase()} by officer`,
      });
      success(`Document #${docId} marked as ${verificationStatus}`);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Verification update failed');
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-slate-400">Loading application details...</div>;
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Application Not Found</h2>
        <Link to="/applications" className="text-blue-600 underline text-sm mt-2 inline-block">
          Return to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to={isAdmin || isStaff || isReviewer ? "/applications" : "/dashboard/customer"}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Application #{app.applicationId} (LA-{10000 + app.applicationId})
              </h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitted on {app.applicationDate} • Loan Type: <strong>{app.loanType}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls for Admin / Reviewer */}
        {(isAdmin || isReviewer || isStaff) && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-500/20"
            >
              <Cpu className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
              <span>Evaluate</span>
            </button>

            {app.status !== 'APPROVED' && (
              <button
                onClick={() => {
                  setRemarks('');
                  setShowApproveModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>APPROVE</span>
              </button>
            )}

            {app.status !== 'NOT_ELIGIBLE' && app.status !== 'REJECTED' && (
              <button
                onClick={() => {
                  setRemarks('');
                  setShowRejectModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-rose-500/20"
              >
                <X className="w-3.5 h-3.5" />
                <span>REJECT</span>
              </button>
            )}

            <button
              onClick={() => handleUpdateStatus('REQUIRES_REVIEW', 'Flagged for underwriter review')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>REQUIRES REVIEW</span>
            </button>
          </div>
        )}
      </div>

      {/* APPROVED REPAYMENT SCHEDULE DISPLAY (Section 8) */}
      {app.repayment && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-4 mb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                Active Loan Repayment Schedule
              </span>
              <h2 className="text-2xl font-black mt-2">
                Monthly Payment: ₹{Number(app.repayment.monthlyPayment).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold opacity-80">Calculated via Backend EMI</span>
              <div className="text-xl font-mono font-bold">
                Total Payable: ₹{Number(app.repayment.totalPayable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="opacity-80 block">Approved Principal:</span>
              <span className="font-mono font-bold text-sm block mt-0.5">₹{Number(app.repayment.approvedAmount).toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="opacity-80 block">Interest Rate:</span>
              <span className="font-mono font-bold text-sm block mt-0.5">{app.repayment.interestRate}% Annual</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="opacity-80 block">Tenure:</span>
              <span className="font-bold text-sm block mt-0.5">{app.repayment.tenureMonths} Months</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="opacity-80 block">Next Payment Date:</span>
              <span className="font-mono font-bold text-sm block mt-0.5">{app.repayment.nextPaymentDate || '30 days'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Eligibility Engine Output Section (Section 6) */}
      <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-6">
          <div>
            <span className="text-[11px] font-black tracking-wider uppercase text-blue-300 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800">
              Active Rule Engine Evaluation
            </span>
            <div className="flex items-center space-x-3 mt-3">
              <div className="text-3xl font-extrabold tracking-tight">
                Status: {eligibility ? eligibility.eligibilityStatus : (app.eligibilityStatus || 'PENDING EVALUATION')}
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
              {eligibility?.reason || app.remarks || 'Application awaiting evaluation.'}
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="text-center">
              <div className="text-xs text-slate-400 font-bold uppercase">Eligibility Score</div>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                {eligibility?.eligibilityScore || app.eligibilityScore ? `${eligibility?.eligibilityScore || app.eligibilityScore}%` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Rule Checks Breakdown */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Engine Rules Evaluated
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {eligibility?.ruleChecks?.length > 0 ? (
              eligibility.ruleChecks.map((chk, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2">
                  <span className="text-slate-200">{chk}</span>
                </div>
              ))
            ) : (
              <>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2 text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Applicant Age requirement (21 - 65 years)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2 text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Minimum verifiable monthly income check</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2 text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Debt-to-Income (DTI) maximum threshold check</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2 text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Credit information classification</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Applicant & Loan Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information (Section 6) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
            <User className="w-4 h-4 text-blue-600" />
            <span>Customer Details</span>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer ID:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">#{app.customerId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">{app.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{app.customerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{app.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Employment Type:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{app.employmentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Age:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{app.customerAge} years</span>
            </div>
          </div>
        </div>

        {/* Financial Details (Section 6) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Financial Details</span>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Monthly Income:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                ₹{Number(financials?.monthlyIncome || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Monthly Expenses:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                ₹{Number(financials?.monthlyExpenses || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Existing Obligations:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                ₹{Number(financials?.existingObligations || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Debt-to-Income (DTI):</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {financials?.debtToIncomeRatio || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Credit Information:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {financials?.creditInformation || 'FAIR'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Documents (Section 6) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
            <FolderOpen className="w-4 h-4 text-purple-600" />
            <span>Submitted Documents</span>
          </div>
          <span className="text-xs font-bold text-slate-400">{documents.length} Document(s)</span>
        </div>

        <div className="space-y-3">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div
                key={doc.documentId}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{doc.documentType}</span>
                    <StatusBadge status={doc.verificationStatus} />
                  </div>
                  <div className="text-slate-500 mt-1 font-mono text-[11px]">
                    File: {doc.fileName} • Status: {doc.submissionStatus}
                    {doc.remarks && <span className="ml-2 text-slate-400 font-sans">({doc.remarks})</span>}
                  </div>
                </div>

                {(isAdmin || isStaff || isReviewer) && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVerifyDocument(doc.documentId, 'VERIFIED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>
                    <button
                      onClick={() => handleVerifyDocument(doc.documentId, 'REJECTED')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              No documents uploaded for this application.
            </div>
          )}
        </div>
      </div>

      {/* APPROVAL MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Approve Loan Application</span>
            </h3>
            <p className="text-xs text-slate-500">
              Approved amount: <strong>₹{Number(app.requestedAmount).toLocaleString()}</strong> for <strong>{app.tenure} months</strong>. The backend will calculate the exact monthly repayment installment.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="36"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Approval Remarks
              </label>
              <textarea
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Approval notes / terms..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                {actionLoading ? 'Processing...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Reject Loan Application</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Rejection Reason / Remarks
              </label>
              <textarea
                rows="4"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter specific policy reason for rejection..."
                required
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/20"
              >
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
