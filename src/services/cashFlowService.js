/**
 * Cash Flow Service — Income & Expenditure tracking with Smart Scan support
 * Uses localStorage pattern consistent with billingService.js
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = (key, fallback = []) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
};

const setStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
    { id: 'groceries', label: 'Groceries', icon: '🛒', color: 'emerald' },
    { id: 'transport', label: 'Transport', icon: '🚗', color: 'blue' },
    { id: 'food', label: 'Food & Dining', icon: '🍽️', color: 'orange' },
    { id: 'utilities', label: 'Utilities', icon: '💡', color: 'yellow' },
    { id: 'rent', label: 'Rent & Housing', icon: '🏠', color: 'purple' },
    { id: 'tech', label: 'Tech & Software', icon: '💻', color: 'indigo' },
    { id: 'office', label: 'Office Supplies', icon: '📎', color: 'slate' },
    { id: 'travel', label: 'Travel', icon: '✈️', color: 'sky' },
    { id: 'insurance', label: 'Insurance', icon: '🛡️', color: 'teal' },
    { id: 'medical', label: 'Medical', icon: '🏥', color: 'red' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: 'pink' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '📦', color: 'violet' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧', color: 'amber' },
    { id: 'marketing', label: 'Marketing', icon: '📣', color: 'rose' },
    { id: 'other_expense', label: 'Other', icon: '📄', color: 'gray' },
];

export const INCOME_CATEGORIES = [
    { id: 'salary', label: 'Salary', icon: '💰', color: 'emerald' },
    { id: 'freelance', label: 'Freelance', icon: '💼', color: 'blue' },
    { id: 'invoice_payment', label: 'Invoice Payment', icon: '📄', color: 'indigo' },
    { id: 'investment', label: 'Investment', icon: '📈', color: 'green' },
    { id: 'refund', label: 'Refund', icon: '↩️', color: 'amber' },
    { id: 'gift', label: 'Gift', icon: '🎁', color: 'pink' },
    { id: 'other_income', label: 'Other', icon: '💵', color: 'gray' },
];

// ─── Auto-Categorization ─────────────────────────────────────────────────────

const VENDOR_CATEGORY_MAP = {
    // Groceries
    'woolworths': 'groceries', 'pick n pay': 'groceries', 'checkers': 'groceries',
    'spar': 'groceries', 'shoprite': 'groceries', 'food lover': 'groceries',
    'walmart': 'groceries', 'costco': 'groceries', 'aldi': 'groceries',
    'lidl': 'groceries', 'tesco': 'groceries', 'whole foods': 'groceries',
    // Transport
    'uber': 'transport', 'bolt': 'transport', 'shell': 'transport',
    'engen': 'transport', 'bp': 'transport', 'caltex': 'transport',
    'sasol': 'transport', 'total': 'transport', 'lyft': 'transport',
    // Food & Dining
    'kfc': 'food', 'nandos': 'food', "nando's": 'food', 'mcdonalds': 'food',
    "mcdonald's": 'food', 'steers': 'food', 'wimpy': 'food', 'spur': 'food',
    'starbucks': 'food', 'mugg & bean': 'food', 'ocean basket': 'food',
    'dominos': 'food', 'pizza': 'food', 'burger': 'food', 'restaurant': 'food',
    'cafe': 'food', 'coffee': 'food',
    // Tech
    'apple': 'tech', 'microsoft': 'tech', 'google': 'tech', 'amazon web': 'tech',
    'aws': 'tech', 'github': 'tech', 'digitalocean': 'tech', 'vercel': 'tech',
    'netlify': 'tech', 'figma': 'tech', 'adobe': 'tech', 'openai': 'tech',
    // Insurance
    'discovery': 'insurance', 'momentum': 'insurance', 'old mutual': 'insurance',
    'sanlam': 'insurance', 'liberty': 'insurance',
    // Subscriptions
    'netflix': 'subscriptions', 'spotify': 'subscriptions', 'youtube': 'subscriptions',
    'showmax': 'subscriptions', 'dstv': 'subscriptions', 'multichoice': 'subscriptions',
    // Utilities
    'eskom': 'utilities', 'telkom': 'utilities', 'vodacom': 'utilities',
    'mtn': 'utilities', 'cell c': 'utilities', 'rain': 'utilities',
    'municipal': 'utilities', 'electricity': 'utilities', 'water': 'utilities',
    // Medical
    'pharmacy': 'medical', 'clicks': 'medical', 'dis-chem': 'medical',
    'dischem': 'medical', 'doctor': 'medical', 'hospital': 'medical',
    'clinic': 'medical', 'dentist': 'medical',
    // Office
    'waltons': 'office', 'makro': 'office', 'incredible connection': 'tech',
    'game': 'office', 'office': 'office',
};

export function suggestCategory(vendorName) {
    if (!vendorName) return null;
    const lower = vendorName.toLowerCase().trim();
    for (const [keyword, category] of Object.entries(VENDOR_CATEGORY_MAP)) {
        if (lower.includes(keyword)) return category;
    }
    return null;
}

export function getCategoryInfo(categoryId, type = 'expense') {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return categories.find(c => c.id === categoryId) || { id: categoryId, label: categoryId, icon: '📄', color: 'gray' };
}

// ─── Default Seed Data ────────────────────────────────────────────────────────

const DEFAULT_TRANSACTIONS = [
    {
        id: 'txn_seed_1', type: 'expense', vendor: 'Pick n Pay Mhluzi',
        date: '2026-02-20', amount: 1245.50, currency: 'ZAR',
        tax: 162.65, taxRate: 15, category: 'groceries',
        description: 'Weekly groceries', receiptImage: null,
        status: 'confirmed', createdAt: '2026-02-20T10:30:00Z'
    },
    {
        id: 'txn_seed_2', type: 'expense', vendor: 'Shell Middelburg',
        date: '2026-02-19', amount: 850.00, currency: 'ZAR',
        tax: 110.87, taxRate: 15, category: 'transport',
        description: 'Fuel', receiptImage: null,
        status: 'confirmed', createdAt: '2026-02-19T14:15:00Z'
    },
    {
        id: 'txn_seed_3', type: 'income', vendor: 'TAMTECH Client Payment',
        date: '2026-02-18', amount: 25000.00, currency: 'ZAR',
        tax: 0, taxRate: 0, category: 'invoice_payment',
        description: 'Website development — Invoice #INV-2026-001', receiptImage: null,
        status: 'confirmed', createdAt: '2026-02-18T09:00:00Z'
    },
    {
        id: 'txn_seed_4', type: 'expense', vendor: 'Vodacom',
        date: '2026-02-17', amount: 599.00, currency: 'ZAR',
        tax: 78.13, taxRate: 15, category: 'utilities',
        description: 'Monthly data plan', receiptImage: null,
        status: 'confirmed', createdAt: '2026-02-17T08:00:00Z'
    },
    {
        id: 'txn_seed_5', type: 'expense', vendor: "Nando's Cosmo City",
        date: '2026-02-16', amount: 285.00, currency: 'ZAR',
        tax: 37.17, taxRate: 15, category: 'food',
        description: 'Client lunch meeting', receiptImage: null,
        status: 'confirmed', createdAt: '2026-02-16T12:45:00Z'
    },
    {
        id: 'txn_seed_6', type: 'income', vendor: 'Freelance — Logo Design',
        date: '2026-02-15', amount: 4500.00, currency: 'ZAR',
        tax: 0, taxRate: 0, category: 'freelance',
        description: 'Logo design project for BrightEdge Solutions', receiptImage: null,
        status: 'confirmed', createdAt: '2026-02-15T16:00:00Z'
    },
    {
        id: 'txn_seed_7', type: 'expense', vendor: 'Vercel',
        date: '2026-02-14', amount: 320.00, currency: 'USD',
        tax: 0, taxRate: 0, category: 'tech',
        description: 'Pro plan hosting — monthly', receiptImage: null,
        status: 'confirmed', createdAt: '2026-02-14T06:00:00Z'
    },
    {
        id: 'txn_seed_8', type: 'expense', vendor: 'Netflix',
        date: '2026-02-01', amount: 199.00, currency: 'ZAR',
        tax: 25.96, taxRate: 15, category: 'subscriptions',
        description: 'Monthly subscription', receiptImage: null,
        status: 'confirmed', createdAt: '2026-02-01T00:00:00Z'
    },
];

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getTransactions() {
    await delay(200);
    return getStorage('cashflow_transactions', DEFAULT_TRANSACTIONS);
}

export async function createTransaction(data) {
    await delay(300);
    const transactions = await getTransactions();
    const newTxn = {
        id: `txn_${Date.now()}`,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        ...data
    };
    transactions.unshift(newTxn);
    setStorage('cashflow_transactions', transactions);
    return newTxn;
}

export async function updateTransaction(id, updates) {
    await delay(200);
    const transactions = await getTransactions();
    const idx = transactions.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Transaction not found');
    transactions[idx] = { ...transactions[idx], ...updates };
    setStorage('cashflow_transactions', transactions);
    return transactions[idx];
}

export async function deleteTransaction(id) {
    await delay(200);
    const transactions = await getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    setStorage('cashflow_transactions', filtered);
    return true;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getTransactionStats() {
    const transactions = await getTransactions();
    const confirmed = transactions.filter(t => t.status === 'confirmed');

    const totalIncome = confirmed
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = confirmed
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = {};
    confirmed.filter(t => t.type === 'expense').forEach(t => {
        if (!categoryBreakdown[t.category]) {
            categoryBreakdown[t.category] = 0;
        }
        categoryBreakdown[t.category] += t.amount;
    });

    return {
        totalIncome,
        totalExpenses,
        netCashFlow: totalIncome - totalExpenses,
        transactionCount: confirmed.length,
        categoryBreakdown
    };
}

// ─── Duplicate Detection ──────────────────────────────────────────────────────

export async function checkDuplicate(amount, dateStr, vendor) {
    const transactions = await getTransactions();
    const targetDate = new Date(dateStr);
    const oneDayMs = 86400000;

    return transactions.filter(t => {
        const txnDate = new Date(t.date);
        const dateDiff = Math.abs(txnDate - targetDate);
        const amountMatch = Math.abs(t.amount - amount) < 0.01;
        const vendorMatch = vendor && t.vendor &&
            t.vendor.toLowerCase().includes(vendor.toLowerCase().substring(0, 5));

        return amountMatch && dateDiff <= oneDayMs && (vendorMatch || !vendor);
    });
}

// ─── Receipt Archive (Audit Trail) ───────────────────────────────────────────

export async function archiveReceipt({ transactionId, fileName, fileType, fileSize, fileData }) {
    await delay(100);
    const archive = getStorage('cashflow_receipt_archive', []);
    const record = {
        id: `rcpt_${Date.now()}`,
        transactionId,
        fileName,
        fileType,
        fileSize,
        fileData, // base64-encoded original file
        uploadedAt: new Date().toISOString(),
        financialYear: getFinancialYear(new Date()),
    };
    archive.unshift(record);
    setStorage('cashflow_receipt_archive', archive);
    return record;
}

export async function getArchivedReceipts(financialYear = null) {
    await delay(100);
    const archive = getStorage('cashflow_receipt_archive', []);
    if (financialYear) return archive.filter(r => r.financialYear === financialYear);
    return archive;
}

export async function getReceiptByTransactionId(transactionId) {
    const archive = getStorage('cashflow_receipt_archive', []);
    return archive.find(r => r.transactionId === transactionId) || null;
}

export async function deleteArchivedReceipt(receiptId) {
    await delay(100);
    const archive = getStorage('cashflow_receipt_archive', []);
    const filtered = archive.filter(r => r.id !== receiptId);
    setStorage('cashflow_receipt_archive', filtered);
    return true;
}

export function downloadReceipt(receipt) {
    if (!receipt?.fileData) return;
    const link = document.createElement('a');
    link.href = receipt.fileData;
    link.download = receipt.fileName || `receipt_${receipt.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getFinancialYear(date) {
    // SA financial year: March to February
    const month = date.getMonth(); // 0-indexed
    const year = date.getFullYear();
    if (month >= 2) return `${year}/${year + 1}`; // March onwards
    return `${year - 1}/${year}`; // Jan-Feb belongs to previous FY
}
