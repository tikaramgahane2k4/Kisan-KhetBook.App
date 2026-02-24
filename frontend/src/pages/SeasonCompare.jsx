import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n.jsx';
import { cropAPI } from '../services/api';

const SeasonCompare = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [crops, setCrops] = useState([]);
    const [selectedCropName, setSelectedCropName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const res = await cropAPI.getCrops();
                if (res.success) {
                    // Only compare completed crops to get actual profit data
                    const completedCrops = res.data.filter(c => c.status === 'Completed');
                    setCrops(completedCrops);

                    // Set default selection if crops exist
                    if (completedCrops.length > 0) {
                        const uniqueNames = [...new Set(completedCrops.map(c => c.name))];
                        if (uniqueNames.length > 0) setSelectedCropName(uniqueNames[0]);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchCrops();
    }, []);

    const uniqueCropNames = [...new Set(crops.map(c => c.name))];
    const comparisonData = crops.filter(c => c.name === selectedCropName)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    const maxExpense = Math.max(...comparisonData.map(c => c.expenses.reduce((s, e) => s + e.amount, 0)), 1);
    const maxSales = Math.max(...comparisonData.map(c => c.sales.reduce((s, e) => s + e.amount, 0)), 1);

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
                <h1 className="text-3xl font-bold text-slate-800 font-outfit">{t('compareSeasons')}</h1>
                <p className="text-slate-500">{t('seasonCompareDesc')}</p>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : crops.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No completed crops found</h3>
                    <p className="text-slate-500">You need at least two completed crops to compare performance across seasons.</p>
                </div>
            ) : (
                <>
                    <div className="mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                        {uniqueCropNames.map(name => (
                            <button
                                key={name}
                                onClick={() => setSelectedCropName(name)}
                                className={`px-6 py-2.5 rounded-full font-bold mr-3 transition-all ${selectedCropName === name
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {comparisonData.map((crop, idx) => {
                            const totalExpense = crop.expenses.reduce((s, e) => s + e.amount, 0);
                            const totalSales = crop.sales.reduce((s, e) => s + e.amount, 0);
                            const profit = totalSales - totalExpense;
                            const costPerAcre = totalExpense / (crop.landArea || 1);

                            return (
                                <div key={crop._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">{new Date(crop.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</h3>
                                            <p className="text-sm text-slate-500">{crop.landArea} {crop.unit}</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl text-center ${profit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Profit/Loss</p>
                                            <p className={`text-lg font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>₹{Math.abs(profit).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Expense Chart */}
                                        <div>
                                            <div className="flex justify-between mb-1.5 px-0.5">
                                                <span className="text-xs font-bold text-slate-500 uppercase">{t('totalSpent')}</span>
                                                <span className="text-xs font-bold text-slate-800">₹{totalExpense.toLocaleString()}</span>
                                            </div>
                                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(totalExpense / maxExpense) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Sales Chart */}
                                        <div>
                                            <div className="flex justify-between mb-1.5 px-0.5">
                                                <span className="text-xs font-bold text-slate-500 uppercase">{t('totalSalesLabel')}</span>
                                                <span className="text-xs font-bold text-slate-800">₹{totalSales.toLocaleString()}</span>
                                            </div>
                                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(totalSales / maxSales) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50">
                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('costAcre')}</p>
                                            <p className="text-lg font-bold text-slate-700 font-outfit">₹{Math.round(costPerAcre).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ROI</p>
                                            <p className="text-lg font-bold text-blue-700 font-outfit">{((profit / totalExpense) * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default SeasonCompare;
