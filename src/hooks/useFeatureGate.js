import { useState, useCallback } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import {
    hasFeatureAccess,
    checkActionLimit,
    getUpgradeReason,
    getRecommendedPlan
} from '../services/paymentService';

/**
 * useFeatureGate Hook
 * Provides feature access checking and upgrade modal triggering
 * 
 * @returns {object} - Feature gate utilities
 */
export function useFeatureGate() {
    const { subscription, canUse, isFree } = useSubscription();
    const [upgradeModal, setUpgradeModal] = useState({
        isOpen: false,
        reason: null,
    });

    /**
     * Check if user has access to a feature
     * @param {string} feature - Feature key
     * @returns {boolean} - Whether user has access
     */
    const checkAccess = useCallback((feature) => {
        return hasFeatureAccess(feature);
    }, []);

    /**
     * Check if user can perform an action (considering limits)
     * @param {string} action - Action key ('createTask', 'createAppointment', 'useAI')
     * @returns {object} - { allowed, remaining, reason }
     */
    const checkLimit = useCallback((action) => {
        return checkActionLimit(action);
    }, []);

    /**
     * Show upgrade modal for a specific feature/reason
     * @param {string} reason - Upgrade reason key
     */
    const showUpgradeModal = useCallback((reason) => {
        setUpgradeModal({
            isOpen: true,
            reason,
        });
    }, []);

    /**
     * Close upgrade modal
     */
    const closeUpgradeModal = useCallback(() => {
        setUpgradeModal({
            isOpen: false,
            reason: null,
        });
    }, []);

    /**
     * Gate a feature - check access and show upgrade modal if needed
     * @param {string} feature - Feature key
     * @param {function} onAccess - Callback if user has access
     * @returns {boolean} - Whether user was granted access
     */
    const gateFeature = useCallback((feature, onAccess) => {
        if (hasFeatureAccess(feature)) {
            if (onAccess) onAccess();
            return true;
        }
        showUpgradeModal(feature);
        return false;
    }, [showUpgradeModal]);

    /**
     * Gate an action - check limit and show upgrade modal if needed
     * @param {string} action - Action key
     * @param {function} onAccess - Callback if action is allowed
     * @returns {object} - { allowed, remaining }
     */
    const gateAction = useCallback((action, onAccess) => {
        const result = checkActionLimit(action);
        if (result.allowed) {
            if (onAccess) onAccess();
            return result;
        }
        showUpgradeModal(result.reason);
        return result;
    }, [showUpgradeModal]);

    /**
     * Get upgrade info for a feature
     * @param {string} feature - Feature key
     * @returns {object} - Upgrade reason info
     */
    const getUpgradeInfo = useCallback((feature) => {
        return {
            ...getUpgradeReason(feature),
            recommendedPlan: getRecommendedPlan(feature),
        };
    }, []);

    return {
        // State
        subscription,
        isFree,
        upgradeModal,

        // Access checks
        checkAccess,
        checkLimit,
        canUse,

        // Modal controls
        showUpgradeModal,
        closeUpgradeModal,

        // Gating functions
        gateFeature,
        gateAction,

        // Utilities
        getUpgradeInfo,
    };
}

export default useFeatureGate;
