/**
 * Marketing Intelligence Service
 * Multi-Industry Marketing Engine with Campaign Management,
 * Industry Pods, Content Generation, and Cross-Pollination
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getStorage(key, fallback = null) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch { return fallback; }
}

function setStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ─── Industry Pod Definitions ────────────────────────────────────────────────

export const INDUSTRY_PODS = [
    {
        id: 'taxi',
        name: 'Taxi & Rides',
        icon: '🚕',
        color: '#f59e0b',
        gradient: 'from-amber-500 to-yellow-600',
        peakHours: [7, 8, 9, 17, 18, 19],
        seoKeywords: ['ride share', 'taxi near me', 'affordable cab', 'luxury ride-share', 'airport taxi'],
        usps: ['Taxi Bidding', 'Set Your Own Fare', 'SOS Emergency Call', 'VOIP Call Masking'],
        crossPromo: ['food', 'grocery'],
    },
    {
        id: 'food',
        name: 'Food Delivery',
        icon: '🍕',
        color: '#ef4444',
        gradient: 'from-red-500 to-orange-600',
        peakHours: [11, 12, 13, 18, 19, 20, 21],
        seoKeywords: ['food delivery', 'order food online', 'quick lunch delivery', 'restaurant near me', 'dinner delivery'],
        usps: ['30-Min Delivery', 'Restaurant Bidding', 'Live Tracking', 'Universal Wallet'],
        crossPromo: ['taxi', 'grocery'],
    },
    {
        id: 'grocery',
        name: 'Grocery & Stores',
        icon: '🛒',
        color: '#10b981',
        gradient: 'from-emerald-500 to-green-600',
        peakHours: [9, 10, 11, 16, 17, 18],
        seoKeywords: ['grocery delivery', 'quick grocery delivery', 'online supermarket', 'same-day grocery', 'fresh produce delivery'],
        usps: ['Same-Day Delivery', 'Price Comparison', 'Loyalty Points', 'Universal Wallet'],
        crossPromo: ['food', 'cleaning'],
    },
    {
        id: 'handyman',
        name: 'Handyman Services',
        icon: '🔧',
        color: '#3b82f6',
        gradient: 'from-blue-500 to-indigo-600',
        peakHours: [8, 9, 10, 14, 15, 16],
        seoKeywords: ['emergency plumber', 'electrician near me', 'handyman services', 'home repair', 'handyman bidding'],
        usps: ['Handyman Bidding', 'Verified Professionals', 'SOS Emergency Call', 'In-App Chat'],
        crossPromo: ['cleaning', 'courier'],
    },
    {
        id: 'cleaning',
        name: 'Home Cleaning',
        icon: '🏠',
        color: '#8b5cf6',
        gradient: 'from-violet-500 to-purple-600',
        peakHours: [8, 9, 10, 14, 15],
        seoKeywords: ['home cleaning service', 'deep cleaning near me', 'office cleaning', 'weekly cleaner', 'move-out cleaning'],
        usps: ['Weekend Availability', 'Vetted Cleaners', 'Book in 60 Seconds', 'Loyalty Rewards'],
        crossPromo: ['handyman', 'flower'],
    },
    {
        id: 'flower',
        name: 'Flower Delivery',
        icon: '💐',
        color: '#ec4899',
        gradient: 'from-pink-500 to-rose-600',
        peakHours: [8, 9, 10, 11, 14, 15],
        seoKeywords: ['flower delivery', 'send flowers online', 'same day bouquet', 'birthday flowers', 'anniversary flowers'],
        usps: ['Same-Day Delivery', 'Gift Wrapping', 'Personal Message Card', 'Surprise Delivery'],
        crossPromo: ['food', 'courier'],
    },
    {
        id: 'video_consult',
        name: 'Video Consultancy',
        icon: '📹',
        color: '#06b6d4',
        gradient: 'from-cyan-500 to-teal-600',
        peakHours: [9, 10, 11, 14, 15, 16, 17],
        seoKeywords: ['online doctor', 'video consultation', 'telehealth', 'virtual lawyer', 'online tutor'],
        usps: ['HD Video Calls', 'Verified Professionals', 'Instant Booking', 'Secure & Private'],
        crossPromo: ['taxi', 'handyman'],
    },
    {
        id: 'courier',
        name: 'Courier & Parcels',
        icon: '📦',
        color: '#f97316',
        gradient: 'from-orange-500 to-amber-600',
        peakHours: [9, 10, 11, 14, 15, 16],
        seoKeywords: ['same day courier', 'parcel delivery', 'package delivery near me', 'express courier', 'document delivery'],
        usps: ['Real-Time Tracking', 'Express Delivery', 'Insurance Coverage', 'Business Accounts'],
        crossPromo: ['flower', 'grocery'],
    },
];

// ─── Campaign Templates (PAS Framework) ──────────────────────────────────────

const PAS_TEMPLATES = {
    first_order: {
        name: 'First Order Discount',
        problem: 'New users hesitate to try an unfamiliar platform.',
        agitate: 'Every minute they wait, they miss out on faster, cheaper service than competitors.',
        solution: 'Get {discount}% off your first {service} order. Zero risk, instant savings.',
    },
    cross_pollinate: {
        name: 'Cross-Service Promo',
        problem: 'Users only use one service and miss the ecosystem benefits.',
        agitate: 'They\'re paying full price elsewhere when their loyalty points could save them money across all services.',
        solution: 'You just used {service_a}! Here\'s {discount}% off your next {service_b} — your Universal Wallet rewards work everywhere.',
    },
    bidding: {
        name: 'Bidding Feature Launch',
        problem: 'Fixed pricing means users overpay during off-peak hours.',
        agitate: 'Competitors lock you into inflated prices. You deserve to set your own fare.',
        solution: 'Introducing {service} Bidding — name your price and let providers compete for your business.',
    },
    safety: {
        name: 'Safety Campaign',
        problem: 'Users worry about security when inviting strangers into their home or car.',
        agitate: 'One bad experience ruins trust forever. Other platforms lack real safety measures.',
        solution: 'Every {service} provider is verified. Plus SOS Emergency Call + VOIP Call Masking come standard.',
    },
    loyalty: {
        name: 'Loyalty Boost',
        problem: 'Customers switch between platforms for the best deal.',
        agitate: 'Without a reward system, there\'s no incentive to stay loyal.',
        solution: 'Earn Reward Points on every order. Use them across ALL {count}+ services in one Universal Wallet.',
    },
    seasonal: {
        name: 'Seasonal Campaign',
        problem: 'Seasonal demand spikes leave users scrambling for availability.',
        agitate: 'Last-minute bookings mean higher prices and longer waits.',
        solution: 'Book your {service} early this {season}. Priority access + {discount}% early bird discount.',
    },
};

// ─── Default Seed Data ───────────────────────────────────────────────────────

const DEFAULT_CAMPAIGNS = [
    {
        id: 'camp_001',
        name: 'Launch Week Blitz',
        industry: 'taxi',
        template: 'first_order',
        status: 'active',
        budget: 5000,
        spent: 3200,
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        target: 'new_users',
        discount: 25,
        pas: {
            problem: 'Tired of overpriced rides with surge pricing?',
            agitate: 'Every ride with competitors costs you 30% more during peak hours.',
            solution: 'Get 25% off your first 5 rides. Set your own fare with Taxi Bidding.',
        },
        metrics: { impressions: 45200, clicks: 3850, conversions: 412, revenue: 18500 },
        createdAt: '2026-02-01T00:00:00Z',
    },
    {
        id: 'camp_002',
        name: 'Lunch Rush Promo',
        industry: 'food',
        template: 'seasonal',
        status: 'active',
        budget: 3000,
        spent: 1800,
        startDate: '2026-02-10',
        endDate: '2026-03-10',
        target: 'returning_users',
        discount: 15,
        pas: {
            problem: 'Hungry at work but no time to leave the office?',
            agitate: 'Cold leftovers and vending machines shouldn\'t be your only option.',
            solution: '15% off lunch orders between 11AM-2PM. Hot food at your desk in 30 minutes.',
        },
        metrics: { impressions: 32100, clicks: 2890, conversions: 367, revenue: 12400 },
        createdAt: '2026-02-10T00:00:00Z',
    },
    {
        id: 'camp_003',
        name: 'Safety First',
        industry: 'handyman',
        template: 'safety',
        status: 'paused',
        budget: 2000,
        spent: 800,
        startDate: '2026-02-15',
        endDate: '2026-03-15',
        target: 'all_users',
        discount: 0,
        pas: {
            problem: 'Worried about letting a stranger into your home for repairs?',
            agitate: 'Unverified handymen from classifieds have no accountability.',
            solution: 'Every handyman is background-checked. SOS Emergency Call comes standard.',
        },
        metrics: { impressions: 12400, clicks: 980, conversions: 89, revenue: 4200 },
        createdAt: '2026-02-15T00:00:00Z',
    },
    {
        id: 'camp_004',
        name: 'Cross-Sell: Food → Ride',
        industry: 'taxi',
        template: 'cross_pollinate',
        status: 'draft',
        budget: 1500,
        spent: 0,
        startDate: '2026-03-01',
        endDate: '2026-03-31',
        target: 'food_users',
        discount: 20,
        pas: {
            problem: 'You ordered dinner but still need a ride home.',
            agitate: 'Why pay full price for a separate app when you already have credits here?',
            solution: 'Food lovers get 20% off their next ride. Your Universal Wallet works everywhere.',
        },
        metrics: { impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
        createdAt: '2026-02-20T00:00:00Z',
    },
];

const DEFAULT_POD_METRICS = {
    taxi: { users: 12400, orders: 8900, revenue: 245000, growth: 12.5, avgRating: 4.6, completionRate: 94 },
    food: { users: 18200, orders: 15600, revenue: 380000, growth: 18.2, avgRating: 4.4, completionRate: 91 },
    grocery: { users: 8900, orders: 6200, revenue: 195000, growth: 8.7, avgRating: 4.5, completionRate: 89 },
    handyman: { users: 4200, orders: 2800, revenue: 142000, growth: 22.1, avgRating: 4.7, completionRate: 87 },
    cleaning: { users: 5600, orders: 3900, revenue: 115000, growth: 15.4, avgRating: 4.8, completionRate: 92 },
    flower: { users: 2100, orders: 1400, revenue: 68000, growth: -3.2, avgRating: 4.6, completionRate: 85 },
    video_consult: { users: 3800, orders: 2100, revenue: 210000, growth: 28.6, avgRating: 4.9, completionRate: 96 },
    courier: { users: 6700, orders: 5100, revenue: 153000, growth: 11.3, avgRating: 4.3, completionRate: 88 },
};

// ─── Campaign CRUD ───────────────────────────────────────────────────────────

export async function getCampaigns() {
    await delay(200);
    return getStorage('marketing_campaigns', DEFAULT_CAMPAIGNS);
}

export async function getCampaign(id) {
    await delay(100);
    const campaigns = await getCampaigns();
    return campaigns.find(c => c.id === id) || null;
}

export async function createCampaign(data) {
    await delay(300);
    const campaigns = await getCampaigns();
    const newCampaign = {
        id: `camp_${Date.now()}`,
        status: 'draft',
        spent: 0,
        metrics: { impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
        createdAt: new Date().toISOString(),
        ...data,
    };
    campaigns.unshift(newCampaign);
    setStorage('marketing_campaigns', campaigns);
    return newCampaign;
}

export async function updateCampaign(id, updates) {
    await delay(200);
    const campaigns = await getCampaigns();
    const idx = campaigns.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Campaign not found');
    campaigns[idx] = { ...campaigns[idx], ...updates };
    setStorage('marketing_campaigns', campaigns);
    return campaigns[idx];
}

export async function deleteCampaign(id) {
    await delay(200);
    const campaigns = await getCampaigns();
    setStorage('marketing_campaigns', campaigns.filter(c => c.id !== id));
    return true;
}

// ─── Industry Pod Metrics ────────────────────────────────────────────────────

export async function getPodMetrics() {
    await delay(200);
    return getStorage('marketing_pod_metrics', DEFAULT_POD_METRICS);
}

export async function updatePodMetrics(podId, updates) {
    await delay(100);
    const metrics = await getPodMetrics();
    metrics[podId] = { ...metrics[podId], ...updates };
    setStorage('marketing_pod_metrics', metrics);
    return metrics[podId];
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function getMarketingOverview() {
    await delay(200);
    const campaigns = await getCampaigns();
    const podMetrics = await getPodMetrics();

    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
    const totalImpressions = campaigns.reduce((s, c) => s + c.metrics.impressions, 0);
    const totalClicks = campaigns.reduce((s, c) => s + c.metrics.clicks, 0);
    const totalConversions = campaigns.reduce((s, c) => s + c.metrics.conversions, 0);
    const totalCampaignRevenue = campaigns.reduce((s, c) => s + c.metrics.revenue, 0);

    const totalPlatformRevenue = Object.values(podMetrics).reduce((s, p) => s + p.revenue, 0);
    const totalUsers = Object.values(podMetrics).reduce((s, p) => s + p.users, 0);
    const totalOrders = Object.values(podMetrics).reduce((s, p) => s + p.orders, 0);

    return {
        activeCampaigns: activeCampaigns.length,
        totalCampaigns: campaigns.length,
        totalBudget,
        totalSpent,
        budgetUtilization: totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0,
        totalImpressions,
        totalClicks,
        ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0,
        totalConversions,
        conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0,
        totalCampaignRevenue,
        roi: totalSpent > 0 ? (((totalCampaignRevenue - totalSpent) / totalSpent) * 100).toFixed(1) : 0,
        totalPlatformRevenue,
        totalUsers,
        totalOrders,
    };
}

// ─── Cross-Pollination Suggestions ──────────────────────────────────────────

export function getCrossPollinationSuggestions(podId) {
    const pod = INDUSTRY_PODS.find(p => p.id === podId);
    if (!pod) return [];

    return pod.crossPromo.map(targetId => {
        const target = INDUSTRY_PODS.find(p => p.id === targetId);
        return {
            from: pod,
            to: target,
            suggestion: `Users who use ${pod.name} should get a promo for ${target.name}`,
            template: PAS_TEMPLATES.cross_pollinate,
            discount: 15 + Math.floor(Math.random() * 10),
        };
    });
}

// ─── Content Generation (PAS Framework) ──────────────────────────────────────

export function generatePASContent(industry, template, variables = {}) {
    const pod = INDUSTRY_PODS.find(p => p.id === industry);
    const tmpl = PAS_TEMPLATES[template];
    if (!pod || !tmpl) return null;

    const vars = {
        service: pod.name,
        discount: variables.discount || 20,
        service_a: variables.service_a || pod.name,
        service_b: variables.service_b || (INDUSTRY_PODS.find(p => pod.crossPromo.includes(p.id))?.name || 'another service'),
        season: variables.season || getCurrentSeason(),
        count: '100',
        ...variables,
    };

    const interpolate = (str) => str.replace(/\{(\w+)\}/g, (_, key) => vars[key] || key);

    return {
        templateName: tmpl.name,
        industry: pod.name,
        icon: pod.icon,
        color: pod.color,
        problem: interpolate(tmpl.problem),
        agitate: interpolate(tmpl.agitate),
        solution: interpolate(tmpl.solution),
        headline: generateHeadline(pod, template, vars),
        cta: generateCTA(template, vars),
        hashtags: generateHashtags(pod),
    };
}

function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Autumn';
    if (month >= 5 && month <= 7) return 'Winter';
    if (month >= 8 && month <= 10) return 'Spring';
    return 'Summer';
}

function generateHeadline(pod, template, vars) {
    const headlines = {
        first_order: `🎉 ${vars.discount}% Off Your First ${pod.name} Order`,
        cross_pollinate: `💡 ${pod.name} Users Get ${vars.discount}% Off ${vars.service_b}`,
        bidding: `💰 Name Your Price with ${pod.name} Bidding`,
        safety: `🛡️ Your Safety is Our Priority — ${pod.name}`,
        loyalty: `⭐ Earn Rewards on Every ${pod.name} Order`,
        seasonal: `🌟 ${vars.season} Special: ${vars.discount}% Off ${pod.name}`,
    };
    return headlines[template] || `Discover ${pod.name}`;
}

function generateCTA(template, vars) {
    const ctas = {
        first_order: `Claim Your ${vars.discount}% Discount →`,
        cross_pollinate: `Unlock Your Cross-Service Savings →`,
        bidding: `Start Bidding Now →`,
        safety: `Book a Verified Professional →`,
        loyalty: `Start Earning Rewards →`,
        seasonal: `Book Early & Save ${vars.discount}% →`,
    };
    return ctas[template] || 'Get Started →';
}

function generateHashtags(pod) {
    const base = ['#SuperApp', '#OnDemand', '#LocalServices'];
    const industry = {
        taxi: ['#RideShare', '#TaxiBidding', '#YourFareYourWay'],
        food: ['#FoodDelivery', '#OrderNow', '#HungryNoMore'],
        grocery: ['#GroceryDelivery', '#FreshProduce', '#ShopFromHome'],
        handyman: ['#HandymanServices', '#HomeRepair', '#FixItNow'],
        cleaning: ['#HomeCleaning', '#DeepClean', '#SparklingClean'],
        flower: ['#FlowerDelivery', '#SurpriseDelivery', '#FreshFlowers'],
        video_consult: ['#Telehealth', '#OnlineConsultation', '#VirtualExpert'],
        courier: ['#SameDayCourier', '#ExpressDelivery', '#ParcelService'],
    };
    return [...base, ...(industry[pod.id] || [])];
}

// ─── Time-of-Day Activity Checker ────────────────────────────────────────────

export function getActivePodsNow() {
    const currentHour = new Date().getHours();
    return INDUSTRY_PODS.filter(pod => pod.peakHours.includes(currentHour));
}

export function getTimeSuggestions() {
    const hour = new Date().getHours();
    const suggestions = [];

    if (hour >= 6 && hour <= 9) {
        suggestions.push({ pod: 'taxi', msg: '🚕 Morning commute — push Taxi Ride promos' });
        suggestions.push({ pod: 'food', msg: '☕ Breakfast window — promote breakfast delivery bundles' });
    } else if (hour >= 11 && hour <= 14) {
        suggestions.push({ pod: 'food', msg: '🍕 Lunch rush — activate food delivery campaigns' });
        suggestions.push({ pod: 'grocery', msg: '🛒 Midday — push grocery top-up orders' });
    } else if (hour >= 17 && hour <= 21) {
        suggestions.push({ pod: 'taxi', msg: '🚕 Evening commute — boost ride-share promos' });
        suggestions.push({ pod: 'food', msg: '🍔 Dinner time — maximize food delivery visibility' });
        suggestions.push({ pod: 'cleaning', msg: '🏠 Weekend prep — promote cleaning bookings' });
    } else {
        suggestions.push({ pod: 'video_consult', msg: '📹 Off-peak — promote video consultations' });
        suggestions.push({ pod: 'courier', msg: '📦 Business hours — push courier services' });
    }

    return suggestions;
}

// ─── PAS Templates Export ────────────────────────────────────────────────────

export function getPASTemplates() {
    return Object.entries(PAS_TEMPLATES).map(([id, tmpl]) => ({ id, ...tmpl }));
}

// ─── SEO Analytics ───────────────────────────────────────────────────────────

const SEO_DATA = {
    taxi: [
        { keyword: 'ride share near me', rank: 3, volume: 14800, difficulty: 72, trend: 'up' },
        { keyword: 'affordable cab booking', rank: 5, volume: 9200, difficulty: 65, trend: 'up' },
        { keyword: 'taxi bidding app', rank: 1, volume: 3400, difficulty: 28, trend: 'up' },
        { keyword: 'luxury ride-share', rank: 8, volume: 6100, difficulty: 78, trend: 'stable' },
        { keyword: 'airport taxi service', rank: 4, volume: 18500, difficulty: 81, trend: 'down' },
        { keyword: 'set your own fare ride', rank: 2, volume: 2100, difficulty: 22, trend: 'up' },
    ],
    food: [
        { keyword: 'food delivery near me', rank: 6, volume: 42000, difficulty: 92, trend: 'stable' },
        { keyword: 'quick lunch delivery', rank: 2, volume: 15600, difficulty: 68, trend: 'up' },
        { keyword: 'order food online', rank: 9, volume: 38000, difficulty: 95, trend: 'stable' },
        { keyword: 'restaurant delivery app', rank: 4, volume: 12400, difficulty: 74, trend: 'up' },
        { keyword: '30 minute food delivery', rank: 1, volume: 8900, difficulty: 45, trend: 'up' },
        { keyword: 'dinner delivery tonight', rank: 3, volume: 7200, difficulty: 52, trend: 'up' },
    ],
    grocery: [
        { keyword: 'grocery delivery same day', rank: 3, volume: 22000, difficulty: 78, trend: 'up' },
        { keyword: 'online supermarket', rank: 7, volume: 18500, difficulty: 88, trend: 'stable' },
        { keyword: 'fresh produce delivery', rank: 2, volume: 8400, difficulty: 55, trend: 'up' },
        { keyword: 'quick grocery delivery', rank: 1, volume: 11200, difficulty: 62, trend: 'up' },
        { keyword: 'weekly grocery order', rank: 5, volume: 6800, difficulty: 48, trend: 'stable' },
    ],
    handyman: [
        { keyword: 'emergency plumber near me', rank: 2, volume: 24000, difficulty: 76, trend: 'up' },
        { keyword: 'electrician near me', rank: 5, volume: 31000, difficulty: 85, trend: 'stable' },
        { keyword: 'handyman bidding', rank: 1, volume: 2800, difficulty: 18, trend: 'up' },
        { keyword: 'verified handyman service', rank: 3, volume: 5600, difficulty: 42, trend: 'up' },
        { keyword: 'home repair app', rank: 4, volume: 9200, difficulty: 64, trend: 'up' },
    ],
    cleaning: [
        { keyword: 'home cleaning service', rank: 4, volume: 19000, difficulty: 74, trend: 'stable' },
        { keyword: 'deep cleaning near me', rank: 2, volume: 15200, difficulty: 68, trend: 'up' },
        { keyword: 'office cleaning service', rank: 6, volume: 12800, difficulty: 72, trend: 'stable' },
        { keyword: 'move-out cleaning', rank: 1, volume: 8400, difficulty: 45, trend: 'up' },
        { keyword: 'weekly cleaner booking', rank: 3, volume: 6200, difficulty: 38, trend: 'up' },
    ],
    flower: [
        { keyword: 'flower delivery same day', rank: 3, volume: 16000, difficulty: 72, trend: 'up' },
        { keyword: 'send flowers online', rank: 5, volume: 21000, difficulty: 82, trend: 'stable' },
        { keyword: 'birthday flower delivery', rank: 2, volume: 12400, difficulty: 65, trend: 'up' },
        { keyword: 'surprise flower delivery', rank: 1, volume: 4800, difficulty: 35, trend: 'up' },
    ],
    video_consult: [
        { keyword: 'online doctor consultation', rank: 4, volume: 28000, difficulty: 82, trend: 'up' },
        { keyword: 'video consultation app', rank: 2, volume: 9400, difficulty: 55, trend: 'up' },
        { keyword: 'telehealth platform', rank: 6, volume: 18200, difficulty: 88, trend: 'stable' },
        { keyword: 'virtual lawyer consultation', rank: 1, volume: 5600, difficulty: 42, trend: 'up' },
        { keyword: 'online tutor booking', rank: 3, volume: 11200, difficulty: 58, trend: 'up' },
    ],
    courier: [
        { keyword: 'same day courier', rank: 3, volume: 15600, difficulty: 70, trend: 'up' },
        { keyword: 'parcel delivery near me', rank: 5, volume: 22000, difficulty: 80, trend: 'stable' },
        { keyword: 'express courier service', rank: 2, volume: 9800, difficulty: 62, trend: 'up' },
        { keyword: 'document delivery today', rank: 1, volume: 4200, difficulty: 32, trend: 'up' },
    ],
};

export async function getSEOAnalytics(podId = null) {
    await delay(200);
    if (podId) return SEO_DATA[podId] || [];
    return SEO_DATA;
}

export function getSEOSearchTrends() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => ({
        month: m,
        organic: Math.floor(1200 + Math.random() * 3800),
        paid: Math.floor(800 + Math.random() * 2200),
        social: Math.floor(400 + Math.random() * 1500),
    }));
}

// ─── Competitor Analysis (Munus Concept) ─────────────────────────────────────

const COMPETITORS = [
    { name: 'RideApp', industry: 'taxi', pricing: 'R12/km', rating: 4.2, marketShare: 35, weaknesses: ['No bidding', 'Surge pricing', 'No safety features'] },
    { name: 'QuickEats', industry: 'food', pricing: 'R15 delivery fee', rating: 4.1, marketShare: 28, weaknesses: ['Slow delivery', 'Limited restaurants', 'No loyalty program'] },
    { name: 'HomeFixIt', industry: 'handyman', pricing: 'R250/hour', rating: 3.9, marketShare: 22, weaknesses: ['No verification', 'No bidding', 'No insurance'] },
    { name: 'CleanPro', industry: 'cleaning', pricing: 'R350/session', rating: 4.0, marketShare: 18, weaknesses: ['Limited availability', 'No real-time tracking', 'No loyalty points'] },
    { name: 'FreshMart', industry: 'grocery', pricing: 'R25 delivery', rating: 4.3, marketShare: 31, weaknesses: ['Next-day only', 'No price comparison', 'No universal wallet'] },
    { name: 'DocOnline', industry: 'video_consult', pricing: 'R450/session', rating: 4.4, marketShare: 25, weaknesses: ['Doctors only', 'No instant booking', 'Long wait times'] },
];

export async function getCompetitorAnalysis(industry = null) {
    await delay(200);
    if (industry) return COMPETITORS.filter(c => c.industry === industry);
    return COMPETITORS;
}

// ─── Loyalty & Wallet Metrics ────────────────────────────────────────────────

export async function getLoyaltyMetrics() {
    await delay(200);
    return {
        totalWallets: 42800,
        activeWallets: 31200,
        totalPointsIssued: 2450000,
        totalPointsRedeemed: 1820000,
        avgPointsPerUser: 57,
        crossServiceUsage: 38.5,
        walletBalance: 184500,
        monthlyGrowth: 14.2,
        topRedemptions: [
            { service: 'Food Delivery', points: 560000, icon: '🍕' },
            { service: 'Taxi & Rides', points: 420000, icon: '🚕' },
            { service: 'Grocery', points: 310000, icon: '🛒' },
            { service: 'Home Cleaning', points: 180000, icon: '🏠' },
            { service: 'Handyman', points: 150000, icon: '🔧' },
            { service: 'Courier', points: 120000, icon: '📦' },
            { service: 'Video Consult', points: 80000, icon: '📹' },
        ],
        crossPollinationStats: [
            { from: 'Food', to: 'Taxi', conversions: 1240, rate: 18.5 },
            { from: 'Taxi', to: 'Food', conversions: 980, rate: 15.2 },
            { from: 'Grocery', to: 'Cleaning', conversions: 650, rate: 12.8 },
            { from: 'Handyman', to: 'Cleaning', conversions: 420, rate: 22.1 },
            { from: 'Food', to: 'Grocery', conversions: 890, rate: 14.6 },
            { from: 'Flower', to: 'Food', conversions: 310, rate: 24.8 },
        ],
    };
}

// ─── Promo Schedule (30-Day Calendar) ────────────────────────────────────────

export function getPromoSchedule() {
    const today = new Date();
    const schedule = [];
    const promoTypes = [
        { type: 'flash_sale', label: 'Flash Sale', color: '#ef4444', icon: '⚡' },
        { type: 'cross_promo', label: 'Cross-Promo', color: '#3b82f6', icon: '🔄' },
        { type: 'loyalty_boost', label: 'Loyalty Boost', color: '#10b981', icon: '⭐' },
        { type: 'seasonal', label: 'Seasonal', color: '#f59e0b', icon: '🌟' },
        { type: 'safety_push', label: 'Safety Push', color: '#06b6d4', icon: '🛡️' },
    ];
    const pods = ['taxi', 'food', 'grocery', 'handyman', 'cleaning', 'flower', 'video_consult', 'courier'];

    for (let d = 0; d < 30; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() + d);
        if (Math.random() > 0.4) {
            const promo = promoTypes[Math.floor(Math.random() * promoTypes.length)];
            schedule.push({
                date: date.toISOString().split('T')[0],
                day: date.getDate(),
                weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
                ...promo,
                industry: pods[Math.floor(Math.random() * pods.length)],
                discount: 10 + Math.floor(Math.random() * 25),
            });
        }
    }
    return schedule;
}

// ─── Auto-Trigger Rules ──────────────────────────────────────────────────────

export function getAutoTriggers() {
    return [
        { id: 'at_001', name: 'Low Completion Recovery', condition: 'Completion rate < 85%', action: 'Launch 20% First Order discount', targetPod: 'any', status: 'active', triggered: 3 },
        { id: 'at_002', name: 'Cross-Sell: Food → Ride', condition: 'User completes food order', action: 'Send ride discount push notification', targetPod: 'food', status: 'active', triggered: 1240 },
        { id: 'at_003', name: 'Inactive User Win-Back', condition: 'No activity for 14 days', action: 'Send 25% comeback promo via email', targetPod: 'any', status: 'active', triggered: 856 },
        { id: 'at_004', name: 'Peak Hour Boost', condition: 'Pod enters peak hours', action: 'Increase ad spend by 30%', targetPod: 'any', status: 'paused', triggered: 0 },
        { id: 'at_005', name: 'Rating Drop Alert', condition: 'Avg rating drops below 4.0', action: 'Launch Safety Campaign + email to providers', targetPod: 'any', status: 'active', triggered: 1 },
        { id: 'at_006', name: 'Flower Low Volume', condition: 'Flower orders < 50/day', action: 'Activate 15% discount + cross-promo from Food', targetPod: 'flower', status: 'active', triggered: 12 },
    ];
}

// ─── Safety Feature Stats ────────────────────────────────────────────────────

export function getSafetyFeatures() {
    return {
        sosCallsTotal: 342,
        sosResponseAvg: '8 seconds',
        voipMaskedCalls: 28400,
        verifiedProviders: 4820,
        backgroundChecks: 5100,
        safetyRating: 4.9,
        safetyIncrease: 23.4,
        features: [
            { name: 'SOS Emergency Call', usage: 342, description: 'One-tap emergency call during any service', icon: '🆘', color: '#ef4444' },
            { name: 'VOIP Call Masking', usage: 28400, description: 'Phone numbers hidden between users and providers', icon: '📞', color: '#3b82f6' },
            { name: 'Provider Verification', usage: 4820, description: 'Background-checked and verified providers', icon: '✅', color: '#10b981' },
            { name: 'In-App Chat', usage: 15600, description: 'Secure messaging without sharing personal info', icon: '💬', color: '#8b5cf6' },
            { name: 'Real-Time Tracking', usage: 38200, description: 'Live GPS tracking for all delivery & ride services', icon: '📍', color: '#f59e0b' },
            { name: 'Insurance Coverage', usage: 2100, description: 'Built-in coverage for courier & handyman services', icon: '🛡️', color: '#06b6d4' },
        ],
    };
}

// ─── Bidding Stats ───────────────────────────────────────────────────────────

export function getBiddingStats() {
    return {
        totalBids: 24800,
        acceptedBids: 18600,
        avgSavings: 22,
        avgBidTime: '45 seconds',
        industries: [
            { name: 'Taxi Bidding', icon: '🚕', totalBids: 15200, accepted: 12100, avgSavings: 25, conversionRate: 79.6, avgFare: 'R85', userSatisfaction: 4.7 },
            { name: 'Handyman Bidding', icon: '🔧', totalBids: 6400, accepted: 4200, avgSavings: 18, conversionRate: 65.6, avgFare: 'R320', userSatisfaction: 4.5 },
            { name: 'Restaurant Bidding', icon: '🍕', totalBids: 3200, accepted: 2300, avgSavings: 15, conversionRate: 71.9, avgFare: 'R45', userSatisfaction: 4.3 },
        ],
        monthlyTrend: [
            { month: 'Sep', bids: 1200, accepted: 890 },
            { month: 'Oct', bids: 1800, accepted: 1350 },
            { month: 'Nov', bids: 2400, accepted: 1900 },
            { month: 'Dec', bids: 3100, accepted: 2500 },
            { month: 'Jan', bids: 3800, accepted: 3100 },
            { month: 'Feb', bids: 4200, accepted: 3400 },
        ],
    };
}
