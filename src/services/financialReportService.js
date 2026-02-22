/**
 * Financial Report Service — Executive Financial Suite
 * Calculation engines for P&L, Balance Sheet, Break-even, Forecasting
 * Pulls data from cashFlowService + billingService
 */

import { getTransactions } from './cashFlowService';
import { getDocuments, getPayments } from './billingService';

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

// ─── Fixed vs Variable Cost Classification ───────────────────────────────────

const FIXED_COST_CATEGORIES = [
    'rent', 'subscriptions', 'insurance', 'utilities'
];

const VARIABLE_COST_CATEGORIES = [
    'transport', 'food', 'office', 'maintenance', 'marketing',
    'tech', 'groceries', 'medical', 'other_expense'
];

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function getDateRange(period) {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start;

    switch (period) {
        case 'this_month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'last_month':
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end.setDate(0); // last day of previous month
            break;
        case 'this_quarter':
            start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            break;
        case 'this_year':
            start = new Date(now.getFullYear(), 0, 1);
            break;
        case 'last_6_months':
            start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            break;
        case 'financial_year': {
            // SA Financial Year: March to February
            const month = now.getMonth();
            if (month >= 2) { // March onwards
                start = new Date(now.getFullYear(), 2, 1);
            } else {
                start = new Date(now.getFullYear() - 1, 2, 1);
            }
            break;
        }
        default:
            start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }

    return { start, end };
}

function isInRange(dateStr, start, end) {
    const d = new Date(dateStr);
    return d >= start && d <= end;
}

// ─── P&L Statement ───────────────────────────────────────────────────────────

export async function generateProfitAndLoss(period = 'this_year', customStart = null, customEnd = null) {
    await delay(200);

    const { start, end } = customStart && customEnd
        ? { start: new Date(customStart), end: new Date(customEnd) }
        : getDateRange(period);

    const transactions = await getTransactions();
    const invoices = await getDocuments({ type: 'invoice' });
    const payments = await getPayments();

    // Filter to date range
    const periodTxns = transactions.filter(t => isInRange(t.date, start, end));
    const periodPayments = payments.filter(p => isInRange(p.date, start, end));
    const periodInvoices = invoices.filter(i => isInRange(i.date, start, end));

    // Revenue
    const cashflowIncome = periodTxns
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const invoiceRevenue = periodPayments.reduce((sum, p) => sum + p.amount, 0);

    const totalRevenue = cashflowIncome + invoiceRevenue;

    // COGS (cost of goods sold from products)
    const cogs = periodInvoices.reduce((sum, inv) => {
        return sum + (inv.items || []).reduce((s, item) => s + ((item.cost || 0) * (item.qty || 1)), 0);
    }, 0);

    const grossProfit = totalRevenue - cogs;

    // Operating Expenses by category
    const expenses = periodTxns.filter(t => t.type === 'expense');
    const expenseByCategory = {};
    let totalExpenses = 0;

    expenses.forEach(t => {
        const cat = t.category || 'other_expense';
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + t.amount;
        totalExpenses += t.amount;
    });

    // Separate fixed vs variable
    const fixedCosts = Object.entries(expenseByCategory)
        .filter(([cat]) => FIXED_COST_CATEGORIES.includes(cat))
        .reduce((sum, [, val]) => sum + val, 0);

    const variableCosts = Object.entries(expenseByCategory)
        .filter(([cat]) => VARIABLE_COST_CATEGORIES.includes(cat))
        .reduce((sum, [, val]) => sum + val, 0);

    const operatingProfit = grossProfit - totalExpenses;

    // Tax (VAT collected from invoices)
    const taxExpense = periodTxns
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.tax || 0), 0);

    const netProfit = operatingProfit - taxExpense;

    return {
        period: { start: start.toISOString(), end: end.toISOString() },
        revenue: {
            cashflowIncome,
            invoiceRevenue,
            total: totalRevenue,
        },
        cogs,
        grossProfit,
        expenses: {
            byCategory: expenseByCategory,
            fixed: fixedCosts,
            variable: variableCosts,
            total: totalExpenses,
        },
        operatingProfit,
        taxExpense,
        netProfit,
        margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0,
    };
}

// ─── Cash Flow Statement ─────────────────────────────────────────────────────

export async function generateCashFlowStatement(period = 'this_year', customStart = null, customEnd = null) {
    await delay(200);

    const { start, end } = customStart && customEnd
        ? { start: new Date(customStart), end: new Date(customEnd) }
        : getDateRange(period);

    const transactions = await getTransactions();
    const payments = await getPayments();
    const invoices = await getDocuments({ type: 'invoice' });

    const periodTxns = transactions.filter(t => isInRange(t.date, start, end));
    const periodPayments = payments.filter(p => isInRange(p.date, start, end));

    // Operating Activities
    const operatingIncome = periodTxns
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) +
        periodPayments.reduce((sum, p) => sum + p.amount, 0);

    const operatingExpenses = periodTxns
        .filter(t => t.type === 'expense' && !['tech'].includes(t.category))
        .reduce((sum, t) => sum + t.amount, 0);

    const operatingNet = operatingIncome - operatingExpenses;

    // Investing Activities (equipment/tech purchases)
    const investingOutflows = periodTxns
        .filter(t => t.type === 'expense' && t.category === 'tech')
        .reduce((sum, t) => sum + t.amount, 0);

    // Accounts Receivable Change
    const currentReceivables = invoices
        .filter(i => ['sent', 'partial', 'overdue'].includes(i.status))
        .reduce((sum, i) => sum + (i.total - (i.amountPaid || 0)), 0);

    // Financing (from balance sheet data)
    const bsData = getStorage('financial_balance_sheet', {});
    const financingInflows = parseFloat(bsData.newLoans || 0);
    const financingOutflows = parseFloat(bsData.loanRepayments || 0);
    const financingNet = financingInflows - financingOutflows;

    const netCashFlow = operatingNet - investingOutflows + financingNet;

    return {
        period: { start: start.toISOString(), end: end.toISOString() },
        operating: {
            income: operatingIncome,
            expenses: operatingExpenses,
            net: operatingNet,
        },
        investing: {
            outflows: investingOutflows,
            net: -investingOutflows,
        },
        financing: {
            inflows: financingInflows,
            outflows: financingOutflows,
            net: financingNet,
        },
        accountsReceivable: currentReceivables,
        netCashFlow,
    };
}

// ─── Balance Sheet ───────────────────────────────────────────────────────────

export async function generateBalanceSheet() {
    await delay(200);

    const invoices = await getDocuments({ type: 'invoice' });
    const transactions = await getTransactions();
    const bsData = getStorage('financial_balance_sheet', {});

    // ASSETS
    const cashOnHand = parseFloat(bsData.cashOnHand || 0);

    const accountsReceivable = invoices
        .filter(i => ['sent', 'partial', 'overdue'].includes(i.status))
        .reduce((sum, i) => sum + (i.total - (i.amountPaid || 0)), 0);

    const equipment = parseFloat(bsData.equipment || 0);
    const otherAssets = parseFloat(bsData.otherAssets || 0);

    const totalAssets = cashOnHand + accountsReceivable + equipment + otherAssets;

    // LIABILITIES
    const accountsPayable = parseFloat(bsData.accountsPayable || 0);
    const loans = parseFloat(bsData.loans || 0);
    const otherLiabilities = parseFloat(bsData.otherLiabilities || 0);

    const totalLiabilities = accountsPayable + loans + otherLiabilities;

    // EQUITY
    const ownerEquity = parseFloat(bsData.ownerEquity || 0);
    const retainedEarnings = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) -
        transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

    const totalEquity = ownerEquity + retainedEarnings;

    return {
        assets: {
            cashOnHand,
            accountsReceivable,
            equipment,
            otherAssets,
            total: totalAssets,
        },
        liabilities: {
            accountsPayable,
            loans,
            otherLiabilities,
            total: totalLiabilities,
        },
        equity: {
            ownerEquity,
            retainedEarnings,
            total: totalEquity,
        },
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
        ratio: totalLiabilities > 0 ? (totalAssets / totalLiabilities).toFixed(2) : '∞',
    };
}

export function saveBalanceSheetData(data) {
    setStorage('financial_balance_sheet', data);
}

export function getBalanceSheetData() {
    return getStorage('financial_balance_sheet', {
        cashOnHand: 0,
        equipment: 0,
        otherAssets: 0,
        accountsPayable: 0,
        loans: 0,
        otherLiabilities: 0,
        ownerEquity: 0,
        newLoans: 0,
        loanRepayments: 0,
    });
}

// ─── Break-even Analysis ─────────────────────────────────────────────────────

export async function calculateBreakeven(overrides = {}) {
    await delay(100);

    const pnl = await generateProfitAndLoss('last_6_months');

    // Monthly averages
    const monthsInPeriod = 6;
    const monthlyFixedCosts = (pnl.expenses.fixed / monthsInPeriod) * (overrides.fixedCostMultiplier || 1);
    const monthlyRevenue = (pnl.revenue.total / monthsInPeriod) * (overrides.revenueMultiplier || 1);
    const monthlyVariableCosts = (pnl.expenses.variable / monthsInPeriod) * (overrides.variableCostMultiplier || 1);

    // Add what-if adjustments
    const additionalFixedCosts = parseFloat(overrides.additionalFixedCosts || 0);
    const additionalRevenue = parseFloat(overrides.additionalRevenue || 0);
    const adjustedFixed = monthlyFixedCosts + additionalFixedCosts;
    const adjustedRevenue = monthlyRevenue + additionalRevenue;

    // Contribution Margin Ratio
    const cmRatio = adjustedRevenue > 0
        ? (adjustedRevenue - monthlyVariableCosts) / adjustedRevenue
        : 0;

    // Break-even Revenue = Fixed Costs / CM Ratio
    const breakEvenRevenue = cmRatio > 0 ? adjustedFixed / cmRatio : 0;

    // Generate chart data (0 to 2x expected revenue)
    const maxRevenue = Math.max(adjustedRevenue * 2, breakEvenRevenue * 1.5);
    const chartData = [];
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
        const revenue = (maxRevenue / steps) * i;
        const variableCostAtRevenue = adjustedRevenue > 0
            ? (monthlyVariableCosts / adjustedRevenue) * revenue
            : 0;
        const totalCost = adjustedFixed + variableCostAtRevenue;
        const profit = revenue - totalCost;

        chartData.push({
            revenue: Math.round(revenue),
            totalCost: Math.round(totalCost),
            fixedCost: Math.round(adjustedFixed),
            profit: Math.round(profit),
            label: `R${Math.round(revenue / 1000)}k`,
        });
    }

    return {
        monthlyFixedCosts: adjustedFixed,
        monthlyVariableCosts,
        monthlyRevenue: adjustedRevenue,
        contributionMarginRatio: cmRatio,
        breakEvenRevenue: Math.round(breakEvenRevenue),
        currentMonthlyProfit: Math.round(adjustedRevenue - adjustedFixed - monthlyVariableCosts),
        isAboveBreakEven: adjustedRevenue > breakEvenRevenue,
        chartData,
        // What-if comparison
        baseline: {
            fixed: monthlyFixedCosts - additionalFixedCosts,
            revenue: monthlyRevenue - additionalRevenue,
            breakEven: monthlyFixedCosts > 0 && cmRatio > 0
                ? Math.round((monthlyFixedCosts - additionalFixedCosts) / cmRatio)
                : 0,
        },
    };
}

// ─── AI Forecasting (Linear Regression) ──────────────────────────────────────

export async function generateForecast(monthsBack = 6, monthsForward = 3) {
    await delay(200);

    const transactions = await getTransactions();
    const payments = await getPayments();
    const now = new Date();

    // Build monthly totals for income and expenses
    const monthlyData = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

        const monthLabel = monthStart.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' });

        const income = transactions
            .filter(t => t.type === 'income' && isInRange(t.date, monthStart, monthEnd))
            .reduce((sum, t) => sum + t.amount, 0) +
            payments
                .filter(p => isInRange(p.date, monthStart, monthEnd))
                .reduce((sum, p) => sum + p.amount, 0);

        const expenses = transactions
            .filter(t => t.type === 'expense' && isInRange(t.date, monthStart, monthEnd))
            .reduce((sum, t) => sum + t.amount, 0);

        monthlyData.push({
            x: monthsBack - i,
            month: monthLabel,
            income,
            expenses,
            netCashFlow: income - expenses,
            isActual: true,
        });
    }

    // Linear regression: y = mx + b
    function linearRegression(data, key) {
        const n = data.length;
        if (n < 2) return { slope: 0, intercept: data[0]?.[key] || 0 };

        const sumX = data.reduce((s, d) => s + d.x, 0);
        const sumY = data.reduce((s, d) => s + d[key], 0);
        const sumXY = data.reduce((s, d) => s + d.x * d[key], 0);
        const sumX2 = data.reduce((s, d) => s + d.x * d.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    }

    const incomeModel = linearRegression(monthlyData, 'income');
    const expenseModel = linearRegression(monthlyData, 'expenses');

    // Predict future months
    const predictions = [];
    for (let i = 1; i <= monthsForward; i++) {
        const x = monthsBack + i;
        const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const monthLabel = futureDate.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' });

        const predictedIncome = Math.max(0, incomeModel.slope * x + incomeModel.intercept);
        const predictedExpenses = Math.max(0, expenseModel.slope * x + expenseModel.intercept);

        predictions.push({
            x,
            month: monthLabel,
            income: Math.round(predictedIncome),
            expenses: Math.round(predictedExpenses),
            netCashFlow: Math.round(predictedIncome - predictedExpenses),
            isActual: false,
        });
    }

    // Trend assessment
    const avgIncome = monthlyData.reduce((s, d) => s + d.income, 0) / monthlyData.length;
    const avgExpenses = monthlyData.reduce((s, d) => s + d.expenses, 0) / monthlyData.length;
    const lastPrediction = predictions[predictions.length - 1];

    let trend = 'stable';
    if (lastPrediction) {
        if (lastPrediction.netCashFlow > avgIncome - avgExpenses) trend = 'improving';
        else if (lastPrediction.netCashFlow < 0) trend = 'warning';
        else if (lastPrediction.netCashFlow < (avgIncome - avgExpenses) * 0.5) trend = 'declining';
    }

    return {
        historical: monthlyData,
        predictions,
        combined: [...monthlyData, ...predictions],
        models: {
            income: incomeModel,
            expenses: expenseModel,
        },
        trend,
        insights: {
            avgMonthlyIncome: Math.round(avgIncome),
            avgMonthlyExpenses: Math.round(avgExpenses),
            avgNetCashFlow: Math.round(avgIncome - avgExpenses),
            predictedNextMonth: predictions[0] || null,
        },
    };
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

export async function exportToPDF(reportType, data) {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const businessInfo = getStorage('businessInfo', {});
    const companyName = businessInfo.companyName || 'Your Company';
    const now = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

    // Header gradient bar
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 24, 210, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 14, 16);
    doc.setFontSize(9);
    doc.text(`Generated: ${now}`, 196, 16, { align: 'right' });

    doc.setTextColor(30, 41, 59);
    let y = 40;

    if (reportType === 'pnl') {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Profit & Loss Statement', 14, y);
        y += 12;

        autoTable(doc, {
            startY: y,
            head: [['Item', 'Amount (ZAR)']],
            body: [
                ['Revenue — Cash Flow Income', `R ${data.revenue.cashflowIncome.toLocaleString()}`],
                ['Revenue — Invoice Payments', `R ${data.revenue.invoiceRevenue.toLocaleString()}`],
                [{ content: 'Total Revenue', styles: { fontStyle: 'bold' } }, { content: `R ${data.revenue.total.toLocaleString()}`, styles: { fontStyle: 'bold' } }],
                ['', ''],
                ['Cost of Goods Sold', `(R ${data.cogs.toLocaleString()})`],
                [{ content: 'Gross Profit', styles: { fontStyle: 'bold' } }, { content: `R ${data.grossProfit.toLocaleString()}`, styles: { fontStyle: 'bold' } }],
                ['', ''],
                ['Fixed Operating Expenses', `(R ${data.expenses.fixed.toLocaleString()})`],
                ['Variable Operating Expenses', `(R ${data.expenses.variable.toLocaleString()})`],
                [{ content: 'Total Expenses', styles: { fontStyle: 'bold' } }, { content: `(R ${data.expenses.total.toLocaleString()})`, styles: { fontStyle: 'bold' } }],
                ['', ''],
                ['Tax Expense (VAT)', `(R ${data.taxExpense.toLocaleString()})`],
                [{ content: 'NET PROFIT', styles: { fontStyle: 'bold', textColor: data.netProfit >= 0 ? [16, 185, 129] : [239, 68, 68] } },
                { content: `R ${data.netProfit.toLocaleString()}`, styles: { fontStyle: 'bold', textColor: data.netProfit >= 0 ? [16, 185, 129] : [239, 68, 68] } }],
                ['Profit Margin', `${data.margin}%`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            styles: { fontSize: 10 },
        });
    }

    if (reportType === 'balance_sheet') {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Balance Sheet', 14, y);
        y += 12;

        autoTable(doc, {
            startY: y,
            head: [['Category', 'Amount (ZAR)']],
            body: [
                [{ content: 'ASSETS', styles: { fontStyle: 'bold', fillColor: [240, 253, 244] } }, ''],
                ['Cash on Hand', `R ${data.assets.cashOnHand.toLocaleString()}`],
                ['Accounts Receivable', `R ${data.assets.accountsReceivable.toLocaleString()}`],
                ['Equipment', `R ${data.assets.equipment.toLocaleString()}`],
                ['Other Assets', `R ${data.assets.otherAssets.toLocaleString()}`],
                [{ content: 'Total Assets', styles: { fontStyle: 'bold' } }, { content: `R ${data.assets.total.toLocaleString()}`, styles: { fontStyle: 'bold' } }],
                ['', ''],
                [{ content: 'LIABILITIES', styles: { fontStyle: 'bold', fillColor: [254, 242, 242] } }, ''],
                ['Accounts Payable', `R ${data.liabilities.accountsPayable.toLocaleString()}`],
                ['Loans', `R ${data.liabilities.loans.toLocaleString()}`],
                ['Other Liabilities', `R ${data.liabilities.otherLiabilities.toLocaleString()}`],
                [{ content: 'Total Liabilities', styles: { fontStyle: 'bold' } }, { content: `R ${data.liabilities.total.toLocaleString()}`, styles: { fontStyle: 'bold' } }],
                ['', ''],
                [{ content: 'EQUITY', styles: { fontStyle: 'bold', fillColor: [239, 246, 255] } }, ''],
                ['Owner Equity', `R ${data.equity.ownerEquity.toLocaleString()}`],
                ['Retained Earnings', `R ${data.equity.retainedEarnings.toLocaleString()}`],
                [{ content: 'Total Equity', styles: { fontStyle: 'bold' } }, { content: `R ${data.equity.total.toLocaleString()}`, styles: { fontStyle: 'bold' } }],
            ],
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            styles: { fontSize: 10 },
        });
    }

    if (reportType === 'cashflow') {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Cash Flow Statement', 14, y);
        y += 12;

        autoTable(doc, {
            startY: y,
            head: [['Activity', 'Amount (ZAR)']],
            body: [
                [{ content: 'OPERATING ACTIVITIES', styles: { fontStyle: 'bold', fillColor: [240, 253, 244] } }, ''],
                ['Cash Received', `R ${data.operating.income.toLocaleString()}`],
                ['Cash Paid (Expenses)', `(R ${data.operating.expenses.toLocaleString()})`],
                [{ content: 'Net Operating Cash Flow', styles: { fontStyle: 'bold' } }, { content: `R ${data.operating.net.toLocaleString()}`, styles: { fontStyle: 'bold' } }],
                ['', ''],
                [{ content: 'INVESTING ACTIVITIES', styles: { fontStyle: 'bold', fillColor: [254, 252, 232] } }, ''],
                ['Equipment / Tech Purchases', `(R ${data.investing.outflows.toLocaleString()})`],
                [{ content: 'Net Investing', styles: { fontStyle: 'bold' } }, { content: `R ${data.investing.net.toLocaleString()}`, styles: { fontStyle: 'bold' } }],
                ['', ''],
                [{ content: 'FINANCING ACTIVITIES', styles: { fontStyle: 'bold', fillColor: [239, 246, 255] } }, ''],
                ['New Loans / Funding', `R ${data.financing.inflows.toLocaleString()}`],
                ['Loan Repayments', `(R ${data.financing.outflows.toLocaleString()})`],
                [{ content: 'Net Financing', styles: { fontStyle: 'bold' } }, { content: `R ${data.financing.net.toLocaleString()}`, styles: { fontStyle: 'bold' } }],
                ['', ''],
                [{ content: 'NET CASH FLOW', styles: { fontStyle: 'bold', textColor: data.netCashFlow >= 0 ? [16, 185, 129] : [239, 68, 68] } },
                { content: `R ${data.netCashFlow.toLocaleString()}`, styles: { fontStyle: 'bold', textColor: data.netCashFlow >= 0 ? [16, 185, 129] : [239, 68, 68] } }],
            ],
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            styles: { fontSize: 10 },
        });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`${companyName} — Financial Report — Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export function logAuditEvent(action, details) {
    const log = getStorage('financial_audit_log', []);
    log.unshift({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action,
        details,
        user: 'current_user',
    });
    // Keep last 500 entries
    setStorage('financial_audit_log', log.slice(0, 500));
}

export function getAuditLog() {
    return getStorage('financial_audit_log', []);
}
