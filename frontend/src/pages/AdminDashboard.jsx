import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { StatusDistributionChart, LoanTypeChart, ApplicationTrendChart } from '../components/Charts';
import { 
  Users, UserCheck, FileText, CheckCircle2, XCircle, 
  AlertTriangle, Clock, PlusCircle, Sliders, FileSpreadsheet, 
  ShieldCheck, RefreshCw, ArrowUpRight, History
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Admin Greeting & Demo Label Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>DEMO PROJECT DATA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
              WELCOME BACK, {user?.name || 'SYED MOULALI'} Administrator
            </h1>
            <p className="text-blue-100 text-sm mt-1 font-medium">
              Administrator Console — Complete Loan Assessment &amp; Governance Center
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-bold transition flex items-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Operational Actions</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/customers"
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-center space-y-1.5 transition"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>+ Add Customer</span>
          </Link>
          <Link
            to="/apply"
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-center space-y-1.5 transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>+ Create Loan App</span>
          </Link>
          <Link
            to="/applications"
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-center space-y-1.5 transition"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Review Applications</span>
          </Link>
          <Link
            to="/rules"
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-center space-y-1.5 transition"
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Manage Rules</span>
          </Link>
          <Link
            to="/documents"
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-center space-y-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Verify Documents</span>
          </Link>
          <Link
            to="/reports"
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-center space-y-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            <span>Generate Report</span>
          </Link>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Customers" value={data?.totalCustomers || 0} icon={UserCheck} color="indigo" />
        <StatCard title="Total Applications" value={data?.totalApplications || 0} icon={FileText} color="blue" />
        <StatCard title="New Applications" value={data?.newApplications || 0} icon={Clock} color="blue" />
        <StatCard title="Under Verification" value={data?.underVerification || 0} icon={ShieldCheck} color="amber" />
        <StatCard title="Pending Review" value={data?.underReviewApplications || 0} icon={Clock} color="purple" />
        <StatCard title="Eligible Loans" value={data?.eligibleApplications || 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Approved Loans" value={data?.approvedLoans || 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Requires Review" value={data?.requiresReviewApplications || 0} icon={AlertTriangle} color="amber" />
        <StatCard title="Not Eligible" value={data?.notEligibleApplications || 0} icon={XCircle} color="rose" />
        <StatCard title="Unread Notifications" value={data?.unreadNotifications || 0} icon={AlertTriangle} color="rose" />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Applications by Status</h3>
            <span className="text-xs font-medium text-slate-400">Live Breakdown</span>
          </div>
          <StatusDistributionChart data={data?.applicationsByStatus || []} />
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Applications by Loan Type</h3>
            <span className="text-xs font-medium text-slate-400">Categories</span>
          </div>
          <LoanTypeChart data={data?.applicationsByLoanType || []} />
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Volume Trends</h3>
            <span className="text-xs font-medium text-slate-400">Applications</span>
          </div>
          <ApplicationTrendChart data={data?.monthlyApplicationTrends || []} />
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Loan Applications</h3>
            <p className="text-xs text-slate-500">Real-time applications awaiting underwriter action</p>
          </div>
          <Link
            to="/applications"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Queue</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-750">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Loan Type</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Tenure</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Eligibility</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {data?.recentApplications?.map((app) => (
                <tr key={app.applicationId} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-600 dark:text-slate-400">
                    #{app.applicationId}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {app.customerName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {app.loanType}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    ${Number(app.requestedAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {app.tenure} mos
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
                      <span className="text-xs text-slate-400">Pending Eval</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/applications/${app.applicationId}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold transition"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Audit Logs Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent System Audit Trail</h3>
          </div>
          <Link to="/audit-logs" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            View All Logs
          </Link>
        </div>
        <div className="space-y-3">
          {data?.recentAuditLogs?.map((log) => (
            <div
              key={log.auditId}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                <span className="mx-2 text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-400">{log.description}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap ml-4">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
