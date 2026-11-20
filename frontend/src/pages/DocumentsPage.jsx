import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { FolderOpen, Check, X, Search, FileText } from 'lucide-react';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { success, error } = useToast();

  const fetchDocs = async () => {
    try {
      setLoading(true);
      // Fetch documents across applications
      const appsRes = await api.get('/applications');
      const allDocs = [];
      for (const a of appsRes.data.slice(0, 15)) {
        try {
          const docRes = await api.get(`/applications/${a.applicationId}/documents`);
          docRes.data.forEach((d) => allDocs.push({ ...d, customerName: a.customerName, loanType: a.loanType }));
        } catch (e) {}
      }
      setDocuments(allDocs);
    } catch (err) {
      console.error('Error fetching documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleVerify = async (docId, status) => {
    try {
      await api.put(`/documents/${docId}/verify`, {
        verificationStatus: status,
        remarks: `Document ${status.toLowerCase()} by officer`,
      });
      success(`Document #${docId} marked as ${status}`);
      fetchDocs();
    } catch (err) {
      error('Failed to update verification status');
    }
  };

  const filtered = documents.filter(
    (d) =>
      d.documentType.toLowerCase().includes(search.toLowerCase()) ||
      d.fileName.toLowerCase().includes(search.toLowerCase()) ||
      (d.customerName && d.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
          <FolderOpen className="w-6 h-6 text-purple-600" />
          <span>Document Verification Management</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, approve, or reject applicant identity and income documents
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or applicant..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-750">
              <tr>
                <th className="px-6 py-4">Doc ID</th>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">App ID</th>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {filtered.map((doc) => (
                <tr key={doc.documentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-400">
                    #{doc.documentId}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {doc.customerName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                    #{doc.applicationId}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold">
                    {doc.documentType}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {doc.fileName}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={doc.verificationStatus} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleVerify(doc.documentId, 'VERIFIED')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition inline-flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>
                    <button
                      onClick={() => handleVerify(doc.documentId, 'REJECTED')}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition inline-flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
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
