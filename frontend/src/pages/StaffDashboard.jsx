import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { 
  FileText, Clock, CheckSquare, Search, Filter, 
  CheckCircle2, XCircle, AlertTriangle, ArrowUpDown, Cpu, Edit3
} from 'lucide-react';

export const StaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const { success, error } = useToast();

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/staff');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load staff dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleEvaluate = async (applicationId) => {
    try {
      const res = await api.post(`/applications/${applicationId}/evaluate`);
      success(`Application #${applicationId} evaluated -> ${res.data.eligibilityStatus} (${res.data.eligibilityScore}%)`);
      fetchStaffData();
    } catch (err) {
      error(err.response?.data?.message || 'Evaluation failed');
    }
  };

  const applications = data?.applications || [];
  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      app.applicationId?.toString().includes(search) ||
      app.loanType?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesType = !typeFilter || app.loanType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">Loan Underwriting Queue</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Staff &amp; Loan Officer Center</h1>
            <p className="text-blue-100 text-sm mt-1">Verify applicant documents, assess financial profiles, and trigger automated eligibility evaluations</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard title="Total" value={data?.totalApplications || 0} icon={FileText} color="blue" />
        <StatCard title="New" value={data?.newApplications || 0} icon={Clock} color="purple" />
        <StatCard title="Under Verif." value={data?.underVerification || 0} icon={CheckSquare} color="indigo" />
        <StatCard title="Under Review" value={data?.underReview || 0} icon={AlertTriangle} color="amber" />
        <StatCard title="Eligible" value={data?.eligible || 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Requires Rev." value={data?.requiresReview || 0} icon={AlertTriangle} color="amber" />
        <StatCard title="Not Eligible" value={data?.notEligible || 0} icon={XCircle} color="rose" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, ID, or loan..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_VERIFICATION">UNDER_VERIFICATION</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="ELIGIBLE">ELIGIBLE</option>
            <option value="REQUIRES_REVIEW">REQUIRES_REVIEW</option>
            <option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
            <option value="APPROVED">APPROVED</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium"
          >
            <option value="">All Loan Types</option>
            <option value="Personal Loan">Personal Loan</option>
            <option value="Home Loan">Home Loan</option>
            <option value="Vehicle Loan">Vehicle Loan</option>
            <option value="Education Loan">Education Loan</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-750">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Loan Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">App Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Eligibility</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {filtered.map((app) => (
                <tr key={app.applicationId} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-600 dark:text-slate-400">
                    #{app.applicationId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{app.customerName}</div>
                    <div className="text-xs text-slate-400">{app.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                    {app.loanType}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    ${Number(app.requestedAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {app.applicationDate}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
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
                      <span className="text-xs text-slate-400">Not Evaluated</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleEvaluate(app.applicationId)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition inline-flex items-center space-x-1"
                      title="Run Eligibility Engine"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Evaluate</span>
                    </button>
                    <Link
                      to={`/applications/${app.applicationId}`}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition inline-flex items-center space-x-1"
                    >
                      <span>Review</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
