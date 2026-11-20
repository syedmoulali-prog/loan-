import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { History, Search, Shield, RefreshCw } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      (log.userName && log.userName.toLowerCase().includes(search.toLowerCase()));
    const matchesEntity = !entityFilter || log.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <History className="w-6 h-6 text-blue-600" />
            <span>Audit Logs &amp; Security Compliance</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable tracking record of user activities, evaluations, rule alterations, and underwriter decisions
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, user, or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold w-full sm:w-auto"
        >
          <option value="">All Entities</option>
          <option value="USER">USER</option>
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="LOAN_APPLICATION">LOAN_APPLICATION</option>
          <option value="LOAN_RULE">LOAN_RULE</option>
          <option value="DOCUMENT">DOCUMENT</option>
          <option value="FINANCIAL_DETAILS">FINANCIAL_DETAILS</option>
          <option value="SYSTEM_SETTING">SYSTEM_SETTING</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-750">
              <tr>
                <th className="px-6 py-4">Audit ID</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {filtered.map((log) => (
                <tr key={log.auditId} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-400">
                    #{log.auditId}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-xs text-slate-900 dark:text-white">
                    {log.userName || 'System'}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {log.entityType} {log.entityId ? `(#${log.entityId})` : ''}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                    {log.description}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
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
