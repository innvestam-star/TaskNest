import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight, PartyPopper } from 'lucide-react';
import { getPendingPayment, activateSubscription, PLANS } from '../services/paymentService';
import { useSubscription } from '../context/SubscriptionContext';

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const { refreshSubscription, updateSubscription } = useSubscription();
    const [planDetails, setPlanDetails] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        // Get pending payment and activate subscription
        const pendingPayment = getPendingPayment();
        if (pendingPayment) {
            const plan = PLANS[pendingPayment.planId];
            setPlanDetails({
                ...plan,
                yearly: pendingPayment.yearly,
            });

            // Activate the subscription using context's updateSubscription
            // This properly syncs to both localStorage AND Firestore
            const activateAndRefresh = async () => {
                // First activate in localStorage (for billing history)
                activateSubscription(pendingPayment.planId, {
                    yearly: pendingPayment.yearly,
                    paymentId: pendingPayment.paymentId,
                });

                // Then update via context (syncs to Firestore)
                await updateSubscription(pendingPayment.planId, {
                    yearly: pendingPayment.yearly,
                    paymentId: pendingPayment.paymentId,
                    billingCycle: pendingPayment.yearly ? 'yearly' : 'monthly',
                });
            };

            activateAndRefresh();
        } else {
            // No pending payment, might be a direct visit
            setPlanDetails(PLANS.pro);
        }

        // Hide confetti after 3 seconds
        const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);

        // Countdown timer
        const countdownTimer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownTimer);
                    navigate('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearTimeout(confettiTimer);
            clearInterval(countdownTimer);
        };
    }, [navigate, refreshSubscription, updateSubscription]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Confetti animation (CSS-based) */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Success Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-8 py-12 text-white text-center relative">
                    <div className="absolute top-4 right-4">
                        <PartyPopper className="w-8 h-8 text-white/50 animate-bounce" />
                    </div>

                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                    <p className="text-green-100">
                        Welcome to TaskNest {planDetails?.name || 'Pro'}
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {planDetails?.name || 'Pro'} Plan Activated
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {planDetails?.yearly ? 'Yearly' : 'Monthly'} subscription
                                </p>
                            </div>
                        </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-3">You now have access to:</h3>
                    <ul className="space-y-2 mb-8">
                        {(planDetails?.features || PLANS.pro.features).slice(0, 4).map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Link
                        to="/dashboard"
                        className="block w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-center shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Start Exploring
                            <ArrowRight className="w-5 h-5" />
                        </span>
                    </Link>

                    <p className="text-center text-gray-400 text-sm mt-4">
                        Redirecting to dashboard in {countdown} seconds...
                    </p>
                </div>
            </div>

            {/* CSS for animations */}
            <style>{`
                @keyframes confetti {
                    0% {
                        transform: translateY(-100vh) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-confetti {
                    animation: confetti 4s ease-out forwards;
                }
                @keyframes scale-in {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
