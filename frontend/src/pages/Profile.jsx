import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useTranslation } from '../i18n.jsx';

const Profile = ({ user, onUpdateUser, isOpen, onClose }) => {
  const { t } = useTranslation();
  // If isOpen/onClose are not passed, it renders as a full page
  const isModal = typeof isOpen !== 'undefined';
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobile: '',
    pincode: '',
    city: '',
    district: '',
    state: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    pincode: '',
    city: '',
    district: '',
    state: ''
  });
  const [pinLoading, setPinLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Always fetch latest profile on mount, on modal open, and after update
  useEffect(() => {
    if (isModal && !isOpen) return;
    setIsEditing(false);
    setError('');
    setSuccess('');
    const fetchProfile = async () => {
      setFetchLoading(true);
      try {
        const response = await authAPI.getMe();
        if (response.success) {
          const data = {
            name: response.data.name || '',
            email: response.data.email || '',
            mobile: response.data.mobile || '',
            pincode: response.data.pincode || '',
            city: response.data.city || '',
            district: response.data.district || '',
            state: response.data.state || ''
          };
          setProfileData(data);
          setFormData(data);
          if (onUpdateUser) onUpdateUser(response.data);
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [isModal ? isOpen : null, success]);

  const handleEditClick = () => {
    setFormData({ ...profileData });
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile({
        name: formData.name,
        mobile: formData.mobile,
        pincode: formData.pincode,
        city: formData.city,
        district: formData.district,
        state: formData.state
      });
      if (response.success) {
        // Fetch latest profile from backend to ensure all fields are up to date
        const latest = await authAPI.getMe();
        if (latest.success) {
          const data = {
            name: latest.data.name || '',
            email: latest.data.email || '',
            mobile: latest.data.mobile || '',
            pincode: latest.data.pincode || '',
            city: latest.data.city || '',
            district: latest.data.district || '',
            state: latest.data.state || ''
          };
          setProfileData(data);
          setFormData(data);
          if (onUpdateUser) {
            onUpdateUser(latest.data);
          }
        }
        setSuccess(t('profileUpdated'));
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Update failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill address fields from pin code
  useEffect(() => {
    const fetchPinDetails = async () => {
      if (formData.pincode && formData.pincode.length === 6) {
        setPinLoading(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await res.json();
          if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const po = data[0].PostOffice[0];
            setFormData(f => ({
              ...f,
              city: po.Block || po.Taluk || po.Name || f.city,
              district: po.District || f.district,
              state: po.State || f.state
            }));
          }
        } catch (e) {
          // ignore
        } finally {
          setPinLoading(false);
        }
      }
    };
    fetchPinDetails();
    // eslint-disable-next-line
  }, [formData.pincode]);

  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    if (isEditing) {
      handleCancel();
    }
    onClose();
  };

  const displayValue = (value, placeholder) => {
    return value ? value : <span className="text-slate-400 italic">{placeholder || t('notAdded')}</span>;
  };

  const ProfileField = ({ icon, label, value, placeholder }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-slate-100 last:border-b-0">
      <div className="flex-shrink-0 w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5 break-words">{displayValue(value, placeholder)}</p>
      </div>
    </div>
  );

  if (isModal && !isOpen) return null;

  // ===== Shared Profile Content (used in both modal and page) =====
  const profileContent = (
    <>
      {/* Messages */}
      <div className="px-5 sm:px-6 pt-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-3">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-3 flex items-center space-x-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Loading */}
      {fetchLoading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-emerald-500 mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      ) : !isEditing ? (
        /* ===== VIEW MODE ===== */
        <div className="px-5 sm:px-6 pb-5">
          <div className={isModal ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-x-8'}>
            <ProfileField
              icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
              label={t('fullName')}
              value={profileData.name}
              placeholder={t('notAdded')}
            />
            <ProfileField
              icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
              label={t('emailAddress')}
              value={profileData.email}
            />
            <ProfileField
              icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>}
              label={t('mobileNumber')}
              value={profileData.mobile}
              placeholder={t('notAdded')}
            />
            <ProfileField
              icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>}
              label="District"
              value={profileData.district}
              placeholder={t('notAdded')}
            />
            <ProfileField
              icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>}
              label="Pin Code"
              value={profileData.pincode}
              placeholder={t('notAdded')}
            />
            <ProfileField
              icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
              label={t('cityLabel')}
              value={profileData.city}
              placeholder={t('notAdded')}
            />
            <ProfileField
              icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              label={t('stateLabel')}
              value={profileData.state}
              placeholder={t('notAdded')}
            />
          </div>

          <button
            type="button"
            onClick={handleEditClick}
            className="w-full sm:w-auto mt-5 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span>{t('editProfile')}</span>
          </button>
        </div>
      ) : (
        /* ===== EDIT MODE ===== */
        <form onSubmit={handleSubmit} className="px-5 sm:px-6 pb-5 space-y-4">
          <div className={isModal ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-5'}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('fullName')}</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('emailAddress')}</label>
              <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm">
                {formData.email}
              </div>
              <p className="text-xs text-slate-500 mt-1">{t('emailCannotChange')}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('mobileNumber')}</label>
              <input
                type="tel"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="9876543210"
                value={formData.mobile}
                maxLength={10}
                pattern="[0-9]{10}"
                onChange={e => setFormData({
                  ...formData,
                  mobile: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                })}
                required
              />
              {formData.mobile && formData.mobile.length !== 10 && (
                <span className="text-xs text-red-500">Mobile number must be 10 digits</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Pin Code</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter 6-digit PIN code"
                value={formData.pincode}
                maxLength={6}
                onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/[^0-9]/g, '') })}
              />
              {pinLoading && (
                <span className="text-xs text-emerald-600">Fetching address...</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">City / Village</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="City or Village"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">District</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="District"
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">State</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="State"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-5 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-center"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{t('saveChanges')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </>
  );

  // ===== MODAL MODE =====
  if (isModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>

        {/* Modal Window */}
        <div className="relative w-full sm:max-w-lg max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out]">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2.5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-outfit">{t('myProfile')}</h2>
                <p className="text-emerald-100 text-xs">{t('managePersonalInfo')}</p>
              </div>
            </div>
            <button onClick={handleClose} className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {profileContent}
          </div>
        </div>

        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0.5; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ===== FULL PAGE MODE =====
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/account" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          {t('backToAccount')}
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 sm:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-full p-3 sm:p-4">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-outfit">{t('myProfile')}</h1>
              <p className="text-emerald-100 text-sm sm:text-base">{t('managePersonalInfo')}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {profileContent}
      </div>
    </div>
  );
};

export default Profile;
