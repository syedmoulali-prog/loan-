import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { FileText, Search, PlusCircle, ArrowUpRight, Filter } from 'lucide-react';

export const ApplicationsQueuePage = () => {
  const { user, isCustomer } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchApps = async () => {
    try {
      setLoading(true);
      let res;
      if (isCustomer && user?.customerId) {
        res = await api.get(`/applications/customer/${user.customerId}`);
      } else {
        res = await api.get('/applications');
      }
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [isCustomer, user]);

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      app.applicationId?.toString().includes(search) ||
      app.loanType?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>{isCustomer ? 'My Loan Applications' : 'Loan Applications Queue'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isCustomer ? 'Track your active applications and underwriter reviews' : 'Real-time pipeline of loan applications across all risk stages'}
          </p>
        </div>

        {isCustomer && (
          <Link
            to="/apply"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/20 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for New Loan</span>
          </Link>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, name, or loan type..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold w-full sm:w-auto"
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
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-750">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Loan Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Tenure</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Eligibility</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {filtered.map((app) => (
                <tr key={app.applicationId} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-400">
                    #{app.applicationId}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {app.customerName}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {app.loanType}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    ${Number(app.requestedAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {app.tenure} mos
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
                      <span className="text-xs text-slate-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/applications/${app.applicationId}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold transition inline-flex items-center space-x-1"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
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
