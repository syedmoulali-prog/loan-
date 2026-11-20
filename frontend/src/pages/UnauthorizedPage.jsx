import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Access Forbidden (403)</h1>
        <p className="text-sm text-slate-500 mt-2">
          Your assigned role does not have authorization to view this restricted resource.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
        <h1 className="text-6xl font-black text-blue-600 font-mono">404</h1>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          The requested page could not be located on the platform.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal</span>
        </Link>
      </div>
    </div>
  );
};
