import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard, HelpCircle, RefreshCw } from 'lucide-react';

export default function PaymentCancelled() {
    const faqs = [
        {
            question: 'Why was my payment cancelled?',
            answer: 'Payments can be cancelled if you close the payment window, your bank declines the transaction, or if there was a timeout.',
        },
        {
            question: 'Was I charged?',
            answer: 'No, if the payment was cancelled, no money was deducted from your account.',
        },
        {
            question: 'Can I try a different payment method?',
            answer: 'Yes! PayFast supports credit cards, debit cards, instant EFT, and more. Try again with a different method.',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
            {/* Card */}
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 px-8 py-12 text-white text-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-12 h-12 text-white/80" />
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
                    <p className="text-gray-300">
                        No worries — you can try again whenever you're ready
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Action Buttons */}
                    <div className="space-y-3 mb-8">
                        <Link
                            to="/pricing"
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </Link>

                        <Link
                            to="/dashboard"
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Continue with Free Plan
                        </Link>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-gray-400 text-sm">Common Questions</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* FAQs */}
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                                            {faq.question}
                                        </h4>
                                        <p className="text-gray-500 text-sm">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Help Link */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-500 text-sm">
                            Having trouble?{' '}
                            <a href="mailto:support@tasknest.app" className="text-primary font-medium hover:underline">
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
