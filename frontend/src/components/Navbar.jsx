
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n.jsx';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: t('myProfile'),
      desc: t('managePersonalInfo'),
      path: '/profile',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: t('history'),
      desc: t('historyDesc'),
      path: '/history',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: t('settings'),
      desc: t('settingsDesc'),
      path: '/settings',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: t('help'),
      desc: t('helpDesc'),
      path: '/help',
    },
  ];

  return (
    <nav className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5">
              <img src="/logo.png" alt="KhetBook" className="w-10 h-10 object-contain" />
              <span className="font-outfit text-xl font-bold tracking-tight">{t('appName')}</span>
            </Link>
          </div>

          {/* Profile Avatar */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm font-bold uppercase tracking-wide group-hover:bg-white/30 transition-all">
                {getInitials(user?.name)}
              </div>
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                {/* Back / Close Button */}
                <div className="flex items-center px-3 py-2.5 border-b border-slate-100">
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center space-x-1.5 text-slate-500 hover:text-emerald-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">{t('backToDashboard') || 'Back'}</span>
                  </button>
                </div>

                {/* User Info Header */}
                <div className="px-4 py-4 bg-emerald-50 border-b border-emerald-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white text-base font-bold uppercase">
                      {getInitials(user?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {menuItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(item.path);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-emerald-50 transition-colors group"
                    >
                      <span className="text-slate-400 group-hover:text-emerald-600 mt-0.5">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">{item.label}</p>
                        <p className="text-xs text-slate-400 leading-tight">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-slate-100">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">{t('logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
