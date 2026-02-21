import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, FileText, Download, Calendar, ArrowRight } from 'lucide-react';
import {
    getDashboardStats,
    getRevenueByMonth,
    getClientProfitability,
    getTaxSummary
} from '../services/billingService';
import { formatCurrency, DEFAULT_CURRENCY } from '../utils/currency';
import PageHeader from '../components/PageHeader';

export default function BillingReports() {
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [clientData, setClientData] = useState([]);
    const [taxData, setTaxData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportPeriod, setReportPeriod] = useState(6);

    useEffect(() => {
        loadReports();
    }, [reportPeriod]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const [dashStats, revenue, clients, tax] = await Promise.all([
                getDashboardStats(),
                getRevenueByMonth(reportPeriod),
                getClientProfitability(),
                getTaxSummary()
            ]);
            setStats(dashStats);
            setRevenueData(revenue);
            setClientData(clients);
            setTaxData(tax);
        } catch (error) {
            console.error('Error loading reports:', error);
        }
        setLoading(false);
    };

    const exportToCSV = (data, filename) => {
        const csv = data.map(row => Object.values(row).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-all duration-500">
            <PageHeader
                title="Business Analytics"
                subtitle="Growth insights and financial performance"
            >
                <div className="flex items-center gap-3 bg-surface/50 border border-border/50 rounded-2xl p-1.5 shadow-inner glass-panel">
                    <span className="text-[10px] font-black uppercase tracking-widest pl-3 pr-2 text-slate-500">Period:</span>
                    <select
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(parseInt(e.target.value))}
                        className="bg-transparent border-0 text-xs font-black uppercase tracking-widest px-3 py-1.5 focus:outline-none focus:ring-0 text-text-main cursor-pointer"
                    >
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                    </select>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 space-y-4">
                            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Collating financial data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="bg-surface/50 p-8 rounded-[2rem] border border-border/50 glass-panel electric-card shadow-2xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                            <FileText className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoices</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-text-main tracking-tighter">{stats?.totalInvoices || 0}</h3>
                                </div>

                                <div className="bg-surface/50 p-8 rounded-[2rem] border border-border/50 glass-panel electric-card shadow-2xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20">
                                            <DollarSign className="w-6 h-6 text-green-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-green-500 tracking-tighter">{formatCurrency(stats?.paidThisMonth || 0)}</h3>
                                </div>

                                <div className="bg-surface/50 p-8 rounded-[2rem] border border-border/50 glass-panel electric-card shadow-2xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                                            <TrendingUp className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Outstanding</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-text-main tracking-tighter">{formatCurrency(stats?.outstanding || 0)}</h3>
                                </div>

                                <div className="bg-surface/50 p-8 rounded-[2rem] border border-border/50 glass-panel electric-card shadow-2xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                                            <Users className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clients</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-text-main tracking-tighter">{clientData?.length || 0}</h3>
                                </div>
                            </div>

                            {/* Main Chart Section */}
                            <div className="bg-surface/50 rounded-[3rem] border border-border/50 p-12 glass-panel shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl transition-opacity group-hover:opacity-100 opacity-50"></div>
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h2 className="text-2xl font-black text-text-main tracking-tighter">Revenue Projection</h2>
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Monthly income analysis</p>
                                    </div>
                                    <button
                                        onClick={() => exportToCSV(revenueData, 'revenue-report.csv')}
                                        className="flex items-center gap-2 px-6 py-3 bg-surface border border-border/50 text-text-main rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-black/5 active:scale-95"
                                    >
                                        <Download className="w-4 h-4 text-primary" />
                                        Export CSV
                                    </button>
                                </div>

                                <div className="h-80 flex items-end gap-6 relative z-10">
                                    {revenueData.map((item, index) => {
                                        const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);
                                        const height = (item.revenue / maxRevenue) * 100;
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center gap-6 group/bar">
                                                <div className="w-full relative h-[240px] flex items-end">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-primary/80 to-blue-400 rounded-2xl transition-all duration-500 group-hover/bar:from-primary group-hover/bar:shadow-[0_0_30px_-5px_var(--color-primary)] relative"
                                                        style={{ height: `${Math.max(height, 8)}%` }}
                                                    >
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 shadow-2xl">
                                                            {formatCurrency(item.revenue)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center group-hover/bar:translate-y-[-4px] transition-transform">
                                                    <p className="text-[10px] font-black text-text-main uppercase tracking-widest">{item.month.split(' ')[0]}</p>
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-wider">{item.month.split(' ')[1]}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Data Tables Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Profitability Table */}
                                <div className="lg:col-span-2 bg-surface/50 rounded-[3rem] border border-border/50 glass-panel shadow-2xl overflow-hidden">
                                    <div className="px-10 py-8 border-b border-border/20 flex items-center justify-between">
                                        <h2 className="text-xl font-black text-text-main tracking-tighter">Client Profitability</h2>
                                        <button className="p-3 text-slate-500 hover:text-primary transition-colors"><ArrowRight className="w-5 h-5" /></button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-900/30 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    <th className="px-10 py-5">Client</th>
                                                    <th className="px-10 py-5 text-right">Invoiced</th>
                                                    <th className="px-10 py-5 text-right">Paid</th>
                                                    <th className="px-10 py-5 text-right">Profit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/10">
                                                {clientData.map(client => (
                                                    <tr key={client.id} className="hover:bg-slate-900/20 transition-all group">
                                                        <td className="px-10 py-6 font-black text-text-main tracking-tight group-hover:text-primary transition-colors">{client.name}</td>
                                                        <td className="px-10 py-6 text-right font-bold text-text-muted">{formatCurrency(client.invoiced)}</td>
                                                        <td className="px-10 py-6 text-right font-black text-green-500">{formatCurrency(client.paid)}</td>
                                                        <td className="px-10 py-6 text-right font-black text-text-main">{formatCurrency(client.paid)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Summary Widgets */}
                                <div className="space-y-8">
                                    <div className="bg-surface/50 p-10 rounded-[3rem] border border-border/50 glass-panel shadow-2xl">
                                        <h3 className="text-lg font-black text-text-main tracking-tighter mb-8 border-b border-border/20 pb-4">Status Hub</h3>
                                        <div className="space-y-6">
                                            {[
                                                { label: 'Draft', count: stats?.draftInvoices, color: 'bg-slate-500' },
                                                { label: 'Sent', count: stats?.sentInvoices, color: 'bg-blue-500' },
                                                { label: 'Paid', count: stats?.paidInvoices, color: 'bg-green-500' },
                                                { label: 'Overdue', count: stats?.overdueCount, color: 'bg-red-500' }
                                            ].map(item => (
                                                <div key={item.label} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-lg transition-transform group-hover:scale-125`}></div>
                                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                                    </div>
                                                    <span className="text-sm font-black text-text-main">{item.count || 0}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-primary p-10 rounded-[3rem] shadow-2xl shadow-primary/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform"></div>
                                        <h3 className="text-lg font-black text-white tracking-tighter mb-2 relative z-10">Tax Summary</h3>
                                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-6 relative z-10">Total Collected</p>
                                        <div className="text-4xl font-black text-white tracking-tighter mb-4 relative z-10">
                                            {formatCurrency(taxData?.totalTaxCollected || 0)}
                                        </div>
                                        <p className="text-[9px] font-black text-white/50 uppercase tracking-widest relative z-10">Verified for the current fiscal period</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
