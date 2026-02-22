import React, { useState } from 'react';
import { CheckCircle, Calendar, Layout, Sparkles, Settings, CreditCard, Users, FileText, ChevronDown, BarChart3, DollarSign, Package, TrendingUp, Megaphone } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const location = useLocation();
    const { subscription, getPlanDetails } = useSubscription();
    const { isAdmin } = useAuth();
    const planDetails = getPlanDetails();
    const plan = subscription?.plan || 'free';
    const [showBillingMenu, setShowBillingMenu] = useState(location.pathname.startsWith('/billing'));

    const isActive = (path) => {
        return location.pathname === path
            ? 'bg-primary/10 text-primary border-r-2 border-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]'
            : 'text-slate-400 hover:bg-slate-900/50 hover:text-white transition-all';
    };

    const isBillingActive = location.pathname.startsWith('/billing') || location.pathname.startsWith('/invoices');

    return (
        <aside className="w-64 bg-[#020617] h-screen flex flex-col border-r border-slate-800 shadow-2xl z-50 transition-all duration-500">
            {/* Logo Section */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full"></div>
                        <div className="w-12 h-12 bg-[#020617] rounded-xl flex items-center justify-center border border-slate-800 shadow-2xl relative z-10 transition-all group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-primary/20 overflow-hidden p-2">
                            <img src="/logo-white.svg" alt="TaskNest" className="w-full h-full object-contain filter" />
                        </div>
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter">TaskNest</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">

                <div className="px-5 py-2 mb-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] opacity-80">Main Menu</div>

                <Link to="/dashboard" className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/dashboard')}`}>
                    <Layout className="w-5 h-5" />
                    Dashboard
                </Link>

                <Link to="/tasks" className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/tasks')}`}>
                    <CheckCircle className="w-5 h-5" />
                    My Tasks
                </Link>

                <Link to="/schedule" className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/schedule')}`}>
                    <Calendar className="w-5 h-5" />
                    Schedule
                </Link>

                <Link to="/calendar" className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/calendar')}`}>
                    <Calendar className="w-5 h-5" />
                    Calendar
                </Link>

                <Link to="/ai-assistant" className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm group transition-all duration-300 ${isActive('/ai-assistant')}`}>
                    <Sparkles className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
                    NestAI
                    <span className="ml-auto text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2 py-0.5 rounded-lg shadow-lg shadow-amber-900/20">PRO</span>
                </Link>

                <Link to="/booking/setup" className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/booking/setup')}`}>
                    <Users className="w-5 h-5" />
                    Booking
                    <span className="ml-auto text-[9px] font-black bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-0.5 rounded-lg">BIZ</span>
                </Link>


                <div className="mt-10 px-5 py-2 mb-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] opacity-80">Workspace</div>

                <Link to="/projects" className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/projects')}`}>
                    <Layout className="w-5 h-5" />
                    Projects
                </Link>

                <div>
                    <button
                        onClick={() => setShowBillingMenu(!showBillingMenu)}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isBillingActive
                            ? 'bg-slate-900/50 text-white'
                            : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
                            }`}
                    >
                        <FileText className="w-5 h-5" />
                        <span className="flex-1 text-left">Finance</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showBillingMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showBillingMenu && (
                        <div className="ml-5 mt-2 space-y-1 border-l-2 border-slate-800 pl-4 animate-in slide-in-from-left duration-300">
                            {[
                                { to: '/billing', label: 'Dashboard', icon: Layout },
                                { to: '/billing/cashflow', label: 'Cash Flow', icon: TrendingUp },
                                { to: '/billing/quotes', label: 'Quotes', icon: FileText },
                                { to: '/billing/invoices', label: 'Invoices', icon: FileText },
                                { to: '/billing/clients', label: 'Clients', icon: Users },
                                { to: '/billing/products', label: 'Products', icon: Package },
                                { to: '/billing/payments', label: 'Payments', icon: DollarSign },
                                { to: '/billing/financial-reports', label: 'Financial Reports', icon: BarChart3 },
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${location.pathname === item.to ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <item.icon className="w-3.5 h-3.5" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-10 px-5 py-2 mb-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] opacity-80">Account</div>

                <Link to="/settings" className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/settings')}`}>
                    <Settings className="w-5 h-5" />
                    Settings
                </Link>

                {isAdmin && (
                    <>
                        <Link to="/admin" className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/admin')}`}>
                            <Users className="w-5 h-5" />
                            Admin Panel
                        </Link>
                        <Link to="/marketing" className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/marketing')}`}>
                            <Megaphone className="w-5 h-5" />
                            Marketing
                            <span className="ml-auto text-[9px] font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 py-0.5 rounded-lg">NEW</span>
                        </Link>
                    </>
                )}

                <Link to="/pricing" className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/pricing')}`}>
                    <CreditCard className="w-5 h-5" />
                    Billing
                </Link>
            </nav>

            {/* Footer / Upgrade Card */}
            <div className="p-6 border-t border-slate-800 bg-[#020617]">
                {subscription.plan === 'free' ? (
                    <div className="relative overflow-hidden bg-gradient-to-br from-primary to-indigo-700 rounded-3xl p-5 text-white shadow-xl shadow-primary/20 group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="font-black text-sm relative z-10 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            Go Pro
                        </h4>
                        <p className="text-[10px] text-blue-100 mt-1 mb-4 relative z-10 font-medium">Unlock all premium features.</p>
                        <Link to="/pricing" className="block w-full py-2.5 bg-white text-primary text-xs font-black rounded-xl transition-all text-center relative z-10 shadow-lg hover:scale-105 active:scale-95">
                            Upgrade Now
                        </Link>
                    </div>
                ) : (
                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/80">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <span className="font-black text-xs text-white uppercase tracking-wider">{planDetails.name}</span>
                                <p className="text-[10px] text-slate-500 font-bold">Active Shield</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
