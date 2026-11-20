import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { 
  FileSpreadsheet, Download, Filter, Search, Calendar, 
  BarChart2, FileText, CheckCircle2, XCircle, AlertTriangle 
} from 'lucide-react';

export const ReportsPage = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('');
  const [loanType, setLoanType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  const { success, error } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (loanType) params.append('loanType', loanType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [dataRes, sumRes] = await Promise.all([
        api.get(`/reports/applications?${params.toString()}`),
        api.get('/reports/summary'),
      ]);

      setReportData(dataRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [status, loanType, startDate, endDate]);

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (loanType) params.append('loanType', loanType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const downloadUrl = `${baseUrl}/reports/export/csv?${params.toString()}`;

    // Trigger direct download
    fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Loan_Applications_Report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        success('CSV report exported successfully');
      })
      .catch(() => error('Failed to export CSV report'));
  };

  const filtered = reportData.filter(
    (app) =>
      app.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      app.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      app.applicationId?.toString().includes(search)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-purple-600" />
            <span>Management &amp; Audit Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregate loan performance, underwriting status distribution, and export compliance data
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-purple-500/20"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <div className="text-xs text-slate-500 font-bold">Total Applications</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {summary?.totalApplications || 0}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <div className="text-xs text-emerald-600 font-bold">Eligible / Approved</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {summary?.eligibleApplications || 0}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <div className="text-xs text-amber-600 font-bold">Requires Review</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {summary?.requiresReviewApplications || 0}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <div className="text-xs text-rose-600 font-bold">Not Eligible / Rejected</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {summary?.notEligibleApplications || 0}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="ELIGIBLE">ELIGIBLE</option>
            <option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
            <option value="REQUIRES_REVIEW">REQUIRES_REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="SUBMITTED">SUBMITTED</option>
          </select>

          <select
            value={loanType}
            onChange={(e) => setLoanType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
          >
            <option value="">All Loan Types</option>
            <option value="Personal Loan">Personal Loan</option>
            <option value="Home Loan">Home Loan</option>
            <option value="Vehicle Loan">Vehicle Loan</option>
            <option value="Education Loan">Education Loan</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
            title="Start Date"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
            title="End Date"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-750">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Loan Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Tenure</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {filtered.map((row) => (
                <tr key={row.applicationId} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">
                    #{row.applicationId}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {row.customerName}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {row.customerEmail}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium">
                    {row.loanType}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    ${Number(row.requestedAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {row.tenure} mos
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {row.applicationDate}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-xs">
                    {row.eligibilityScore ? `${row.eligibilityScore}%` : 'N/A'}
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
