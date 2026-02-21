import React, { useEffect, useRef } from 'react';
import { buildPaymentParams, getPayFastUrl } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

/**
 * PayFast Form Component
 * Renders a hidden form for secure PayFast submission
 * More secure than URL parameter method as sensitive data isn't exposed in browser history
 */
export default function PayFastForm({
    planId,
    yearly = false,
    autoSubmit = false,
    onSubmit,
    children
}) {
    const formRef = useRef(null);
    const { user } = useAuth();

    const params = buildPaymentParams(planId, yearly, {
        email: user?.email || 'user@example.com',
        firstName: user?.firstName || 'User',
        lastName: user?.lastName || '',
    });

    const actionUrl = getPayFastUrl();

    useEffect(() => {
        if (autoSubmit && formRef.current) {
            formRef.current.submit();
        }
    }, [autoSubmit]);

    const handleSubmit = (e) => {
        if (onSubmit) {
            onSubmit(e);
        }
    };

    // If children provided, render as wrapper; otherwise render form directly
    if (children) {
        return (
            <form
                ref={formRef}
                action={actionUrl}
                method="POST"
                onSubmit={handleSubmit}
            >
                {/* Hidden form fields */}
                {Object.entries(params).map(([key, value]) => (
                    value !== '' && value !== undefined && (
                        <input
                            key={key}
                            type="hidden"
                            name={key}
                            value={value}
                        />
                    )
                ))}
                {children}
            </form>
        );
    }

    // Auto-submit mode with loading overlay
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <div className="text-center">
                {/* Loading spinner */}
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Redirecting to PayFast...
                </h2>
                <p className="text-gray-500">
                    Please wait while we prepare your secure checkout
                </p>

                {/* Hidden form for auto-submit */}
                <form
                    ref={formRef}
                    action={actionUrl}
                    method="POST"
                    className="hidden"
                >
                    {Object.entries(params).map(([key, value]) => (
                        value !== '' && value !== undefined && (
                            <input
                                key={key}
                                type="hidden"
                                name={key}
                                value={value}
                            />
                        )
                    ))}
                </form>
            </div>
        </div>
    );
}

/**
 * PayFast Button Component
 * A styled button that wraps PayFastForm for easy integration
 */
export function PayFastButton({
    planId,
    yearly = false,
    className = '',
    children = 'Subscribe Now'
}) {
    return (
        <PayFastForm planId={planId} yearly={yearly}>
            <button
                type="submit"
                className={`px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 cursor-pointer ${className}`}
            >
                {children}
            </button>
        </PayFastForm>
    );
}
