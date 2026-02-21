import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Edit2, Trash2, X, Save, DollarSign, ArrowRight, Zap, Box } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/billingService';
import { useSubscription } from '../context/SubscriptionContext';
import Paywall from '../components/Paywall';
import PageHeader from '../components/PageHeader';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const { checkFeatureAccess } = useSubscription();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'service',
        pricingType: 'hourly',
        price: 0,
        cost: 0,
        taxRate: 0,
        active: true
    });

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        let filtered = products;

        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterType !== 'all') {
            filtered = filtered.filter(product => product.type === filterType);
        }

        setFilteredProducts(filtered);
    }, [searchTerm, filterType, products]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
        setLoading(false);
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                type: 'service',
                pricingType: 'hourly',
                price: 0,
                cost: 0,
                taxRate: 0,
                active: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                cost: parseFloat(formData.cost),
                taxRate: parseFloat(formData.taxRate)
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, data);
            } else {
                await createProduct(data);
            }
            await loadProducts();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this product/service?')) return;
        try {
            await deleteProduct(productId);
            await loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const calculateMargin = (price, cost) => {
        if (price === 0) return 0;
        return ((price - cost) / price * 100).toFixed(1);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-all duration-500">
            <PageHeader
                title="Service Catalog"
                subtitle="Manage your products and specialized services"
            >
                <div className="flex items-center gap-4">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Find an item..."
                            className="bg-surface/50 border border-border/50 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:ring-4 focus:ring-primary/10 outline-none w-64 transition-all shadow-inner text-text-main placeholder:text-text-muted/50 font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl text-sm font-black transition-all shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 glow-blue"
                    >
                        <Plus className="w-4 h-4" />
                        New Item
                    </button>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Filters Hub */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 p-1.5 bg-surface/50 border border-border/50 rounded-2xl glass-panel shadow-inner">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'service', label: 'Services' },
                                { id: 'product', label: 'Products' }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setFilterType(t.id)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === t.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-text-main hover:bg-slate-900/10'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Items: {filteredProducts.length}</p>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 space-y-4">
                            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Syncing Catalog...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="bg-surface/50 rounded-[3rem] border border-border/50 p-24 text-center glass-panel">
                            <Box className="w-16 h-16 text-slate-600 opacity-20 mx-auto mb-6" />
                            <p className="text-lg font-black text-text-main tracking-tight uppercase">No assets found</p>
                            <p className="text-xs font-bold text-text-muted mt-2">Initialize your catalog by adding a new product or service.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className="bg-surface/50 rounded-[2.5rem] border border-border/50 p-10 hover:shadow-2xl hover:shadow-primary/5 transition-all group glass-panel electric-card relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform"></div>

                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110 ${product.type === 'service' ? 'bg-blue-500/10 border-blue-500/20 shadow-blue-500/10' : 'bg-green-500/10 border-green-500/20 shadow-green-500/10'
                                            }`}>
                                            {product.type === 'service' ? (
                                                <Zap className="w-8 h-8 text-blue-500" />
                                            ) : (
                                                <Box className="w-8 h-8 text-green-500" />
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative z-10 mb-8">
                                        <h3 className="text-2xl font-black text-text-main tracking-tighter mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                                        <p className="text-xs font-bold text-text-muted line-clamp-2 leading-relaxed h-10">{product.description}</p>
                                    </div>

                                    <div className="space-y-5 relative z-10">
                                        <div className="flex items-center justify-between border-b border-border/10 pb-5 mb-5 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Price Unit</span>
                                                <span className="text-sm font-bold text-text-main uppercase tracking-tighter">{product.pricingType.replace('_', ' ')}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-3xl font-black text-text-main tracking-tighter">
                                                    {formatCurrency(product.price)}
                                                    {product.pricingType === 'hourly' && <span className="text-xs font-black text-slate-400 ml-1">/HR</span>}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${product.active ? 'bg-green-500 glow-green' : 'bg-slate-500'}`}></div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{product.active ? 'Available' : 'Retired'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-background/50 border border-border/20 rounded-xl">
                                                <span className="text-[10px] font-black text-text-main uppercase tracking-widest">{product.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-surface rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden border border-border/50 shadow-2xl flex flex-col glass-panel shadow-primary/10">
                        <div className="p-10 border-b border-border/20 flex items-center justify-between bg-surface/80 backdrop-blur-md">
                            <div>
                                <h3 className="text-2xl font-black text-text-main tracking-tighter">
                                    {editingProduct ? 'Configuration Unit' : 'Initialize Asset'}
                                </h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Catalog Management</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-3 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 pl-1">Classification</label>
                                <div className="flex gap-4 p-1.5 bg-background/50 border border-border/20 rounded-2xl glass-panel">
                                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${formData.type === 'service' ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20 scale-[1.02]' : 'text-slate-500 hover:bg-slate-900/10'}`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="service"
                                            checked={formData.type === 'service'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="hidden"
                                        />
                                        <Zap className="w-5 h-5 transition-transform" />
                                        <span className="font-black uppercase tracking-widest text-[10px]">Service Provider</span>
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${formData.type === 'product' ? 'bg-green-500 text-white shadow-xl shadow-green-500/20 scale-[1.02]' : 'text-slate-500 hover:bg-slate-900/10'}`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="product"
                                            checked={formData.type === 'product'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="hidden"
                                        />
                                        <Box className="w-5 h-5 transition-transform" />
                                        <span className="font-black uppercase tracking-widest text-[10px]">Physical Asset</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Designation *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-text-main transition-all"
                                        placeholder="Item nomenclature"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Briefing</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-text-main transition-all resize-none shadow-inner"
                                        placeholder="Operational details and use cases"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Financial Structure</label>
                                    <select
                                        value={formData.pricingType}
                                        onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                                        className="w-full px-5 py-4 bg-background/50 border border-border/20 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-text-main transition-all cursor-pointer"
                                    >
                                        <option value="hourly">Temporal (Hourly)</option>
                                        <option value="fixed">Standard (Fixed)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Market Value *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-5 h-5 font-black" />
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full pl-14 pr-5 py-4 bg-background/50 border border-border/20 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-black text-text-main transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-10 bg-slate-950/20 backdrop-blur-md border-t border-border/20 flex gap-4">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="flex-1 py-4 text-text-main font-black uppercase tracking-widest text-[10px] border border-border/50 rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-[2] py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-600 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 glow-blue active:scale-95"
                            >
                                <Save className="w-4 h-4" />
                                Sync Asset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
