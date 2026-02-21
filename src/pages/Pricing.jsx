import React, { useState, useRef } from 'react';
import { Check, X, Sparkles, Zap, Crown, ArrowRight, Ticket, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { PLANS, buildPaymentParams, getPayFastUrl } from '../services/paymentService';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { markUserNotNew } from '../services/firebaseConfig';
import { redeemCoupon } from '../services/couponService';

export default function Pricing() {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const { subscription, updateSubscription } = useSubscription();
    const { user } = useAuth();
    const formRef = useRef(null);
    const [paymentParams, setPaymentParams] = useState(null);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');

    const handleSubscribe = async (planId) => {
        if (planId === 'free') {
            if (user?.id) {
                try {
                    await markUserNotNew(user.id);
                } catch (error) {
                    console.error('Failed to mark user as not new:', error);
                }
            }
            navigate('/dashboard');
            return;
        }

        if (subscription.plan === planId) {
            window.location.href = '/settings';
            return;
        }

        const isYearly = billingCycle === 'yearly';
        const params = buildPaymentParams(planId, isYearly, {
            email: user?.email || 'user@example.com',
            firstName: user?.firstName || 'User',
            lastName: user?.lastName || '',
        });

        console.log('PayFast params:', params);
        console.log('Signature:', params.signature);

        setPaymentParams(params);
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.submit();
            }
        }, 100);
    };

    const handleRedeemCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        if (!user?.id) {
            setCouponError('You must be logged in to redeem a coupon.');
            return;
        }
        setCouponError('');
        setCouponSuccess('');
        setCouponLoading(true);

        try {
            const result = await redeemCoupon(couponCode, user.id);
            const endDate = new Date(Date.now() + result.durationDays * 24 * 60 * 60 * 1000).toISOString();
            await updateSubscription(result.plan, {
                source: 'coupon',
                couponCode: couponCode.toUpperCase(),
                nextBillingDate: endDate,
            });
            const planName = result.plan === 'business' ? 'Business' : 'Pro';
            setCouponSuccess(`🎉 ${planName} plan activated for ${result.durationDays} days!`);
            setCouponCode('');
        } catch (err) {
            setCouponError(err.message || 'Invalid coupon code.');
        } finally {
            setCouponLoading(false);
        }
    };

    const getButtonText = (planId) => {
        if (subscription.plan === planId) {
            return 'Current Plan';
        }
        if (planId === 'free') {
            return subscription.plan === 'free' ? 'Current Plan' : 'Downgrade';
        }
        if (subscription.plan === 'business' && planId === 'pro') {
            return 'Downgrade';
        }
        return 'Get Started';
    };

    const planIcons = {
        free: Zap,
        pro: Sparkles,
        business: Crown,
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-all duration-500">
            <PageHeader
                title="Choose Your Plan"
                subtitle="Unlock your full productivity potential with TaskNest Pro"
            >
                {/* Billing Toggle */}
                <div className="inline-flex items-center bg-surface/50 border border-border/50 rounded-2xl p-1.5 shadow-inner glass-panel">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${billingCycle === 'monthly' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative cursor-pointer ${billingCycle === 'yearly' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        Yearly
                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-lg ring-2 ring-background">
                            -17%
                        </span>
                    </button>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
                {/* Hidden PayFast Form */}
                {paymentParams && (
                    <form
                        ref={formRef}
                        action={getPayFastUrl()}
                        method="POST"
                        style={{ display: 'none' }}
                    >
                        {Object.entries(paymentParams).map(([key, value]) => (
                            value !== '' && value !== undefined && value !== null && (
                                <input
                                    key={key}
                                    type="hidden"
                                    name={key}
                                    value={value}
                                />
                            )
                        ))}
                    </form>
                )}

                <div className="max-w-6xl mx-auto py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {Object.values(PLANS).map((plan) => {
                            const Icon = planIcons[plan.id];
                            const price = billingCycle === 'yearly' && plan.yearlyPrice
                                ? plan.yearlyPriceDisplay
                                : plan.priceDisplay;
                            const period = billingCycle === 'yearly' && plan.yearlyPrice
                                ? '/year'
                                : plan.period === 'forever' ? '' : '/month';
                            const isCurrentPlan = subscription.plan === plan.id;

                            return (
                                <div
                                    key={plan.id}
                                    className={`bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden relative transition-all duration-500 hover:-translate-y-2 border p-10 flex flex-col ${plan.popular ? 'border-primary/50 ring-4 ring-primary/5' : 'border-border/50'
                                        } ${isCurrentPlan ? 'border-green-500/50 ring-4 ring-green-500/5' : ''} electric-card glass-panel`}
                                >
                                    {plan.popular && !isCurrentPlan && (
                                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-blue-600 text-white text-center text-[10px] font-black tracking-[0.2em] py-2">
                                            RECOMMENDED
                                        </div>
                                    )}
                                    {isCurrentPlan && (
                                        <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center text-[10px] font-black tracking-[0.2em] py-2">
                                            ACTIVE PLAN
                                        </div>
                                    )}

                                    <div className={`flex-1 ${plan.popular || isCurrentPlan ? 'pt-6' : ''}`}>
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl ${plan.id === 'free' ? 'bg-slate-900/50 border border-slate-800 text-slate-500' :
                                            plan.id === 'pro' ? 'bg-primary/10 text-primary border border-primary/20' :
                                                'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            }`}>
                                            <Icon className="w-8 h-8" />
                                        </div>

                                        <h3 className="text-3xl font-black text-text-main tracking-tighter leading-none mb-4">{plan.name}</h3>

                                        <div className="mb-10 flex items-baseline gap-1">
                                            <span className="text-6xl font-black text-text-main tracking-tighter">{price}</span>
                                            {period && <span className="text-slate-500 text-sm font-black uppercase tracking-widest ml-1">{period}</span>}
                                        </div>

                                        <button
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={isCurrentPlan}
                                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${isCurrentPlan
                                                ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default'
                                                : plan.id === 'free'
                                                    ? 'bg-slate-900/50 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                                                    : plan.popular
                                                        ? 'bg-primary text-white hover:bg-blue-600 shadow-2xl shadow-primary/20 glow-blue'
                                                        : 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-700'
                                                }`}
                                        >
                                            {getButtonText(plan.id)}
                                            {!isCurrentPlan && plan.id !== 'free' && <ArrowRight className="w-4 h-4" />}
                                        </button>

                                        <ul className="mt-12 space-y-5">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-4 group/item">
                                                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform">
                                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                                    </div>
                                                    <span className="text-slate-400 text-sm font-medium group-hover/item:text-slate-200 transition-colors">{feature}</span>
                                                </li>
                                            ))}
                                            {plan.limitations?.map((limitation, i) => (
                                                <li key={`limit-${i}`} className="flex items-start gap-4 opacity-30 grayscale group/item">
                                                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                                                        <X className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <span className="text-slate-500 text-sm font-medium">{limitation}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ─── Coupon Redemption ─── */}
                    <div className="mt-16 max-w-lg mx-auto">
                        <div className="bg-surface/40 backdrop-blur-xl border border-border/40 rounded-[2rem] p-8 glass-panel">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Ticket className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-text-main tracking-tight">Have a Coupon?</h3>
                                    <p className="text-xs text-slate-500">Enter your code to unlock plan access</p>
                                </div>
                            </div>

                            {couponSuccess && (
                                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-bold animate-in fade-in duration-300">
                                    {couponSuccess}
                                </div>
                            )}
                            {couponError && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                                    {couponError}
                                </div>
                            )}

                            <form onSubmit={handleRedeemCoupon} className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Enter coupon code..."
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-1 bg-slate-900/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-text-main font-mono font-bold tracking-wider placeholder-slate-600 focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={couponLoading || !couponCode.trim()}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-black text-sm hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {couponLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Redeem'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-24 text-center">
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Secure Cloud Infrastructure</p>
                        <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                            <div className="flex items-center gap-3 text-slate-400 font-black tracking-tighter text-xl">
                                <Check className="w-6 h-6 text-primary" /> PayFast
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 font-black tracking-tighter text-xl">
                                <Sparkles className="w-6 h-6 text-amber-500" /> SSL 256
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 font-black tracking-tighter text-xl">
                                <Zap className="w-6 h-6 text-blue-500" /> AES End-to-End
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
