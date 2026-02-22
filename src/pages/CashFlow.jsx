import React, { useState, useEffect } from 'react';
import {
    Plus, Search, TrendingUp, TrendingDown, DollarSign, ScanLine,
    Trash2, Edit, X, Save, Loader2, ArrowUpRight, ArrowDownRight,
    Filter, Calendar, Download, Paperclip
} from 'lucide-react';
import {
    getTransactions, createTransaction, updateTransaction, deleteTransaction,
    getTransactionStats, EXPENSE_CATEGORIES, INCOME_CATEGORIES,
    getCategoryInfo, suggestCategory, getReceiptByTransactionId, downloadReceipt
} from '../services/cashFlowService';
import { formatCurrency, DEFAULT_CURRENCY } from '../utils/currency';
import SmartScan from './SmartScan';

export default function CashFlow() {
    const [transactions, setTransactions] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0, netCashFlow: 0, transactionCount: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showSmartScan, setShowSmartScan] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const emptyForm = {
        type: 'expense',
        vendor: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        currency: DEFAULT_CURRENCY,
        tax: '',
        taxRate: 15,
        category: '',
        description: '',
    };
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        let result = transactions;
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(t =>
                t.vendor?.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q) ||
                t.category?.toLowerCase().includes(q)
            );
        }
        if (typeFilter !== 'all') result = result.filter(t => t.type === typeFilter);
        if (categoryFilter !== 'all') result = result.filter(t => t.category === categoryFilter);
        setFiltered(result);
    }, [searchTerm, typeFilter, categoryFilter, transactions]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [txns, s] = await Promise.all([getTransactions(), getTransactionStats()]);
            setTransactions(txns);
            setFiltered(txns);
            setStats(s);
        } catch (error) {
            console.error('Error loading cash flow data:', error);
        }
        setLoading(false);
    };

    const handleOpenModal = (txn = null) => {
        if (txn) {
            setEditingId(txn.id);
            setFormData({
                type: txn.type,
                vendor: txn.vendor || '',
                date: txn.date || '',
                amount: txn.amount || '',
                currency: txn.currency || DEFAULT_CURRENCY,
                tax: txn.tax || '',
                taxRate: txn.taxRate || 15,
                category: txn.category || '',
                description: txn.description || '',
            });
        } else {
            setEditingId(null);
            setFormData(emptyForm);
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.vendor || !formData.amount) return;
        setSaving(true);
        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount),
                tax: parseFloat(formData.tax || 0),
                taxRate: parseFloat(formData.taxRate || 15),
            };
            if (editingId) {
                await updateTransaction(editingId, data);
            } else {
                await createTransaction(data);
            }
            setShowModal(false);
            await loadData();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await deleteTransaction(id);
            await loadData();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-ZA', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

    return (
        <div className="flex-1 p-8 overflow-auto bg-background transition-colors duration-300">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight">Cash Flow</h1>
                        <p className="text-text-muted mt-1">Track income & expenses with smart receipt scanning</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowSmartScan(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <ScanLine className="w-4 h-4" />
                            Smart Scan
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border text-text-main rounded-xl font-bold text-sm hover:bg-primary/5 hover:border-primary/30 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Manually
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Income */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20 group">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <ArrowUpRight className="w-4 h-4 text-emerald-200" />
                                <p className="text-emerald-100 font-bold text-xs uppercase tracking-widest">Total Income</p>
                            </div>
                            <p className="text-3xl font-black mt-2">{formatCurrency(stats.totalIncome)}</p>
                        </div>
                    </div>

                    {/* Expenses */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl shadow-red-500/20 group">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <ArrowDownRight className="w-4 h-4 text-red-200" />
                                <p className="text-red-100 font-bold text-xs uppercase tracking-widest">Total Expenses</p>
                            </div>
                            <p className="text-3xl font-black mt-2">{formatCurrency(stats.totalExpenses)}</p>
                        </div>
                    </div>

                    {/* Net Cash Flow */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 group">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4 text-blue-200" />
                                <p className="text-blue-100 font-bold text-xs uppercase tracking-widest">Net Cash Flow</p>
                            </div>
                            <p className="text-3xl font-black mt-2">{formatCurrency(stats.netCashFlow)}</p>
                            <p className="text-blue-200 text-xs mt-1 font-medium">{stats.transactionCount} transactions</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by vendor, description, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium"
                    >
                        <option value="all">All Types</option>
                        <option value="income">↑ Income</option>
                        <option value="expense">↓ Expenses</option>
                    </select>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium"
                    >
                        <option value="all">All Categories</option>
                        {allCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                        ))}
                    </select>
                </div>

                {/* Transaction List */}
                {loading ? (
                    <div className="bg-surface rounded-2xl p-12 text-center border border-border">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-surface rounded-2xl p-12 text-center border border-border">
                        <DollarSign className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                        <p className="text-text-muted font-medium">
                            {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
                                ? 'No transactions match your filters'
                                : 'No transactions yet. Scan a receipt or add one manually.'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-900/30 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-xs font-black text-text-muted uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-5 text-left text-xs font-black text-text-muted uppercase tracking-widest">Vendor</th>
                                        <th className="px-6 py-5 text-left text-xs font-black text-text-muted uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-5 text-left text-xs font-black text-text-muted uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-5 text-right text-xs font-black text-text-muted uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-5 text-right text-xs font-black text-text-muted uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map(txn => {
                                        const catInfo = getCategoryInfo(txn.category, txn.type);
                                        return (
                                            <tr key={txn.id} className="hover:bg-primary/5 transition-all group">
                                                <td className="px-6 py-5 text-text-main font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-primary/60" />
                                                        {formatDate(txn.date)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div>
                                                        <p className="font-black text-text-main">{txn.vendor}</p>
                                                        {txn.description && (
                                                            <p className="text-xs text-text-muted mt-0.5 truncate max-w-[200px]">{txn.description}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-muted">
                                                        <span>{catInfo.icon}</span>
                                                        {catInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${txn.type === 'income'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {txn.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                        {txn.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <span className={`font-black text-lg ${txn.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, txn.currency || DEFAULT_CURRENCY)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {txn.hasReceipt && (
                                                            <button
                                                                onClick={async () => {
                                                                    const receipt = await getReceiptByTransactionId(txn.id);
                                                                    if (receipt) downloadReceipt(receipt);
                                                                }}
                                                                className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                                                title="Download archived receipt"
                                                            >
                                                                <Paperclip className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleOpenModal(txn)}
                                                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(txn.id)}
                                                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Smart Scan Modal */}
            <SmartScan
                isOpen={showSmartScan}
                onClose={() => setShowSmartScan(false)}
                onSuccess={loadData}
            />

            {/* Add/Edit Transaction Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto pt-20">
                    <div className="bg-surface rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col my-8 border border-border shadow-2xl">
                        <div className="p-8 border-b border-border flex items-center justify-between flex-shrink-0">
                            <h2 className="text-2xl font-black text-text-main tracking-tight">
                                {editingId ? 'Edit Transaction' : 'Add Transaction'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                            <div className="p-8 space-y-5 overflow-y-auto flex-1 custom-scrollbar">

                                {/* Type Toggle */}
                                <div>
                                    <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">Type</label>
                                    <div className="flex gap-2">
                                        {['expense', 'income'].map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: t, category: '' })}
                                                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${formData.type === t
                                                    ? t === 'expense'
                                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                        : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                    : 'bg-background border border-border text-text-muted hover:bg-primary/5'
                                                    }`}
                                            >
                                                {t === 'expense' ? '↓ Expense' : '↑ Income'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Vendor */}
                                <div>
                                    <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">
                                        {formData.type === 'income' ? 'Source / Payer *' : 'Vendor / Merchant *'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.vendor}
                                        onChange={(e) => {
                                            const vendor = e.target.value;
                                            const suggested = suggestCategory(vendor);
                                            setFormData({
                                                ...formData,
                                                vendor,
                                                category: suggested || formData.category
                                            });
                                        }}
                                        className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium placeholder:opacity-30"
                                        placeholder="e.g. Pick n Pay, Shell, Uber..."
                                    />
                                </div>

                                {/* Amount + Date */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">Amount *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0.01"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Tax + Currency */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">Tax / VAT</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.tax}
                                            onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">Currency</label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium cursor-pointer"
                                        >
                                            <option value="ZAR">ZAR — R</option>
                                            <option value="USD">USD — $</option>
                                            <option value="EUR">EUR — €</option>
                                            <option value="GBP">GBP — £</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">Category</label>
                                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${formData.category === cat.id
                                                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                                                    : 'bg-background border border-border text-text-muted hover:bg-primary/5'
                                                    }`}
                                            >
                                                <span>{cat.icon}</span>
                                                <span className="truncate">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="2"
                                        className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium placeholder:opacity-30"
                                        placeholder="Optional note..."
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-8 bg-slate-950/20 backdrop-blur-md border-t border-border flex gap-4 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-4 border border-border text-text-main rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingId ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
