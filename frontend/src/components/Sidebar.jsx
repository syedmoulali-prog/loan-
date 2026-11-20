import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, CheckSquare, 
  Sliders, ShieldCheck, History, Settings, FileSpreadsheet,
  FolderOpen, CreditCard, PlusCircle, UserCheck, LogOut
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isStaff, isReviewer, isCustomer, logout } = useAuth();

  const getLinks = () => {
    if (isAdmin) {
      return [
        { to: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/customers', label: 'Customers', icon: Users },
        { to: '/applications', label: 'Loan Applications', icon: FileText },
        { to: '/documents', label: 'Documents', icon: FolderOpen },
        { to: '/rules', label: 'Eligibility Rules', icon: Sliders },
        { to: '/reports', label: 'Reports', icon: FileSpreadsheet },
        { to: '/users', label: 'User Management', icon: ShieldCheck },
        { to: '/audit-logs', label: 'Audit Logs', icon: History },
        { to: '/settings', label: 'Settings', icon: Settings },
      ];
    }
    if (isStaff) {
      return [
        { to: '/dashboard/staff', label: 'Staff Dashboard', icon: LayoutDashboard },
        { to: '/applications', label: 'Applications Queue', icon: FileText },
        { to: '/customers', label: 'Customer Directory', icon: Users },
        { to: '/documents', label: 'Verify Documents', icon: CheckSquare },
        { to: '/rules', label: 'View Eligibility Rules', icon: Sliders },
      ];
    }
    if (isReviewer) {
      return [
        { to: '/dashboard/reviewer', label: 'Reviewer Dashboard', icon: LayoutDashboard },
        { to: '/applications', label: 'Application Reviews', icon: FileText },
        { to: '/reports', label: 'Audit & Reports', icon: FileSpreadsheet },
        { to: '/rules', label: 'Loan Rules', icon: Sliders },
      ];
    }
    // Customer
    return [
      { to: '/dashboard/customer', label: 'My Dashboard', icon: LayoutDashboard },
      { to: '/apply', label: 'Apply for Loan', icon: PlusCircle },
      { to: '/my-applications', label: 'My Applications', icon: FileText },
      { to: '/profile', label: 'My Profile', icon: UserCheck },
    ];
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Role badge */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Portal</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              {user?.role || 'Guest'}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
