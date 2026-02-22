import React, { useState, useEffect, useCallback } from 'react';
import {
    Megaphone, Target, Layers, Wand2, BarChart3, TrendingUp,
    ArrowUpRight, ArrowDownRight, Plus, Play, Pause, Trash2,
    Clock, Zap, Eye, MousePointer, ShoppingCart, DollarSign,
    Users, Star, ChevronRight, Copy, RefreshCw, Loader2, Edit, X,
    AlertTriangle, CheckCircle, Lightbulb, Share2, Search, Shield,
    Wallet, Gift, CalendarDays, Activity, Gavel
} from 'lucide-react';
import {
    BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    getCampaigns, createCampaign, updateCampaign, deleteCampaign,
    getMarketingOverview, getPodMetrics, INDUSTRY_PODS,
    generatePASContent, getPASTemplates, getTimeSuggestions,
    getActivePodsNow, getCrossPollinationSuggestions,
    getSEOAnalytics, getSEOSearchTrends, getCompetitorAnalysis,
    getLoyaltyMetrics, getPromoSchedule, getAutoTriggers,
    getSafetyFeatures, getBiddingStats
} from '../services/marketingService';
import { formatCurrency } from '../utils/currency';

const TABS = [
    { id: 'command', label: 'Command Center', icon: Target },
    { id: 'campaigns', label: 'Campaign Studio', icon: Megaphone },
    { id: 'pods', label: 'Industry Pods', icon: Layers },
    { id: 'content', label: 'Content Engine', icon: Wand2 },
    { id: 'analytics', label: 'SEO & Analytics', icon: Search },
    { id: 'loyalty', label: 'Loyalty & Promos', icon: Gift },
];

export default function Marketing() {
    const [activeTab, setActiveTab] = useState('command');
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [overview, setOverview] = useState(null);
    const [podMetrics, setPodMetrics] = useState({});
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [timeSuggestions, setTimeSuggestions] = useState([]);
    const [activePods, setActivePods] = useState([]);

    // Content Engine State
    const [selectedIndustry, setSelectedIndustry] = useState('taxi');
    const [selectedTemplate, setSelectedTemplate] = useState('first_order');
    const [generatedContent, setGeneratedContent] = useState(null);
    const [contentDiscount, setContentDiscount] = useState(20);

    // New Tab State
    const [seoData, setSeoData] = useState({});
    const [searchTrends, setSearchTrends] = useState([]);
    const [competitors, setCompetitors] = useState([]);
    const [seoPod, setSeoPod] = useState('taxi');
    const [loyaltyData, setLoyaltyData] = useState(null);
    const [promoSchedule, setPromoSchedule] = useState([]);
    const [autoTriggers, setAutoTriggers] = useState([]);
    const [safetyData, setSafetyData] = useState(null);
    const [biddingData, setBiddingData] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [camps, ov, pm, seo, comps, loyalty] = await Promise.all([
                getCampaigns(),
                getMarketingOverview(),
                getPodMetrics(),
                getSEOAnalytics(),
                getCompetitorAnalysis(),
                getLoyaltyMetrics(),
            ]);
            setCampaigns(camps);
            setOverview(ov);
            setPodMetrics(pm);
            setTimeSuggestions(getTimeSuggestions());
            setActivePods(getActivePodsNow());
            setSeoData(seo);
            setSearchTrends(getSEOSearchTrends());
            setCompetitors(comps);
            setLoyaltyData(loyalty);
            setPromoSchedule(getPromoSchedule());
            setAutoTriggers(getAutoTriggers());
            setSafetyData(getSafetyFeatures());
            setBiddingData(getBiddingStats());
        } catch (err) {
            console.error('Failed to load marketing data:', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleStatusChange = async (id, newStatus) => {
        await updateCampaign(id, { status: newStatus });
        loadData();
    };

    const handleDeleteCampaign = async (id) => {
        await deleteCampaign(id);
        loadData();
    };

    const handleGenerateContent = () => {
        const content = generatePASContent(selectedIndustry, selectedTemplate, { discount: contentDiscount });
        setGeneratedContent(content);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl">
                <p className="text-xs font-bold text-white mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-[11px]" style={{ color: p.color }}>
                        {p.name}: {typeof p.value === 'number' && p.value > 100 ? formatCurrency(p.value) : p.value}
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
                        <h1 className="text-3xl font-black text-text-main tracking-tight flex items-center gap-3">
                            <Megaphone className="w-8 h-8 text-primary" />
                            Marketing Intelligence
                        </h1>
                        <p className="text-text-muted mt-1">Multi-industry growth engine — powered by AI</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={loadData} className="p-2.5 bg-surface border border-border rounded-xl text-text-muted hover:text-primary transition-all">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { setEditingCampaign(null); setShowCampaignModal(true); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                        >
                            <Plus className="w-4 h-4" /> New Campaign
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
                        <p className="text-xs font-black text-text-muted uppercase tracking-widest">Loading marketing intelligence...</p>
                    </div>
                ) : (
                    <>
                        {/* ═══════════ COMMAND CENTER ═══════════ */}
                        {activeTab === 'command' && overview && (
                            <div className="space-y-8">
                                {/* KPI Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Active Campaigns', value: overview.activeCampaigns, icon: Megaphone, colorClass: 'text-blue-500' },
                                        { label: 'Total Reach', value: overview.totalImpressions.toLocaleString(), icon: Eye, colorClass: 'text-emerald-500' },
                                        { label: 'Avg CTR', value: `${overview.ctr}%`, icon: MousePointer, colorClass: 'text-amber-500' },
                                        { label: 'Conversion Rate', value: `${overview.conversionRate}%`, icon: ShoppingCart, colorClass: 'text-rose-500' },
                                    ].map((kpi, i) => (
                                        <div key={i} className="bg-surface border border-border rounded-2xl p-6 shadow-xl group hover:shadow-2xl transition-all hover:border-primary/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <kpi.icon className={`w-4 h-4 ${kpi.colorClass}`} />
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{kpi.label}</span>
                                            </div>
                                            <p className={`text-2xl font-black ${kpi.colorClass}`}>{kpi.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Revenue + ROI Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Campaign Revenue</p>
                                        <p className="text-3xl font-black relative z-10">{formatCurrency(overview.totalCampaignRevenue)}</p>
                                        <p className="text-xs opacity-60 mt-1">ROI: {overview.roi}%</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Platform Revenue</p>
                                        <p className="text-3xl font-black relative z-10">{formatCurrency(overview.totalPlatformRevenue)}</p>
                                        <p className="text-xs opacity-60 mt-1">{overview.totalUsers.toLocaleString()} users</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Budget Utilization</p>
                                        <p className="text-3xl font-black relative z-10">{overview.budgetUtilization}%</p>
                                        <p className="text-xs opacity-60 mt-1">{formatCurrency(overview.totalSpent)} / {formatCurrency(overview.totalBudget)}</p>
                                    </div>
                                </div>

                                {/* AI Time-Based Suggestions */}
                                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                                            <Zap className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-text-main">AI Suggestions — Right Now</h3>
                                            <p className="text-xs text-text-muted">{new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })} — Based on time-of-day patterns</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {timeSuggestions.map((s, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-xl hover:bg-primary/10 transition-all group">
                                                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0" />
                                                <span className="text-sm text-text-main font-medium flex-1">{s.msg}</span>
                                                <button
                                                    onClick={() => { setSelectedIndustry(s.pod); setActiveTab('content'); }}
                                                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    Create Ad
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Industry Pod Grid */}
                                <div>
                                    <h3 className="text-lg font-black text-text-main mb-4">Industry Pod Performance</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {INDUSTRY_PODS.map(pod => {
                                            const metrics = podMetrics[pod.id] || {};
                                            const isActive = activePods.some(p => p.id === pod.id);
                                            return (
                                                <div key={pod.id} className={`bg-surface border rounded-2xl p-5 shadow-lg transition-all hover:shadow-xl cursor-pointer group ${isActive ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border'}`}
                                                    onClick={() => { setActiveTab('pods'); }}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-2xl">{pod.icon}</span>
                                                        {isActive && (
                                                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" title="Peak hour" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-black text-text-main mb-1">{pod.name}</p>
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <span className={`text-xs font-bold ${(metrics.growth || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {(metrics.growth || 0) >= 0 ? '+' : ''}{metrics.growth || 0}%
                                                        </span>
                                                        {(metrics.growth || 0) >= 0
                                                            ? <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                                            : <ArrowDownRight className="w-3 h-3 text-red-500" />
                                                        }
                                                    </div>
                                                    <p className="text-[10px] text-text-muted">{(metrics.orders || 0).toLocaleString()} orders</p>
                                                    <div className="mt-2 w-full h-1.5 bg-border rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${metrics.completionRate || 0}%`, backgroundColor: pod.color }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Campaign Performance Chart */}
                                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                    <h3 className="text-lg font-black text-text-main mb-6">Campaign Performance</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={campaigns.filter(c => c.metrics.impressions > 0)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="metrics.clicks" name="Clicks" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="metrics.conversions" name="Conversions" fill="#10b981" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* ═══════════ CAMPAIGN STUDIO ═══════════ */}
                        {activeTab === 'campaigns' && (
                            <div className="space-y-8">
                                {/* Campaign List */}
                                <div className="bg-surface border border-border rounded-3xl shadow-xl overflow-hidden">
                                    <div className="p-6 border-b border-border flex items-center justify-between">
                                        <h3 className="text-lg font-black text-text-main">All Campaigns</h3>
                                        <button
                                            onClick={() => { setEditingCampaign(null); setShowCampaignModal(true); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                        >
                                            <Plus className="w-4 h-4" /> Create
                                        </button>
                                    </div>
                                    <div className="divide-y divide-border">
                                        {campaigns.map(camp => {
                                            const pod = INDUSTRY_PODS.find(p => p.id === camp.industry);
                                            const ctr = camp.metrics.impressions > 0 ? ((camp.metrics.clicks / camp.metrics.impressions) * 100).toFixed(1) : '0.0';
                                            return (
                                                <div key={camp.id} className="p-6 hover:bg-primary/5 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-2xl">{pod?.icon || '📣'}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="font-black text-text-main truncate">{camp.name}</h4>
                                                                <StatusBadge status={camp.status} />
                                                            </div>
                                                            <p className="text-xs text-text-muted mt-1">
                                                                {pod?.name || camp.industry} · {camp.startDate} → {camp.endDate} · Budget: {formatCurrency(camp.budget)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-6 text-right">
                                                            <div>
                                                                <p className="text-[10px] text-text-muted uppercase tracking-wider">CTR</p>
                                                                <p className="text-sm font-black text-text-main">{ctr}%</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-text-muted uppercase tracking-wider">Conversions</p>
                                                                <p className="text-sm font-black text-emerald-500">{camp.metrics.conversions}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-text-muted uppercase tracking-wider">Revenue</p>
                                                                <p className="text-sm font-black text-primary">{formatCurrency(camp.metrics.revenue)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                            {camp.status === 'draft' && (
                                                                <button onClick={() => handleStatusChange(camp.id, 'active')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><Play className="w-4 h-4" /></button>
                                                            )}
                                                            {camp.status === 'active' && (
                                                                <button onClick={() => handleStatusChange(camp.id, 'paused')} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg"><Pause className="w-4 h-4" /></button>
                                                            )}
                                                            {camp.status === 'paused' && (
                                                                <button onClick={() => handleStatusChange(camp.id, 'active')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><Play className="w-4 h-4" /></button>
                                                            )}
                                                            <button onClick={() => handleDeleteCampaign(camp.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                    {/* PAS Preview */}
                                                    {camp.pas && (
                                                        <div className="mt-4 grid grid-cols-3 gap-3">
                                                            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                                                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Problem</p>
                                                                <p className="text-xs text-text-muted">{camp.pas.problem}</p>
                                                            </div>
                                                            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                                                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Agitate</p>
                                                                <p className="text-xs text-text-muted">{camp.pas.agitate}</p>
                                                            </div>
                                                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Solution</p>
                                                                <p className="text-xs text-text-muted">{camp.pas.solution}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Budget Distribution Chart */}
                                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                    <h3 className="text-lg font-black text-text-main mb-6">Budget Distribution</h3>
                                    <div className="flex items-center gap-8">
                                        <ResponsiveContainer width="50%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={campaigns.map(c => ({ name: c.name, value: c.budget }))}
                                                    cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                                                    paddingAngle={3} dataKey="value"
                                                >
                                                    {campaigns.map((_, i) => (
                                                        <Cell key={i} fill={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][i % 5]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="flex-1 space-y-3">
                                            {campaigns.map((c, i) => (
                                                <div key={c.id} className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][i % 5] }} />
                                                    <span className="text-xs font-bold text-text-main flex-1">{c.name}</span>
                                                    <span className="text-xs font-bold text-text-muted">{formatCurrency(c.budget)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══════════ INDUSTRY PODS ═══════════ */}
                        {activeTab === 'pods' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {INDUSTRY_PODS.map(pod => {
                                        const metrics = podMetrics[pod.id] || {};
                                        const crossPromos = getCrossPollinationSuggestions(pod.id);
                                        const isActive = activePods.some(p => p.id === pod.id);

                                        return (
                                            <div key={pod.id} className={`bg-surface border rounded-3xl shadow-xl overflow-hidden transition-all hover:shadow-2xl ${isActive ? 'border-primary/30' : 'border-border'}`}>
                                                {/* Pod Header */}
                                                <div className={`bg-gradient-to-r ${pod.gradient} p-6 text-white relative overflow-hidden`}>
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-3xl">{pod.icon}</span>
                                                            <div>
                                                                <h3 className="text-lg font-black">{pod.name}</h3>
                                                                {isActive && (
                                                                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-lg">🟢 PEAK HOUR</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black">{formatCurrency(metrics.revenue || 0)}</p>
                                                            <p className="text-xs opacity-80">Revenue</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 space-y-5">
                                                    {/* KPI Row */}
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {[
                                                            { label: 'Users', value: (metrics.users || 0).toLocaleString() },
                                                            { label: 'Orders', value: (metrics.orders || 0).toLocaleString() },
                                                            { label: 'Rating', value: `⭐ ${metrics.avgRating || 0}` },
                                                            { label: 'Growth', value: `${(metrics.growth || 0) >= 0 ? '+' : ''}${metrics.growth || 0}%` },
                                                        ].map((kpi, i) => (
                                                            <div key={i} className="text-center p-2 bg-background rounded-xl">
                                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-wider">{kpi.label}</p>
                                                                <p className="text-sm font-black text-text-main">{kpi.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Completion Rate */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Completion Rate</span>
                                                            <span className="text-xs font-black text-text-main">{metrics.completionRate || 0}%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${metrics.completionRate || 0}%`, backgroundColor: pod.color }} />
                                                        </div>
                                                    </div>

                                                    {/* SEO Keywords */}
                                                    <div>
                                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">SEO Keywords</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {pod.seoKeywords.map(kw => (
                                                                <span key={kw} className="px-2.5 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-lg border border-primary/10">{kw}</span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* USPs */}
                                                    <div>
                                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Unique Selling Points</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {pod.usps.map(usp => (
                                                                <span key={usp} className="px-2.5 py-1 bg-emerald-500/5 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-500/10">✓ {usp}</span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Cross-Pollination */}
                                                    {crossPromos.length > 0 && (
                                                        <div>
                                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                                                                <Share2 className="w-3 h-3" /> Cross-Pollination
                                                            </p>
                                                            <div className="space-y-2">
                                                                {crossPromos.map((cp, i) => (
                                                                    <div key={i} className="flex items-center gap-2 p-2 bg-background rounded-lg text-xs">
                                                                        <span>{cp.from.icon}</span>
                                                                        <ChevronRight className="w-3 h-3 text-text-muted" />
                                                                        <span>{cp.to.icon}</span>
                                                                        <span className="text-text-muted flex-1">{cp.to.name}</span>
                                                                        <span className="font-bold text-primary">{cp.discount}% off</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Peak Hours */}
                                                    <div>
                                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Peak Hours</p>
                                                        <div className="flex gap-1">
                                                            {Array.from({ length: 24 }, (_, h) => (
                                                                <div
                                                                    key={h}
                                                                    className={`flex-1 h-4 rounded-sm transition-all ${pod.peakHours.includes(h) ? 'opacity-100' : 'opacity-20'}`}
                                                                    style={{ backgroundColor: pod.peakHours.includes(h) ? pod.color : '#334155' }}
                                                                    title={`${h}:00`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-between mt-1 text-[8px] text-text-muted">
                                                            <span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>12AM</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ═══════════ CONTENT ENGINE ═══════════ */}
                        {activeTab === 'content' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Generator Panel */}
                                    <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Wand2 className="w-5 h-5 text-primary" />
                                            <h3 className="text-lg font-black text-text-main">AI Content Generator</h3>
                                        </div>
                                        <p className="text-xs text-text-muted mb-6">Select an industry and campaign type to generate PAS-framework marketing copy.</p>

                                        <div className="space-y-5">
                                            {/* Industry Select */}
                                            <div>
                                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Industry</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {INDUSTRY_PODS.map(pod => (
                                                        <button
                                                            key={pod.id}
                                                            onClick={() => setSelectedIndustry(pod.id)}
                                                            className={`p-3 rounded-xl text-center transition-all ${selectedIndustry === pod.id
                                                                ? 'bg-primary/10 border-2 border-primary/30 shadow-lg'
                                                                : 'bg-background border border-border hover:border-primary/20'
                                                                }`}
                                                        >
                                                            <span className="text-xl">{pod.icon}</span>
                                                            <p className="text-[9px] font-bold text-text-muted mt-1">{pod.name.split(' ')[0]}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Template Select */}
                                            <div>
                                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Campaign Template</label>
                                                <select
                                                    value={selectedTemplate}
                                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                >
                                                    {getPASTemplates().map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Discount Input */}
                                            <div>
                                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Discount %</label>
                                                <input
                                                    type="number"
                                                    value={contentDiscount}
                                                    onChange={(e) => setContentDiscount(parseInt(e.target.value) || 0)}
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    min="0" max="100"
                                                />
                                            </div>

                                            <button
                                                onClick={handleGenerateContent}
                                                className="w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Wand2 className="w-4 h-4" /> Generate Marketing Copy
                                            </button>
                                        </div>
                                    </div>

                                    {/* Generated Output */}
                                    <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                        <h3 className="text-lg font-black text-text-main mb-6">Generated Content</h3>

                                        {generatedContent ? (
                                            <div className="space-y-5">
                                                {/* Headline */}
                                                <div className="p-4 bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/20 rounded-xl">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Headline</p>
                                                    <p className="text-lg font-black text-text-main">{generatedContent.headline}</p>
                                                </div>

                                                {/* PAS Cards */}
                                                <div className="space-y-3">
                                                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">🔴 Problem</p>
                                                        <p className="text-sm text-text-main">{generatedContent.problem}</p>
                                                    </div>
                                                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">🟡 Agitate</p>
                                                        <p className="text-sm text-text-main">{generatedContent.agitate}</p>
                                                    </div>
                                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">🟢 Solution</p>
                                                        <p className="text-sm text-text-main">{generatedContent.solution}</p>
                                                    </div>
                                                </div>

                                                {/* CTA */}
                                                <div className="p-4 bg-primary text-white rounded-xl text-center shadow-lg shadow-primary/20">
                                                    <p className="font-black text-sm">{generatedContent.cta}</p>
                                                </div>

                                                {/* Hashtags */}
                                                <div>
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Hashtags</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {generatedContent.hashtags.map(tag => (
                                                            <span key={tag} className="px-2 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-lg">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => {
                                                            const text = `${generatedContent.headline}\n\n${generatedContent.problem}\n\n${generatedContent.agitate}\n\n${generatedContent.solution}\n\n${generatedContent.cta}\n\n${generatedContent.hashtags.join(' ')}`;
                                                            navigator.clipboard.writeText(text);
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-background border border-border rounded-xl text-text-main text-xs font-black uppercase tracking-widest hover:bg-primary/5 transition-all"
                                                    >
                                                        <Copy className="w-4 h-4" /> Copy All
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingCampaign(null);
                                                            setShowCampaignModal(true);
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        <Megaphone className="w-4 h-4" /> Create Campaign
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-[400px] text-text-muted">
                                                <Wand2 className="w-12 h-12 mb-4 opacity-20" />
                                                <p className="text-sm font-bold">Select options and generate</p>
                                                <p className="text-xs mt-1">PAS-framework copy will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══════════ SEO & ANALYTICS ═══════════ */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-8">
                                {/* Pod Selector */}
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {INDUSTRY_PODS.map(pod => (
                                        <button key={pod.id} onClick={() => setSeoPod(pod.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${seoPod === pod.id
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'bg-surface border border-border text-text-muted hover:border-primary/30'}`}>
                                            <span>{pod.icon}</span> {pod.name.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Keyword Rankings Table */}
                                    <div className="lg:col-span-2 bg-surface border border-border rounded-3xl shadow-xl overflow-hidden">
                                        <div className="p-6 border-b border-border flex items-center gap-3">
                                            <Search className="w-5 h-5 text-primary" />
                                            <h3 className="text-lg font-black text-text-main">Keyword Rankings — {INDUSTRY_PODS.find(p => p.id === seoPod)?.name}</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-border">
                                                        <th className="text-left px-6 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Keyword</th>
                                                        <th className="text-center px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Rank</th>
                                                        <th className="text-center px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Volume</th>
                                                        <th className="text-center px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Difficulty</th>
                                                        <th className="text-center px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Trend</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {(seoData[seoPod] || []).map((kw, i) => (
                                                        <tr key={i} className="hover:bg-primary/5 transition-all">
                                                            <td className="px-6 py-4 text-sm font-bold text-text-main">{kw.keyword}</td>
                                                            <td className="px-4 py-4 text-center">
                                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black ${kw.rank <= 3 ? 'bg-emerald-500/10 text-emerald-500' : kw.rank <= 5 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-400'}`}>
                                                                    #{kw.rank}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 text-center text-sm font-bold text-text-main">{kw.volume.toLocaleString()}</td>
                                                            <td className="px-4 py-4 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                                                                        <div className="h-full rounded-full" style={{ width: `${kw.difficulty}%`, backgroundColor: kw.difficulty > 70 ? '#ef4444' : kw.difficulty > 40 ? '#f59e0b' : '#10b981' }} />
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-text-muted">{kw.difficulty}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-center">
                                                                {kw.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-emerald-500 mx-auto" /> : kw.trend === 'down' ? <ArrowDownRight className="w-4 h-4 text-red-500 mx-auto" /> : <span className="text-xs text-text-muted">—</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Competitor Cards */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className="w-5 h-5 text-primary" />
                                            <h3 className="text-lg font-black text-text-main">Competitor Pulse</h3>
                                        </div>
                                        {(() => { const podComps = competitors.filter(c => c.industry === seoPod); return (podComps.length > 0 ? podComps : competitors).slice(0, 3); })().map((comp, i) => (
                                            <div key={i} className="bg-surface border border-border rounded-2xl p-5 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-black text-text-main">{comp.name}</h4>
                                                    <span className="text-xs font-bold text-amber-500">⭐ {comp.rating}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <div className="p-2 bg-background rounded-lg text-center">
                                                        <p className="text-[9px] font-black text-text-muted uppercase">Pricing</p>
                                                        <p className="text-xs font-bold text-text-main">{comp.pricing}</p>
                                                    </div>
                                                    <div className="p-2 bg-background rounded-lg text-center">
                                                        <p className="text-[9px] font-black text-text-muted uppercase">Market</p>
                                                        <p className="text-xs font-bold text-text-main">{comp.marketShare}%</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1.5">Weaknesses</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {comp.weaknesses.map(w => (
                                                            <span key={w} className="px-2 py-0.5 bg-red-500/5 text-red-500 text-[9px] font-bold rounded-lg border border-red-500/10">✗ {w}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Search Traffic Trends */}
                                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
                                    <h3 className="text-lg font-black text-text-main mb-6">Search Traffic Trends</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={searchTrends}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Area type="monotone" dataKey="organic" name="Organic" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                                            <Area type="monotone" dataKey="paid" name="Paid" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                                            <Area type="monotone" dataKey="social" name="Social" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* ═══════════ LOYALTY & PROMOS ═══════════ */}
                        {activeTab === 'loyalty' && loyaltyData && (
                            <div className="space-y-8">
                                {/* Universal Wallet KPIs */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Active Wallets', value: loyaltyData.activeWallets.toLocaleString(), icon: Wallet, colorClass: 'text-blue-500' },
                                        { label: 'Points Redeemed', value: `${(loyaltyData.totalPointsRedeemed / 1000000).toFixed(1)}M`, icon: Star, colorClass: 'text-amber-500' },
                                        { label: 'Cross-Service %', value: `${loyaltyData.crossServiceUsage}%`, icon: Share2, colorClass: 'text-emerald-500' },
                                        { label: 'Monthly Growth', value: `+${loyaltyData.monthlyGrowth}%`, icon: TrendingUp, colorClass: 'text-cyan-500' },
                                    ].map((kpi, i) => (
                                        <div key={i} className="bg-surface border border-border rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-2 mb-3">
                                                <kpi.icon className={`w-4 h-4 ${kpi.colorClass}`} />
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{kpi.label}</span>
                                            </div>
                                            <p className={`text-2xl font-black ${kpi.colorClass}`}>{kpi.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Cross-Pollination Stats */}
                                    <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Share2 className="w-5 h-5 text-primary" />
                                            <h3 className="text-lg font-black text-text-main">Cross-Pollination Performance</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {loyaltyData.crossPollinationStats.map((cp, i) => (
                                                <div key={i} className="flex items-center gap-4 p-3 bg-background rounded-xl hover:bg-primary/5 transition-all">
                                                    <div className="flex items-center gap-2 min-w-[120px]">
                                                        <span className="text-sm font-bold text-text-main">{cp.from}</span>
                                                        <ChevronRight className="w-3 h-3 text-text-muted" />
                                                        <span className="text-sm font-bold text-primary">{cp.to}</span>
                                                    </div>
                                                    <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all" style={{ width: `${cp.rate * 4}%` }} />
                                                    </div>
                                                    <div className="text-right min-w-[80px]">
                                                        <span className="text-xs font-black text-emerald-500">{cp.rate}%</span>
                                                        <span className="text-[10px] text-text-muted ml-1">({cp.conversions.toLocaleString()})</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Points Redemption Chart */}
                                    <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl">
                                        <h3 className="text-lg font-black text-text-main mb-6">Reward Points by Service</h3>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={loyaltyData.topRedemptions} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                <YAxis dataKey="service" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={100} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="points" name="Points" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Auto-Trigger Rules */}
                                <div className="bg-surface border border-border rounded-3xl shadow-xl overflow-hidden">
                                    <div className="p-6 border-b border-border flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-primary" />
                                        <h3 className="text-lg font-black text-text-main">Auto-Trigger Rules</h3>
                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-lg">{autoTriggers.filter(t => t.status === 'active').length} Active</span>
                                    </div>
                                    <div className="divide-y divide-border">
                                        {autoTriggers.map(trigger => (
                                            <div key={trigger.id} className="p-5 hover:bg-primary/5 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${trigger.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-black text-text-main text-sm">{trigger.name}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-xs text-text-muted"><span className="font-bold text-amber-500">IF</span> {trigger.condition}</span>
                                                            <ChevronRight className="w-3 h-3 text-text-muted" />
                                                            <span className="text-xs text-text-muted"><span className="font-bold text-emerald-500">THEN</span> {trigger.action}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-primary">{trigger.triggered.toLocaleString()}</p>
                                                        <p className="text-[10px] text-text-muted">triggers</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Safety Features Marketing */}
                                    {safetyData && (
                                        <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Shield className="w-5 h-5 text-emerald-500" />
                                                <div>
                                                    <h3 className="text-lg font-black text-text-main">Safety as a Feature</h3>
                                                    <p className="text-xs text-text-muted">Market these to build trust</p>
                                                </div>
                                                <span className="ml-auto text-sm font-black text-emerald-500">⭐ {safetyData.safetyRating}/5.0</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                {safetyData.features.map((f, i) => (
                                                    <div key={i} className="p-3 bg-background rounded-xl hover:bg-primary/5 transition-all group cursor-pointer">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-lg">{f.icon}</span>
                                                            <span className="text-xs font-black text-text-main">{f.name}</span>
                                                        </div>
                                                        <p className="text-[10px] text-text-muted mb-2">{f.description}</p>
                                                        <p className="text-xs font-bold" style={{ color: f.color }}>{f.usage.toLocaleString()} uses</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bidding Edge */}
                                    {biddingData && (
                                        <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Gavel className="w-5 h-5 text-amber-500" />
                                                <div>
                                                    <h3 className="text-lg font-black text-text-main">The Bidding Edge</h3>
                                                    <p className="text-xs text-text-muted">Users set their own price</p>
                                                </div>
                                                <span className="ml-auto text-sm font-black text-amber-500">{biddingData.avgSavings}% avg savings</span>
                                            </div>
                                            <div className="space-y-3 mb-6">
                                                {biddingData.industries.map((b, i) => (
                                                    <div key={i} className="p-4 bg-background rounded-xl">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">{b.icon}</span>
                                                                <span className="text-sm font-black text-text-main">{b.name}</span>
                                                            </div>
                                                            <span className="text-xs font-bold text-emerald-500">{b.conversionRate}% conv.</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="text-center">
                                                                <p className="text-[9px] text-text-muted uppercase">Total Bids</p>
                                                                <p className="text-xs font-black text-text-main">{b.totalBids.toLocaleString()}</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-[9px] text-text-muted uppercase">Avg Fare</p>
                                                                <p className="text-xs font-black text-text-main">{b.avgFare}</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-[9px] text-text-muted uppercase">Savings</p>
                                                                <p className="text-xs font-black text-emerald-500">{b.avgSavings}%</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Bidding Trend */}
                                            <ResponsiveContainer width="100%" height={150}>
                                                <BarChart data={biddingData.monthlyTrend}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                                    <Bar dataKey="bids" name="Total Bids" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="accepted" name="Accepted" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* 30-Day Promo Calendar */}
                                <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <CalendarDays className="w-5 h-5 text-primary" />
                                        <h3 className="text-lg font-black text-text-main">30-Day Promo Calendar</h3>
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                            <div key={d} className="text-center text-[9px] font-black text-text-muted uppercase tracking-wider pb-2">{d}</div>
                                        ))}
                                        {promoSchedule.slice(0, 28).map((promo, i) => (
                                            <div key={i} className="p-2 bg-background rounded-xl text-center hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-primary/20" title={`${promo.label} — ${promo.discount}% off`}>
                                                <p className="text-[9px] text-text-muted">{promo.weekday}</p>
                                                <p className="text-sm font-black text-text-main">{promo.day}</p>
                                                <span className="text-sm">{promo.icon}</span>
                                                <p className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-all" style={{ color: promo.color }}>{promo.discount}%</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ═══════════ CAMPAIGN MODAL ═══════════ */}
                {showCampaignModal && (
                    <CampaignModal
                        campaign={editingCampaign}
                        generatedContent={generatedContent}
                        onSave={async (data) => {
                            if (editingCampaign) {
                                await updateCampaign(editingCampaign.id, data);
                            } else {
                                await createCampaign(data);
                            }
                            setShowCampaignModal(false);
                            loadData();
                        }}
                        onClose={() => setShowCampaignModal(false)}
                    />
                )}
            </div>
        </div>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const map = {
        active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        paused: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${map[status] || map.draft}`}>
            {status}
        </span>
    );
}

function CampaignModal({ campaign, generatedContent, onSave, onClose }) {
    const [form, setForm] = useState({
        name: campaign?.name || '',
        industry: campaign?.industry || 'taxi',
        template: campaign?.template || 'first_order',
        budget: campaign?.budget || 1000,
        discount: campaign?.discount || 20,
        startDate: campaign?.startDate || new Date().toISOString().split('T')[0],
        endDate: campaign?.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        target: campaign?.target || 'all_users',
        pas: campaign?.pas ? campaign.pas : generatedContent ? {
            problem: generatedContent.problem || '',
            agitate: generatedContent.agitate || '',
            solution: generatedContent.solution || '',
        } : { problem: '', agitate: '', solution: '' },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    const pod = INDUSTRY_PODS.find(p => p.id === form.industry);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="text-lg font-black text-text-main">{campaign ? 'Edit Campaign' : 'Create Campaign'}</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Campaign Name</label>
                            <input
                                type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="e.g. Summer Ride Promo" required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Industry</label>
                            <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20">
                                {INDUSTRY_PODS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Budget (R)</label>
                            <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Start Date</label>
                            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">End Date</label>
                            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Target Audience</label>
                            <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20">
                                <option value="all_users">All Users</option>
                                <option value="new_users">New Users</option>
                                <option value="returning_users">Returning Users</option>
                                <option value="inactive_users">Inactive Users</option>
                                <option value="food_users">Food Delivery Users</option>
                                <option value="taxi_users">Taxi Users</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Discount %</label>
                            <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" min="0" max="100" />
                        </div>
                    </div>

                    {/* PAS Framework */}
                    <div className="border-t border-border pt-5">
                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-4">PAS Framework Copy</p>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">🔴 Problem</label>
                                <textarea value={form.pas.problem} onChange={e => setForm({ ...form, pas: { ...form.pas, problem: e.target.value } })}
                                    rows="2" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    placeholder="What pain does your audience feel?" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">🟡 Agitate</label>
                                <textarea value={form.pas.agitate} onChange={e => setForm({ ...form, pas: { ...form.pas, agitate: e.target.value } })}
                                    rows="2" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    placeholder="Make the problem feel urgent..." />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">🟢 Solution</label>
                                <textarea value={form.pas.solution} onChange={e => setForm({ ...form, pas: { ...form.pas, solution: e.target.value } })}
                                    rows="2" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    placeholder="Present your service as the answer..." />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-background border border-border rounded-xl text-text-muted text-xs font-black uppercase tracking-widest hover:bg-surface transition-all">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                            {campaign ? 'Update Campaign' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
