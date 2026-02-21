import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Trash2, Save, Eye, Link, Lock, Settings, ChevronRight, Zap } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Paywall from '../components/Paywall';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { getBookingConfig, saveBookingConfig, generateSlug } from '../services/bookingService';

export default function BookingSetup() {
    const { subscription, isBusiness, isPro } = useSubscription();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Allow access for business plan users
    const hasAccess = isBusiness;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    // Config state
    const [config, setConfig] = useState({
        businessName: '',
        description: '',
        slug: '',
        bufferTime: 15,
        leadTime: 24,
        maxAdvanceDays: 30,
        workingHours: {
            monday: { enabled: true, start: '09:00', end: '17:00' },
            tuesday: { enabled: true, start: '09:00', end: '17:00' },
            wednesday: { enabled: true, start: '09:00', end: '17:00' },
            thursday: { enabled: true, start: '09:00', end: '17:00' },
            friday: { enabled: true, start: '09:00', end: '17:00' },
            saturday: { enabled: false, start: '10:00', end: '14:00' },
            sunday: { enabled: false, start: '10:00', end: '14:00' },
        },
        services: [],
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const savedConfig = await getBookingConfig(user?.id || 'demo');
            setConfig(prev => ({ ...prev, ...savedConfig }));
        } catch (error) {
            console.error('Error loading config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveBookingConfig(user?.id || 'demo', config);
        } catch (error) {
            console.error('Error saving config:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const updateWorkingHours = (day, field, value) => {
        setConfig(prev => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: {
                    ...prev.workingHours[day],
                    [field]: value,
                },
            },
        }));
    };

    const addService = () => {
        const newService = {
            id: `service_${Date.now()}`,
            name: 'New Service',
            duration: 30,
            description: '',
            price: 0,
            color: '#3B82F6',
        };
        setConfig(prev => ({
            ...prev,
            services: [...(prev.services || []), newService],
        }));
    };

    const updateService = (serviceId, field, value) => {
        setConfig(prev => ({
            ...prev,
            services: prev.services.map(s =>
                s.id === serviceId ? { ...s, [field]: value } : s
            ),
        }));
    };

    const removeService = (serviceId) => {
        setConfig(prev => ({
            ...prev,
            services: prev.services.filter(s => s.id !== serviceId),
        }));
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    if (!hasAccess) {
        return (
            <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center h-full">
                <Paywall
                    title="Client Booking Page"
                    description="Professional appointment scheduling with custom public pages."
                    requiredPlan="business"
                />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full bg-background space-y-4">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Establishing booking link...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-all duration-500">
            <PageHeader
                title="Booking Protocol"
                subtitle="Configure your global availability and service offerings"
            >
                <div className="flex gap-4">
                    <a
                        href={`/book/${config.slug || 'preview'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-2.5 bg-surface/50 border border-border/50 text-text-main rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-black/5 active:scale-95 glass-panel"
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </a>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl text-sm font-black transition-all shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 glow-blue disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Establishing...' : 'Sync Config'}
                    </button>
                </div>
            </PageHeader>

            {/* Navigation Tabs */}
            <div className="px-12 py-6 border-b border-border/20 bg-background/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-2 p-1.5 bg-surface/50 border border-border/50 rounded-2xl glass-panel shadow-inner">
                    {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'services', label: 'Services', icon: Zap },
                        { id: 'availability', label: 'Availability', icon: Clock },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                                : 'text-slate-500 hover:text-text-main hover:bg-slate-900/10'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-12 pb-24">

                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="space-y-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
                            <div className="bg-surface/50 rounded-[3rem] border border-border/50 p-12 glass-panel shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl transition-opacity group-hover:opacity-100 opacity-50"></div>
                                <h2 className="text-2xl font-black text-text-main tracking-tighter mb-10 border-b border-border/10 pb-6 uppercase">Core Identity</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Professional Naming</label>
                                        <input
                                            type="text"
                                            value={config.businessName}
                                            onChange={(e) => {
                                                setConfig(prev => ({
                                                    ...prev,
                                                    businessName: e.target.value,
                                                    slug: generateSlug(e.target.value),
                                                }));
                                            }}
                                            className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-text-main transition-all shadow-inner"
                                            placeholder="Legal entity / Trading name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Digital Slug / URL</label>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 flex items-center bg-background/50 border border-border/20 rounded-2xl overflow-hidden shadow-inner px-5 py-4">
                                                <span className="text-slate-500 text-xs font-bold whitespace-nowrap opacity-60">tasknest.app/book/</span>
                                                <input
                                                    type="text"
                                                    value={config.slug}
                                                    onChange={(e) => setConfig(prev => ({ ...prev, slug: e.target.value }))}
                                                    className="flex-1 bg-transparent border-none outline-none text-sm font-black text-text-main ml-1 uppercase"
                                                    placeholder="identifier"
                                                />
                                            </div>
                                            <button className="p-4 bg-surface border border-border/50 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 rounded-2xl transition-all shadow-sm active:scale-90">
                                                <Link className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Executive Summary</label>
                                        <textarea
                                            value={config.description}
                                            onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                                            rows="4"
                                            className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-text-main transition-all resize-none shadow-inner leading-relaxed"
                                            placeholder="Briefly state your professional objective and service scope..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface/50 rounded-[3rem] border border-border/50 p-12 glass-panel shadow-2xl">
                                <h2 className="text-2xl font-black text-text-main tracking-tighter mb-10 border-b border-border/10 pb-6 uppercase">Operating Constraints</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Buffer Period</label>
                                        </div>
                                        <select
                                            value={config.bufferTime}
                                            onChange={(e) => setConfig(prev => ({ ...prev, bufferTime: parseInt(e.target.value) }))}
                                            className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl text-xs font-black text-text-main focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner uppercase cursor-pointer"
                                        >
                                            <option value="0">Off-Grid</option>
                                            <option value="5">5 Min Gap</option>
                                            <option value="10">10 Min Gap</option>
                                            <option value="15">15 Min Gap</option>
                                            <option value="30">30 Min Gap</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                                <Zap className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notice Lead</label>
                                        </div>
                                        <select
                                            value={config.leadTime}
                                            onChange={(e) => setConfig(prev => ({ ...prev, leadTime: parseInt(e.target.value) }))}
                                            className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl text-xs font-black text-text-main focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner uppercase cursor-pointer"
                                        >
                                            <option value="1">1H Response</option>
                                            <option value="2">2H Response</option>
                                            <option value="4">4H Response</option>
                                            <option value="24">24H Logic</option>
                                            <option value="48">48H Sequence</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                                <Calendar className="w-4 h-4 text-purple-500" />
                                            </div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Radar Range</label>
                                        </div>
                                        <select
                                            value={config.maxAdvanceDays}
                                            onChange={(e) => setConfig(prev => ({ ...prev, maxAdvanceDays: parseInt(e.target.value) }))}
                                            className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl text-xs font-black text-text-main focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner uppercase cursor-pointer"
                                        >
                                            <option value="7">7 Day Radar</option>
                                            <option value="14">14 Day Radar</option>
                                            <option value="30">30 Day Sync</option>
                                            <option value="60">60 Day Sync</option>
                                            <option value="90">90 Day Wide</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Services Tab */}
                    {activeTab === 'services' && (
                        <div className="space-y-10 animate-in fade-in duration-500 slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-text-main tracking-tighter uppercase">Service Registry</h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Available meeting protocols</p>
                                </div>
                                <button
                                    onClick={addService}
                                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 glow-blue"
                                >
                                    <Plus className="w-4 h-4" />
                                    Initialize Service
                                </button>
                            </div>

                            {(config.services || []).map(service => (
                                <div key={service.id} className="group bg-surface/50 rounded-[3rem] border border-border/50 p-10 glass-panel shadow-2xl hover:border-primary/30 transition-all relative overflow-hidden electric-card">
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-2.5 transition-all opacity-40 group-hover:opacity-100 shadow-[0_0_20px_0_rgba(0,0,0,0.3)]"
                                        style={{ backgroundColor: service.color, boxShadow: `0 0 30px 0 ${service.color}44` }}
                                    />
                                    <div className="space-y-8">
                                        <div className="flex items-start gap-8">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={service.name}
                                                    onChange={(e) => updateService(service.id, 'name', e.target.value)}
                                                    className="w-full text-3xl font-black bg-transparent border-none outline-none text-text-main placeholder-slate-800 tracking-tighter uppercase"
                                                    placeholder="Protocol Designation"
                                                />
                                                <div className="h-px bg-border/20 mt-4 group-focus-within:bg-primary/50 transition-colors" />
                                            </div>
                                            <button
                                                onClick={() => removeService(service.id)}
                                                className="p-4 text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all active:scale-90"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <textarea
                                            value={service.description}
                                            onChange={(e) => updateService(service.id, 'description', e.target.value)}
                                            rows="2"
                                            className="w-full px-6 py-5 bg-background/50 border border-border/20 rounded-2xl text-sm font-bold text-text-main focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none shadow-inner leading-relaxed"
                                            placeholder="Define technical objectives and deliverables for this session type..."
                                        />

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-4 border-t border-border/10">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Sync Duration</span>
                                                <div className="relative">
                                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                    <select
                                                        value={service.duration}
                                                        onChange={(e) => updateService(service.id, 'duration', parseInt(e.target.value))}
                                                        className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border/20 rounded-xl text-xs font-black text-text-main appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                                                    >
                                                        <option value="15">15 Min Sync</option>
                                                        <option value="30">30 Min Sync</option>
                                                        <option value="45">45 Min Sync</option>
                                                        <option value="60">1 Hour Sync</option>
                                                        <option value="90">90 Min Wide</option>
                                                        <option value="120">2 Hour Wide</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Protocol Color</span>
                                                <div className="flex items-center gap-3 bg-background/50 border border-border/20 px-4 py-2.5 rounded-xl shadow-inner group/color">
                                                    <div className="relative w-6 h-6 shrink-0">
                                                        <input
                                                            type="color"
                                                            value={service.color}
                                                            onChange={(e) => updateService(service.id, 'color', e.target.value)}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                        <div
                                                            className="w-full h-full rounded-lg shadow-2xl border border-white/10 group-hover/color:scale-110 transition-transform"
                                                            style={{ backgroundColor: service.color }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black text-text-main uppercase tracking-tight">{service.color}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!config.services || config.services.length === 0) && (
                                <div className="bg-surface/30 border-2 border-dashed border-border/40 rounded-[3rem] p-24 text-center glass-panel shadow-inner">
                                    <div className="w-24 h-24 bg-surface rounded-3xl shadow-2xl border border-border/50 flex items-center justify-center mx-auto mb-10 transform -rotate-6 group hover:rotate-0 transition-transform">
                                        <Zap className="w-12 h-12 text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h3 className="text-xl font-black text-text-main uppercase tracking-tighter mb-4">Initialize Catalog</h3>
                                    <p className="text-slate-500 font-bold mb-10 max-w-sm mx-auto leading-relaxed">Establish meeting protocols such as 'Executive Brief' or 'Strategic Workshop' to enable client syncs.</p>
                                    <button
                                        onClick={addService}
                                        className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 glow-blue"
                                    >
                                        <Plus className="w-5 h-5 flex-shrink-0" />
                                        Deploy First Service
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Availability Tab */}
                    {activeTab === 'availability' && (
                        <div className="bg-surface/50 rounded-[3rem] border border-border/50 p-12 glass-panel shadow-2xl animate-in fade-in duration-500 slide-in-from-bottom-4">
                            <h2 className="text-2xl font-black text-text-main tracking-tighter mb-12 border-b border-border/10 pb-6 uppercase">Syncing Hours</h2>

                            <div className="space-y-6">
                                {days.map(day => (
                                    <div key={day} className={`flex flex-col sm:flex-row sm:items-center gap-8 p-6 rounded-[2rem] border transition-all ${config.workingHours[day]?.enabled
                                        ? 'bg-background/40 border-primary/20 shadow-2xl'
                                        : 'bg-slate-900/10 border-transparent opacity-40 grayscale group hover:grayscale-0 transition-all'
                                        }`}>
                                        <label className="flex items-center gap-6 w-48 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={config.workingHours[day]?.enabled}
                                                    onChange={(e) => updateWorkingHours(day, 'enabled', e.target.checked)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-12 h-6 rounded-full transition-all duration-300 ${config.workingHours[day]?.enabled ? 'bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}></div>
                                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${config.workingHours[day]?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                            <span className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${config.workingHours[day]?.enabled ? 'text-text-main' : 'text-slate-600'}`}>
                                                {day}
                                            </span>
                                        </label>

                                        {config.workingHours[day]?.enabled ? (
                                            <div className="flex items-center gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Commence</span>
                                                    <input
                                                        type="time"
                                                        value={config.workingHours[day]?.start || '09:00'}
                                                        onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                                                        className="px-6 py-3 bg-background/80 border border-border/20 rounded-xl text-sm font-black text-text-main focus:border-primary outline-none transition-all shadow-inner uppercase"
                                                    />
                                                </div>
                                                <div className="pt-6">
                                                    <div className="w-4 h-px bg-border/40" />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Terminate</span>
                                                    <input
                                                        type="time"
                                                        value={config.workingHours[day]?.end || '17:00'}
                                                        onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                                                        className="px-6 py-3 bg-background/80 border border-border/20 rounded-xl text-sm font-black text-text-main focus:border-primary outline-none transition-all shadow-inner uppercase"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Lock className="w-4 h-4 opacity-40 text-red-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Temporal Lock / Unavailable</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
