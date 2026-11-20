import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sun, Moon, ShieldCheck, User, LogOut, Settings, 
  ChevronDown, Bell, Landmark, Menu, X, LayoutDashboard,
  CheckCircle2, AlertCircle, Clock, Check
} from 'lucide-react';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Load avatar
  useEffect(() => {
    let mounted = true;
    if (user?.customerId) {
      api.get(`/customers/${user.customerId}/photo`, { responseType: 'blob' })
        .then((res) => {
          if (mounted) {
            setAvatarUrl(URL.createObjectURL(res.data));
          }
        })
        .catch(() => {
          if (mounted) setAvatarUrl(null);
        });
    } else {
      setAvatarUrl(null);
    }
    return () => {
      mounted = false;
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [user?.customerId]);

  // Load notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      setNotifications(listRes.data || []);
      setUnreadCount(countRes.data?.unreadCount || 0);
    } catch (e) {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s live refresh
    return () => clearInterval(interval);
  }, [user]);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif.notificationId}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === notif.notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {}
    }

    setNotifOpen(false);

    // Navigate to appropriate detail
    if (notif.relatedEntityType === 'LOAN_APPLICATION' && notif.relatedEntityId) {
      navigate(`/applications/${notif.relatedEntityId}`);
    } else if (notif.relatedEntityType === 'CUSTOMER') {
      const match = notif.message?.match(/Name:\s*([^\n]+)/);
      if (match && match[1]) {
        navigate(`/customers?q=${encodeURIComponent(match[1].trim())}`);
      } else {
        navigate('/customers');
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center space-x-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <Link to="/" className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                Customer Loan Eligibility
              </span>
              <span className="inline-block ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                PRO
              </span>
            </div>
          </Link>
        </div>

        {/* Center/Right: Action Buttons & User Menu */}
        <div className="flex items-center space-x-3">
          {/* Admin Console Shortcut */}
          {isAdmin && (
            <Link
              to="/dashboard/admin"
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Console</span>
            </Link>
          )}

          {/* Theme switch button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Notification Center Bell */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3.5 px-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No notifications to display
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.notificationId}
                          onClick={() => handleMarkAsRead(n)}
                          className={`p-3.5 px-4 cursor-pointer transition flex items-start space-x-3 hover:bg-slate-50 dark:hover:bg-slate-750 ${
                            !n.isRead
                              ? 'bg-blue-50/50 dark:bg-blue-950/20'
                              : 'bg-white dark:bg-slate-800 opacity-80'
                          }`}
                        >
                          <div className="mt-1 flex-shrink-0">
                            {!n.isRead ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                              {n.title}
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                              {n.message}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1.5 font-medium flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User profile dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 pl-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/80"
              >
                <div className="text-right flex flex-col items-end">
                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                    {user.name}
                  </div>
                  <div className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    {user.role === 'ADMINISTRATOR' ? 'Administrator' : user.role}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0) || 'U'
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {user.role === 'ADMINISTRATOR' ? 'Administrator' : user.role}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/dashboard/admin"
                      className="flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2.5" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <User className="w-4 h-4 mr-2.5 text-slate-400" />
                    My Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <Settings className="w-4 h-4 mr-2.5 text-slate-400" />
                      Account Settings
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-t border-slate-100 dark:border-slate-700/60 mt-1 font-semibold"
                  >
                    <LogOut className="w-4 h-4 mr-2.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
