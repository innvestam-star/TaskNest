import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, CheckCircle, Clock, Send, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDocuments, deleteDocument } from '../services/billingService';
import { useSubscription } from '../context/SubscriptionContext';
import Paywall from '../components/Paywall';
import PageHeader from '../components/PageHeader';
import { formatCurrency } from '../utils/currency';

export default function Invoices({ type }) {
    const { subscription } = useSubscription();
    const plan = subscription?.plan || 'free';
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(type || 'all');
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (type) setFilter(type);
    }, [type]);

    useEffect(() => {
        loadDocuments();
    }, [filter]);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const data = await getDocuments({ type: filter !== 'all' ? filter : undefined });
            setDocuments(data);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (docId, docNumber) => {
        if (!window.confirm(`Delete ${docNumber}? This action cannot be undone.`)) return;
        setDeletingId(docId);
        try {
            await deleteDocument(docId);
            setDocuments(prev => prev.filter(d => d.id !== docId));
        } catch (error) {
            console.error('Failed to delete:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'sent': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'draft': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
            case 'overdue': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'accepted': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500';
        }
    };

    if (plan !== 'business') {
        return (
            <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center h-full">
                <Paywall
                    title="Invoices & Quotes"
                    description="Professional billing aimed for freelancers and small businesses."
                    requiredPlan="business"
                />
            </div>
        );
    }

    const filteredDocs = documents.filter(doc => {
        const matchesType = filter === 'all' || doc.type === filter;
        if (!matchesType) return false;
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            (doc.number || '').toLowerCase().includes(term) ||
            (doc.clientName || '').toLowerCase().includes(term) ||
            (doc.clientEmail || '').toLowerCase().includes(term)
        );
    });

    // Stats
    const totalOutstanding = documents
        .filter(d => d.type === 'invoice' && (d.status === 'sent' || d.status === 'overdue'))
        .reduce((sum, d) => sum + (d.total - (d.amountPaid || 0)), 0);

    const totalPaid = documents
        .filter(d => d.type === 'invoice' && d.status === 'paid')
        .reduce((sum, d) => sum + d.total, 0);

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-all duration-500">
            <PageHeader
                title={filter === 'invoice' ? 'Invoices' : filter === 'quote' ? 'Quotes' : 'Finances'}
                subtitle="Manage your business transactions"
            >
                <div className="flex gap-4">
                    <Link
                        to="/invoices/new?type=quote"
                        className="px-6 py-2.5 bg-surface/50 border border-border/50 text-text-main rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-black/5 active:scale-95 glass-panel"
                    >
                        New Quote
                    </Link>
                    <Link
                        to="/invoices/new?type=invoice"
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl text-sm font-black transition-all shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 glow-blue"
                    >
                        <Plus className="w-4 h-4" />
                        New Invoice
                    </Link>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-surface/50 p-8 rounded-[2rem] border border-border/50 glass-panel electric-card shadow-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                                    <Clock className="w-6 h-6 text-amber-500" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Outstanding</span>
                            </div>
                            <h3 className="text-3xl font-black text-text-main tracking-tighter">{formatCurrency(totalOutstanding)}</h3>
                        </div>

                        <div className="bg-surface/50 p-8 rounded-[2rem] border border-border/50 glass-panel electric-card shadow-2xl transition-all hover:border-green-500/30">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Total Paid</span>
                            </div>
                            <h3 className="text-3xl font-black text-green-500 tracking-tighter">{formatCurrency(totalPaid)}</h3>
                        </div>

                        <div className="bg-surface/50 p-8 rounded-[2rem] border border-border/50 glass-panel electric-card shadow-2xl transition-all hover:border-primary/30">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Open Quotes</span>
                            </div>
                            <h3 className="text-3xl font-black text-primary tracking-tighter">{documents.filter(d => d.type === 'quote' && d.status === 'sent').length}</h3>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-surface/50 rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden glass-panel">
                        <div className="px-8 py-6 border-b border-border/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            {/* Tabs */}
                            <div className="flex items-center gap-2 p-1.5 bg-background/50 border border-border/20 rounded-2xl glass-panel">
                                {[
                                    { id: 'all', label: 'All' },
                                    { id: 'invoice', label: 'Invoices' },
                                    { id: 'quote', label: 'Quotes' }
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setFilter(t.id)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === t.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-text-main hover:bg-slate-900/10'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative group flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border/20 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-slate-600 text-text-main"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/30 border-b border-border/20 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        <th className="px-8 py-5">Number</th>
                                        <th className="px-8 py-5">Client</th>
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5">Total</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/10">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center">
                                                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                                            </td>
                                        </tr>
                                    ) : filteredDocs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-24 text-center">
                                                <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
                                                    <FileText className="w-8 h-8 text-slate-600 opacity-20" />
                                                </div>
                                                <p className="text-slate-500 font-medium">
                                                    {searchTerm ? 'No documents match your search.' : 'Digital silence. No documents found.'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDocs.map(doc => (
                                            <tr key={doc.id} className="hover:bg-slate-900/20 transition-all group">
                                                <td className="px-8 py-6">
                                                    <Link to={`/invoices/${doc.id}`} className="font-black text-text-main tracking-tight group-hover:text-primary transition-colors hover:underline">
                                                        {doc.number}
                                                    </Link>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-60">{doc.type}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-text-main tracking-tight">{doc.clientName}</div>
                                                    <div className="text-xs text-text-muted font-bold">{doc.clientEmail}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-sm text-text-muted font-bold">{new Date(doc.date).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-lg font-black text-text-main tracking-tighter">{formatCurrency(doc.total, doc.currency || 'ZAR')}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border ${getStatusColor(doc.status)} shadow-sm`}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/invoices/${doc.id}`}
                                                            className="inline-flex items-center justify-center w-10 h-10 bg-surface border border-border text-slate-400 hover:text-primary hover:border-primary rounded-xl transition-all active:scale-90 shadow-sm"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(doc.id, doc.number)}
                                                            disabled={deletingId === doc.id}
                                                            className="inline-flex items-center justify-center w-10 h-10 bg-surface border border-border text-slate-400 hover:text-red-500 hover:border-red-500/50 rounded-xl transition-all active:scale-90 shadow-sm disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                                        >
                                                            {deletingId === doc.id ? (
                                                                <div className="animate-spin w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"></div>
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
