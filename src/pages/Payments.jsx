import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard, DollarSign, Calendar, FileText, X, Save, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPayments, getDocuments, recordPayment } from '../services/billingService';
import { formatCurrency, DEFAULT_CURRENCY } from '../utils/currency';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMethod, setFilterMethod] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        documentId: '',
        amount: 0,
        method: 'eft',
        reference: '',
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        let filtered = payments;

        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterMethod !== 'all') {
            filtered = filtered.filter(payment => payment.method === filterMethod);
        }

        setFilteredPayments(filtered);
    }, [searchTerm, filterMethod, payments]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [paymentsData, docsData] = await Promise.all([
                getPayments(),
                getDocuments({ type: 'invoice' })
            ]);
            setPayments(paymentsData);
            setFilteredPayments(paymentsData);
            // Only show invoices that aren't fully paid
            setInvoices(docsData.filter(doc =>
                doc.status !== 'paid' && doc.status !== 'draft'
            ));
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setLoading(false);
    };

    const handleOpenModal = () => {
        setFormData({
            documentId: '',
            amount: 0,
            method: 'eft',
            reference: '',
            notes: ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount)
            };
            await recordPayment(data);
            await loadData();
            handleCloseModal();
        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Failed to record payment');
        }
    };

    const handleDocumentChange = (e) => {
        const docId = e.target.value;
        const invoice = invoices.find(inv => inv.id === docId);
        if (invoice) {
            const outstanding = invoice.total - (invoice.amountPaid || 0);
            setFormData({
                ...formData,
                documentId: docId,
                amount: outstanding
            });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getMethodIcon = (method) => {
        const icons = {
            cash: '💵',
            eft: '🏦',
            card: '💳',
            check: '📝',
            other: '📄'
        };
        return icons[method] || '💳';
    };

    const getMethodLabel = (method) => {
        const labels = {
            cash: 'Cash',
            eft: 'EFT/Bank Transfer',
            card: 'Credit/Debit Card',
            check: 'Check',
            other: 'Other'
        };
        return labels[method] || method;
    };

    const totalPayments = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

    // Billing pages accessible to all users

    return (
        <div className="flex-1 p-8 overflow-auto bg-background transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight">Payments</h1>
                        <p className="text-text-muted mt-1">Track and record invoice payments</p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Record Payment
                    </button>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 mb-1">Total Payments Received</p>
                            <p className="text-4xl font-bold">{formatCurrency(totalPayments)}</p>
                            <p className="text-green-100 mt-2">{filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                            <DollarSign className="w-10 h-10" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search payments by invoice, client, or reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main"
                        />
                    </div>
                    <select
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                        className="px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main"
                    >
                        <option value="all">All Methods</option>
                        <option value="eft">EFT/Bank Transfer</option>
                        <option value="card">Card</option>
                        <option value="cash">Cash</option>
                        <option value="check">Check</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Payments Table */}
                {loading ? (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {searchTerm || filterMethod !== 'all'
                                ? 'No payments found matching your filters'
                                : 'No payments recorded yet. Record your first payment to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-900/30 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-xs font-black text-text-muted uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-5 text-left text-xs font-black text-text-muted uppercase tracking-widest">Invoice</th>
                                        <th className="px-6 py-5 text-left text-xs font-black text-text-muted uppercase tracking-widest">Client</th>
                                        <th className="px-6 py-5 text-left text-xs font-black text-text-muted uppercase tracking-widest">Method</th>
                                        <th className="px-6 py-5 text-left text-xs font-black text-text-muted uppercase tracking-widest">Reference</th>
                                        <th className="px-6 py-5 text-right text-xs font-black text-text-muted uppercase tracking-widest">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredPayments.map(payment => (
                                        <tr key={payment.id} className="hover:bg-primary/5 transition-all group">
                                            <td className="px-6 py-5 text-text-main font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-primary/60" />
                                                    {formatDate(payment.date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/invoices/${payment.documentId}`}
                                                    className="text-primary hover:underline font-medium"
                                                >
                                                    {payment.documentNumber}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5 font-black text-text-main">{payment.clientName}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="p-2 bg-surface border border-border rounded-xl text-lg shadow-sm group-hover:scale-110 transition-transform">{getMethodIcon(payment.method)}</span>
                                                    <span className="text-sm text-text-muted font-bold">{getMethodLabel(payment.method)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-text-muted text-sm font-medium">
                                                {payment.reference || <span className="opacity-20">—</span>}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="font-black text-green-500 text-lg">
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Record Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto pt-20">
                    <div className="bg-surface rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col my-8 border border-border shadow-2xl">
                        <div className="p-8 border-b border-border flex items-center justify-between flex-shrink-0">
                            <h2 className="text-2xl font-black text-text-main tracking-tight">Record Payment</h2>
                            <button onClick={handleCloseModal} className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                            <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                                <div>
                                    <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">
                                        Invoice *
                                    </label>
                                    <select
                                        required
                                        value={formData.documentId}
                                        onChange={handleDocumentChange}
                                        className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium cursor-pointer"
                                    >
                                        <option value="">Select an invoice...</option>
                                        {invoices.map(invoice => (
                                            <option key={invoice.id} value={invoice.id}>
                                                {invoice.number} - {invoice.clientName} ({formatCurrency(invoice.total - (invoice.amountPaid || 0))} outstanding)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">
                                        Amount *
                                    </label>
                                    <div className="relative font-bold text-lg">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted">$</div>
                                        <input
                                            type="number"
                                            required
                                            min="0.01"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full pl-12 pr-5 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-black"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">
                                        Payment Method *
                                    </label>
                                    <select
                                        required
                                        value={formData.method}
                                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium cursor-pointer"
                                    >
                                        <option value="eft">EFT/Bank Transfer</option>
                                        <option value="card">Credit/Debit Card</option>
                                        <option value="cash">Cash</option>
                                        <option value="check">Check</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">
                                        Reference Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.reference}
                                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                        placeholder="Transaction ID, check number, etc."
                                        className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium placeholder:opacity-30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-text-main uppercase tracking-widest mb-3">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows="3"
                                        className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium placeholder:opacity-30"
                                    />
                                </div>
                            </div>

                            <div className="p-8 bg-slate-950/20 backdrop-blur-md border-t border-border flex gap-4 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-4 border border-border text-text-main rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
