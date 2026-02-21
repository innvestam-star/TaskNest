// TaskNest Clients Page - Updated 2026-01-26
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Search, Users, Building2, User, Mail, Phone,
    MapPin, Edit2, Trash2, X, FileText, DollarSign, ArrowRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { getClients, createClient, updateClient, deleteClient, getClientStats } from '../services/billingService';
import { useSubscription } from '../context/SubscriptionContext';
import Paywall from '../components/Paywall';

export default function Clients() {
    const { subscription } = useSubscription();
    const plan = subscription?.plan || 'free';
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientStats, setClientStats] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        type: 'business',
        name: '',
        email: '',
        phone: '',
        address: '',
        taxNumber: '',
        paymentTerms: 30,
        currency: 'USD',
        notes: ''
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await getClients();
            setClients(data);
        } catch (error) {
            console.error('Failed to load clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({ ...client });
        } else {
            setEditingClient(null);
            setFormData({
                type: 'business',
                name: '',
                email: '',
                phone: '',
                address: '',
                taxNumber: '',
                paymentTerms: 30,
                currency: 'USD',
                notes: ''
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (editingClient) {
                await updateClient(editingClient.id, formData);
            } else {
                await createClient(formData);
            }
            loadClients();
            setShowModal(false);
        } catch (error) {
            console.error('Failed to save client:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                await deleteClient(id);
                loadClients();
                if (selectedClient?.id === id) {
                    setSelectedClient(null);
                    setClientStats(null);
                }
            } catch (error) {
                console.error('Failed to delete client:', error);
            }
        }
    };

    const handleSelectClient = async (client) => {
        setSelectedClient(client);
        try {
            const stats = await getClientStats(client.id);
            setClientStats(stats);
        } catch (error) {
            console.error('Failed to load client stats:', error);
        }
    };

    if (plan !== 'business') {
        return (
            <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center h-full">
                <Paywall
                    title="Client Management"
                    description="Manage your clients and track their billing history."
                    requiredPlan="business"
                />
            </div>
        );
    }

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-all duration-500">
            <PageHeader
                title="Client Directory"
                subtitle="Manage your business relationships"
            >
                <div className="flex items-center gap-4">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Find a client..."
                            className="bg-surface/50 border border-border/50 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:ring-4 focus:ring-primary/10 outline-none w-64 transition-all shadow-inner text-text-main placeholder:text-text-muted/50 font-medium"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl text-sm font-black transition-all shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 glow-blue"
                    >
                        <Plus className="w-4 h-4" />
                        Add Client
                    </button>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Client List */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-surface/50 rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden glass-panel">
                                {loading ? (
                                    <div className="p-20 text-center">
                                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                                    </div>
                                ) : filteredClients.length === 0 ? (
                                    <div className="p-24 text-center">
                                        <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
                                            <Users className="w-8 h-8 text-slate-600 opacity-20" />
                                        </div>
                                        <p className="text-slate-500 font-medium">Digital silence. No clients found.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/10">
                                        {filteredClients.map(client => (
                                            <div
                                                key={client.id}
                                                className={`p-6 flex items-center justify-between cursor-pointer transition-all ${selectedClient?.id === client.id ? 'bg-primary/5 shadow-inner' : 'hover:bg-slate-900/10'
                                                    }`}
                                                onClick={() => handleSelectClient(client)}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform ${selectedClient?.id === client.id ? 'scale-110 shadow-primary/20' : ''} ${client.type === 'business' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-green-500/10 border-green-500/20'
                                                        }`}>
                                                        {client.type === 'business' ? (
                                                            <Building2 className="w-6 h-6 text-blue-500" />
                                                        ) : (
                                                            <User className="w-6 h-6 text-green-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-text-main tracking-tight">{client.name}</h4>
                                                        <p className="text-xs font-bold text-text-muted mt-1 uppercase tracking-widest opacity-60">{client.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleOpenModal(client); }}
                                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}
                                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Client Detail Panel */}
                        <div className="lg:col-span-4">
                            <div className="bg-surface/50 rounded-[3rem] border border-border/50 shadow-2xl p-10 sticky top-0 glass-panel electric-card">
                                {selectedClient ? (
                                    <>
                                        <div className="flex flex-col items-center text-center mb-10">
                                            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 border shadow-2xl ${selectedClient.type === 'business' ? 'bg-blue-500/10 border-blue-500/20 shadow-blue-500/10' : 'bg-green-500/10 border-green-500/20 shadow-green-500/10'
                                                }`}>
                                                {selectedClient.type === 'business' ? (
                                                    <Building2 className="w-10 h-10 text-blue-500" />
                                                ) : (
                                                    <User className="w-10 h-10 text-green-500" />
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-black text-text-main tracking-tighter mb-2">{selectedClient.name}</h3>
                                            <span className="px-5 py-1.5 bg-background border border-border/50 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                                {selectedClient.type} entity
                                            </span>
                                        </div>

                                        <div className="space-y-6 mb-10 border-y border-border/10 py-8">
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/20 group-hover:border-primary/50 transition-colors">
                                                    <Mail className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                </div>
                                                <span className="text-sm font-bold text-text-main">{selectedClient.email}</span>
                                            </div>
                                            {selectedClient.phone && (
                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/20 group-hover:border-primary/50 transition-colors">
                                                        <Phone className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <span className="text-sm font-bold text-text-main">{selectedClient.phone}</span>
                                                </div>
                                            )}
                                            {selectedClient.address && (
                                                <div className="flex items-start gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/20 group-hover:border-primary/50 transition-colors flex-shrink-0">
                                                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <span className="text-sm font-bold text-text-main leading-relaxed">{selectedClient.address}</span>
                                                </div>
                                            )}
                                        </div>

                                        {clientStats && (
                                            <div className="grid grid-cols-2 gap-4 mb-10">
                                                <div className="bg-background/50 p-5 rounded-2xl border border-border/20">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Invoiced</p>
                                                    <p className="text-lg font-black text-text-main tracking-tighter">${clientStats.totalInvoiced.toLocaleString()}</p>
                                                </div>
                                                <div className="bg-green-500/5 p-5 rounded-2xl border border-green-500/10">
                                                    <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Paid</p>
                                                    <p className="text-lg font-black text-green-500 tracking-tighter">${clientStats.totalPaid.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-3">
                                            <Link
                                                to={`/invoices/new?type=invoice&clientId=${selectedClient.id}`}
                                                className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl text-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all glow-blue"
                                            >
                                                New Invoice
                                            </Link>
                                            <Link
                                                to={`/invoices/new?type=quote&clientId=${selectedClient.id}`}
                                                className="w-full py-4 bg-surface border border-border text-text-main text-xs font-black uppercase tracking-widest rounded-2xl text-center hover:bg-slate-900 transition-all active:scale-95"
                                            >
                                                Generate Quote
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-96 flex flex-col items-center justify-center text-center opacity-40">
                                        <Users className="w-16 h-16 text-slate-600 mb-6" />
                                        <p className="text-lg font-black text-text-main tracking-tight uppercase">Select a Client</p>
                                        <p className="text-xs font-bold text-text-muted mt-2">Dossiers will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                        <div className="bg-surface rounded-[3rem] w-full max-w-xl max-h-[90vh] overflow-hidden border border-border/50 shadow-2xl flex flex-col glass-panel shadow-primary/10">
                            <div className="p-10 border-b border-border/20 flex items-center justify-between bg-surface/80 backdrop-blur-md">
                                <div>
                                    <h3 className="text-2xl font-black text-text-main tracking-tighter">
                                        {editingClient ? 'Sync Client Data' : 'Establish New Client'}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Registry Update</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                                <div className="flex gap-4 p-1.5 bg-background/50 border border-border/20 rounded-2xl glass-panel">
                                    <button
                                        onClick={() => setFormData({ ...formData, type: 'business' })}
                                        className={`flex-1 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${formData.type === 'business'
                                            ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20'
                                            : 'text-slate-500 hover:text-text-main hover:bg-slate-900/10'
                                            }`}
                                    >
                                        <Building2 className="w-4 h-4" /> Company
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, type: 'individual' })}
                                        className={`flex-1 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${formData.type === 'individual'
                                            ? 'bg-green-500 text-white shadow-xl shadow-green-500/20'
                                            : 'text-slate-500 hover:text-text-main hover:bg-slate-900/10'
                                            }`}
                                    >
                                        <User className="w-4 h-4" /> Personal
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Identifier Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-text-main transition-all"
                                            placeholder={formData.type === 'business' ? 'Legal Entity Name' : 'Full Professional Name'}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Digital Correspondence</label>
                                        <input
                                            type="email"
                                            className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-text-main transition-all"
                                            placeholder="communications@entity.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Primary Telecom</label>
                                        <input
                                            type="tel"
                                            className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-text-main transition-all"
                                            placeholder="+0 000-000-0000"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Tax ID / VAT</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-text-main transition-all"
                                            placeholder="Taxation reference"
                                            value={formData.taxNumber}
                                            onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">HQ Address</label>
                                        <textarea
                                            className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-text-main transition-all resize-none shadow-inner"
                                            rows="3"
                                            placeholder="Physical location details"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 bg-slate-950/20 backdrop-blur-md border-t border-border/20 flex gap-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 text-text-main font-black uppercase tracking-widest text-[10px] border border-border/50 rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!formData.name || !formData.email}
                                    className="flex-[2] py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-600 transition-all shadow-2xl shadow-primary/30 disabled:opacity-20 disabled:cursor-not-allowed glow-blue active:scale-95"
                                >
                                    {editingClient ? 'Sync Changes' : 'Confirm Establishment'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
