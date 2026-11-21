import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Landmark, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setFormError('Please enter both email and password.');
      error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(trimmedEmail, password);
      success(`Welcome back, ${user.name}!`);

      if (user.role === 'ADMINISTRATOR') navigate('/dashboard/admin');
      else if (user.role === 'STAFF') navigate('/dashboard/staff');
      else if (user.role === 'REVIEWER') navigate('/dashboard/reviewer');
      else navigate('/dashboard/customer');
    } catch (err) {
      console.error('Login error:', err);
      let errorMsg = 'Invalid email or password';
      if (err.message && err.message.includes('Backend server is not connected')) {
        errorMsg = err.message;
      } else if (typeof err.response?.data === 'string' && err.response.data.includes('<!DOCTYPE html>')) {
        errorMsg = 'Backend server is not connected. API route returned HTML from Vercel.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMsg = 'Unable to connect to backend server. Please verify the backend is running.';
      }
      setFormError(errorMsg);
      error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-4 group">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Landmark className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-slate-800 dark:text-slate-100">
            CUSTOMER LOAN ELIGIBILITY SYSTEM
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Welcome Back
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-200/50 dark:shadow-none">
          {formError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50 tracking-wider uppercase text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>LOGIN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
