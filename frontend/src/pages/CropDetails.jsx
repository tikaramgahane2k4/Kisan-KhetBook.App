
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cropAPI, expenseAPI } from '../services/api';
import { useTranslation } from '../i18n.jsx';

// Constants for Enums
export const ExpenseType = {
  LABOUR: 'Labour',
  TRACTOR: 'Tractor',
  THRESHING: 'Paddy Threshing',
  FERTILIZER: 'Fertilizer',
  SEEDS: 'Seeds',
  IRRIGATION: 'Water / Paani',
  OTHER: 'Other'
};

export const CropStatus = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed'
};

const CropDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [crop, setCrop] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const getDefaultExpenseData = () => ({
    type: ExpenseType.LABOUR,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    // Tractor/Machine fields
    machineOwner: '',
    runningHours: '',
    runningMinutes: '',
    chargePerUnit: '',
    // Threshing fields (same as tractor)
    threshingOwner: '',
    threshingHours: '',
    threshingMinutes: '',
    threshingChargePerUnit: '',
    // Labour fields
    labourType: 'male',
    workingTime: 'full',
    customHours: '',
    chargePerPerson: '',
    labourQty: '',
    daysOfWork: '1',
    // Other categories
    itemName: '',
    unitPrice: '',
    quantity: '',
    unit: 'kg',
    brand: '',
    supplier: '',
    // Common
    notes: '',
    billPhoto: null,
    paymentMode: '',
    total: '',
  });
  const [expenseData, setExpenseData] = useState(getDefaultExpenseData());
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleData, setSaleData] = useState({
    weight: '',
    weightUnit: 'kg',
    ratePerUnit: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [farmer, setFarmer] = useState({ name: '', email: '' });
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseFilters, setExpenseFilters] = useState({
    type: 'all',
    query: '',
    from: '',
    to: ''
  });

  useEffect(() => {
    const auth = localStorage.getItem('agri_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setFarmer({
          name: parsed?.user?.name || '',
          email: parsed?.user?.email || ''
        });
      } catch (e) {
        setFarmer({ name: '', email: '' });
      }
    }

    const fetchCrop = async () => {
      if (id) {
        try {
          const response = await cropAPI.getCropById(id);
          if (response.success) {
            setCrop(response.data);
          }
        } catch (err) {
          console.error('Failed to load crop:', err);
          navigate('/');
        }
      }
    };
    fetchCrop();
  }, [id, navigate]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!crop || !id) return;

    // Calculate total based on category
    let total = 0;
    if (expenseData.type === ExpenseType.TRACTOR) {
      let hours = parseFloat(expenseData.runningHours) || 0;
      let minutes = parseFloat(expenseData.runningMinutes) || 0;
      let time = hours + (minutes / 60);
      let charge = parseFloat(expenseData.chargePerUnit) || 0;
      total = time * charge;
    } else if (expenseData.type === ExpenseType.THRESHING) {
      let hours = parseFloat(expenseData.threshingHours) || 0;
      let minutes = parseFloat(expenseData.threshingMinutes) || 0;
      let time = hours + (minutes / 60);
      let charge = parseFloat(expenseData.threshingChargePerUnit) || 0;
      total = time * charge;
    } else if (expenseData.type === ExpenseType.LABOUR) {
      let qty = parseInt(expenseData.labourQty) || 0;
      let charge = parseFloat(expenseData.chargePerPerson) || 0;
      let days = parseInt(expenseData.daysOfWork) || 0;
      let time = 1;
      if (expenseData.workingTime === 'half') time = 0.5;
      else if (expenseData.workingTime === 'custom') time = parseFloat(expenseData.customHours) / 8 || 0;
      total = qty * charge * time * (days || 1);
    } else {
      let qty = parseFloat(expenseData.quantity) || 0;
      let price = parseFloat(expenseData.unitPrice) || 0;
      total = qty * price;
    }

    // Validate required fields
    if (!expenseData.date) return alert('Date is required');
    if (total <= 0) return alert('Total must be greater than 0');

    try {
      setLoading(true);
      // Prepare data for backend (keep backward compatibility)
      const newExpenseData = {
        type: getBackendExpenseType(expenseData.type),
        amount: total,
        date: expenseData.date,
        description: expenseData.description,
        notes: expenseData.notes,
        paymentMode: expenseData.paymentMode,
        // Attach extra fields for future-proofing (backend will ignore unknown fields)
        machineOwner: expenseData.machineOwner,
        runningHours: expenseData.runningHours,
        runningMinutes: expenseData.runningMinutes,
        chargePerUnit: expenseData.chargePerUnit,
        threshingOwner: expenseData.threshingOwner,
        threshingHours: expenseData.threshingHours,
        threshingMinutes: expenseData.threshingMinutes,
        threshingChargePerUnit: expenseData.threshingChargePerUnit,
        labourType: expenseData.labourType,
        workingTime: expenseData.workingTime,
        customHours: expenseData.customHours,
        chargePerPerson: expenseData.chargePerPerson,
        labourQty: expenseData.labourQty,
        daysOfWork: expenseData.daysOfWork,
        itemName: expenseData.itemName,
        unitPrice: expenseData.unitPrice,
        quantity: expenseData.quantity,
        unit: expenseData.unit,
        brand: expenseData.brand,
        supplier: expenseData.supplier,
      };
      // Bill/photo upload not handled here (needs multipart/form-data)
      const response = isEditingExpense && editingExpenseId
        ? await expenseAPI.updateExpense(id, editingExpenseId, newExpenseData)
        : await expenseAPI.addExpense(id, newExpenseData);
      if (response.success) {
        setCrop(response.data);
        setShowExpenseModal(false);
        setExpenseData(getDefaultExpenseData());
        setIsEditingExpense(false);
        setEditingExpenseId(null);
      }
    } catch (err) {
      console.error('Failed to add expense:', err);
      const message = err?.response?.data?.message || err?.message || 'Failed to save expense';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpense = (exp) => {
    const mapped = {
      ...getDefaultExpenseData(),
      ...exp,
      date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };
    setExpenseData(mapped);
    setIsEditingExpense(true);
    setEditingExpenseId(exp._id || exp.id);
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!crop || !id) return;
    if (!window.confirm('Delete this expense?')) return;
    try {
      const response = await expenseAPI.deleteExpense(id, expenseId);
      if (response.success) {
        setCrop(response.data);
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };


  const toggleStatus = async () => {
    if (!crop) return;
    if (crop.status === CropStatus.ACTIVE) {
      setShowSaleModal(true);
    } else {
      // Re-activate crop
      try {
        const response = await cropAPI.updateCrop(crop._id, { status: CropStatus.ACTIVE, sales: [] });
        if (response.success) {
          setCrop(response.data);
        }
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    }
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!crop) return;
    try {
      const weight = parseFloat(saleData.weight) || 0;
      const rate = parseFloat(saleData.ratePerUnit) || 0;
      const totalAmount = weight * rate;
      if (!saleData.date) return alert('Date is required');
      if (weight <= 0 || rate <= 0) return alert('Weight and rate must be greater than 0');
      // Add sale to backend
      const response = await cropAPI.addSale(crop._id, {
        amount: totalAmount,
        weight,
        weightUnit: saleData.weightUnit,
        ratePerUnit: rate,
        date: saleData.date,
        description: saleData.description
      });
      if (response.success) {
        // Mark crop as completed
        const updateRes = await cropAPI.updateCrop(crop._id, { status: CropStatus.COMPLETED });
        if (updateRes.success) {
          setCrop(updateRes.data);
        }
        setShowSaleModal(false);
        setSaleData({ weight: '', weightUnit: 'kg', ratePerUnit: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
      }
    } catch (err) {
      console.error('Failed to add sale or complete crop:', err);
      const message = err?.response?.data?.message || err?.message || 'Failed to add sale or complete crop';
      alert(message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalExpense = crop?.expenses.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const totalSales = crop?.sales?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
  const profit = totalSales - totalExpense;

  if (!crop) return null;

  const isCompleted = crop.status === CropStatus.COMPLETED;

  const normalizeExpenseType = (type) => {
    switch (type) {
      case 'Labour Charge':
        return ExpenseType.LABOUR;
      case 'Tractor Charge':
        return ExpenseType.TRACTOR;
      case 'Threshing Charge':
        return ExpenseType.THRESHING;
      case 'Fertilizer Cost':
        return ExpenseType.FERTILIZER;
      case 'Seeds Cost':
        return ExpenseType.SEEDS;
      case 'Irrigation Cost':
        return ExpenseType.IRRIGATION;
      case 'Other Expenses':
        return ExpenseType.OTHER;
      default:
        return type;
    }
  };

  const getExpenseTypeLabel = (type) => {
    const normalized = normalizeExpenseType(type);
    switch (normalized) {
      case ExpenseType.LABOUR:
        return t('expenseType_labour');
      case ExpenseType.TRACTOR:
        return t('expenseType_tractor');
      case ExpenseType.THRESHING:
        return t('expenseType_threshing');
      case ExpenseType.FERTILIZER:
        return t('expenseType_fertilizer');
      case ExpenseType.SEEDS:
        return t('expenseType_seeds');
      case ExpenseType.IRRIGATION:
        return t('expenseType_waterpaani');
      case ExpenseType.OTHER:
        return t('expenseType_other');
      default:
        return type;
    }
  };

  const getBackendExpenseType = (type) => {
    switch (type) {
      case ExpenseType.LABOUR:
        return 'Labour Charge';
      case ExpenseType.TRACTOR:
        return 'Tractor Charge';
      case ExpenseType.THRESHING:
        return 'Threshing Charge';
      case ExpenseType.FERTILIZER:
        return 'Fertilizer Cost';
      case ExpenseType.SEEDS:
        return 'Seeds Cost';
      case ExpenseType.IRRIGATION:
        return 'Irrigation Cost';
      case ExpenseType.OTHER:
        return 'Other Expenses';
      default:
        return type;
    }
  };

  const filteredExpenses = crop.expenses
    .filter(exp => expenseFilters.type === 'all' || normalizeExpenseType(exp.type) === expenseFilters.type)
    .filter(exp => {
      if (!expenseFilters.query) return true;
      const q = expenseFilters.query.toLowerCase();
      return (
        getExpenseTypeLabel(exp.type)?.toLowerCase().includes(q) ||
        exp.description?.toLowerCase().includes(q)
      );
    })
    .filter(exp => {
      if (!expenseFilters.from && !expenseFilters.to) return true;
      const expDate = new Date(exp.date).getTime();
      if (expenseFilters.from) {
        const fromDate = new Date(expenseFilters.from).getTime();
        if (expDate < fromDate) return false;
      }
      if (expenseFilters.to) {
        const toDate = new Date(expenseFilters.to).getTime();
        if (expDate > toDate) return false;
      }
      return true;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Info */}
      <div className="mb-8 no-print">
        <Link to="/" className="text-emerald-600 font-bold flex items-center mb-4 hover:underline">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          {t('backToDashboard')}
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-4xl font-bold text-slate-800 font-outfit">{crop.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${isCompleted ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {crop.status}
              </span>
            </div>
            <p className="text-slate-500 font-medium">{t('startedOn', { date: new Date(crop.startDate).toLocaleDateString() })} • {crop.landArea} {crop.unit}</p>
          </div>
          <div className="flex space-x-3 w-full md:w-auto">
            {isCompleted && (
              <button
                onClick={handlePrint}
                className="flex-1 md:flex-none bg-white border-2 border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
                <span>{t('downloadPdf')}</span>
              </button>
            )}
            <button
              onClick={toggleStatus}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold transition-all ${isCompleted ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
            >
              {isCompleted ? t('reactivateCrop') : t('completeCrop')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        {/* Left Col: Summary & Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 font-outfit">{t('financialSummary')}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-sm font-bold text-emerald-800">{t('totalSpent')}</span>
                <span className="text-2xl font-bold text-emerald-700 font-outfit">₹{totalExpense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-sm font-bold text-blue-800">{t('totalSalesLabel')}</span>
                <span className="text-2xl font-bold text-blue-700 font-outfit">₹{totalSales.toLocaleString()}</span>
              </div>
              {isCompleted && (
                <div className={`flex justify-between items-center p-4 rounded-2xl border ${profit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <span className={`text-sm font-bold ${profit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>{profit >= 0 ? t('profit') : t('loss')}</span>
                  <span className={`text-2xl font-bold font-outfit ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>₹{Math.abs(profit).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-medium text-slate-600">{t('costPerUnit', { unit: crop.unit })}</span>
                <span className="text-lg font-bold text-slate-800 font-outfit">₹{(totalExpense / crop.landArea).toFixed(0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 font-outfit">{t('cropDetailsTitle')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                <span className="text-slate-500">{t('locationLabel')}</span>
                <span className="font-bold text-slate-700">{crop.location || 'Not specified'}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                <span className="text-slate-500">{t('areaLabel')}</span>
                <span className="font-bold text-slate-700">{crop.landArea} {crop.unit}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase tracking-wider font-bold block mb-1">{t('notesLabel')}</span>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl min-h-[60px] italic">
                  {crop.notes || t('noNotes')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Expense List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800 font-outfit">{t('expenseLogs')}</h2>
            {!isCompleted && (
              <button
                onClick={() => setShowExpenseModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md transition-all flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span>{t('addExpense')}</span>
              </button>
            )}

          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 no-print">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t('filterType')}</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={expenseFilters.type}
                  onChange={e => setExpenseFilters({ ...expenseFilters, type: e.target.value })}
                >
                  <option value="all">All</option>
                  {Object.values(ExpenseType).map(type => (
                    <option key={type} value={type}>{getExpenseTypeLabel(type)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t('searchLabel')}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="Type or description"
                  value={expenseFilters.query}
                  onChange={e => setExpenseFilters({ ...expenseFilters, query: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t('fromLabel')}</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={expenseFilters.from}
                  onChange={e => setExpenseFilters({ ...expenseFilters, from: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t('toLabel')}</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={expenseFilters.to}
                  onChange={e => setExpenseFilters({ ...expenseFilters, to: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              {t('showingCount', { filtered: filteredExpenses.length, total: crop.expenses.length })}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{t('expenseTypeLabel')}</th>
                    <th className="px-6 py-4">{t('dateLabel')}</th>
                    <th className="px-6 py-4">{t('descriptionLabel')}</th>
                    <th className="px-6 py-4 text-right">{t('amountLabel')}</th>
                    <th className="px-6 py-4 text-right">{t('actionsLabel')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                        {t('noExpenses')}
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                      <tr key={exp._id || exp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                            <span className="font-bold text-slate-700">{getExpenseTypeLabel(exp.type)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(exp.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate">
                          {exp.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800 font-outfit">
                          ₹{exp.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => handleEditExpense(exp)}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                            >
                              {t('edit')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(exp._id || exp.id)}
                              className="text-xs font-bold text-red-600 hover:text-red-700"
                            >
                              {t('delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-50/50">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right text-sm font-bold text-slate-500 uppercase tracking-wider">{t('grandTotal')}</td>
                    <td className="px-6 py-4 text-right text-xl font-bold text-emerald-700 font-outfit">₹{totalExpense.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Print View Only */}
      <div className="print-only p-8 bg-white print-page">
        <div className="print-scale">
          <div className="flex justify-between items-start border-b-4 border-emerald-600 pb-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 font-outfit">{t('cropExpenseReport')}</h1>
              <p className="text-slate-600 text-lg">{t('reportSubTitle')}</p>
              {(farmer.name || farmer.email) && (
                <p className="text-slate-600 text-sm mt-1">
                  Farmer: {farmer.name || '-'}{farmer.email ? ` • ${farmer.email}` : ''}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800 text-xl">{crop.name}</p>
              <p className="text-slate-500">{t('statusLabel')}: {crop.status}</p>
              <p className="text-slate-500">{t('generatedOn')}: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-slate-200 p-4 rounded-xl">
              <p className="text-xs uppercase font-bold text-slate-400 mb-1">{t('startDate')}</p>
              <p className="font-bold text-slate-800">{new Date(crop.startDate).toLocaleDateString()}</p>
            </div>
            <div className="border border-slate-200 p-4 rounded-xl">
              <p className="text-xs uppercase font-bold text-slate-400 mb-1">{t('landArea')}</p>
              <p className="font-bold text-slate-800">{crop.landArea} {crop.unit}</p>
            </div>
            <div className="border border-slate-200 p-4 rounded-xl">
              <p className="text-xs uppercase font-bold text-slate-400 mb-1">{t('locationLabel')}</p>
              <p className="font-bold text-slate-800">{crop.location || 'General'}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2">{t('salesSummary')}</h2>
            <table className="w-full text-left mb-4">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-3">{t('dateLabel')}</th>
                  <th className="px-4 py-3">{t('descriptionLabel')}</th>
                  <th className="px-4 py-3 text-right">{t('amountLabel')}</th>
                </tr>
              </thead>
              <tbody>
                {crop.sales && crop.sales.length > 0 ? crop.sales.map(sale => (
                  <tr key={sale._id || sale.id} className="border-b">
                    <td className="px-4 py-3">{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{sale.description || '-'}</td>
                    <td className="px-4 py-3 text-right">₹{sale.amount.toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-4 py-3 text-center text-slate-500 italic">{t('noSalesRecorded')}</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50">
                  <td colSpan={2} className="px-4 py-4 text-right font-bold text-blue-800 text-xl">{t('totalSalesFooter')}</td>
                  <td className="px-4 py-4 text-right font-bold text-blue-900 text-2xl">₹{totalSales.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">{t('completeExpenseBreakdown')}</h2>
          <table className="w-full text-left mb-10">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-4 py-3">{t('expenseTypeLabel')}</th>
                <th className="px-4 py-3">{t('dateLabel')}</th>
                <th className="px-4 py-3">{t('descriptionLabel')}</th>
                <th className="px-4 py-3 text-right">{t('amountLabel')}</th>
              </tr>
            </thead>
            <tbody>
              {crop.expenses.map(exp => (
                <tr key={exp._id || exp.id} className="border-b">
                  <td className="px-4 py-3 font-bold">{getExpenseTypeLabel(exp.type)}</td>
                  <td className="px-4 py-3">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{exp.description}</td>
                  <td className="px-4 py-3 text-right">₹{exp.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-emerald-50">
                <td colSpan={3} className="px-4 py-5 text-right font-bold text-emerald-800 text-xl">{t('totalCost')}</td>
                <td className="px-4 py-5 text-right font-bold text-emerald-900 text-2xl">₹{totalExpense.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex justify-end mb-10">
            <div className={`px-6 py-4 rounded-2xl border ${profit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <p className={`text-sm font-bold ${profit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>{profit >= 0 ? 'TOTAL PROFIT' : 'TOTAL LOSS'}</p>
              <p className={`text-2xl font-bold font-outfit ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>₹{Math.abs(profit).toLocaleString()}</p>
            </div>
          </div>


          <div className="mt-20 flex justify-between">
            <div className="text-center">
              <div className="w-48 border-b border-slate-400 mb-2"></div>
              <p className="text-sm font-medium text-slate-500">{t('farmerSignature')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">© Generated via AgriExpense Platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 z-[60] transition-opacity bg-slate-900 bg-opacity-70" onClick={() => { setShowExpenseModal(false); setIsEditingExpense(false); setEditingExpenseId(null); }}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-[70] inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddExpense}>
                <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white font-outfit">{isEditingExpense ? t('editExpenseTitle') : t('recordExpense')}</h3>
                  <button type="button" onClick={() => { setShowExpenseModal(false); setIsEditingExpense(false); setEditingExpenseId(null); }} className="text-white hover:text-emerald-100">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('expenseTypeLabel')}</label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      value={expenseData.type}
                      onChange={e => setExpenseData({ ...expenseData, type: e.target.value })}
                    >
                      {Object.values(ExpenseType).map(type => (
                        <option key={type} value={type}>{getExpenseTypeLabel(type)}</option>
                      ))}
                    </select>
                  </div>
                  {/* Conditional fields based on category */}
                  {expenseData.type === ExpenseType.TRACTOR && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('dateLabel')}</label>
                          <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" value={expenseData.date} onChange={e => setExpenseData({ ...expenseData, date: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('ownerOperator')}</label>
                          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.machineOwner} onChange={e => setExpenseData({ ...expenseData, machineOwner: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('runningTime')}</label>
                          <div className="flex gap-2">
                            <input type="number" min={0} className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder={t('hours')} value={expenseData.runningHours} onChange={e => setExpenseData({ ...expenseData, runningHours: e.target.value })} />
                            <input type="number" min={0} max={59} className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder={t('minutes')} value={expenseData.runningMinutes} onChange={e => setExpenseData({ ...expenseData, runningMinutes: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('chargePerHour')}</label>
                          <input type="number" min={0} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.chargePerUnit} onChange={e => setExpenseData({ ...expenseData, chargePerUnit: e.target.value })} />
                        </div>
                      </div>
                      <div className="mt-2 text-right font-bold text-emerald-700">{t('totalLabel')}: ₹{(() => {
                        let hours = parseFloat(expenseData.runningHours) || 0;
                        let minutes = parseFloat(expenseData.runningMinutes) || 0;
                        let time = hours + (minutes / 60);
                        let charge = parseFloat(expenseData.chargePerUnit) || 0;
                        let total = time * charge;
                        return isNaN(total) ? 0 : total.toFixed(2);
                      })()}</div>
                    </>
                  )}
                  {expenseData.type === ExpenseType.IRRIGATION && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('dateLabel')}</label>
                          <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" value={expenseData.date} onChange={e => setExpenseData({ ...expenseData, date: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('ownerOperator')}</label>
                          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.machineOwner} onChange={e => setExpenseData({ ...expenseData, machineOwner: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('runningTime')}</label>
                          <div className="flex gap-2">
                            <input type="number" min={0} className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder={t('hours')} value={expenseData.runningHours} onChange={e => setExpenseData({ ...expenseData, runningHours: e.target.value })} />
                            <input type="number" min={0} max={59} className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder={t('minutes')} value={expenseData.runningMinutes} onChange={e => setExpenseData({ ...expenseData, runningMinutes: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('chargePerHour')}</label>
                          <input type="number" min={0} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.chargePerUnit} onChange={e => setExpenseData({ ...expenseData, chargePerUnit: e.target.value })} />
                        </div>
                      </div>
                      <div className="mt-2 text-right font-bold text-emerald-700">{t('totalLabel')}: ₹{(() => {
                        let hours = parseFloat(expenseData.runningHours) || 0;
                        let minutes = parseFloat(expenseData.runningMinutes) || 0;
                        let time = hours + (minutes / 60);
                        let charge = parseFloat(expenseData.chargePerUnit) || 0;
                        let total = time * charge;
                        return isNaN(total) ? 0 : total.toFixed(2);
                      })()}</div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('notesOptionalLabel')}</label>
                          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.notes} onChange={e => setExpenseData({ ...expenseData, notes: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('paymentMode')}</label>
                          <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.paymentMode} onChange={e => setExpenseData({ ...expenseData, paymentMode: e.target.value })}>
                            <option value="">Select</option>
                            <option value="cash">Cash</option>
                            <option value="upi">UPI</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                  {expenseData.type === ExpenseType.LABOUR && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('dateLabel')}</label>
                          <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.date} onChange={e => setExpenseData({ ...expenseData, date: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('labourType')}</label>
                          <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.labourType} onChange={e => setExpenseData({ ...expenseData, labourType: e.target.value })}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('workingTime')}</label>
                          <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.workingTime} onChange={e => setExpenseData({ ...expenseData, workingTime: e.target.value })}>
                            <option value="full">{t('fullDay')}</option>
                            <option value="half">{t('halfDay')}</option>
                            <option value="custom">{t('customHours')}</option>
                          </select>
                        </div>
                        {expenseData.workingTime === 'custom' && (
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">{t('customHours')}</label>
                            <input type="number" min={1} max={24} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.customHours} onChange={e => setExpenseData({ ...expenseData, customHours: e.target.value })} />
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('chargePerPerson')}</label>
                          <input type="number" min={0} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.chargePerPerson} onChange={e => setExpenseData({ ...expenseData, chargePerPerson: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('numberOfWorkers')}</label>
                          <input type="number" min={1} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.labourQty} onChange={e => setExpenseData({ ...expenseData, labourQty: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('daysOfWork')}</label>
                          <input type="number" min={1} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.daysOfWork} onChange={e => setExpenseData({ ...expenseData, daysOfWork: e.target.value })} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('workDescription')}</label>
                          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.description} onChange={e => setExpenseData({ ...expenseData, description: e.target.value })} />
                        </div>
                      </div>
                      <div className="mt-2 text-right font-bold text-emerald-700">{t('totalLabel')}: ₹{(() => {
                        let qty = parseInt(expenseData.labourQty) || 0;
                        let charge = parseFloat(expenseData.chargePerPerson) || 0;
                        let days = parseInt(expenseData.daysOfWork) || 0;
                        let time = 1;
                        if (expenseData.workingTime === 'half') time = 0.5;
                        else if (expenseData.workingTime === 'custom') time = parseFloat(expenseData.customHours) / 8 || 0;
                        let total = qty * charge * time * (days || 1);
                        return isNaN(total) ? 0 : total.toFixed(2);
                      })()}</div>
                    </>
                  )}
                  {expenseData.type === ExpenseType.THRESHING && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('dateLabel')}</label>
                          <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" value={expenseData.date} onChange={e => setExpenseData({ ...expenseData, date: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('ownerOperator')}</label>
                          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.threshingOwner} onChange={e => setExpenseData({ ...expenseData, threshingOwner: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('runningTime')}</label>
                          <div className="flex gap-2">
                            <input type="number" min={0} className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder={t('hours')} value={expenseData.threshingHours} onChange={e => setExpenseData({ ...expenseData, threshingHours: e.target.value })} />
                            <input type="number" min={0} max={59} className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder={t('minutes')} value={expenseData.threshingMinutes} onChange={e => setExpenseData({ ...expenseData, threshingMinutes: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('chargePerHour')}</label>
                          <input type="number" min={0} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.threshingChargePerUnit} onChange={e => setExpenseData({ ...expenseData, threshingChargePerUnit: e.target.value })} />
                        </div>
                      </div>
                      <div className="mt-2 text-right font-bold text-emerald-700">{t('totalLabel')}: ₹{(() => {
                        let hours = parseFloat(expenseData.threshingHours) || 0;
                        let minutes = parseFloat(expenseData.threshingMinutes) || 0;
                        let time = hours + (minutes / 60);
                        let charge = parseFloat(expenseData.threshingChargePerUnit) || 0;
                        let total = time * charge;
                        return isNaN(total) ? 0 : total.toFixed(2);
                      })()}</div>
                    </>
                  )}
                  {([ExpenseType.FERTILIZER, ExpenseType.SEEDS, ExpenseType.OTHER].includes(expenseData.type)) && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('dateLabel')}</label>
                          <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.date} onChange={e => setExpenseData({ ...expenseData, date: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('itemName')}</label>
                          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.itemName} onChange={e => setExpenseData({ ...expenseData, itemName: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('unitPrice')}</label>
                          <input type="number" min={0} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.unitPrice} onChange={e => setExpenseData({ ...expenseData, unitPrice: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('quantity')}</label>
                          <input type="number" min={0} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.quantity} onChange={e => setExpenseData({ ...expenseData, quantity: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('unitLabel')}</label>
                          <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.unit} onChange={e => setExpenseData({ ...expenseData, unit: e.target.value })}>
                            <option value="kg">kg</option>
                            <option value="liter">liter</option>
                            <option value="bag">bag</option>
                            <option value="packet">packet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">{t('brandSupplier')}</label>
                          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.brand} onChange={e => setExpenseData({ ...expenseData, brand: e.target.value })} />
                        </div>
                      </div>
                      <div className="mt-2 text-right font-bold text-emerald-700">{t('totalLabel')}: ₹{(() => {
                        let qty = parseFloat(expenseData.quantity) || 0;
                        let price = parseFloat(expenseData.unitPrice) || 0;
                        let total = qty * price;
                        return isNaN(total) ? 0 : total.toFixed(2);
                      })()}</div>
                    </>
                  )}
                  {/* Common enhancements */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('notesOptionalLabel')}</label>
                      <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.notes} onChange={e => setExpenseData({ ...expenseData, notes: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('paymentMode')}</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={expenseData.paymentMode} onChange={e => setExpenseData({ ...expenseData, paymentMode: e.target.value })}>
                        <option value="">Select</option>
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('billUpload')}</label>
                    <input type="file" accept="image/*,application/pdf" className="w-full" onChange={e => setExpenseData({ ...expenseData, billPhoto: e.target.files[0] })} />
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 flex space-x-3 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => { setShowExpenseModal(false); setIsEditingExpense(false); setEditingExpenseId(null); }}
                    className="flex-1 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all"
                  >
                    {isEditingExpense ? t('updateExpense') : t('saveExpense')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-70" onClick={() => setShowSaleModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddSale}>
                <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white font-outfit">{t('recordSaleTitle')}</h3>
                  <button type="button" onClick={() => setShowSaleModal(false)} className="text-white hover:text-blue-100">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('cropWeight')}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        required
                        className="w-2/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Weight"
                        value={saleData.weight}
                        onChange={e => setSaleData({ ...saleData, weight: e.target.value })}
                      />
                      <select
                        className="w-1/3 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={saleData.weightUnit}
                        onChange={e => setSaleData({ ...saleData, weightUnit: e.target.value })}
                      >
                        <option value="kg">kg</option>
                        <option value="quintal">quintal</option>
                        <option value="ton">ton</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('ratePerUnit', { unit: saleData.weightUnit })}</label>
                    <input
                      type="number"
                      min={0}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="0.00"
                      value={saleData.ratePerUnit}
                      onChange={e => setSaleData({ ...saleData, ratePerUnit: e.target.value })}
                    />
                  </div>
                  <div className="text-right font-bold text-blue-700">
                    {t('totalLabel')}: ₹{(() => {
                      const weight = parseFloat(saleData.weight) || 0;
                      const rate = parseFloat(saleData.ratePerUnit) || 0;
                      const total = weight * rate;
                      return isNaN(total) ? 0 : total.toFixed(2);
                    })()}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('dateLabel')}</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={saleData.date}
                      onChange={e => setSaleData({ ...saleData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('descriptionOptional')}</label>
                    <textarea
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                      rows={2}
                      placeholder="e.g. Sold to local market"
                      value={saleData.description}
                      onChange={e => setSaleData({ ...saleData, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 flex space-x-3 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setShowSaleModal(false)}
                    className="flex-1 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
                  >
                    {t('saveSaleComplete')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropDetails;
