// TaskNest Settings Page - Updated 2026-01-25
import React, { useState, useRef } from 'react';
import {
    User, CreditCard, Bell, Palette, Shield, LogOut,
    ChevronRight, Check, AlertTriangle, Crown, Sparkles,
    Mail, Calendar, Clock, ExternalLink, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PLANS, cancelSubscription, pauseSubscription, resumeSubscription, getBillingHistory, getGracePeriodStatus } from '../services/paymentService';

export default function Settings() {
    const navigate = useNavigate();
    const { subscription, getPlanDetails, refreshSubscription } = useSubscription();
    const { user, logout, getInitials, updateProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const [activeSection, setActiveSection] = useState('profile');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [pausing, setPausing] = useState(false);
    const [resuming, setResuming] = useState(false);
    const [loadingLogo, setLoadingLogo] = useState(false);
    const businessFormRef = useRef(null);
    const gracePeriod = getGracePeriodStatus();

    // Notification preferences state
    const [notifications, setNotifications] = useState({
        emailReminders: true,
        emailDigest: false,
        pushTasks: true,
        pushAppointments: true,
        reminderTime: '30',
    });
    const [saveStatus, setSaveStatus] = useState({ profile: false, business: false });

    const triggerSaveFeedback = (section) => {
        setSaveStatus(prev => ({ ...prev, [section]: true }));
        setTimeout(() => setSaveStatus(prev => ({ ...prev, [section]: false })), 2000);
    };

    const handleSaveBusinessDetails = () => {
        if (!businessFormRef.current) return;
        const updates = {};
        businessFormRef.current.querySelectorAll('[data-field]').forEach(el => {
            updates[el.dataset.field] = el.value;
        });
        if (Object.keys(updates).length > 0) {
            updateProfile(updates);
        }
        triggerSaveFeedback('business');
    };

    const planDetails = getPlanDetails();
    const billingHistory = getBillingHistory();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const handleCancelSubscription = async () => {
        setCancelling(true);
        try {
            await cancelSubscription(subscription.payfastToken);
            refreshSubscription();
            setShowCancelModal(false);
        } catch (error) {
            console.error('Failed to cancel:', error);
        } finally {
            setCancelling(false);
        }
    };

    const sections = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'business', label: 'Business', icon: Shield },
        { id: 'subscription', label: 'Subscription', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-colors duration-300">
            <PageHeader
                title="Settings"
                subtitle="Manage your account and preferences"
            />

            <div className="max-w-5xl mx-auto p-8 w-full overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-gap-8 md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-64 shrink-0">
                        <nav className="bg-surface/40 rounded-3xl shadow-2xl border border-border/50 overflow-hidden glass-panel transition-all duration-500">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-all cursor-pointer border-l-4 ${activeSection === section.id
                                        ? 'bg-primary/10 text-primary border-primary font-black shadow-[inset_4px_0_15px_rgba(59,130,246,0.1)]'
                                        : 'text-slate-500 hover:bg-slate-900/40 hover:text-text-main border-transparent font-bold'
                                        }`}
                                >
                                    <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-primary' : 'text-slate-400'}`} />
                                    <span className="text-sm uppercase tracking-widest">{section.label}</span>
                                </button>
                            ))}

                            <div className="border-t border-border/20">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-6 py-4 text-left text-red-500 hover:bg-red-500/10 transition-all cursor-pointer font-black uppercase tracking-[0.2em] text-[10px]"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {activeSection === 'profile' && (
                            <div className="bg-surface/40 rounded-[2.5rem] shadow-2xl border border-border/50 overflow-hidden glass-panel transition-all duration-500 animate-in fade-in slide-in-from-right-4">
                                <div className="p-8 border-b border-border/20 bg-slate-900/40">
                                    <h2 className="text-xl font-black text-text-main tracking-tighter uppercase">Identity Registry</h2>
                                    <p className="text-xs text-slate-500 font-bold mt-1 opacity-80 uppercase tracking-widest">Update your profile parameters and credentials</p>
                                </div>
                                <div className="p-10 space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-black shadow-inner shadow-primary/20">
                                            {getInitials()}
                                        </div>
                                        <div>
                                            <button className="px-6 py-2.5 bg-surface border border-border/80 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-main hover:bg-slate-900 transition-all cursor-pointer shadow-xl active:scale-95">
                                                Shift Avatar
                                            </button>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] mt-3 ml-1 opacity-60">JPG, GIF, PNG. Limit: 2MB.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">First Name</label>
                                            <input
                                                type="text"
                                                defaultValue={user?.firstName || ''}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                                onBlur={(e) => updateProfile({ firstName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Last Name</label>
                                            <input
                                                type="text"
                                                defaultValue={user?.lastName || ''}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                                onBlur={(e) => updateProfile({ lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            defaultValue={user?.email || ''}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                            onBlur={(e) => updateProfile({ email: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={() => triggerSaveFeedback('profile')}
                                            className={`px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 ${saveStatus.profile
                                                ? 'bg-green-500 text-white shadow-green-500/20'
                                                : 'bg-primary text-white shadow-primary/20 hover:bg-blue-600'
                                                }`}
                                        >
                                            {saveStatus.profile ? <Check className="w-4 h-4" /> : null}
                                            {saveStatus.profile ? 'Profile Saved!' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'subscription' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900 dark:text-white">Current Plan</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your subscription and billing</p>
                                        </div>
                                        <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">
                                            {subscription.status}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 bg-[#020617] rounded-lg shadow-lg flex items-center justify-center border border-slate-800">
                                                    <Crown className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 dark:text-white">{planDetails.name} Plan</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {subscription.plan === 'free'
                                                            ? 'Limited access to core features'
                                                            : subscription.billingCycle === 'yearly'
                                                                ? `${planDetails.yearlyPriceDisplay}/year`
                                                                : `${planDetails.priceDisplay}/month`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate('/pricing')}
                                                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                                            >
                                                {subscription.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                                            </button>
                                        </div>

                                        {subscription.plan !== 'free' && (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                                                    <span className="text-gray-500">Next billing date</span>
                                                    <span className="font-medium text-gray-900">{formatDate(subscription.nextBillingDate)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                                                    <span className="text-gray-500">Payment method</span>
                                                    <span className="font-medium text-gray-900 flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4" /> PayFast Secure
                                                    </span>
                                                </div>

                                                {gracePeriod.inGracePeriod && (
                                                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
                                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-medium text-amber-800">Subscription Cancelled</p>
                                                            <p className="text-xs text-amber-700 mt-0.5">
                                                                Your access will continue until {formatDate(subscription.nextBillingDate)}.
                                                                You have {gracePeriod.daysRemaining} days left.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-4 flex gap-3">
                                                    {subscription.status === 'active' && !gracePeriod.inGracePeriod && (
                                                        <button
                                                            onClick={() => setShowCancelModal(true)}
                                                            className="text-sm text-red-600 font-medium hover:text-red-700 cursor-pointer"
                                                        >
                                                            Cancel Subscription
                                                        </button>
                                                    )}
                                                    {gracePeriod.inGracePeriod && (
                                                        <button
                                                            onClick={() => navigate('/pricing')}
                                                            className="text-sm text-primary font-medium hover:text-blue-600 cursor-pointer"
                                                        >
                                                            Renew Subscription
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {billingHistory.length > 0 && (
                                    <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                                        <div className="p-6 border-b border-gray-100">
                                            <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        <th className="px-6 py-3">Date</th>
                                                        <th className="px-6 py-3">Description</th>
                                                        <th className="px-6 py-3">Amount</th>
                                                        <th className="px-6 py-3">Status</th>
                                                        <th className="px-6 py-3">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {billingHistory.map((invoice) => (
                                                        <tr key={invoice.id} className="text-sm">
                                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDate(invoice.date)}</td>
                                                            <td className="px-6 py-4 text-gray-900 font-medium">{invoice.description}</td>
                                                            <td className="px-6 py-4 text-gray-900">R{invoice.amount}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                                                                    {invoice.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <button className="text-primary hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                                                                    <ExternalLink className="w-4 h-4" /> Receipt
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'business' && (
                            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
                                    <p className="text-sm text-gray-500 mt-1">Logo and details for your professional invoices and quotes</p>
                                </div>
                                <div className="p-6 space-y-8" ref={businessFormRef}>
                                    {/* Logo Upload */}
                                    <div className="space-y-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-40 h-40 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center overflow-hidden mb-4 group relative shadow-inner">
                                                {loadingLogo ? (
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                ) : user?.businessLogo ? (
                                                    <>
                                                        <img src={user.businessLogo} alt="Business Logo" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" />
                                                        <button
                                                            onClick={() => updateProfile({ businessLogo: null })}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 active:scale-95"
                                                            title="Remove Logo"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="text-slate-400 flex flex-col items-center">
                                                        <Sparkles className="w-8 h-8 mb-2 opacity-30" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Upload Logo</span>
                                                    </div>
                                                )}

                                                {!loadingLogo && (
                                                    <label className="absolute inset-0 bg-primary/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-black uppercase tracking-widest">
                                                        {user?.businessLogo ? 'Change' : 'Upload'}
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (!file) return;

                                                                // Validation
                                                                if (file.size > 2 * 1024 * 1024) { // Increased to 2MB as per limit text
                                                                    alert('Logo must be smaller than 2MB. Please compress your image.');
                                                                    return;
                                                                }

                                                                setLoadingLogo(true);
                                                                try {
                                                                    console.log('Starting logo process...', file.name, file.size);

                                                                    // Compress logo via canvas to keep Firestore doc under 1MB
                                                                    const img = new Image();
                                                                    img.onload = async () => {
                                                                        const canvas = document.createElement('canvas');
                                                                        const MAX = 300; // Increased resolution slightly
                                                                        let w = img.width, h = img.height;

                                                                        if (w > h) {
                                                                            if (w > MAX) {
                                                                                h = Math.round(h * MAX / w);
                                                                                w = MAX;
                                                                            }
                                                                        } else {
                                                                            if (h > MAX) {
                                                                                w = Math.round(w * MAX / h);
                                                                                h = MAX;
                                                                            }
                                                                        }

                                                                        canvas.width = w;
                                                                        canvas.height = h;
                                                                        const ctx = canvas.getContext('2d');
                                                                        ctx.drawImage(img, 0, 0, w, h);

                                                                        // Use slightly higher quality
                                                                        const compressed = canvas.toDataURL('image/png', 0.9);
                                                                        console.log('Logo compressed from', file.size, 'to', compressed.length);

                                                                        await updateProfile({ businessLogo: compressed });
                                                                        setLoadingLogo(false);
                                                                        triggerSaveFeedback('business');
                                                                    };

                                                                    img.onerror = (err) => {
                                                                        console.error('Failed to load image for compression', err);
                                                                        setLoadingLogo(false);
                                                                        alert('Failed to process image. Please try another file.');
                                                                    };

                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => { img.src = reader.result; };
                                                                    reader.readAsDataURL(file);
                                                                } catch (err) {
                                                                    console.error('Logo upload failed:', err);
                                                                    setLoadingLogo(false);
                                                                    alert('Failed to save logo: ' + err.message);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
                                                Recommended: Square PNG/SVG<br />
                                                <span className={`${loadingLogo ? 'text-primary animate-pulse' : ''}`}>Max size: 500KB</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Business Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Name</label>
                                            <input
                                                type="text"
                                                data-field="businessName"
                                                defaultValue={user?.businessName || ''}
                                                placeholder="e.g. Acme Studio"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                                onBlur={(e) => updateProfile({ businessName: e.target.value })}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Address</label>
                                            <textarea
                                                data-field="businessAddress"
                                                defaultValue={user?.businessAddress || ''}
                                                placeholder="Street Address, City, Zip Code"
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none shadow-inner"
                                                rows="3"
                                                onBlur={(e) => updateProfile({ businessAddress: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Person</label>
                                            <input
                                                type="text"
                                                data-field="contactPerson"
                                                defaultValue={user?.contactPerson || ''}
                                                placeholder="e.g. John Doe"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                                onBlur={(e) => updateProfile({ contactPerson: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Number</label>
                                            <input
                                                type="tel"
                                                data-field="contactNumber"
                                                defaultValue={user?.contactNumber || ''}
                                                placeholder="e.g. +27 12 345 6789"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                                onBlur={(e) => updateProfile({ contactNumber: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Email</label>
                                            <input
                                                type="email"
                                                data-field="businessEmail"
                                                defaultValue={user?.businessEmail || ''}
                                                placeholder="e.g. billing@company.com"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                                onBlur={(e) => updateProfile({ businessEmail: e.target.value })}
                                            />
                                        </div>

                                        {/* Banking Details */}
                                        <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Banking Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bank Name</label>
                                                    <input
                                                        type="text"
                                                        data-field="bankName"
                                                        defaultValue={user?.bankName || ''}
                                                        placeholder="e.g. First National Bank"
                                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                                        onBlur={(e) => updateProfile({ bankName: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Account Holder</label>
                                                    <input
                                                        type="text"
                                                        data-field="accountHolder"
                                                        defaultValue={user?.accountHolder || ''}
                                                        placeholder="Your Name or Business Name"
                                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                                        onBlur={(e) => updateProfile({ accountHolder: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Account Number</label>
                                                    <input
                                                        type="text"
                                                        data-field="accountNumber"
                                                        defaultValue={user?.accountNumber || ''}
                                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                                        onBlur={(e) => updateProfile({ accountNumber: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Branch/Sort Code</label>
                                                    <input
                                                        type="text"
                                                        data-field="branchCode"
                                                        defaultValue={user?.branchCode || ''}
                                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                                        onBlur={(e) => updateProfile({ branchCode: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex justify-end">
                                        <button
                                            className={`px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 ${saveStatus.business
                                                ? 'bg-green-500 text-white shadow-green-500/20'
                                                : 'bg-primary text-white shadow-primary/20 hover:bg-blue-600'
                                                }`}
                                            onClick={handleSaveBusinessDetails}
                                        >
                                            {saveStatus.business ? <Check className="w-4 h-4" /> : null}
                                            {saveStatus.business ? 'Business Saved!' : 'Save Business Details'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Notification Preferences</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control how and when you receive updates</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Email Notifications</h3>
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Task Reminders</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Get notified before a task is due</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Daily Digest</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Summary of your day ahead every morning</p>
                                            </div>
                                            <input type="checkbox" className="w-5 h-5 accent-primary cursor-pointer" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <h3 className="font-medium text-gray-900">Push Notifications</h3>
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Desktop Notifications</p>
                                                <p className="text-xs text-gray-500">Show alerts on your desktop</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button className="px-8 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-blue-600 transition-all cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
                                            Update Preferences
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'appearance' && (
                            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                                    <p className="text-sm text-gray-500 mt-1">Customize how TaskNest looks</p>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Theme */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-4">Theme</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <button
                                                onClick={() => setTheme('light')}
                                                className={`p-4 border-2 rounded-xl text-center transition-all cursor-pointer ${theme === 'light' ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                            >
                                                <div className="w-full h-12 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                                                    <div className="w-6 h-6 bg-white rounded border border-gray-200"></div>
                                                </div>
                                                <span className={`text-sm font-medium ${theme === 'light' ? 'text-primary' : 'text-gray-900'}`}>Light</span>
                                                {theme === 'light' && <Check className="w-4 h-4 text-primary mx-auto mt-1" />}
                                            </button>

                                            <button
                                                onClick={() => setTheme('dark')}
                                                className={`p-4 border-2 rounded-xl text-center transition-all cursor-pointer ${theme === 'dark' ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                            >
                                                <div className="w-full h-12 bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                                                    <div className="w-6 h-6 bg-gray-700 rounded shadow-sm"></div>
                                                </div>
                                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-primary' : 'text-gray-900'}`}>Dark</span>
                                                {theme === 'dark' && <Check className="w-4 h-4 text-primary mx-auto mt-1" />}
                                            </button>

                                            <button
                                                onClick={() => setTheme('system')}
                                                className={`p-4 border-2 rounded-xl text-center transition-all cursor-pointer ${theme === 'system' ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                            >
                                                <div className="w-full h-12 bg-gradient-to-r from-gray-100 to-gray-800 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                                                    <div className="w-full h-full flex">
                                                        <div className="flex-1 bg-gray-100"></div>
                                                        <div className="flex-1 bg-gray-800"></div>
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-medium ${theme === 'system' ? 'text-primary' : 'text-gray-900'}`}>System</span>
                                                {theme === 'system' && <Check className="w-4 h-4 text-primary mx-auto mt-1" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Language */}
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Language</h3>
                                        <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all">
                                            <option value="en">English</option>
                                            <option value="af">Afrikaans</option>
                                            <option value="zu">isiZulu</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Subscription Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowCancelModal(false)}></div>

                    <div className="relative bg-surface rounded-[3rem] border border-border/50 shadow-2xl max-w-md w-full p-10 glass-panel animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 bg-red-500/10 rounded-[2rem] border border-red-500/30 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text-main tracking-tighter uppercase">Decommission Plan?</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-80">This sequence is irreversible</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6">
                            <p className="text-sm text-amber-800">
                                You'll still have access to {planDetails.name} features until{' '}
                                <strong>{formatDate(subscription.nextBillingDate)}</strong>.
                            </p>
                        </div>

                        <p className="text-gray-600 mb-6">
                            We're sad to see you go! If there's anything we can do to improve your experience,
                            please let us know.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Keep My Plan
                            </button>
                            <button
                                onClick={handleCancelSubscription}
                                disabled={cancelling}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
