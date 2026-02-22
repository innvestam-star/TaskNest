import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart3, TrendingUp, Scale, Target, BrainCircuit,
    Download, Calendar, Loader2, ArrowUpRight, ArrowDownRight,
    DollarSign, Building2, Wallet, CreditCard, PiggyBank,
    AlertTriangle, CheckCircle, Info, Sliders, RefreshCw
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceLine, Legend, ComposedChart
} from 'recharts';
import {
    generateProfitAndLoss, generateCashFlowStatement,
    generateBalanceSheet, calculateBreakeven, generateForecast,
    exportToPDF, getBalanceSheetData, saveBalanceSheetData, logAuditEvent
} from '../services/financialReportService';
import { formatCurrency } from '../utils/currency';

const TABS = [
    { id: 'pnl', label: 'P&L Statement', icon: BarChart3, color: 'blue' },
    { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp, color: 'emerald' },
    { id: 'balance', label: 'Balance Sheet', icon: Scale, color: 'amber' },
    { id: 'breakeven', label: 'Break-even', icon: Target, color: 'rose' },
    { id: 'forecast', label: 'Forecasting', icon: BrainCircuit, color: 'indigo' },
];

const PERIODS = [
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'financial_year', label: 'Financial Year' },
];

export default function FinancialReports() {
    const [activeTab, setActiveTab] = useState('pnl');
    const [period, setPeriod] = useState('this_year');
    const [loading, setLoading] = useState(true);
    const [pnlData, setPnlData] = useState(null);
    const [cashflowData, setCashflowData] = useState(null);
    const [balanceData, setBalanceData] = useState(null);
    const [breakevenData, setBreakevenData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [bsInputs, setBsInputs] = useState(getBalanceSheetData());
    const [whatIf, setWhatIf] = useState({
        fixedCostMultiplier: 1,
        revenueMultiplier: 1,
        variableCostMultiplier: 1,
        additionalFixedCosts: 0,
        additionalRevenue: 0,
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [pnl, cf, bs, be, fc] = await Promise.all([
                generateProfitAndLoss(period),
                generateCashFlowStatement(period),
                generateBalanceSheet(),
                calculateBreakeven(whatIf),
                generateForecast(6, 3),
            ]);
            setPnlData(pnl);
            setCashflowData(cf);
            setBalanceData(bs);
            setBreakevenData(be);
            setForecastData(fc);
        } catch (err) {
            console.error('Failed to load financial data:', err);
        }
        setLoading(false);
    }, [period, whatIf]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleExportPDF = async (type) => {
        const dataMap = { pnl: pnlData, balance_sheet: balanceData, cashflow: cashflowData };
        if (dataMap[type]) {
            await exportToPDF(type, dataMap[type]);
            logAuditEvent('pdf_export', { type, period });
        }
    };

    const handleSaveBS = () => {
        saveBalanceSheetData(bsInputs);
        logAuditEvent('balance_sheet_update', bsInputs);
        loadData();
    };

    const handleWhatIfChange = (key, value) => {
        setWhatIf(prev => ({ ...prev, [key]: value }));
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl">
                <p className="text-xs font-bold text-white mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-[11px]" style={{ color: p.color }}>
                        {p.name}: {formatCurrency(p.value)}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-1 p-8 overflow-auto bg-background transition-colors duration-300">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight">Financial Reports</h1>
                        <p className="text-text-muted mt-1">Executive intelligence suite — your virtual CFO</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="px-4 py-2.5 bg-surface border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                        <button
                            onClick={loadData}
                            className="p-2.5 bg-surface border border-border rounded-xl text-text-muted hover:text-primary transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-surface border border-border text-text-muted hover:bg-primary/5 hover:border-primary/30'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="bg-surface rounded-3xl p-20 text-center border border-border">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-xs font-black text-text-muted uppercase tracking-widest">Crunching numbers...</p>
                    </div>
                ) : (
                    <>
                        {/* ═══════════ P&L Tab ═══════════ */}
                        {activeTab === 'pnl' && pnlData && (
                            <div className="space-y-8">
                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Total Revenue', value: pnlData.revenue.total, color: 'emerald', icon: ArrowUpRight },
                                        { label: 'Total Expenses', value: pnlData.expenses.total, color: 'red', icon: ArrowDownRight },
                                        { label: 'Net Profit', value: pnlData.netProfit, color: pnlData.netProfit >= 0 ? 'emerald' : 'red', icon: DollarSign },
                                        { label: 'Profit Margin', value: null, display: `${pnlData.margin}%`, color: 'blue', icon: TrendingUp },
                                    ].map((kpi, i) => (
                                        <div key={i} className="bg-surface border border-border rounded-2xl p-6 shadow-xl group hover:shadow-2xl transition-all">
                                            <div className="flex items-center gap-2 mb-2">
                                                <kpi.icon className={`w-4 h-4 text-${kpi.color}-500`} />
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{kpi.label}</span>
                                            </div>
                                            <p className={`text-2xl font-black text-${kpi.color}-500`}>
                                                {kpi.display || formatCurrency(kpi.value)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* P&L Breakdown */}
                                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black text-text-main">Profit & Loss Breakdown</h2>
                                        <button
                                            onClick={() => handleExportPDF('pnl')}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                        >
                                            <Download className="w-4 h-4" /> Export PDF
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <StatementRow label="Revenue — Cash Flow Income" value={pnlData.revenue.cashflowIncome} positive />
                                        <StatementRow label="Revenue — Invoice Payments" value={pnlData.revenue.invoiceRevenue} positive />
                                        <StatementRow label="Total Revenue" value={pnlData.revenue.total} bold positive />
                                        <div className="border-t border-border my-4" />
                                        <StatementRow label="Cost of Goods Sold" value={pnlData.cogs} negative />
                                        <StatementRow label="Gross Profit" value={pnlData.grossProfit} bold positive={pnlData.grossProfit >= 0} />
                                        <div className="border-t border-border my-4" />
                                        <StatementRow label="Fixed Expenses (Rent, Subs, Insurance, Utilities)" value={pnlData.expenses.fixed} negative />
                                        <StatementRow label="Variable Expenses (Transport, Food, Office, etc.)" value={pnlData.expenses.variable} negative />
                                        <StatementRow label="Total Operating Expenses" value={pnlData.expenses.total} bold negative />
                                        <div className="border-t border-border my-4" />
                                        <StatementRow label="Tax Expense" value={pnlData.taxExpense} negative />
                                        <div className="border-t-2 border-primary/30 my-4" />
                                        <StatementRow label="NET PROFIT" value={pnlData.netProfit} bold highlight positive={pnlData.netProfit >= 0} />
                                    </div>
                                </div>

                                {/* Expense Category Breakdown Chart */}
                                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                    <h3 className="text-lg font-black text-text-main mb-6">Expense by Category</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={Object.entries(pnlData.expenses.byCategory).map(([cat, val]) => ({ category: cat.replace(/_/g, ' '), amount: val }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                            <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="amount" name="Amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* ═══════════ Cash Flow Statement Tab ═══════════ */}
                        {activeTab === 'cashflow' && cashflowData && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Operating', value: cashflowData.operating.net, icon: Building2 },
                                        { label: 'Investing', value: cashflowData.investing.net, icon: Wallet },
                                        { label: 'Net Cash Flow', value: cashflowData.netCashFlow, icon: DollarSign },
                                    ].map((kpi, i) => (
                                        <div key={i} className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl ${kpi.value >= 0 ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
                                            }`}>
                                            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <kpi.icon className="w-4 h-4 opacity-70" />
                                                    <p className="font-bold text-xs uppercase tracking-widest opacity-80">{kpi.label}</p>
                                                </div>
                                                <p className="text-3xl font-black mt-2">{formatCurrency(Math.abs(kpi.value))}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black text-text-main">Cash Flow Statement</h2>
                                        <button onClick={() => handleExportPDF('cashflow')} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                            <Download className="w-4 h-4" /> Export PDF
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <SectionHeader title="Operating Activities" color="emerald" />
                                        <StatementRow label="Cash Received (Income + Payments)" value={cashflowData.operating.income} positive />
                                        <StatementRow label="Cash Paid (Operating Expenses)" value={cashflowData.operating.expenses} negative />
                                        <StatementRow label="Net Operating Cash Flow" value={cashflowData.operating.net} bold positive={cashflowData.operating.net >= 0} />
                                        <div className="border-t border-border my-4" />

                                        <SectionHeader title="Investing Activities" color="amber" />
                                        <StatementRow label="Equipment / Tech Purchases" value={cashflowData.investing.outflows} negative />
                                        <StatementRow label="Net Investing" value={cashflowData.investing.net} bold positive={cashflowData.investing.net >= 0} />
                                        <div className="border-t border-border my-4" />

                                        <SectionHeader title="Financing Activities" color="blue" />
                                        <StatementRow label="New Loans / Funding" value={cashflowData.financing.inflows} positive />
                                        <StatementRow label="Loan Repayments" value={cashflowData.financing.outflows} negative />
                                        <StatementRow label="Net Financing" value={cashflowData.financing.net} bold positive={cashflowData.financing.net >= 0} />

                                        <div className="border-t-2 border-primary/30 my-4" />
                                        <StatementRow label="NET CASH FLOW" value={cashflowData.netCashFlow} bold highlight positive={cashflowData.netCashFlow >= 0} />

                                        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
                                            <Info className="w-5 h-5 text-primary flex-shrink-0" />
                                            <span className="text-xs text-text-muted">
                                                Accounts Receivable (outstanding invoices): <strong className="text-text-main">{formatCurrency(cashflowData.accountsReceivable)}</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══════════ Balance Sheet Tab ═══════════ */}
                        {activeTab === 'balance' && balanceData && (
                            <div className="space-y-8">
                                {/* Floating Balance Scale Visual */}
                                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                    <h2 className="text-xl font-black text-text-main text-center mb-8">Financial Health Scale</h2>
                                    <div className="flex items-end justify-center gap-12 mb-6">
                                        {/* Assets Side */}
                                        <div className="text-center">
                                            <div
                                                className="w-40 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-2xl mx-auto flex items-center justify-center transition-all duration-700 shadow-xl shadow-emerald-500/30"
                                                style={{ height: `${Math.min(200, Math.max(60, (balanceData.assets.total / Math.max(balanceData.assets.total, balanceData.liabilities.total, 1)) * 200))}px` }}
                                            >
                                                <div className="text-white text-center p-4">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Assets</p>
                                                    <p className="text-xl font-black">{formatCurrency(balanceData.assets.total)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scale Center */}
                                        <div className="flex flex-col items-center mb-4">
                                            <Scale className={`w-10 h-10 transition-all duration-500 ${balanceData.assets.total >= balanceData.liabilities.total ? 'text-emerald-500' : 'text-red-500'
                                                }`} style={{
                                                    transform: `rotate(${Math.max(-15, Math.min(15, ((balanceData.liabilities.total - balanceData.assets.total) / Math.max(balanceData.assets.total, balanceData.liabilities.total, 1)) * 30))}deg)`
                                                }} />
                                            <div className={`mt-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${balanceData.assets.total >= balanceData.liabilities.total
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {balanceData.assets.total >= balanceData.liabilities.total ? 'Healthy' : 'At Risk'}
                                            </div>
                                        </div>

                                        {/* Liabilities Side */}
                                        <div className="text-center">
                                            <div
                                                className="w-40 bg-gradient-to-t from-red-500 to-rose-400 rounded-2xl mx-auto flex items-center justify-center transition-all duration-700 shadow-xl shadow-red-500/30"
                                                style={{ height: `${Math.min(200, Math.max(60, (balanceData.liabilities.total / Math.max(balanceData.assets.total, balanceData.liabilities.total, 1)) * 200))}px` }}
                                            >
                                                <div className="text-white text-center p-4">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Liabilities</p>
                                                    <p className="text-xl font-black">{formatCurrency(balanceData.liabilities.total)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs text-text-muted">
                                        Asset-to-Liability Ratio: <strong className="text-text-main">{balanceData.ratio}:1</strong>
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Balance Sheet Table */}
                                    <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-black text-text-main">Balance Sheet</h3>
                                            <button onClick={() => handleExportPDF('balance_sheet')} className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                                <Download className="w-3.5 h-3.5" /> PDF
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <SectionHeader title="Assets" color="emerald" />
                                            <StatementRow label="Cash on Hand" value={balanceData.assets.cashOnHand} positive />
                                            <StatementRow label="Accounts Receivable" value={balanceData.assets.accountsReceivable} positive />
                                            <StatementRow label="Equipment" value={balanceData.assets.equipment} positive />
                                            <StatementRow label="Other Assets" value={balanceData.assets.otherAssets} positive />
                                            <StatementRow label="Total Assets" value={balanceData.assets.total} bold positive />
                                            <div className="border-t border-border my-3" />
                                            <SectionHeader title="Liabilities" color="red" />
                                            <StatementRow label="Accounts Payable" value={balanceData.liabilities.accountsPayable} negative />
                                            <StatementRow label="Loans" value={balanceData.liabilities.loans} negative />
                                            <StatementRow label="Other Liabilities" value={balanceData.liabilities.otherLiabilities} negative />
                                            <StatementRow label="Total Liabilities" value={balanceData.liabilities.total} bold negative />
                                            <div className="border-t border-border my-3" />
                                            <SectionHeader title="Equity" color="blue" />
                                            <StatementRow label="Owner Equity" value={balanceData.equity.ownerEquity} positive />
                                            <StatementRow label="Retained Earnings" value={balanceData.equity.retainedEarnings} positive={balanceData.equity.retainedEarnings >= 0} />
                                            <StatementRow label="Total Equity" value={balanceData.equity.total} bold positive={balanceData.equity.total >= 0} />
                                        </div>
                                    </div>

                                    {/* Manual Input Panel */}
                                    <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                        <h3 className="text-lg font-black text-text-main mb-6">Update Figures</h3>
                                        <p className="text-xs text-text-muted mb-6">Accounts Receivable is auto-calculated from unpaid invoices. Enter other values manually.</p>
                                        <div className="space-y-4">
                                            {[
                                                { key: 'cashOnHand', label: 'Cash on Hand', icon: '💵' },
                                                { key: 'equipment', label: 'Equipment Value', icon: '🖥️' },
                                                { key: 'otherAssets', label: 'Other Assets', icon: '📦' },
                                                { key: 'accountsPayable', label: 'Accounts Payable', icon: '📋' },
                                                { key: 'loans', label: 'Loans Outstanding', icon: '🏦' },
                                                { key: 'otherLiabilities', label: 'Other Liabilities', icon: '📄' },
                                                { key: 'ownerEquity', label: 'Owner Equity / Capital', icon: '👤' },
                                            ].map(field => (
                                                <div key={field.key} className="flex items-center gap-3">
                                                    <span className="text-lg">{field.icon}</span>
                                                    <label className="text-xs font-bold text-text-muted w-40 flex-shrink-0">{field.label}</label>
                                                    <input
                                                        type="number"
                                                        value={bsInputs[field.key] || ''}
                                                        onChange={(e) => setBsInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                        className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            ))}
                                            <button
                                                onClick={handleSaveBS}
                                                className="w-full mt-4 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                            >
                                                Save & Recalculate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══════════ Break-even Tab ═══════════ */}
                        {activeTab === 'breakeven' && breakevenData && (
                            <div className="space-y-8">
                                {/* KPI Row */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Break-even Point</p>
                                        <p className="text-2xl font-black text-primary">{formatCurrency(breakevenData.breakEvenRevenue)}</p>
                                        <p className="text-[10px] text-text-muted mt-1">Monthly revenue needed</p>
                                    </div>
                                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Monthly Fixed Costs</p>
                                        <p className="text-2xl font-black text-red-500">{formatCurrency(breakevenData.monthlyFixedCosts)}</p>
                                    </div>
                                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Current Revenue</p>
                                        <p className="text-2xl font-black text-emerald-500">{formatCurrency(breakevenData.monthlyRevenue)}</p>
                                    </div>
                                    <div className={`border rounded-2xl p-6 shadow-xl ${breakevenData.isAboveBreakEven
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : 'bg-red-500/10 border-red-500/30'
                                        }`}>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Status</p>
                                        <div className="flex items-center gap-2">
                                            {breakevenData.isAboveBreakEven
                                                ? <CheckCircle className="w-6 h-6 text-emerald-500" />
                                                : <AlertTriangle className="w-6 h-6 text-red-500" />
                                            }
                                            <p className={`text-lg font-black ${breakevenData.isAboveBreakEven ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {breakevenData.isAboveBreakEven ? 'Profitable' : 'Below Break-even'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Chart */}
                                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                    <h3 className="text-lg font-black text-text-main mb-6">Break-even Analysis Chart</h3>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <ComposedChart data={breakevenData.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                                            <Line type="monotone" dataKey="totalCost" name="Total Cost" stroke="#ef4444" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="fixedCost" name="Fixed Cost" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                                            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* What-If Scenario Panel */}
                                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Sliders className="w-5 h-5 text-primary" />
                                        <h3 className="text-lg font-black text-text-main">What-If Scenario Planning</h3>
                                    </div>
                                    <p className="text-xs text-text-muted mb-6">Adjust variables to see real-time impact on your break-even point.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <SliderInput
                                            label="Fixed Costs Change"
                                            value={whatIf.fixedCostMultiplier}
                                            onChange={(v) => handleWhatIfChange('fixedCostMultiplier', v)}
                                            min={0.5} max={2} step={0.05}
                                            display={`${((whatIf.fixedCostMultiplier - 1) * 100).toFixed(0)}%`}
                                        />
                                        <SliderInput
                                            label="Revenue Change"
                                            value={whatIf.revenueMultiplier}
                                            onChange={(v) => handleWhatIfChange('revenueMultiplier', v)}
                                            min={0.5} max={2} step={0.05}
                                            display={`${((whatIf.revenueMultiplier - 1) * 100).toFixed(0)}%`}
                                        />
                                        <SliderInput
                                            label="Variable Costs Change"
                                            value={whatIf.variableCostMultiplier}
                                            onChange={(v) => handleWhatIfChange('variableCostMultiplier', v)}
                                            min={0.5} max={2} step={0.05}
                                            display={`${((whatIf.variableCostMultiplier - 1) * 100).toFixed(0)}%`}
                                        />
                                        <div>
                                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">
                                                Additional Fixed Costs (R)
                                            </label>
                                            <input
                                                type="number"
                                                value={whatIf.additionalFixedCosts}
                                                onChange={(e) => handleWhatIfChange('additionalFixedCosts', parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="e.g. 2000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">
                                                Additional Revenue (R) — e.g. new projects
                                            </label>
                                            <input
                                                type="number"
                                                value={whatIf.additionalRevenue}
                                                onChange={(e) => handleWhatIfChange('additionalRevenue', parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="e.g. 5000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══════════ Forecast Tab ═══════════ */}
                        {activeTab === 'forecast' && forecastData && (
                            <div className="space-y-8">
                                {/* Trend Badge */}
                                <div className={`flex items-center gap-4 p-6 rounded-2xl border shadow-xl ${forecastData.trend === 'improving' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                        forecastData.trend === 'warning' ? 'bg-red-500/10 border-red-500/30' :
                                            forecastData.trend === 'declining' ? 'bg-amber-500/10 border-amber-500/30' :
                                                'bg-blue-500/10 border-blue-500/30'
                                    }`}>
                                    <BrainCircuit className={`w-8 h-8 ${forecastData.trend === 'improving' ? 'text-emerald-500' :
                                            forecastData.trend === 'warning' ? 'text-red-500' :
                                                forecastData.trend === 'declining' ? 'text-amber-500' :
                                                    'text-blue-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-black text-text-main">
                                            AI Forecast: Trend is {forecastData.trend === 'improving' ? '📈 Improving' :
                                                forecastData.trend === 'warning' ? '🚨 Warning — Negative Cash Flow Predicted' :
                                                    forecastData.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                                        </p>
                                        <p className="text-xs text-text-muted mt-1">
                                            Based on linear regression of the last 6 months of transaction data.
                                        </p>
                                    </div>
                                </div>

                                {/* Insights Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Avg Monthly Income</p>
                                        <p className="text-2xl font-black text-emerald-500">{formatCurrency(forecastData.insights.avgMonthlyIncome)}</p>
                                    </div>
                                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Avg Monthly Expenses</p>
                                        <p className="text-2xl font-black text-red-500">{formatCurrency(forecastData.insights.avgMonthlyExpenses)}</p>
                                    </div>
                                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Predicted Next Month</p>
                                        {forecastData.insights.predictedNextMonth && (
                                            <p className={`text-2xl font-black ${forecastData.insights.predictedNextMonth.netCashFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {formatCurrency(forecastData.insights.predictedNextMonth.netCashFlow)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Forecast Chart */}
                                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                    <h3 className="text-lg font-black text-text-main mb-6">Cash Flow Forecast — 6 Month History + 3 Month Prediction</h3>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <ComposedChart data={forecastData.combined}>
                                            <defs>
                                                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
                                            <Line type="monotone" dataKey="netCashFlow" name="Net Cash Flow" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                                            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                    <div className="mt-4 flex items-center gap-4 text-[10px] text-text-muted">
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" /> Actual Data</span>
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500/40 rounded-full inline-block border border-dashed border-emerald-500" /> Predicted (AI)</span>
                                    </div>
                                </div>

                                {/* Monthly Breakdown Table */}
                                <div className="bg-surface border border-border rounded-3xl shadow-xl overflow-hidden">
                                    <div className="p-6 border-b border-border">
                                        <h3 className="text-lg font-black text-text-main">Monthly Breakdown</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-900/30">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Month</th>
                                                    <th className="px-6 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Income</th>
                                                    <th className="px-6 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Expenses</th>
                                                    <th className="px-6 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Net</th>
                                                    <th className="px-6 py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">Type</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {forecastData.combined.map((d, i) => (
                                                    <tr key={i} className={`${!d.isActual ? 'bg-primary/5' : ''} hover:bg-primary/5 transition-all`}>
                                                        <td className="px-6 py-4 font-bold text-text-main">{d.month}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-emerald-500">{formatCurrency(d.income)}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-red-500">{formatCurrency(d.expenses)}</td>
                                                        <td className={`px-6 py-4 text-right font-black ${d.netCashFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {formatCurrency(d.netCashFlow)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${d.isActual ? 'bg-blue-500/10 text-blue-500' : 'bg-indigo-500/10 text-indigo-500'
                                                                }`}>
                                                                {d.isActual ? 'Actual' : 'Predicted'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Reusable Sub-components ─────────────────────────────────────────────────

function StatementRow({ label, value, bold, highlight, positive, negative }) {
    const color = highlight
        ? (positive !== false ? 'text-emerald-500' : 'text-red-500')
        : positive ? 'text-emerald-600' : negative ? 'text-red-500' : 'text-text-main';

    return (
        <div className={`flex items-center justify-between py-2 px-3 rounded-lg ${highlight ? 'bg-primary/5' : ''} ${bold ? '' : 'opacity-90'}`}>
            <span className={`text-sm ${bold ? 'font-black text-text-main' : 'font-medium text-text-muted'}`}>{label}</span>
            <span className={`text-sm ${bold ? 'font-black' : 'font-bold'} ${color}`}>
                {negative && value > 0 ? `(${formatCurrency(value)})` : formatCurrency(Math.abs(value || 0))}
            </span>
        </div>
    );
}

function SectionHeader({ title, color }) {
    const colorMap = {
        emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        red: 'bg-red-500/10 text-red-600 border-red-500/20',
        blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    };
    return (
        <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${colorMap[color] || colorMap.blue}`}>
            {title}
        </div>
    );
}

function SliderInput({ label, value, onChange, min, max, step, display }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">{label}</label>
                <span className={`text-sm font-black ${parseFloat(display) > 0 ? 'text-red-500' : parseFloat(display) < 0 ? 'text-emerald-500' : 'text-text-main'}`}>
                    {parseFloat(display) > 0 ? '+' : ''}{display}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[9px] text-text-muted mt-1">
                <span>-{((1 - min) * 100).toFixed(0)}%</span>
                <span>0%</span>
                <span>+{((max - 1) * 100).toFixed(0)}%</span>
            </div>
        </div>
    );
}
