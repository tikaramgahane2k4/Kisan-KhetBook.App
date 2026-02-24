import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n.jsx';
import { mandiData } from '../data/mandiData';

const MandiPrices = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const filteredData = mandiData.filter(item =>
        item.commodity.toLowerCase().includes(search.toLowerCase()) ||
        item.mandi.toLowerCase().includes(search.toLowerCase()) ||
        item.state.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/account')}
                className="flex items-center space-x-1.5 text-slate-500 hover:text-emerald-600 transition-colors mb-6"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">{t('backToAccount')}</span>
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 font-outfit">{t('marketRates')}</h1>
                <p className="text-slate-500">{t('mandiPricesDesc')}</p>
            </div>

            {/* SearchBar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder={t('searchMandi')}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredData.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{item.commodity}</h3>
                                <p className="text-xs text-slate-500 font-medium">{item.mandi}, {item.state}</p>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                {item.arrivalDate}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="bg-slate-50 p-2 rounded-xl text-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{t('minPrice')}</p>
                                <p className="text-sm font-bold text-slate-700">₹{item.minPrice}</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl text-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{t('maxPrice')}</p>
                                <p className="text-sm font-bold text-slate-700">₹{item.maxPrice}</p>
                            </div>
                            <div className="bg-emerald-50 p-2 rounded-xl text-center border border-emerald-100">
                                <p className="text-[10px] text-emerald-600 font-bold uppercase">{t('modalPrice')}</p>
                                <p className="text-sm font-bold text-emerald-700">₹{item.modalPrice}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-right text-slate-400 mt-2 font-medium italic">* {t('perQuintal')}</p>
                    </div>
                ))}
                {filteredData.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500 italic">
                        No market rates found for your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MandiPrices;
