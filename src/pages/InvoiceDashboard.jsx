import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, FileText, Users, Clock, AlertTriangle, CheckCircle,
    TrendingUp, ArrowRight, Receipt, CreditCard, Package
} from 'lucide-react';
import { getDashboardStats, getDocuments, checkOverdueInvoices } from '../services/billingService';
import { useSubscription } from '../context/SubscriptionContext';
import PageHeader from '../components/PageHeader';
import Paywall from '../components/Paywall';
import { formatCurrency } from '../utils/currency';

export default function InvoiceDashboard() {
    const { subscription } = useSubscription();
    const plan = subscription?.plan || 'free';
    const [stats, setStats] = useState(null);
    const [recentDocs, setRecentDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await checkOverdueInvoices();

            const [statsData, docs] = await Promise.all([
                getDashboardStats(),
                getDocuments()
            ]);
            setStats(statsData);
            setRecentDocs(docs.slice(0, 5));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (plan !== 'business') {
        return (
            <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center h-full">
                <Paywall
                    title="Invoices & Quotes"
                    description="Professional billing for freelancers and small businesses."
                    requiredPlan="business"
                />
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'sent': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'draft': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
            case 'overdue': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'partial': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'accepted': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-all duration-500">
            <PageHeader
                title="Finance"
                subtitle="Professional billing & insights"
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
                <div className="max-w-7xl mx-auto">

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                <div className="bg-surface/50 p-8 rounded-[2rem] border border-border/50 glass-panel electric-card shadow-2xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                                            <Clock className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Outstanding</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-text-main tracking-tighter">{formatCurrency(stats?.outstanding || 0)}</h3>
                                </div>

                                <div className="bg-surface/50 p-8 rounded-[2rem] border border-border/50 glass-panel electric-card shadow-2xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                                            <AlertTriangle className="w-6 h-6 text-red-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Overdue</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-red-500 tracking-tighter">{formatCurrency(stats?.overdue || 0)}</h3>
                                    {stats?.overdueCount > 0 && (
                                        <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest mt-2">{stats.overdueCount} Critical</p>
                                    )}
                                </div>

                                <div className="bg-surface/50 p-8 rounded-[2rem] border border-border/50 glass-panel electric-card shadow-2xl transition-all hover:border-green-500/30">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20">
                                            <TrendingUp className="w-6 h-6 text-green-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Paid Month</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-green-500 tracking-tighter">{formatCurrency(stats?.paidThisMonth || 0)}</h3>
                                </div>

                                <div className="bg-surface/50 p-8 rounded-[2rem] border border-border/50 glass-panel electric-card shadow-2xl transition-all hover:border-primary/30">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Pending Quotes</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-primary tracking-tighter">{stats?.quotesAwaiting || 0}</h3>
                                </div>
                            </div>

                            {/* Quick Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                                {[
                                    { label: 'Draft', value: stats?.draftInvoices },
                                    { label: 'Sent', value: stats?.sentInvoices },
                                    { label: 'Paid', value: stats?.paidInvoices },
                                    { label: 'Total Invoices', value: stats?.totalInvoices },
                                    { label: 'Total Quotes', value: stats?.totalQuotes }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-surface/30 p-4 rounded-2xl border border-border/30 text-center glass-panel">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">{item.label}</p>
                                        <p className="text-xl font-black text-text-main">{item.value || 0}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Links */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
                                <Link to="/billing/invoices" className="bg-surface/80 p-6 rounded-[2rem] border border-border/50 hover:border-primary transition-all group glass-panel active:scale-95">
                                    <Receipt className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-black text-text-main tracking-tight group-hover:text-primary transition-colors">Invoices</h4>
                                    <p className="text-xs text-slate-500 font-medium">Full archive</p>
                                </Link>
                                <Link to="/billing/quotes" className="bg-surface/80 p-6 rounded-[2rem] border border-border/50 hover:border-indigo-500/60 transition-all group glass-panel active:scale-95">
                                    <FileText className="w-8 h-8 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-black text-text-main tracking-tight group-hover:text-indigo-500 transition-colors">Quotes</h4>
                                    <p className="text-xs text-slate-500 font-medium">Bids & offers</p>
                                </Link>
                                <Link to="/billing/clients" className="bg-surface/80 p-6 rounded-[2rem] border border-border/50 hover:border-green-500/60 transition-all group glass-panel active:scale-95">
                                    <Users className="w-8 h-8 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-black text-text-main tracking-tight group-hover:text-green-500 transition-colors">Clients</h4>
                                    <p className="text-xs text-slate-500 font-medium">Directory</p>
                                </Link>
                                <Link to="/billing/products" className="bg-surface/80 p-6 rounded-[2rem] border border-border/50 hover:border-cyan-500/60 transition-all group glass-panel active:scale-95">
                                    <Package className="w-8 h-8 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-black text-text-main tracking-tight group-hover:text-cyan-500 transition-colors">Products</h4>
                                    <p className="text-xs text-slate-500 font-medium">Catalog</p>
                                </Link>
                                <Link to="/billing/payments" className="bg-surface/80 p-6 rounded-[2rem] border border-border/50 hover:border-amber-500/60 transition-all group glass-panel active:scale-95">
                                    <CreditCard className="w-8 h-8 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-black text-text-main tracking-tight group-hover:text-amber-500 transition-colors">Payments</h4>
                                    <p className="text-xs text-slate-500 font-medium">Records</p>
                                </Link>
                                <Link to="/billing/reports" className="bg-surface/80 p-6 rounded-[2rem] border border-border/50 hover:border-rose-500/60 transition-all group glass-panel active:scale-95">
                                    <TrendingUp className="w-8 h-8 text-rose-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-black text-text-main tracking-tight group-hover:text-rose-500 transition-colors">Reports</h4>
                                    <p className="text-xs text-slate-500 font-medium">Analytics</p>
                                </Link>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-surface/50 rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden glass-panel">
                                <div className="px-8 py-6 border-b border-border/30 flex items-center justify-between">
                                    <h3 className="text-lg font-black text-text-main tracking-tight">Recent Activity</h3>
                                    <Link to="/invoices" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                                        Explore All <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="divide-y divide-border/20">
                                    {recentDocs.length === 0 ? (
                                        <div className="px-8 py-16 text-center">
                                            <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
                                                <FileText className="w-8 h-8 text-slate-600 opacity-20" />
                                            </div>
                                            <p className="text-slate-500 font-medium">Digital silence. No documents yet.</p>
                                            <Link to="/invoices/new?type=invoice" className="inline-block mt-4 text-sm font-black text-primary hover:underline">
                                                Create your first invoice →
                                            </Link>
                                        </div>
                                    ) : (
                                        recentDocs.map(doc => (
                                            <Link
                                                key={doc.id}
                                                to={`/invoices/${doc.id}`}
                                                className="flex items-center justify-between px-8 py-5 hover:bg-slate-900/20 transition-colors group"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${doc.type === 'invoice' ? 'bg-primary/10 border border-primary/20' : 'bg-indigo-500/10 border border-indigo-500/20'}`}>
                                                        <FileText className={`w-6 h-6 ${doc.type === 'invoice' ? 'text-primary' : 'text-indigo-500'}`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-text-main tracking-tight group-hover:text-primary transition-colors">{doc.number}</h4>
                                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-60">{doc.clientName}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-text-main tracking-tighter">{formatCurrency(doc.total || 0, doc.currency || 'ZAR')}</p>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border ${getStatusColor(doc.status)}`}>
                                                        {doc.status}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
