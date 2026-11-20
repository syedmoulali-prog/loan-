import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sliders, Plus, Edit2, Trash2, Power, Search, Check, X, ShieldAlert } from 'lucide-react';

export const RulesManagementPage = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    ruleName: '',
    ruleDescription: '',
    ruleValue: '',
    activeStatus: true,
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rules');
      setRules(res.data);
    } catch (err) {
      console.error('Failed to load rules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openAddModal = () => {
    setEditingRule(null);
    setFormData({ ruleName: '', ruleDescription: '', ruleValue: '', activeStatus: true });
    setModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      ruleName: rule.ruleName,
      ruleDescription: rule.ruleDescription,
      ruleValue: rule.ruleValue,
      activeStatus: rule.activeStatus,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await api.put(`/rules/${editingRule.ruleId}`, formData);
        success(`Rule '${formData.ruleName}' updated successfully`);
      } else {
        await api.post('/rules', formData);
        success(`Rule '${formData.ruleName}' created successfully`);
      }
      setModalOpen(false);
      fetchRules();
    } catch (err) {
      error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleToggleStatus = async (id, name) => {
    try {
      const res = await api.patch(`/rules/${id}/status`);
      success(`Rule '${name}' active status toggled to ${res.data.activeStatus}`);
      fetchRules();
    } catch (err) {
      error('Failed to toggle rule status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete rule '${name}'?`)) return;
    try {
      await api.delete(`/rules/${id}`);
      success(`Rule '${name}' deleted successfully`);
      fetchRules();
    } catch (err) {
      error('Failed to delete rule');
    }
  };

  const filteredRules = rules.filter(
    (r) =>
      r.ruleName.toLowerCase().includes(search.toLowerCase()) ||
      r.ruleDescription.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-blue-600" />
            <span>Eligibility Rule Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic rules that directly govern the automated loan assessment engine
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Rule</span>
          </button>
        )}
      </div>

      {/* Search and Info */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules by name or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs font-bold text-slate-400 hidden sm:block">
          Only <strong className="text-emerald-600">ACTIVE</strong> rules are evaluated by engine
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-750">
              <tr>
                <th className="px-6 py-4">Rule ID</th>
                <th className="px-6 py-4">Rule Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Threshold / Value</th>
                <th className="px-6 py-4">Status</th>
                {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {filteredRules.map((rule) => (
                <tr key={rule.ruleId} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-400">
                    #{rule.ruleId}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                    {rule.ruleName}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                    {rule.ruleDescription}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-900 dark:text-white">
                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      {rule.ruleValue}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        rule.activeStatus
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {rule.activeStatus ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleToggleStatus(rule.ruleId, rule.ruleName)}
                        className={`p-1.5 rounded-lg border transition ${
                          rule.activeStatus
                            ? 'text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                        title={rule.activeStatus ? 'Deactivate Rule' : 'Activate Rule'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(rule)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        title="Edit Rule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.ruleId, rule.ruleName)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Rule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingRule ? `Edit Rule: ${editingRule.ruleName}` : 'Add New Eligibility Rule'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Rule Name (UPPERCASE_IDENTIFIER)
                </label>
                <input
                  type="text"
                  required
                  value={formData.ruleName}
                  onChange={(e) => setFormData({ ...formData, ruleName: e.target.value.toUpperCase() })}
                  placeholder="e.g. MIN_AGE_YEARS"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Rule Description
                </label>
                <input
                  type="text"
                  required
                  value={formData.ruleDescription}
                  onChange={(e) => setFormData({ ...formData, ruleDescription: e.target.value })}
                  placeholder="e.g. Minimum applicant age requirement"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Threshold Value
                </label>
                <input
                  type="text"
                  required
                  value={formData.ruleValue}
                  onChange={(e) => setFormData({ ...formData, ruleValue: e.target.value })}
                  placeholder="e.g. 21 or 50.00"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="activeStatus"
                  checked={formData.activeStatus}
                  onChange={(e) => setFormData({ ...formData, activeStatus: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="activeStatus" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enable active rule evaluation immediately
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
