import React, { useState } from 'react';
import { X, Sparkles, Crown, Check, ArrowRight, Zap, Calendar, Clock, Users, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PLANS, getUpgradeReason, getRecommendedPlan, generatePayFastUrl } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

// Icon mapping for upgrade reasons
const ICONS = {
    tasks: Zap,
    calendar: Calendar,
    sparkles: Sparkles,
    repeat: Repeat,
    users: Users,
    clock: Clock,
};

export default function UpgradeModal({ isOpen, onClose, reason = 'aiAssistant', showComparison = false }) {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    if (!isOpen) return null;

    const upgradeInfo = getUpgradeReason(reason);
    const recommendedPlan = getRecommendedPlan(upgradeInfo.feature);
    const Icon = ICONS[upgradeInfo.icon] || Sparkles;

    const handleUpgrade = (planId) => {
        setLoading(true);
        const isYearly = billingCycle === 'yearly';
        const payFastUrl = generatePayFastUrl(planId, isYearly, {
            email: user?.email || 'user@example.com',
            firstName: user?.firstName || 'User',
            lastName: user?.lastName || '',
        });

        // Open PayFast in new tab
        window.open(payFastUrl, '_blank');
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Header with gradient */}
                <div className="bg-gradient-to-br from-primary via-blue-600 to-purple-600 px-8 py-10 text-white relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                            <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{upgradeInfo.title}</h2>
                        <p className="text-blue-100 leading-relaxed">{upgradeInfo.message}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Billing toggle */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${billingCycle === 'monthly'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative cursor-pointer ${billingCycle === 'yearly'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Yearly
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                -17%
                            </span>
                        </button>
                    </div>

                    {/* Plan cards */}
                    <div className="space-y-3 mb-6">
                        {/* Pro Plan */}
                        <div
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${recommendedPlan === 'pro'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => handleUpgrade('pro')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{PLANS.pro.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {billingCycle === 'yearly' ? PLANS.pro.yearlyPriceDisplay : PLANS.pro.priceDisplay}
                                            <span className="text-gray-400">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                                        </p>
                                    </div>
                                </div>
                                {recommendedPlan === 'pro' && (
                                    <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                                        Recommended
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Business Plan */}
                        <div
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${recommendedPlan === 'business'
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => handleUpgrade('business')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <Crown className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{PLANS.business.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {billingCycle === 'yearly' ? PLANS.business.yearlyPriceDisplay : PLANS.business.priceDisplay}
                                            <span className="text-gray-400">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                                        </p>
                                    </div>
                                </div>
                                {recommendedPlan === 'business' && (
                                    <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                                        Recommended
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Features preview */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h4 className="font-medium text-gray-900 mb-3 text-sm">What you'll get:</h4>
                        <ul className="space-y-2">
                            {PLANS[recommendedPlan].features.slice(0, 4).map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => handleUpgrade(recommendedPlan)}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            'Preparing checkout...'
                        ) : (
                            <>
                                Upgrade Now
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    {/* Compare plans link */}
                    <Link
                        to="/pricing"
                        onClick={onClose}
                        className="block text-center text-sm text-gray-500 hover:text-primary mt-4 transition-colors"
                    >
                        Compare all plans →
                    </Link>

                    {/* Trust badge */}
                    <p className="text-center text-xs text-gray-400 mt-4">
                        🔒 Secure payment via PayFast • Cancel anytime
                    </p>
                </div>
            </div>

            {/* Animation styles */}
            <style>{`
                @keyframes scale-in {
                    0% {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
