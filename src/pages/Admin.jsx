import React, { useState, useEffect } from 'react';
import { Users, Shield, Activity, Search, Trash2, Edit, CheckCircle, XCircle, Loader2, AlertTriangle, Ticket, Plus, Power, Copy, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, setUserRole, toggleUserDisabled, deleteUser, computeAdminStats } from '../services/adminService';
import { getAllCoupons, createCoupon, deleteCoupon, toggleCoupon, generateCouponCode } from '../services/couponService';

export default function Admin() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');

    // Users state
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Coupons state
    const [coupons, setCoupons] = useState([]);
    const [couponsLoading, setCouponsLoading] = useState(false);
    const [showCreateCoupon, setShowCreateCoupon] = useState(false);
    const [couponForm, setCouponForm] = useState({
        code: '',
        plan: 'pro',
        durationDays: 30,
        maxUses: 1,
    });
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [copiedCode, setCopiedCode] = useState('');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard', { replace: true });
            return;
        }
        loadUsers();
    }, [isAdmin, navigate]);

    useEffect(() => {
        if (activeTab === 'coupons') {
            loadCoupons();
        }
    }, [activeTab]);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to load users:', err);
            setError('Failed to load users. Check Firestore permissions.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadCoupons = async () => {
        try {
            setCouponsLoading(true);
            const data = await getAllCoupons();
            setCoupons(data);
        } catch (err) {
            console.error('Failed to load coupons:', err);
            setCouponError('Failed to load coupons.');
        } finally {
            setCouponsLoading(false);
        }
    };

    // User actions
    const handleToggleRole = async (targetUser) => {
        if (targetUser.id === user?.id) return;
        const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
        setActionLoading(targetUser.id);
        try {
            await setUserRole(targetUser.id, newRole);
            setUsers(prev => prev.map(u =>
                u.id === targetUser.id ? { ...u, role: newRole } : u
            ));
        } catch (err) {
            console.error('Failed to update role:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleDisabled = async (targetUser) => {
        if (targetUser.id === user?.id) return;
        const newDisabled = targetUser.status === 'Active';
        setActionLoading(targetUser.id);
        try {
            await toggleUserDisabled(targetUser.id, newDisabled);
            setUsers(prev => prev.map(u =>
                u.id === targetUser.id
                    ? { ...u, status: newDisabled ? 'Disabled' : 'Active', disabled: newDisabled }
                    : u
            ));
        } catch (err) {
            console.error('Failed to toggle user status:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (targetUser) => {
        if (targetUser.id === user?.id) return;
        setActionLoading(targetUser.id);
        try {
            await deleteUser(targetUser.id);
            setUsers(prev => prev.filter(u => u.id !== targetUser.id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Failed to delete user:', err);
        } finally {
            setActionLoading(null);
        }
    };

    // Coupon actions
    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        setCouponError('');
        setCouponSuccess('');
        if (!couponForm.code.trim()) {
            setCouponError('Coupon code is required.');
            return;
        }
        try {
            setActionLoading('creating-coupon');
            await createCoupon(couponForm);
            setCouponSuccess(`Coupon "${couponForm.code.toUpperCase()}" created!`);
            setCouponForm({ code: '', plan: 'pro', durationDays: 30, maxUses: 1 });
            setShowCreateCoupon(false);
            loadCoupons();
        } catch (err) {
            setCouponError(err.message || 'Failed to create coupon.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteCoupon = async (code) => {
        try {
            setActionLoading(code);
            await deleteCoupon(code);
            setCoupons(prev => prev.filter(c => c.id !== code));
        } catch (err) {
            console.error('Failed to delete coupon:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleCoupon = async (code, currentActive) => {
        try {
            setActionLoading(code);
            await toggleCoupon(code, !currentActive);
            setCoupons(prev => prev.map(c =>
                c.id === code ? { ...c, active: !currentActive } : c
            ));
        } catch (err) {
            console.error('Failed to toggle coupon:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = computeAdminStats(users);
    const planBadge = (plan) => {
        const styles = {
            free: 'bg-slate-700/30 text-slate-400',
            pro: 'bg-primary/20 text-primary',
            business: 'bg-amber-500/20 text-amber-500',
        };
        return styles[plan] || styles.free;
    };

    if (!isAdmin) return null;

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-colors duration-500">
            <PageHeader
                title="Admin Panel"
                subtitle="System Administration & User Management"
            >
                <div className="hidden md:flex items-center bg-surface/50 border border-border/50 rounded-2xl px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder={activeTab === 'users' ? 'Search users...' : 'Search coupons...'}
                        className="bg-transparent border-none outline-none text-sm ml-3 w-full text-text-main placeholder-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-[1400px] mx-auto space-y-8">

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-surface/40 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Users</p>
                                <h3 className="text-2xl font-black text-text-main">{stats.total}</h3>
                            </div>
                        </div>
                        <div className="bg-surface/40 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Active</p>
                                <h3 className="text-2xl font-black text-text-main">{stats.active}</h3>
                            </div>
                        </div>
                        <div className="bg-surface/40 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Admins</p>
                                <h3 className="text-2xl font-black text-text-main">{stats.admins}</h3>
                            </div>
                        </div>
                        <div className="bg-surface/40 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Coupons</p>
                                <h3 className="text-2xl font-black text-text-main">{coupons.length}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'users'
                                ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                : 'bg-surface/40 text-slate-400 border border-border/40 hover:text-white hover:border-slate-600'
                                }`}
                        >
                            <Users className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('coupons')}
                            className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'coupons'
                                ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                : 'bg-surface/40 text-slate-400 border border-border/40 hover:text-white hover:border-slate-600'
                                }`}
                        >
                            <Ticket className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                            Coupons
                        </button>
                    </div>

                    {/* ─── USERS TAB ─── */}
                    {activeTab === 'users' && (
                        <div className="bg-surface/40 backdrop-blur-xl border border-border/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-border/40">
                                <h3 className="text-xl font-black text-text-main tracking-tight">User Directory</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-900/20 text-xs font-black text-slate-500 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-8 py-5">User</th>
                                            <th className="px-8 py-5">Role</th>
                                            <th className="px-8 py-5">Plan</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5">Last Active</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-900/10 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-xs">
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-text-main">{u.name}</p>
                                                            <p className="text-xs text-slate-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-slate-700/20 text-slate-400'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${planBadge(u.plan)}`}>
                                                        {u.plan}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`flex items-center gap-2 text-xs font-bold ${u.status === 'Active' ? 'text-green-500' : 'text-red-400'}`}>
                                                        {u.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                                                    {u.lastActive}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    {u.id === user?.id ? (
                                                        <span className="text-xs text-slate-600 font-bold">You</span>
                                                    ) : actionLoading === u.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-primary inline-block" />
                                                    ) : deleteConfirm === u.id ? (
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <span className="text-[10px] text-red-400 font-bold">Delete?</span>
                                                            <button
                                                                onClick={() => handleDeleteUser(u)}
                                                                className="px-3 py-1.5 bg-red-500/20 text-red-400 text-[10px] font-black rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer"
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="px-3 py-1.5 bg-slate-700/30 text-slate-400 text-[10px] font-black rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 justify-end">
                                                            <button
                                                                onClick={() => handleToggleRole(u)}
                                                                title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                                                className="p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleDisabled(u)}
                                                                title={u.status === 'Active' ? 'Disable User' : 'Enable User'}
                                                                className="p-2 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                                                            >
                                                                <Power className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(u.id)}
                                                                title="Delete User"
                                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-8 py-12 text-center text-slate-500 font-medium">
                                                    {searchQuery ? 'No users match your search.' : 'No users found.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ─── COUPONS TAB ─── */}
                    {activeTab === 'coupons' && (
                        <div className="space-y-6">
                            {couponSuccess && (
                                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm font-medium animate-in fade-in duration-300">
                                    <CheckCircle className="w-5 h-5 shrink-0" />
                                    {couponSuccess}
                                </div>
                            )}
                            {couponError && (
                                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    {couponError}
                                </div>
                            )}

                            {/* Create Coupon Button / Form */}
                            {!showCreateCoupon ? (
                                <button
                                    onClick={() => {
                                        setCouponForm(prev => ({ ...prev, code: generateCouponCode(prev.plan) }));
                                        setShowCreateCoupon(true);
                                    }}
                                    className="flex items-center gap-3 px-6 py-4 bg-primary/10 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-black text-sm hover:bg-primary/20 hover:border-primary/50 transition-all cursor-pointer w-full justify-center"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create New Coupon
                                </button>
                            ) : (
                                <form onSubmit={handleCreateCoupon} className="bg-surface/40 backdrop-blur-xl border border-border/40 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-top duration-300">
                                    <h3 className="text-lg font-black text-text-main tracking-tight">Create Coupon</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Coupon Code</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponForm.code}
                                                    onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value }))}
                                                    placeholder="e.g. PRO-ABC123"
                                                    className="flex-1 bg-slate-900/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-text-main font-mono font-bold focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setCouponForm(prev => ({ ...prev, code: generateCouponCode(prev.plan) }))}
                                                    className="px-4 py-3 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold hover:text-white transition-colors cursor-pointer"
                                                    title="Generate random code"
                                                >
                                                    🎲
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Grant Plan</label>
                                            <select
                                                value={couponForm.plan}
                                                onChange={(e) => setCouponForm(prev => ({ ...prev, plan: e.target.value }))}
                                                className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-text-main font-bold focus:ring-2 focus:ring-primary/30 outline-none transition-all cursor-pointer"
                                            >
                                                <option value="pro">Pro Plan</option>
                                                <option value="business">Business Plan</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Duration (days)</label>
                                            <select
                                                value={couponForm.durationDays}
                                                onChange={(e) => setCouponForm(prev => ({ ...prev, durationDays: Number(e.target.value) }))}
                                                className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-text-main font-bold focus:ring-2 focus:ring-primary/30 outline-none transition-all cursor-pointer"
                                            >
                                                <option value={7}>7 days</option>
                                                <option value={14}>14 days</option>
                                                <option value={30}>30 days</option>
                                                <option value={90}>90 days</option>
                                                <option value={180}>180 days</option>
                                                <option value={365}>365 days (1 year)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Max Uses</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="1000"
                                                value={couponForm.maxUses}
                                                onChange={(e) => setCouponForm(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                                                className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-text-main font-bold focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => { setShowCreateCoupon(false); setCouponError(''); }}
                                            className="px-6 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold text-sm hover:text-white transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={actionLoading === 'creating-coupon'}
                                            className="px-8 py-3 bg-primary text-white rounded-xl font-black text-sm hover:bg-blue-600 transition-colors shadow-xl shadow-primary/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {actionLoading === 'creating-coupon' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Plus className="w-4 h-4" />
                                            )}
                                            Create Coupon
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Coupons Table */}
                            <div className="bg-surface/40 backdrop-blur-xl border border-border/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                <div className="p-8 border-b border-border/40">
                                    <h3 className="text-xl font-black text-text-main tracking-tight">Coupon Codes</h3>
                                    <p className="text-sm text-slate-500 mt-1">Share codes with users so they can unlock plan access on the Pricing page.</p>
                                </div>
                                {couponsLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-900/20 text-xs font-black text-slate-500 uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-8 py-5">Code</th>
                                                    <th className="px-8 py-5">Plan</th>
                                                    <th className="px-8 py-5">Duration</th>
                                                    <th className="px-8 py-5">Uses</th>
                                                    <th className="px-8 py-5">Status</th>
                                                    <th className="px-8 py-5">Created</th>
                                                    <th className="px-8 py-5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {coupons.map(c => (
                                                    <tr key={c.id} className="hover:bg-slate-900/10 transition-colors">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <code className="bg-slate-900/60 px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-text-main tracking-wider">
                                                                    {c.code}
                                                                </code>
                                                                <button
                                                                    onClick={() => handleCopyCode(c.code)}
                                                                    className="p-1.5 text-slate-500 hover:text-primary transition-colors cursor-pointer"
                                                                    title="Copy code"
                                                                >
                                                                    {copiedCode === c.code ? (
                                                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                                    ) : (
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${planBadge(c.plan)}`}>
                                                                {c.plan}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5 text-sm text-slate-400 font-bold">
                                                            {c.durationDays}d
                                                        </td>
                                                        <td className="px-8 py-5 text-sm font-bold">
                                                            <span className={c.usedCount >= c.maxUses ? 'text-red-400' : 'text-slate-400'}>
                                                                {c.usedCount}/{c.maxUses}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className={`flex items-center gap-2 text-xs font-bold ${c.active ? 'text-green-500' : 'text-slate-600'}`}>
                                                                {c.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                                {c.active ? 'Active' : 'Disabled'}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                                                            {c.createdAt}
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            {actionLoading === c.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-primary inline-block" />
                                                            ) : (
                                                                <div className="flex items-center gap-1 justify-end">
                                                                    <button
                                                                        onClick={() => handleToggleCoupon(c.id, c.active)}
                                                                        title={c.active ? 'Disable coupon' : 'Enable coupon'}
                                                                        className="p-2 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                                                                    >
                                                                        <Power className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteCoupon(c.id)}
                                                                        title="Delete coupon"
                                                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {coupons.length === 0 && (
                                                    <tr>
                                                        <td colSpan="7" className="px-8 py-16 text-center">
                                                            <Ticket className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                                            <p className="text-slate-500 font-bold">No coupons yet</p>
                                                            <p className="text-slate-600 text-sm mt-1">Create your first coupon to grant plan access.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
