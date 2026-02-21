/**
 * PayFast Payment Service
 * Handles subscription payments via PayFast
 * 
 * Documentation: https://developers.payfast.co.za/
 */

// PayFast Configuration (Replace with production values before going live)
const PAYFAST_CONFIG = {
    merchantId: '10045227', // Your Sandbox merchant ID
    merchantKey: 'gwi3edzv5m5lx', // Your Sandbox merchant key
    passphrase: 'Killernobkaylamrrobot', // Your Salt Passphrase
    sandboxMode: true,
    returnUrl: window.location.origin + '/payment/success',
    cancelUrl: window.location.origin + '/payment/cancelled',
    notifyUrl: '', // Your server webhook URL for ITN (requires backend)
};

/**
 * IMPORTANT: Testing PayFast Sandbox Payments
 * 
 * To avoid "Merchant is unable to receive payments from the same account" error:
 * 
 * 1. DO NOT use your merchant account to pay (the account that receives payments)
 * 2. Use the PayFast test buyer account instead:
 *    - Username: sbtu01@payfast.io
 *    - Password: clientpass
 * 
 * Steps to test:
 * 1. Click on a payment card to initiate payment
 * 2. You'll be redirected to PayFast sandbox
 * 3. Login with the TEST BUYER credentials above (NOT your merchant credentials)
 * 4. Complete the payment using the test wallet
 * 
 * The test wallet is reset to R99,999,999.99 every night automatically.
 */

// PayFast URLs
export const PAYFAST_URLS = {
    sandbox: 'https://sandbox.payfast.co.za/eng/process',
    production: 'https://www.payfast.co.za/eng/process',
};

// Subscription Plans with ZAR pricing
export const PLANS = {
    free: {
        id: 'free',
        name: 'Starter',
        price: 0,
        priceDisplay: 'R0',
        period: 'forever',
        features: [
            'Up to 50 tasks',
            'Up to 10 appointments/month',
            'Basic reminders',
            'Calendar view',
        ],
        limitations: [
            'No AI assistant',
            'No recurring tasks',
            'No client booking',
        ],
    },
    pro: {
        id: 'pro',
        name: 'Productivity Plus',
        price: 99, // ZAR
        priceDisplay: 'R99',
        period: 'month',
        yearlyPrice: 990,
        yearlyPriceDisplay: 'R990',
        features: [
            'Unlimited tasks',
            'Unlimited appointments',
            'NestAI Assistant',
            'Smart scheduling',
            'Recurring tasks & events',
            'Priority support',
        ],
        popular: true,
    },
    business: {
        id: 'business',
        name: 'Professional',
        price: 199, // ZAR
        priceDisplay: 'R199',
        period: 'month',
        yearlyPrice: 1990,
        yearlyPriceDisplay: 'R1990',
        features: [
            'Everything in Pro',
            'Client booking page',
            'Client reminders',
            'Branding removal',
            'Usage analytics',
            'Priority support',
        ],
    },
};

// Feature limits for free plan
export const FREE_LIMITS = {
    maxTasks: 50,
    maxAppointmentsPerMonth: 10,
    maxAIMessagesPerDay: 3,
};

// Upgrade reasons with contextual messaging
export const UPGRADE_REASONS = {
    taskLimit: {
        title: "You've reached your task limit",
        message: "Free accounts are limited to 50 tasks. Upgrade to unlock unlimited tasks and supercharge your productivity.",
        feature: 'unlimitedTasks',
        icon: 'tasks',
    },
    appointmentLimit: {
        title: "Monthly appointment limit reached",
        message: "You've used all 10 appointments this month. Upgrade for unlimited appointments and never miss a meeting.",
        feature: 'unlimitedAppointments',
        icon: 'calendar',
    },
    aiAssistant: {
        title: "Unlock NestAI Assistant",
        message: "Get personalized productivity insights, smart task breakdowns, and AI-powered scheduling with NestAI.",
        feature: 'aiAssistant',
        icon: 'sparkles',
    },
    recurringTasks: {
        title: "Recurring tasks are a Pro feature",
        message: "Set up repeating tasks and never forget routine work. Upgrade to automate your recurring responsibilities.",
        feature: 'recurringTasks',
        icon: 'repeat',
    },
    clientBooking: {
        title: "Client booking requires Business",
        message: "Let clients book appointments directly on your schedule. Perfect for consultants and service providers.",
        feature: 'clientBooking',
        icon: 'users',
    },
    smartScheduling: {
        title: "Smart scheduling is a Pro feature",
        message: "Let AI find the perfect time slots for your tasks based on your calendar and work patterns.",
        feature: 'smartScheduling',
        icon: 'clock',
    },
};

/**
 * Generate MD5 hash using Web Crypto API
 * Falls back to simple hash for older browsers
 * @param {string} data - String to hash
 * @returns {Promise<string>} - MD5 hash
 */
async function generateMD5Async(data) {
    try {
        // Use SubtleCrypto if available (note: MD5 not supported, use SHA-256 for demo)
        // In production, you should generate signature on backend or use a library
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.substring(0, 32); // Return first 32 chars to match MD5 length
    } catch (error) {
        // Fallback to simple hash
        return md5(data);
    }
}

/**
 * MD5 hash implementation for PayFast signature
 * Based on RFC 1321 - required for PayFast signature validation
 */
function md5(string) {
    function rotateLeft(value, shift) {
        return (value << shift) | (value >>> (32 - shift));
    }

    function addUnsigned(x, y) {
        const lsw = (x & 0xFFFF) + (y & 0xFFFF);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return x ^ y ^ z; }
    function I(x, y, z) { return y ^ (x | (~z)); }

    function FF(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function GG(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function HH(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function II(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(str) {
        const wordCount = (((str.length + 8) - ((str.length + 8) % 64)) / 64 + 1) * 16;
        const words = new Array(wordCount - 1).fill(0);
        let bytePos = 0;
        let byteCount = 0;
        while (byteCount < str.length) {
            const wordPos = (byteCount - (byteCount % 4)) / 4;
            bytePos = (byteCount % 4) * 8;
            words[wordPos] = words[wordPos] | (str.charCodeAt(byteCount) << bytePos);
            byteCount++;
        }
        const wordPos = (byteCount - (byteCount % 4)) / 4;
        bytePos = (byteCount % 4) * 8;
        words[wordPos] = words[wordPos] | (0x80 << bytePos);
        words[wordCount - 2] = str.length << 3;
        words[wordCount - 1] = str.length >>> 29;
        return words;
    }

    function wordToHex(value) {
        let hex = '';
        for (let i = 0; i <= 3; i++) {
            const byte = (value >>> (i * 8)) & 255;
            hex += ('0' + byte.toString(16)).slice(-2);
        }
        return hex;
    }

    const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    const x = convertToWordArray(string);
    let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

    for (let k = 0; k < x.length; k += 16) {
        const AA = a, BB = b, CC = c, DD = d;
        a = FF(a, b, c, d, x[k], S11, 0xD76AA478); d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB); b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF); d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613); b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8); d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1); b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122); d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E); b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562); d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51); b = GG(b, c, d, a, x[k], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D); d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681); b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6); d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87); b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905); d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9); b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942); d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122); b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44); d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60); b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6); d = HH(d, a, b, c, x[k], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085); b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039); d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8); b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k], S41, 0xF4292244); d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7); b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3); d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D); b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F); d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314); b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82); d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB); b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA); b = addUnsigned(b, BB); c = addUnsigned(c, CC); d = addUnsigned(d, DD);
    }
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

/**
 * PHP-compatible urlencode function
 * PHP's urlencode() encodes spaces as '+', not '%20'
 * This is CRITICAL for PayFast signature matching
 * @param {string} str - String to encode
 * @returns {string} - URL encoded string with spaces as +
 */
function phpUrlencode(str) {
    return encodeURIComponent(String(str).trim())
        .replace(/%20/g, '+');  // PHP urlencode uses + for spaces
}

/**
 * Generate PayFast signature
 * IMPORTANT: Must match PHP's signature generation exactly
 * - Parameters in exact order as per documentation
 * - Spaces encoded as + (PHP urlencode behavior)
 * - Empty values excluded
 * @param {Array} orderedParams - Array of [key, value] pairs in correct order
 * @param {string} passphrase - PayFast passphrase
 * @returns {string} - MD5 signature
 */
function generateSignature(orderedParams, passphrase) {
    // Create parameter string from ordered params (excluding empty values)
    let paramString = '';
    for (const [key, value] of orderedParams) {
        if (value !== '' && value !== undefined && value !== null) {
            paramString += `${key}=${phpUrlencode(value)}&`;
        }
    }
    // Remove trailing ampersand
    paramString = paramString.slice(0, -1);

    // Append passphrase if provided
    if (passphrase) {
        paramString += `&passphrase=${phpUrlencode(passphrase)}`;
    }

    // Debug: log the parameter string (remove in production)
    console.log('PayFast param string for signature:', paramString);

    return md5(paramString);
}

/**
 * Build PayFast payment parameters
 * @param {string} planId - 'pro' or 'business'
 * @param {boolean} yearly - true for yearly billing
 * @param {object} userInfo - { email, firstName, lastName }
 * @returns {object} - Payment parameters with signature
 */
export function buildPaymentParams(planId, yearly = false, userInfo = {}) {
    const plan = PLANS[planId];
    if (!plan || planId === 'free') {
        throw new Error('Invalid plan for payment');
    }

    const amount = yearly ? plan.yearlyPrice : plan.price;
    const itemName = `TaskNest ${plan.name} - ${yearly ? 'Yearly' : 'Monthly'}`;
    const paymentId = `TN-${planId.toUpperCase()}-${Date.now()}`;

    // Store payment ID for later verification
    localStorage.setItem('tasknest_pending_payment', JSON.stringify({
        paymentId,
        planId,
        yearly,
        amount,
        timestamp: Date.now(),
    }));

    // Build PayFast parameters in EXACT order as per documentation
    // Order: merchant details, customer details, transaction details, subscription details
    const orderedParams = [
        // Merchant details (required first)
        ['merchant_id', PAYFAST_CONFIG.merchantId],
        ['merchant_key', PAYFAST_CONFIG.merchantKey],
        ['return_url', PAYFAST_CONFIG.returnUrl],
        ['cancel_url', PAYFAST_CONFIG.cancelUrl],
        ['notify_url', PAYFAST_CONFIG.notifyUrl],
        // Customer details
        ['name_first', userInfo.firstName || 'User'],
        ['name_last', userInfo.lastName || ''],
        ['email_address', userInfo.email || 'user@example.com'],
        // Transaction details
        ['m_payment_id', paymentId],
        ['amount', amount.toFixed(2)],
        ['item_name', itemName],
        // Subscription details
        ['subscription_type', 1],
        ['billing_date', new Date().toISOString().split('T')[0]],
        ['recurring_amount', amount.toFixed(2)],
        ['frequency', yearly ? 6 : 3],
        ['cycles', 0],
    ];

    // Generate signature with ordered params
    const signature = generateSignature(orderedParams, PAYFAST_CONFIG.passphrase);

    // Build params object for form submission
    const params = {};
    for (const [key, value] of orderedParams) {
        if (value !== '' && value !== undefined && value !== null) {
            params[key] = value;
        }
    }
    params.signature = signature;

    return params;
}

/**
 * Get PayFast form action URL
 * @returns {string} - PayFast form action URL
 */
export function getPayFastUrl() {
    return PAYFAST_CONFIG.sandboxMode ? PAYFAST_URLS.sandbox : PAYFAST_URLS.production;
}

/**
 * Generate PayFast payment URL (for redirect method)
 * @param {string} planId - 'pro' or 'business'
 * @param {boolean} yearly - true for yearly billing
 * @param {object} userInfo - { email, firstName, lastName }
 * @returns {string} - PayFast payment URL
 */
export function generatePayFastUrl(planId, yearly = false, userInfo = {}) {
    const params = buildPaymentParams(planId, yearly, userInfo);
    const baseUrl = getPayFastUrl();

    const queryString = Object.entries(params)
        .filter(([_, value]) => value !== '' && value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return `${baseUrl}?${queryString}`;
}

/**
 * Get upgrade reason info based on feature
 * @param {string} feature - Feature key
 * @returns {object} - Upgrade reason info
 */
export function getUpgradeReason(feature) {
    return UPGRADE_REASONS[feature] || {
        title: 'Upgrade to Pro',
        message: 'Unlock premium features and boost your productivity.',
        feature: feature,
        icon: 'sparkles',
    };
}

/**
 * Get recommended plan based on feature
 * @param {string} feature - Feature key
 * @returns {string} - Recommended plan ID
 */
export function getRecommendedPlan(feature) {
    const businessOnlyFeatures = ['clientBooking', 'analytics', 'brandingRemoval'];
    return businessOnlyFeatures.includes(feature) ? 'business' : 'pro';
}

/**
 * Get subscription status from localStorage
 * In production, this would call your backend API
 */
export function getSubscriptionStatus() {
    const status = localStorage.getItem('tasknest_subscription');
    return status ? JSON.parse(status) : { plan: 'free', status: 'active' };
}

/**
 * Activate subscription after successful payment
 * @param {string} planId - The plan to activate
 * @param {object} details - Additional subscription details
 */
export function activateSubscription(planId, details = {}) {
    const isYearly = details.yearly || false;
    const daysToAdd = isYearly ? 365 : 30;

    const subscription = {
        plan: planId,
        status: 'active',
        startDate: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString(),
        billingCycle: isYearly ? 'yearly' : 'monthly',
        ...details,
    };
    localStorage.setItem('tasknest_subscription', JSON.stringify(subscription));
    localStorage.removeItem('tasknest_pending_payment');

    // Add to billing history
    addBillingRecord({
        id: `inv_${Date.now()}`,
        date: new Date().toISOString(),
        amount: isYearly ? PLANS[planId]?.yearlyPrice : PLANS[planId]?.price,
        status: 'paid',
        description: `TaskNest ${PLANS[planId]?.name} - ${isYearly ? 'Yearly' : 'Monthly'}`,
    });

    return subscription;
}

/**
 * Add a billing record to history
 * @param {object} record - Billing record
 */
function addBillingRecord(record) {
    const history = getBillingHistory();
    history.unshift(record);
    localStorage.setItem('tasknest_billing_history', JSON.stringify(history.slice(0, 24))); // Keep last 24 records
}

/**
 * Cancel subscription
 * In production, this would call PayFast API to cancel recurring payments
 * @param {string} token - PayFast subscription token
 */
export async function cancelSubscription(token) {
    // Mock cancellation - in production call PayFast API:
    // PUT https://api.payfast.co.za/subscriptions/{token}/cancel

    console.log('Cancelling subscription with token:', token);

    const current = getSubscriptionStatus();
    const updated = {
        ...current,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        // Keep access until end of billing period
        accessUntil: current.nextBillingDate,
    };
    localStorage.setItem('tasknest_subscription', JSON.stringify(updated));

    return { success: true, subscription: updated };
}

/**
 * Pause subscription
 * @param {string} token - PayFast subscription token
 */
export async function pauseSubscription(token) {
    // Mock pause - in production call PayFast API:
    // PUT https://api.payfast.co.za/subscriptions/{token}/pause

    const current = getSubscriptionStatus();
    const updated = {
        ...current,
        status: 'paused',
        pausedAt: new Date().toISOString(),
    };
    localStorage.setItem('tasknest_subscription', JSON.stringify(updated));

    return { success: true, subscription: updated };
}

/**
 * Resume paused subscription
 * @param {string} token - PayFast subscription token
 */
export async function resumeSubscription(token) {
    // Mock resume - in production call PayFast API:
    // PUT https://api.payfast.co.za/subscriptions/{token}/unpause

    const current = getSubscriptionStatus();
    const updated = {
        ...current,
        status: 'active',
        resumedAt: new Date().toISOString(),
        pausedAt: null,
    };
    localStorage.setItem('tasknest_subscription', JSON.stringify(updated));

    return { success: true, subscription: updated };
}

/**
 * Check if user has access to a premium feature
 * @param {string} feature - Feature key
 * @returns {boolean} - Whether user has access
 */
export function hasFeatureAccess(feature) {
    const { plan, status, accessUntil } = getSubscriptionStatus();

    // If cancelled but still within access period
    if (status === 'cancelled' && accessUntil) {
        const accessDate = new Date(accessUntil);
        if (accessDate < new Date()) {
            return false; // Access period expired
        }
    }

    // Paused subscriptions lose access
    if (status === 'paused') {
        return false;
    }

    const featureAccess = {
        aiAssistant: ['pro', 'business'],
        smartScheduling: ['pro', 'business'],
        recurringTasks: ['pro', 'business'],
        clientBooking: ['business'],
        unlimitedTasks: ['pro', 'business'],
        unlimitedAppointments: ['pro', 'business'],
        analytics: ['business'],
        brandingRemoval: ['business'],
    };

    const requiredPlans = featureAccess[feature] || [];
    return requiredPlans.includes(plan);
}

/**
 * Get usage from localStorage
 * @returns {object} - Usage data
 */
export function getUsage() {
    const usage = localStorage.getItem('tasknest_usage');
    return usage ? JSON.parse(usage) : {
        tasksCreated: 0,
        appointmentsThisMonth: 0,
        aiMessagesToday: 0,
        lastAIMessageDate: null,
    };
}

/**
 * Check if user can perform an action based on limits
 * @param {string} action - 'createTask', 'createAppointment', 'useAI'
 * @returns {object} - { allowed, remaining, reason }
 */
export function checkActionLimit(action) {
    const { plan } = getSubscriptionStatus();

    // Premium plans have no limits
    if (plan !== 'free') {
        return { allowed: true, remaining: Infinity };
    }

    const usage = getUsage();

    switch (action) {
        case 'createTask':
            if (usage.tasksCreated >= FREE_LIMITS.maxTasks) {
                return {
                    allowed: false,
                    remaining: 0,
                    reason: 'taskLimit',
                };
            }
            return {
                allowed: true,
                remaining: FREE_LIMITS.maxTasks - usage.tasksCreated,
            };

        case 'createAppointment':
            if (usage.appointmentsThisMonth >= FREE_LIMITS.maxAppointmentsPerMonth) {
                return {
                    allowed: false,
                    remaining: 0,
                    reason: 'appointmentLimit',
                };
            }
            return {
                allowed: true,
                remaining: FREE_LIMITS.maxAppointmentsPerMonth - usage.appointmentsThisMonth,
            };

        case 'useAI':
            // Reset daily count if new day
            const today = new Date().toDateString();
            if (usage.lastAIMessageDate !== today) {
                return {
                    allowed: true,
                    remaining: FREE_LIMITS.maxAIMessagesPerDay,
                    isNewDay: true,
                };
            }
            if (usage.aiMessagesToday >= FREE_LIMITS.maxAIMessagesPerDay) {
                return {
                    allowed: false,
                    remaining: 0,
                    reason: 'aiAssistant',
                };
            }
            return {
                allowed: true,
                remaining: FREE_LIMITS.maxAIMessagesPerDay - usage.aiMessagesToday,
            };

        default:
            return { allowed: true };
    }
}

/**
 * Get pending payment info (for payment success page)
 */
export function getPendingPayment() {
    const pending = localStorage.getItem('tasknest_pending_payment');
    return pending ? JSON.parse(pending) : null;
}

/**
 * Validate ITN (Instant Transaction Notification) payload
 * Note: This should be done on your backend server
 * @param {object} payload - ITN data from PayFast
 */
export function validateITNPayload(payload) {
    // This is a structure for validation - implement on backend
    const requiredFields = [
        'm_payment_id',
        'pf_payment_id',
        'payment_status',
        'item_name',
        'amount_gross',
    ];

    // Check required fields
    for (const field of requiredFields) {
        if (!payload[field]) {
            return { valid: false, error: `Missing required field: ${field}` };
        }
    }

    // Verify signature
    const calculatedSig = generateSignature(payload, PAYFAST_CONFIG.passphrase);
    if (calculatedSig !== payload.signature) {
        return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true };
}

/**
 * Get billing history
 * @returns {array} - Billing history records
 */
export function getBillingHistory() {
    const history = localStorage.getItem('tasknest_billing_history');
    if (history) {
        return JSON.parse(history);
    }

    // Return mock history for demo if user has a subscription
    const subscription = getSubscriptionStatus();
    if (subscription.plan === 'free') {
        return [];
    }

    return [
        {
            id: 'inv_001',
            date: subscription.startDate || new Date().toISOString(),
            amount: PLANS[subscription.plan]?.price || 0,
            status: 'paid',
            description: `TaskNest ${PLANS[subscription.plan]?.name} - Monthly`,
        },
    ];
}

/**
 * Check if current subscription is in grace period (cancelled but still active)
 * @returns {object} - { inGracePeriod, daysRemaining }
 */
export function getGracePeriodStatus() {
    const { status, accessUntil } = getSubscriptionStatus();

    if (status !== 'cancelled' || !accessUntil) {
        return { inGracePeriod: false };
    }

    const accessDate = new Date(accessUntil);
    const now = new Date();

    if (accessDate <= now) {
        return { inGracePeriod: false, expired: true };
    }

    const daysRemaining = Math.ceil((accessDate - now) / (1000 * 60 * 60 * 24));
    return { inGracePeriod: true, daysRemaining };
}
