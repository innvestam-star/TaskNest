import React from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Paywall({ isOpen, onClose, feature = 'premium features', title, description, requiredPlan }) {
    // If it's a modal, use the modal layout
    if (isOpen !== undefined) {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    onClick={onClose}
                ></div>

                {/* Modal Content */}
                <div className="relative bg-surface rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-border/50 glass-panel">
                    <div className="bg-gradient-to-br from-primary via-blue-600 to-purple-600 px-6 py-10 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>

                        <h2 className="text-3xl font-black mb-2 tracking-tight">Upgrade to Pro</h2>
                        <p className="text-blue-100 text-sm font-medium opacity-90">
                            Unlock {feature} & more
                        </p>
                    </div>

                    <div className="p-10">
                        <ul className="space-y-4 mb-10">
                            {['Unlimited projects & tasks', 'NestAI productivity assistant', 'Professional invoicing', 'Advanced analytics'].map((benefit, i) => (
                                <li key={i} className="flex items-center gap-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <span className="text-text-main font-bold text-sm tracking-tight">{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            to="/pricing"
                            className="block w-full py-4 bg-primary text-white rounded-2xl font-black text-center shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all glow-blue"
                            onClick={onClose}
                        >
                            Get Professional Access
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Inline / Page Mode
    return (
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12 animate-in fade-in zoom-in duration-500">
            <div className="bg-surface/50 border border-border/50 rounded-[3rem] p-12 max-w-2xl w-full text-center glass-panel shadow-2xl shadow-primary/5">
                <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-inner">
                    <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-4xl font-black text-text-main tracking-tighter mb-4">{title || 'Premium Feature'}</h2>
                <p className="text-text-muted text-lg font-medium mb-12 max-w-md mx-auto leading-relaxed">
                    {description || `The ${feature} module requires a ${requiredPlan || 'Pro'} subscription to manage your professional workspace.`}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/dashboard"
                        className="px-8 py-4 bg-surface border border-border text-text-main rounded-2xl font-black text-sm hover:bg-slate-900 transition-all active:scale-95"
                    >
                        Maybe Later
                    </Link>
                    <Link
                        to="/pricing"
                        className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all active:scale-95 glow-blue"
                    >
                        Upgrade Account
                    </Link>
                </div>
            </div>
        </div>
    );
}
