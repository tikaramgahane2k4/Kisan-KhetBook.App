import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cropAPI } from '../services/api';
import { useTranslation } from '../i18n.jsx';

const History = () => {
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await cropAPI.getCrops();
      if (response.success) {
        setCrops(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  // Delete a single crop
  const handleDeleteCrop = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return;
    try {
      await cropAPI.deleteCrop(id);
      setCrops(crops => crops.filter(c => c._id !== id));
    } catch (err) {
      alert('Failed to delete crop');
    }
  };

  // Delete all completed crops
  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all completed crops?')) return;
    try {
      await cropAPI.deleteAllCrops();
      // Re-fetch to reflect actual state (backend deletes all crops)
      await fetchCrops();
    } catch (err) {
      alert('Failed to delete all history');
    }
  };


  // Only completed crops
  const filteredCrops = crops.filter(crop => crop.status === 'Completed');

  // Sort by date (newest first)
  const sortedCrops = [...filteredCrops].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const totalStats = {
    totalCrops: crops.length,
    activeCrops: crops.filter(c => c.status === 'Active').length,
    completedCrops: crops.filter(c => c.status === 'Completed').length,
    totalExpense: crops.reduce((sum, c) => sum + (c.totalExpense || 0), 0),
    totalSales: crops.reduce((sum, c) => sum + (c.totalSales || 0), 0)
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      {/* Back Button */}
      <div className="mb-5">
        <Link to="/account" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToAccount')}
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-100 overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-outfit">{t('history')}</h1>
              <p className="text-blue-100 text-sm">{t('historyDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 text-center flex flex-col items-center justify-center min-h-[70px]">
          <p className="text-xl md:text-2xl font-bold text-slate-800 break-words max-w-full">{totalStats.totalCrops}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t('totalCrops')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 text-center flex flex-col items-center justify-center min-h-[70px]">
          <p className="text-xl md:text-2xl font-bold text-red-500 break-words max-w-full">₹{totalStats.totalExpense.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t('totalSpent')}</p>
        </div>
      </div>
      <div className="mb-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 text-center flex flex-col items-center justify-center min-h-[70px] min-w-0">
          <p className="text-xl md:text-2xl font-bold text-emerald-600 break-words w-full">₹{totalStats.totalSales.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t('totalSalesLabel')}</p>
        </div>
      </div>


      {/* Delete All Button */}
      <div className="flex justify-end mb-4">
        {sortedCrops.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold py-1 px-2 rounded-full shadow text-xs border border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Delete All
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-emerald-500 mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : sortedCrops.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-slate-500 text-sm">{t('noHistoryFound')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCrops.map(crop => {
            const profit = (crop.totalSales || 0) - (crop.totalExpense || 0);
            const isProfit = profit >= 0;
            return (
              <div key={crop._id} className="relative group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <Link
                  to={`/crop/${crop._id}`}
                  className="block p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base font-bold text-slate-800 truncate">{crop.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${crop.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                          }`}>
                          {crop.status === 'Active' ? t('statusActive') : t('statusCompleted')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(crop.startDate)}</span>
                        </span>
                        <span>•</span>
                        <span>{crop.landArea} {crop.unit}</span>
                        {crop.location && (
                          <>
                            <span>•</span>
                            <span className="truncate">{crop.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Financial Summary Row */}
                  <div className="flex items-center mt-3 pt-3 border-t border-slate-100 space-x-4">
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">{t('totalSpent')}</p>
                      <p className="text-sm font-bold text-red-500">₹{(crop.totalExpense || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">{t('totalSalesLabel')}</p>
                      <p className="text-sm font-bold text-emerald-600">₹{(crop.totalSales || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs text-slate-400">{isProfit ? t('profit') : t('loss')}</p>
                      <p className={`text-sm font-bold ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isProfit ? '+' : ''}₹{Math.abs(profit).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </Link>
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteCrop(crop._id)}
                  className="absolute top-3 right-3 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-full px-2.5 py-1 shadow-lg border border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-150 z-10 text-xs font-semibold"
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
