
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n.jsx';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-1">
              <img src="/logo.png" alt="KhetBook" className="w-10 h-10 object-contain" />
              <span className="font-outfit text-xl font-bold tracking-tight">{t('appName')}</span>
            </Link>
          </div>

          {/* Profile Avatar */}
          <button
            onClick={() => navigate('/account')}
            className="flex items-center space-x-2 focus:outline-none group"
            title={t('myProfile')}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm font-bold uppercase tracking-wide group-hover:bg-white/30 transition-all">
              {getInitials(user?.name)}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
