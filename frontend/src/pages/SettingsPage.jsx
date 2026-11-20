import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Settings, Save, Shield, Bell, Moon, Sun, Database, Sliders } from 'lucide-react';

export const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();

  const [settings, setSettings] = useState({
    SYSTEM_NAME: 'Customer Loan Eligibility System',
    DEFAULT_CURRENCY: 'USD',
    MAX_LOAN_AMOUNT: '500000',
    MIN_LOAN_AMOUNT: '1000',
    JWT_EXPIRATION_HOURS: '24',
    NOTIFICATION_EMAIL_ENABLED: 'true',
    ENABLE_AUDIT_LOGS: 'true',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        const map = {};
        res.data.forEach((s) => {
          map[s.key] = s.value;
        });
        setSettings((prev) => ({ ...prev, ...map }));
      } catch (err) {
        console.error('Settings fetch error', err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await api.post('/settings', { key, value, category: 'GENERAL' });
      }
      success('System settings saved successfully');
    } catch (err) {
      error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>System &amp; Security Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure application parameters, financial boundary limits, session duration, and interface themes
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Application Config */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Application Configuration</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">System Name</label>
              <input
                type="text"
                value={settings.SYSTEM_NAME}
                onChange={(e) => handleChange('SYSTEM_NAME', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Default Base Currency</label>
              <input
                type="text"
                value={settings.DEFAULT_CURRENCY}
                onChange={(e) => handleChange('DEFAULT_CURRENCY', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold font-mono"
              />
            </div>
          </div>
        </div>

        {/* Financial Limits */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Financial Threshold Boundaries</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Minimum Loan Amount ($)</label>
              <input
                type="number"
                value={settings.MIN_LOAN_AMOUNT}
                onChange={(e) => handleChange('MIN_LOAN_AMOUNT', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Maximum Loan Cap ($)</label>
              <input
                type="number"
                value={settings.MAX_LOAN_AMOUNT}
                onChange={(e) => handleChange('MAX_LOAN_AMOUNT', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Security & Sessions */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Security &amp; JWT Sessions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">JWT Token Validity (Hours)</label>
              <input
                type="number"
                value={settings.JWT_EXPIRATION_HOURS}
                onChange={(e) => handleChange('JWT_EXPIRATION_HOURS', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono font-bold"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="enableAudit"
                checked={settings.ENABLE_AUDIT_LOGS === 'true'}
                onChange={(e) => handleChange('ENABLE_AUDIT_LOGS', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="enableAudit" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Log All User Actions to Audit Trail
              </label>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Appearance Theme</h3>
            <p className="text-xs text-slate-500 mt-0.5">Toggle between crisp fintech Light mode and high-contrast Dark mode</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-xs font-bold flex items-center space-x-2"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
