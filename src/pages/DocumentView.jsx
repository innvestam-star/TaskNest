import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Send, CheckCircle, XCircle, Edit, Phone, User, Mail } from 'lucide-react';
import { getDocument, updateDocumentStatus } from '../services/billingService';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import Paywall from '../components/Paywall';
import { formatCurrency } from '../utils/currency';

export default function DocumentView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { subscription } = useSubscription();
    const { user } = useAuth();
    const plan = subscription?.plan || 'free';

    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendingStatus, setSendingStatus] = useState(null);

    useEffect(() => {
        loadDocument();
    }, [id]);

    const loadDocument = async () => {
        try {
            const data = await getDocument(id);
            setDocument(data);
        } catch (error) {
            console.error('Failed to load document:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setSendingStatus(newStatus);
        try {
            await updateDocumentStatus(id, newStatus);
            await loadDocument();
        } finally {
            setSendingStatus(null);
        }
    };

    if (plan !== 'business') {
        return (
            <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center h-full">
                <Paywall title="Restricted Access" requiredPlan="business" />
            </div>
        );
    }

    if (loading) return <div className="flex p-8 justify-center">Loading...</div>;
    if (!document) return <div className="flex p-8 justify-center">Document not found</div>;

    const cur = document.currency || 'ZAR';
    const fmt = (amount) => formatCurrency(amount, cur);

    const subtotal = document.subtotal ?? document.items.reduce((s, i) => s + i.qty * i.price, 0);
    const taxTotal = document.taxTotal ?? document.items.reduce((s, i) => {
        const line = i.qty * i.price;
        return s + (line * (i.taxRate || 0) / 100);
    }, 0);
    const discountRaw = document.discount || 0;
    const discountType = document.discountType || 'fixed';
    const discountAmount = discountType === 'percentage' ? subtotal * (discountRaw / 100) : discountRaw;
    const total = document.total ?? Math.max(0, subtotal + taxTotal - discountAmount);
    const hasTax = document.items.some(i => (i.taxRate || 0) > 0);

    // Prioritize current user profile (most up-to-date business identity)
    const logoSrc = user?.businessLogo || document.businessInfo?.logo || null;
    const businessName = user?.businessName || document.businessInfo?.name || 'TaskNest';
    const businessAddress = user?.businessAddress || document.businessInfo?.address || '';
    const contactPerson = user?.contactPerson || document.businessInfo?.contactPerson || '';
    const contactNumber = user?.contactNumber || document.businessInfo?.contactNumber || '';
    const businessEmail = user?.businessEmail || document.businessInfo?.email || user?.email || '';

    return (
        <div className="flex-1 overflow-y-auto bg-background transition-colors duration-300">
            <div className="p-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link to="/invoices" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to List
                    </Link>

                    <div className="flex gap-3 flex-wrap justify-end">
                        {document.status === 'draft' && (
                            <button
                                onClick={() => handleStatusUpdate('sent')}
                                disabled={sendingStatus === 'sent'}
                                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
                            >
                                {sendingStatus === 'sent' ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                {sendingStatus === 'sent' ? 'Sending...' : `Send ${document.type === 'invoice' ? 'Invoice' : 'Quote'}`}
                            </button>
                        )}
                        {(document.status === 'draft' || document.status === 'sent') && (
                            <button
                                onClick={() => navigate(`/invoices/edit/${id}`)}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                            >
                                <Edit className="w-4 h-4" /> Edit
                            </button>
                        )}
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                        >
                            <Printer className="w-4 h-4" /> Print
                        </button>
                        <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors">
                            <Download className="w-4 h-4" /> Download PDF
                        </button>
                        {document.type === 'invoice' && document.status === 'sent' && (
                            <button
                                onClick={() => handleStatusUpdate('paid')}
                                disabled={sendingStatus === 'paid'}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-60"
                            >
                                <CheckCircle className="w-4 h-4" /> Mark Paid
                            </button>
                        )}
                        {document.type === 'quote' && document.status === 'sent' && (
                            <>
                                <button
                                    onClick={() => handleStatusUpdate('accepted')}
                                    disabled={sendingStatus === 'accepted'}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-60"
                                >
                                    <CheckCircle className="w-4 h-4" /> Accept
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('rejected')}
                                    disabled={sendingStatus === 'rejected'}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2 transition-colors disabled:opacity-60"
                                >
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Paper Mockup */}
                <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-sm border border-gray-100 max-w-3xl mx-auto min-h-[11in] relative print:shadow-none print:border-none overflow-hidden">
                    {/* Top accent stripe */}
                    <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 w-full" />

                    <div className="p-14 print:p-8">
                        {/* Status Badge */}
                        <div className="absolute top-10 right-10 rotate-12 opacity-70 pointer-events-none print:hidden">
                            <span className={`px-5 py-1.5 border-2 text-xl font-black uppercase tracking-widest rounded-lg ${document.status === 'paid' ? 'border-green-600 text-green-600' :
                                document.status === 'overdue' ? 'border-red-600 text-red-600' :
                                    document.status === 'draft' ? 'border-gray-300 text-gray-300' :
                                        document.status === 'accepted' ? 'border-green-600 text-green-600' :
                                            document.status === 'rejected' ? 'border-red-600 text-red-600' :
                                                'border-blue-600 text-blue-600'
                                }`}>
                                {document.status}
                            </span>
                        </div>

                        {/* Document Header */}
                        <div className="flex justify-between items-start mb-12">
                            <div className="flex-1">
                                {/* Business Logo */}
                                {logoSrc ? (
                                    <div className="mb-5">
                                        <img
                                            src={logoSrc}
                                            alt={businessName}
                                            className="h-20 w-auto max-w-[280px] object-contain"
                                            onError={(e) => {
                                                console.warn('Logo failed to load');
                                                e.target.style.display = 'none';
                                                const fallback = e.target.nextElementSibling;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                        {/* Fallback text logo (hidden unless img fails) */}
                                        <div className="text-2xl font-black text-slate-900 items-center gap-3 mb-1" style={{ display: 'none' }}>
                                            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-lg shadow-blue-500/20">
                                                {businessName[0] || 'T'}
                                            </div>
                                            <span>{businessName}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex text-2xl font-black text-slate-900 items-center gap-3 mb-5">
                                        <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-lg shadow-blue-500/20">
                                            {businessName[0] || 'T'}
                                        </div>
                                        <span className="tracking-tight">{businessName}</span>
                                    </div>
                                )}

                                {/* Business Address & Contact */}
                                {businessAddress && (
                                    <div className="text-slate-500 text-[13px] whitespace-pre-line leading-relaxed mb-3">
                                        {businessAddress}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {contactPerson && (
                                        <div className="flex items-center gap-2 text-[13px] text-slate-600">
                                            <User className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="font-medium">{contactPerson}</span>
                                        </div>
                                    )}
                                    {contactNumber && (
                                        <div className="flex items-center gap-2 text-[13px] text-slate-600">
                                            <Phone className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="font-medium">{contactNumber}</span>
                                        </div>
                                    )}
                                    {businessEmail && (
                                        <div className="flex items-center gap-2 text-[13px] text-slate-600">
                                            <Mail className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="font-medium">{businessEmail}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-10">
                                <h1 className="text-4xl font-extrabold text-gray-900 uppercase tracking-wider mb-5">
                                    {document.type}
                                </h1>
                                <div className="text-[13px] leading-relaxed space-y-1.5">
                                    <div className="flex justify-end gap-3">
                                        <span className="text-gray-400 font-medium">Number</span>
                                        <span className="text-gray-900 font-bold w-36 text-right">{document.number}</span>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <span className="text-gray-400 font-medium">Date</span>
                                        <span className="text-gray-900 font-bold w-36 text-right">{new Date(document.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <span className="text-gray-400 font-medium">{document.type === 'quote' ? 'Valid Until' : 'Due Date'}</span>
                                        <span className="text-gray-900 font-bold w-36 text-right">{new Date(document.dueDate || document.validUntil).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <span className="text-gray-400 font-medium">Currency</span>
                                        <span className="text-gray-900 font-bold w-36 text-right">{cur}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 mb-10" />

                        {/* Bill To */}
                        <div className="mb-12 bg-slate-50/70 border border-slate-100 rounded-xl p-5 max-w-xs">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                Bill To
                            </h3>
                            <div className="text-gray-900 font-bold text-base">{document.clientName}</div>
                            <div className="text-gray-500 text-[13px] mt-1">{document.clientEmail}</div>
                            {document.clientPhone && (
                                <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mt-1">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    <span>{document.clientPhone}</span>
                                </div>
                            )}
                        </div>

                        {/* Line Items */}
                        <div className="mb-12">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-2 border-gray-800">
                                        <th className="pb-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Description</th>
                                        <th className="pb-3 w-16 text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Qty</th>
                                        <th className="pb-3 w-28 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Price</th>
                                        {hasTax && <th className="pb-3 w-20 text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Tax</th>}
                                        <th className="pb-3 w-32 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {document.items.map((item, i) => {
                                        const lineTotal = item.qty * item.price;
                                        const lineTax = lineTotal * (item.taxRate || 0) / 100;
                                        return (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 text-gray-900 font-medium text-sm">{item.description}</td>
                                                <td className="py-4 text-center text-gray-500 text-sm">{item.qty}</td>
                                                <td className="py-4 text-right text-gray-500 text-sm">{fmt(item.price)}</td>
                                                {hasTax && (
                                                    <td className="py-4 text-center text-gray-400 text-sm">
                                                        {(item.taxRate || 0) > 0 ? `${item.taxRate}%` : '—'}
                                                    </td>
                                                )}
                                                <td className="py-4 text-right text-gray-900 font-bold text-sm">{fmt(lineTotal + lineTax)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-80">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-500 font-medium py-1.5 border-b border-gray-50">
                                        <span>Subtotal</span>
                                        <span className="text-gray-700">{fmt(subtotal)}</span>
                                    </div>
                                    {taxTotal > 0 && (
                                        <div className="flex justify-between text-sm text-gray-500 font-medium py-1.5 border-b border-gray-50">
                                            <span>Tax</span>
                                            <span className="text-gray-700">+{fmt(taxTotal)}</span>
                                        </div>
                                    )}
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-sm text-red-400 font-medium py-1.5 border-b border-gray-50">
                                            <span>Discount{discountType === 'percentage' ? ` (${discountRaw}%)` : ''}</span>
                                            <span>-{fmt(discountAmount)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-xl font-extrabold text-gray-900 mt-4 pt-4 border-t-2 border-gray-800">
                                    <span>Total</span>
                                    <span>{fmt(total)}</span>
                                </div>
                                {document.type === 'invoice' && (document.amountPaid || 0) > 0 && (document.amountPaid || 0) < total && (
                                    <div className="mt-3 space-y-1">
                                        <div className="flex justify-between text-sm text-green-600 font-semibold">
                                            <span>Paid</span>
                                            <span>{fmt(document.amountPaid)}</span>
                                        </div>
                                        <div className="flex justify-between text-base font-bold text-amber-600 pt-2 border-t border-gray-200">
                                            <span>Balance Due</span>
                                            <span>{fmt(total - document.amountPaid)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Banking & Notes */}
                        <div className="mt-16 pt-8 border-t border-gray-100 grid grid-cols-2 gap-10">
                            {(user?.bankName || document.businessInfo?.banking?.bankName) && (
                                <div className="bg-slate-50/60 p-5 rounded-xl border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Payment Information</h4>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400 font-medium">Bank</span>
                                            <span className="font-bold text-slate-800">{user?.bankName || document.businessInfo?.banking?.bankName}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400 font-medium">Account Holder</span>
                                            <span className="font-bold text-slate-800">{user?.accountHolder || document.businessInfo?.banking?.accountHolder}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400 font-medium">Account No.</span>
                                            <span className="font-bold text-slate-800">{user?.accountNumber || document.businessInfo?.banking?.accountNumber}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400 font-medium">Branch Code</span>
                                            <span className="font-bold text-slate-800">{user?.branchCode || document.businessInfo?.banking?.branchCode}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {document.notes && (
                                <div className="flex flex-col justify-start">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Notes</h4>
                                    <p className="text-sm text-slate-500 italic leading-relaxed">"{document.notes}"</p>
                                </div>
                            )}
                        </div>

                        {/* Footer watermark */}
                        <div className="mt-16 text-center">
                            <p className="text-[10px] text-gray-300 font-medium tracking-wide">Thank you for your business</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
