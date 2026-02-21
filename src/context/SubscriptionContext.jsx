import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSubscriptionStatus, hasFeatureAccess, PLANS } from '../services/paymentService';
import { useAuth } from './AuthContext';
import { updateSubscription as updateFirestoreSubscription, markUserNotNew } from '../services/firebaseConfig';

const SubscriptionContext = createContext(null);

// Feature limits for free plan
const FREE_LIMITS = {
    maxTasks: 50,
    maxAppointmentsPerMonth: 10,
};

export function SubscriptionProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const [subscription, setSubscription] = useState({
        plan: 'free',
        status: 'active',
        startDate: null,
        nextBillingDate: null,
        payfastToken: null,
    });
    const [loading, setLoading] = useState(true);
    const [usage, setUsage] = useState({
        tasksCreated: 0,
        appointmentsThisMonth: 0,
    });

    // Load subscription status on mount and when user changes
    useEffect(() => {
        loadSubscription();
    }, [isAuthenticated, user]);

    const loadSubscription = useCallback(() => {
        setLoading(true);
        try {
            // Check both sources: Firestore (via user object) and localStorage
            const firestoreSubscription = user?.subscription;
            const localStorageSubscription = getSubscriptionStatus();

            // Prefer paid subscription from either source
            // This handles cases where payment was made but Firestore wasn't synced
            let finalSubscription = { plan: 'free', status: 'active' };

            if (firestoreSubscription && firestoreSubscription.plan !== 'free') {
                // Firestore has a paid subscription
                finalSubscription = firestoreSubscription;
            } else if (localStorageSubscription && localStorageSubscription.plan !== 'free') {
                // localStorage has a paid subscription (payment completed but not synced to Firestore)
                finalSubscription = localStorageSubscription;

                // Attempt to sync localStorage subscription to Firestore if user is authenticated
                if (user?.id && firestoreSubscription?.plan === 'free') {
                    console.log('Syncing localStorage subscription to Firestore...');
                    // This will be handled asynchronously
                    import('../services/firebaseConfig').then(({ updateSubscription: updateFirestore }) => {
                        updateFirestore(user.id, localStorageSubscription).catch(console.error);
                    });
                }
            } else if (firestoreSubscription) {
                finalSubscription = firestoreSubscription;
            } else if (localStorageSubscription) {
                finalSubscription = localStorageSubscription;
            }

            setSubscription(prev => ({
                ...prev,
                ...finalSubscription,
            }));

            // Load usage from localStorage
            const savedUsage = localStorage.getItem('tasknest_usage');
            if (savedUsage) {
                setUsage(JSON.parse(savedUsage));
            }
        } catch (error) {
            console.error('Failed to load subscription:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Check if user can use a specific feature
    const canUse = useCallback((feature) => {
        return hasFeatureAccess(feature);
    }, []);

    // Check if user has reached their task limit
    const canCreateTask = useCallback(() => {
        if (subscription.plan !== 'free') return { allowed: true };

        if (usage.tasksCreated >= FREE_LIMITS.maxTasks) {
            return {
                allowed: false,
                reason: `You've reached the limit of ${FREE_LIMITS.maxTasks} tasks on the free plan.`,
                feature: 'unlimitedTasks',
            };
        }
        return { allowed: true, remaining: FREE_LIMITS.maxTasks - usage.tasksCreated };
    }, [subscription.plan, usage.tasksCreated]);

    // Check if user can create more appointments
    const canCreateAppointment = useCallback(() => {
        if (subscription.plan !== 'free') return { allowed: true };

        if (usage.appointmentsThisMonth >= FREE_LIMITS.maxAppointmentsPerMonth) {
            return {
                allowed: false,
                reason: `You've reached the limit of ${FREE_LIMITS.maxAppointmentsPerMonth} appointments per month on the free plan.`,
                feature: 'unlimitedAppointments',
            };
        }
        return { allowed: true, remaining: FREE_LIMITS.maxAppointmentsPerMonth - usage.appointmentsThisMonth };
    }, [subscription.plan, usage.appointmentsThisMonth]);

    // Increment usage counters
    const incrementTaskCount = useCallback(() => {
        setUsage(prev => {
            const newUsage = { ...prev, tasksCreated: prev.tasksCreated + 1 };
            localStorage.setItem('tasknest_usage', JSON.stringify(newUsage));
            return newUsage;
        });
    }, []);

    const incrementAppointmentCount = useCallback(() => {
        setUsage(prev => {
            const newUsage = { ...prev, appointmentsThisMonth: prev.appointmentsThisMonth + 1 };
            localStorage.setItem('tasknest_usage', JSON.stringify(newUsage));
            return newUsage;
        });
    }, []);

    // Update subscription (called after successful payment)
    const updateSubscription = useCallback(async (newPlan, details = {}) => {
        const newSubscription = {
            plan: newPlan,
            status: 'active',
            startDate: new Date().toISOString(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            ...details,
        };

        setSubscription(newSubscription);
        localStorage.setItem('tasknest_subscription', JSON.stringify(newSubscription));

        // Also update Firestore if user is authenticated
        if (user?.id) {
            try {
                await updateFirestoreSubscription(user.id, newSubscription);
                // Mark user as no longer new after they've chosen a plan
                await markUserNotNew(user.id);
            } catch (error) {
                console.error('Failed to update subscription in Firestore:', error);
            }
        }
    }, [user]);

    // Get current plan details
    const getPlanDetails = useCallback(() => {
        return PLANS[subscription.plan] || PLANS.free;
    }, [subscription.plan]);

    const value = {
        // State
        subscription,
        loading,
        usage,
        limits: FREE_LIMITS,

        // Feature access
        canUse,
        canCreateTask,
        canCreateAppointment,

        // Actions
        incrementTaskCount,
        incrementAppointmentCount,
        updateSubscription,
        refreshSubscription: loadSubscription,
        getPlanDetails,

        // Derived
        isPro: subscription.plan === 'pro' || subscription.plan === 'business',
        isBusiness: subscription.plan === 'business',
        isFree: subscription.plan === 'free',
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}

export default SubscriptionContext;
