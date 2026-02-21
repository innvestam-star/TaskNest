import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Send, Package, Search, X, Users, Building2, User, AlertCircle, Hash, Percent } from 'lucide-react';
import { createDocument, calculateSubtotal, calculateTaxTotal, getDocument, updateDocument, getProducts, getClients, getClient, getTaxes, getDocuments } from '../services/billingService';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import Paywall from '../components/Paywall';
import { formatCurrency, getCurrencySymbol, getCurrencyList, DEFAULT_CURRENCY, getDefaultTaxRate } from '../utils/currency';

export default function CreateDocument() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const defaultType = searchParams.get('type') || 'invoice';
    const { subscription } = useSubscription();
    const isEditMode = !!id;
    const { user } = useAuth();

    const getDefaultDate = (days = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };

    const [documentType, setDocumentType] = useState(defaultType);
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientContactPerson, setClientContactPerson] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [issueDate, setIssueDate] = useState(getDefaultDate(0));
    const [dueDate, setDueDate] = useState(isEditMode ? '' : getDefaultDate(documentType === 'quote' ? 7 : 14));
    const [items, setItems] = useState([
        { description: '', qty: 1, price: 0, taxRate: getDefaultTaxRate(DEFAULT_CURRENCY).rate }
    ]);
    const [notes, setNotes] = useState('');
    const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('fixed');
    const [loading, setLoading] = useState(isEditMode);
    const [products, setProducts] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [targetItemIndex, setTargetItemIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [clients, setClients] = useState([]);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [errors, setErrors] = useState({});
    const [docNumber, setDocNumber] = useState('');

    useEffect(() => {
        loadProducts();
        loadClients();
        loadTaxes();
        generateDocNumber();
        if (isEditMode) {
            loadDocument();
        } else {
            const clientId = searchParams.get('clientId');
            if (clientId) autoFillClient(clientId);
        }
    }, [id]);

    const loadClients = async () => {
        try {
            const data = await getClients();
            setClients(data);
        } catch (error) {
            console.error('Failed to load clients:', error);
        }
    };

    const loadTaxes = async () => {
        try {
            const data = await getTaxes();
            setTaxes(data);
        } catch (error) {
            console.error('Failed to load taxes:', error);
        }
    };

    const generateDocNumber = async () => {
        try {
            const docs = await getDocuments();
            const typePrefix = defaultType === 'invoice' ? 'INV' : 'QT';
            const year = new Date().getFullYear();
            const count = docs.filter(d => d.type === defaultType).length + 1;
            setDocNumber(`${typePrefix}-${year}-${count.toString().padStart(3, '0')}`);
        } catch { /* ignore */ }
    };

    const autoFillClient = async (clientId) => {
        try {
            const client = await getClient(clientId);
            if (client) {
                setClientName(client.name);
                setClientEmail(client.email);
                setClientPhone(client.phone || '');
                setClientContactPerson(client.contactPerson || '');
                setClientAddress(client.address || '');
                setSelectedClientId(client.id);
                if (client.currency) setCurrency(client.currency);
            }
        } catch (error) {
            console.error('Failed to auto-fill client:', error);
        }
    };

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const loadDocument = async () => {
        try {
            const doc = await getDocument(id);
            if (doc) {
                setDocumentType(doc.type || defaultType);
                setSelectedClientId(doc.clientId || null);
                setClientName(doc.clientName || '');
                setClientEmail(doc.clientEmail || '');
                setClientPhone(doc.clientPhone || '');
                setClientContactPerson(doc.clientContactPerson || '');
                setClientAddress(doc.clientAddress || '');
                setIssueDate(doc.date || getDefaultDate(0));
                setDueDate(doc.dueDate || doc.validUntil || '');
                setItems(doc.items?.length ? doc.items.map(i => ({ ...i, taxRate: i.taxRate || 0 })) : [{ description: '', qty: 1, price: 0, taxRate: 0 }]);
                setNotes(doc.notes || '');
                setCurrency(doc.currency || DEFAULT_CURRENCY);
                setDiscount(doc.discount || 0);
                setDiscountType(doc.discountType || 'fixed');
                setDocNumber(doc.number || '');
            }
        } catch (error) {
            console.error('Failed to load document:', error);
        } finally {
            setLoading(false);
        }
    };

    if (subscription?.plan !== 'business') {
        return (
            <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
                <Paywall title="Create Documents" description="Upgrade to Business to create professional invoices and quotes." requiredPlan="business" />
            </div>
        );
    }

    const handleAddItem = () => {
        const { rate } = getDefaultTaxRate(currency);
        setItems([...items, { description: '', qty: 1, price: 0, taxRate: rate }]);
    };

    const handleAddFromCatalog = (product) => {
        const newItem = {
            description: product.description ? `${product.name} - ${product.description}` : product.name,
            qty: 1,
            price: product.price,
            taxRate: product.taxRate || 0,
            productId: product.id,
            type: product.type
        };
        if (targetItemIndex !== null) {
            const newItems = [...items];
            newItems[targetItemIndex] = newItem;
            setItems(newItems);
            setTargetItemIndex(null);
        } else {
            if (items.length === 1 && !items[0].description && items[0].price === 0) {
                setItems([newItem]);
            } else {
                setItems([...items, newItem]);
            }
        }
        setIsProductModalOpen(false);
    };

    const openCatalogForIndex = (index) => {
        setTargetItemIndex(index);
        setIsProductModalOpen(true);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const validate = () => {
        const newErrors = {};
        if (!clientName.trim()) newErrors.clientName = 'Client name is required';
        if (!dueDate) newErrors.dueDate = documentType === 'quote' ? 'Valid until date is required' : 'Due date is required';
        const hasValidItem = items.some(i => i.description.trim() && i.price > 0);
        if (!hasValidItem) newErrors.items = 'At least one item with description and price is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (status = 'draft') => {
        if (!validate()) return;

        if (status === 'draft') setIsSaving(true);
        else setIsSending(true);

        try {
            const documentData = {
                type: documentType,
                clientId: selectedClientId,
                clientName,
                clientEmail,
                clientPhone,
                clientContactPerson,
                clientAddress,
                date: issueDate,
                dueDate,
                items,
                discount,
                discountType,
                currency,
                notes,
                status,
                businessInfo: {
                    name: user?.businessName || '',
                    logo: user?.businessLogo || '',
                    address: user?.businessAddress || '',
                    contactPerson: user?.contactPerson || '',
                    contactNumber: user?.contactNumber || '',
                    email: user?.businessEmail || user?.email || '',
                    banking: {
                        bankName: user?.bankName || '',
                        accountHolder: user?.accountHolder || '',
                        accountNumber: user?.accountNumber || '',
                        branchCode: user?.branchCode || ''
                    }
                }
            };

            if (isEditMode) {
                await updateDocument(id, documentData);
            } else {
                await createDocument(documentData);
            }
            navigate('/invoices');
        } catch (error) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} document:`, error);
        } finally {
            setIsSaving(false);
            setIsSending(false);
        }
    };

    const subtotal = useMemo(() => calculateSubtotal(items), [items]);
    const taxTotal = useMemo(() => calculateTaxTotal(items), [items]);
    const discountAmount = useMemo(() => {
        if (discountType === 'percentage') return subtotal * (discount / 100);
        return discount;
    }, [subtotal, discount, discountType]);
    const grandTotal = useMemo(() => Math.max(0, subtotal + taxTotal - discountAmount), [subtotal, taxTotal, discountAmount]);

    const sym = getCurrencySymbol(currency);
    const fmt = (amount) => formatCurrency(amount, currency);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-background transition-colors duration-300">
            <div className="p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/invoices')} className="text-gray-500 hover:text-gray-700 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{isEditMode ? 'Edit' : 'New'} {documentType}</h1>
                            {docNumber && (
                                <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                                    <Hash className="w-3.5 h-3.5" />
                                    <span className="font-mono font-bold">{docNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {!isEditMode && (
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                            {['invoice', 'quote'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => {
                                        setDocumentType(t);
                                        setDueDate(getDefaultDate(t === 'quote' ? 7 : 14));
                                    }}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${documentType === t ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                    <div className="p-8 space-y-10">

                        {/* Client & Document Details */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Client & Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Client Name */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Client Name *</label>
                                    <div className="relative group/input">
                                        <input
                                            type="text"
                                            className={`w-full px-4 py-3.5 pr-10 bg-[#F8FAFC] dark:bg-slate-900/50 border rounded-xl text-sm font-medium focus:ring-4 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 ${errors.clientName ? 'border-red-400 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 dark:border-slate-800 focus:border-blue-400 focus:ring-blue-50'}`}
                                            placeholder="Company or Individual Name"
                                            value={clientName}
                                            onChange={e => { setClientName(e.target.value); if (errors.clientName) setErrors(prev => ({ ...prev, clientName: undefined })); }}
                                        />
                                        <button
                                            onClick={() => setIsClientModalOpen(true)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 opacity-0 group-hover/input:opacity-100"
                                            title="Select from Clients"
                                        >
                                            <Users className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {errors.clientName && <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.clientName}</p>}
                                </div>
                                {/* Client Email */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Client Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3.5 bg-[#F8FAFC] dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                        placeholder="client@example.com"
                                        value={clientEmail}
                                        onChange={e => setClientEmail(e.target.value)}
                                    />
                                </div>
                                {/* Contact Person */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Contact Person</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3.5 bg-[#F8FAFC] dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                        placeholder="e.g. Jane Smith"
                                        value={clientContactPerson}
                                        onChange={e => setClientContactPerson(e.target.value)}
                                    />
                                </div>
                                {/* Client Phone */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3.5 bg-[#F8FAFC] dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                        placeholder="e.g. +27 82 000 0000"
                                        value={clientPhone}
                                        onChange={e => setClientPhone(e.target.value)}
                                    />
                                </div>
                                {/* Client Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Billing Address</label>
                                    <textarea
                                        className="w-full px-4 py-3.5 bg-[#F8FAFC] dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 resize-none"
                                        rows="2"
                                        placeholder="e.g. 123 Main Street, Cape Town, 8001"
                                        value={clientAddress}
                                        onChange={e => setClientAddress(e.target.value)}
                                    />
                                </div>
                                {/* Issue Date */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Issue Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3.5 bg-[#F8FAFC] dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white"
                                        value={issueDate}
                                        onChange={e => setIssueDate(e.target.value)}
                                    />
                                </div>
                                {/* Due Date / Valid Until */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                        {documentType === 'quote' ? 'Valid Until *' : 'Due Date *'}
                                    </label>
                                    <input
                                        type="date"
                                        className={`w-full px-4 py-3.5 bg-[#F8FAFC] dark:bg-slate-900/50 border rounded-xl text-sm font-medium focus:ring-4 outline-none transition-all text-slate-900 dark:text-white ${errors.dueDate ? 'border-red-400 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'}`}
                                        value={dueDate}
                                        onChange={e => { setDueDate(e.target.value); if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: undefined })); }}
                                    />
                                    {errors.dueDate && <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dueDate}</p>}
                                </div>
                                {/* Currency */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Currency</label>
                                    <select
                                        className="w-full px-4 py-3.5 bg-[#F8FAFC] dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white"
                                        value={currency}
                                        onChange={e => {
                                            const newCurrency = e.target.value;
                                            setCurrency(newCurrency);
                                            const { rate } = getDefaultTaxRate(newCurrency);
                                            setItems(prev => prev.map(item => ({ ...item, taxRate: rate })));
                                        }}
                                    >
                                        {getCurrencyList().map((c, i) =>
                                            c.divider
                                                ? <option key={`div-${i}`} disabled>──────────</option>
                                                : <option key={c.code} value={c.code}>{c.symbol} — {c.name} ({c.code})</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Line Items</h3>
                                <button
                                    onClick={() => { setTargetItemIndex(null); setIsProductModalOpen(true); }}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-all border border-primary/20"
                                >
                                    <Package className="w-4 h-4" /> From Catalog
                                </button>
                            </div>
                            {errors.items && <p className="text-xs text-red-500 mb-3 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.items}</p>}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-4 py-4 w-[36%]">Description</th>
                                            <th className="px-3 py-4 w-16 text-center">Qty</th>
                                            <th className="px-3 py-4 w-28 text-right">Price</th>
                                            <th className="px-3 py-4 w-28">Tax</th>
                                            <th className="px-4 py-4 w-28 text-right">Total</th>
                                            <th className="px-2 py-4 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950/20">
                                        {items.map((item, index) => {
                                            const lineTotal = item.qty * item.price;
                                            const lineTax = lineTotal * (item.taxRate || 0) / 100;
                                            return (
                                                <tr key={index} className="group hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                                    <td className="px-3 py-3">
                                                        <div className="relative group/input">
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2.5 pr-9 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                                                placeholder="Item description"
                                                                value={item.description}
                                                                onChange={e => { updateItem(index, 'description', e.target.value); if (errors.items) setErrors(prev => ({ ...prev, items: undefined })); }}
                                                            />
                                                            <button
                                                                onClick={() => openCatalogForIndex(index)}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary transition-colors rounded-md opacity-0 group-hover/input:opacity-100"
                                                                title="Select from Catalog"
                                                            >
                                                                <Package className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="w-full px-2 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white"
                                                            value={item.qty}
                                                            onChange={e => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{sym}</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="w-full pl-8 pr-2 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-right text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white"
                                                                value={item.price}
                                                                onChange={e => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <select
                                                            className="w-full px-2 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-700 dark:text-slate-300"
                                                            value={item.taxRate}
                                                            onChange={e => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                                                        >
                                                            {taxes.map(t => (
                                                                <option key={t.id} value={t.rate}>{t.name}</option>
                                                            ))}
                                                            {taxes.length === 0 && <option value={0}>No Tax</option>}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{fmt(lineTotal + lineTax)}</div>
                                                        {lineTax > 0 && <div className="text-[10px] text-slate-400">incl. {fmt(lineTax)} tax</div>}
                                                    </td>
                                                    <td className="px-2 py-3 text-center">
                                                        {items.length > 1 && (
                                                            <button
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <td colSpan="6" className="p-4">
                                                <button
                                                    onClick={handleAddItem}
                                                    className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
                                                >
                                                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> Add Line Item
                                                </button>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="flex justify-end">
                            <div className="w-full max-w-sm bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-6 space-y-4">
                                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                    <span className="text-sm font-medium">Subtotal</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{fmt(subtotal)}</span>
                                </div>
                                {taxTotal > 0 && (
                                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                        <span className="text-sm font-medium">Tax</span>
                                        <span className="font-bold text-slate-900 dark:text-white">+{fmt(taxTotal)}</span>
                                    </div>
                                )}
                                {/* Discount */}
                                <div className="flex justify-between items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Discount</span>
                                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                                            <button
                                                onClick={() => setDiscountType('fixed')}
                                                className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${discountType === 'fixed' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
                                            >
                                                {sym}
                                            </button>
                                            <button
                                                onClick={() => setDiscountType('percentage')}
                                                className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${discountType === 'percentage' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
                                            >
                                                <Percent className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative w-28">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right text-sm font-bold focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white"
                                            value={discount}
                                            onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-red-500">
                                        <span className="text-sm font-medium">Discount applied</span>
                                        <span className="font-bold">-{fmt(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-lg font-black text-slate-900 dark:text-white">Total</span>
                                    <span className="text-2xl font-black text-primary">{fmt(grandTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">Additional Notes</label>
                            <textarea
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 resize-none shadow-inner"
                                rows="3"
                                placeholder="Thank you for your business! Payment details: ..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center transition-colors">
                        <button
                            onClick={() => navigate('/invoices')}
                            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleSave('draft')}
                                disabled={isSaving || isSending}
                                className={`px-5 py-2.5 border font-medium rounded-xl transition-all flex items-center gap-2 ${isSaving
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {isSaving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isSaving ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button
                                onClick={() => handleSave('sent')}
                                disabled={isSaving || isSending}
                                className={`px-5 py-2.5 font-medium rounded-xl transition-all shadow-lg flex items-center gap-2 ${isSending
                                    ? 'bg-blue-400 text-white cursor-not-allowed opacity-70'
                                    : 'bg-primary text-white hover:bg-blue-600 shadow-blue-500/20'
                                    }`}
                            >
                                {isSending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                {isSending ? 'Sending...' : (isEditMode ? 'Update & Send' : `Send ${documentType === 'invoice' ? 'Invoice' : 'Quote'}`)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Selection Modal */}
            {isClientModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-950 rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Select Client</h2>
                            </div>
                            <button onClick={() => setIsClientModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search clients..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                    value={clientSearchTerm}
                                    onChange={e => setClientSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50 dark:bg-slate-900/20 custom-scrollbar">
                            {clients
                                .filter(c =>
                                    (c.name || '').toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                                    (c.email || '').toLowerCase().includes(clientSearchTerm.toLowerCase())
                                )
                                .map(client => (
                                    <button
                                        key={client.id}
                                        onClick={() => {
                                            setClientName(client.name);
                                            setClientEmail(client.email);
                                            setClientPhone(client.phone || '');
                                            setClientContactPerson(client.contactPerson || '');
                                            setClientAddress(client.address || '');
                                            setSelectedClientId(client.id);
                                            if (client.currency) setCurrency(client.currency);
                                            setIsClientModalOpen(false);
                                            if (errors.clientName) setErrors(prev => ({ ...prev, clientName: undefined }));
                                        }}
                                        className="w-full text-left p-4 rounded-2xl border border-white dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-primary hover:bg-primary/5 transition-all group shadow-sm flex items-center gap-4"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${client.type === 'business' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                            {client.type === 'business' ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">{client.name}</h3>
                                            <p className="text-sm text-slate-500 truncate">{client.email}</p>
                                        </div>
                                    </button>
                                ))}
                            {clients.length === 0 && (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">No clients found</p>
                                    <Link to="/clients" className="text-sm text-primary hover:underline mt-2 inline-block font-bold">Add your first client</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Selection Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-950 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Select from Catalog</h2>
                            <button onClick={() => setIsProductModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <select
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-primary outline-none transition-all"
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                            >
                                <option value="all">All Items</option>
                                <option value="service">Services</option>
                                <option value="product">Products</option>
                            </select>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50 dark:bg-slate-900/20 custom-scrollbar">
                            {products
                                .filter(p => {
                                    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesType = filterType === 'all' || p.type === filterType;
                                    return matchesSearch && matchesType;
                                })
                                .map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleAddFromCatalog(product)}
                                        className="w-full text-left p-4 rounded-2xl border border-white dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-primary hover:bg-primary/5 transition-all group shadow-sm"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">{product.name}</h3>
                                                {product.description && <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{product.description}</p>}
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${product.type === 'service' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                        {product.type}
                                                    </span>
                                                    {product.taxRate > 0 && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-100 text-amber-600">{product.taxRate}% tax</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="text-lg font-black text-slate-900 dark:text-white">{fmt(product.price)}</div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold">{product.pricingType}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            {products.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No products found. Add some in the Products section.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
