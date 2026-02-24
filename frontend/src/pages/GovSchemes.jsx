import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n.jsx';
import { schemesData } from '../data/schemesData';

const GovSchemes = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const categories = ['All', ...new Set(schemesData.map(s => s.category))];

    const filteredSchemes = schemesData.filter(scheme => {
        const matchesFilter = filter === 'All' || scheme.category === filter;
        const matchesSearch = scheme.name.toLowerCase().includes(search.toLowerCase()) ||
            scheme.description.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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
                <h1 className="text-3xl font-bold text-slate-800 font-outfit">{t('schemesSubsidies')}</h1>
                <p className="text-slate-500">{t('govSchemesDesc')}</p>
            </div>

            {/* Search & Filter */}
            <div className="space-y-4 mb-8">
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder={t('searchSchemes')}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === cat
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Schemes List */}
            <div className="space-y-4">
                {filteredSchemes.map((scheme) => (
                    <div key={scheme.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-800 mr-4">{scheme.name}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                                {scheme.category}
                            </span>
                        </div>

                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            {scheme.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('benefits')}</p>
                                <p className="text-sm font-bold text-slate-700">{scheme.benefit}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('eligibility')}</p>
                                <p className="text-sm font-bold text-slate-700">{scheme.eligibility}</p>
                            </div>
                        </div>

                        <a
                            href={scheme.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-100 transition-colors w-full sm:w-auto justify-center"
                        >
                            <span>{t('applyNow')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GovSchemes;
