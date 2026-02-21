/**
 * Billing Service for TaskNest
 * Comprehensive billing management including invoices, quotes, clients, products, and payments
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============ DEFAULT DATA ============

const DEFAULT_CLIENTS = [
    {
        id: 'client_001',
        type: 'business',
        name: 'Acme Corp',
        email: 'billing@acme.com',
        phone: '+1 555-0100',
        address: '123 Business Ave, Tech City, TC 90210',
        taxNumber: 'US-123456789',
        paymentTerms: 30,
        currency: 'ZAR',
        notes: 'Long-term client, prefers email communication.',
        createdAt: '2024-01-15'
    },
    {
        id: 'client_002',
        type: 'business',
        name: 'Globex Inc',
        email: 'contact@globex.com',
        phone: '+1 555-0200',
        address: '456 Innovation Blvd, Future Town, FT 80120',
        taxNumber: 'US-987654321',
        paymentTerms: 15,
        currency: 'ZAR',
        notes: '',
        createdAt: '2024-02-01'
    },
    {
        id: 'client_003',
        type: 'individual',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 555-0300',
        address: '789 Main St, Springfield, SP 70210',
        taxNumber: '',
        paymentTerms: 7,
        currency: 'ZAR',
        notes: 'Freelance project client.',
        createdAt: '2024-02-20'
    }
];

const DEFAULT_PRODUCTS = [
    {
        id: 'prod_001',
        name: 'Web Development',
        description: 'Full-stack web development services',
        type: 'service',
        pricingType: 'hourly',
        price: 150,
        cost: 0,
        taxRate: 0,
        active: true
    },
    {
        id: 'prod_002',
        name: 'UI/UX Design',
        description: 'User interface and experience design',
        type: 'service',
        pricingType: 'hourly',
        price: 120,
        cost: 0,
        taxRate: 0,
        active: true
    },
    {
        id: 'prod_003',
        name: 'Server Setup',
        description: 'Cloud server configuration and deployment',
        type: 'service',
        pricingType: 'fixed',
        price: 500,
        cost: 50,
        taxRate: 0,
        active: true
    },
    {
        id: 'prod_004',
        name: 'Monthly Support Package',
        description: 'Ongoing maintenance and support',
        type: 'service',
        pricingType: 'fixed',
        price: 1000,
        cost: 200,
        taxRate: 0,
        active: true
    },
    {
        id: 'prod_005',
        name: 'Premium Theme License',
        description: 'One-time premium theme license',
        type: 'product',
        pricingType: 'fixed',
        price: 299,
        cost: 50,
        taxRate: 0,
        active: true
    }
];

const DEFAULT_TAXES = [
    { id: 'tax_001', name: 'No Tax', rate: 0, default: true },
    { id: 'tax_002', name: 'VAT (15%)', rate: 15, default: false },
    { id: 'tax_003', name: 'Sales Tax (10%)', rate: 10, default: false }
];

const DEFAULT_DOCUMENTS = [
    {
        id: 'inv_001',
        type: 'invoice',
        number: 'INV-2024-001',
        clientId: 'client_001',
        clientName: 'Acme Corp',
        clientEmail: 'billing@acme.com',
        status: 'paid',
        date: '2024-02-15',
        dueDate: '2024-03-01',
        items: [
            { description: 'Web Development Services', qty: 40, price: 150, taxRate: 0, productId: 'prod_001' },
            { description: 'Server Setup', qty: 1, price: 500, taxRate: 0, productId: 'prod_003' }
        ],
        subtotal: 6500,
        taxTotal: 0,
        discount: 0,
        discountType: 'fixed',
        total: 6500,
        amountPaid: 6500,
        currency: 'ZAR',
        notes: 'Thank you for your business!',
        projectId: 'proj_1'
    },
    {
        id: 'inv_002',
        type: 'invoice',
        number: 'INV-2024-002',
        clientId: 'client_002',
        clientName: 'Globex Inc',
        clientEmail: 'contact@globex.com',
        status: 'sent',
        date: '2024-03-01',
        dueDate: '2024-03-15',
        items: [
            { description: 'UI/UX Design', qty: 20, price: 120, taxRate: 0, productId: 'prod_002' }
        ],
        subtotal: 2400,
        taxTotal: 0,
        discount: 0,
        discountType: 'fixed',
        total: 2400,
        amountPaid: 0,
        currency: 'ZAR',
        notes: '',
        projectId: null
    },
    {
        id: 'inv_003',
        type: 'invoice',
        number: 'INV-2024-003',
        clientId: 'client_001',
        clientName: 'Acme Corp',
        clientEmail: 'billing@acme.com',
        status: 'overdue',
        date: '2024-01-10',
        dueDate: '2024-01-25',
        items: [
            { description: 'Monthly Support Package', qty: 1, price: 1000, taxRate: 0, productId: 'prod_004' }
        ],
        subtotal: 1000,
        taxTotal: 0,
        discount: 0,
        discountType: 'fixed',
        total: 1000,
        amountPaid: 0,
        currency: 'ZAR',
        notes: '',
        projectId: null
    },
    {
        id: 'qt_001',
        type: 'quote',
        number: 'QT-2024-001',
        version: 1,
        clientId: 'client_002',
        clientName: 'Globex Inc',
        clientEmail: 'contact@globex.com',
        status: 'sent',
        date: '2024-03-10',
        validUntil: '2024-04-10',
        items: [
            { description: 'Mobile App Design', qty: 1, price: 3000, taxRate: 0, productId: null },
            { description: 'Prototyping phase', qty: 20, price: 100, taxRate: 0, productId: null }
        ],
        subtotal: 5000,
        taxTotal: 0,
        discount: 0,
        discountType: 'fixed',
        total: 5000,
        currency: 'ZAR',
        notes: 'Valid for 30 days.',
        projectId: 'proj_2'
    },
    {
        id: 'qt_002',
        type: 'quote',
        number: 'QT-2024-002',
        version: 1,
        clientId: 'client_003',
        clientName: 'John Smith',
        clientEmail: 'john.smith@email.com',
        status: 'accepted',
        date: '2024-02-28',
        validUntil: '2024-03-28',
        items: [
            { description: 'Website Redesign', qty: 1, price: 2500, taxRate: 0, productId: null }
        ],
        subtotal: 2500,
        taxTotal: 0,
        discount: 250,
        discountType: 'fixed',
        total: 2250,
        currency: 'ZAR',
        notes: '10% early bird discount applied.',
        projectId: null
    }
];

const DEFAULT_PAYMENTS = [
    {
        id: 'pay_001',
        documentId: 'inv_001',
        documentNumber: 'INV-2024-001',
        clientId: 'client_001',
        clientName: 'Acme Corp',
        amount: 6500,
        method: 'eft',
        reference: 'TRX-789456',
        date: '2024-02-28',
        notes: ''
    }
];

const DEFAULT_RECURRING = [
    {
        id: 'rec_001',
        clientId: 'client_001',
        clientName: 'Acme Corp',
        frequency: 'monthly',
        nextDate: '2024-04-01',
        items: [
            { description: 'Monthly Support Package', qty: 1, price: 1000, taxRate: 0, productId: 'prod_004' }
        ],
        total: 1000,
        active: true
    }
];

// ============ HELPER FUNCTIONS ============

function getStorage(key, defaults) {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
}

function setStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ============ CLIENTS ============

export async function getClients() {
    await delay(200);
    return getStorage('billing_clients', DEFAULT_CLIENTS);
}

export async function getClient(id) {
    await delay(100);
    const clients = await getClients();
    return clients.find(c => c.id === id) || null;
}

export async function createClient(clientData) {
    await delay(300);
    const clients = await getClients();
    const newClient = {
        id: `client_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        ...clientData
    };
    clients.push(newClient);
    setStorage('billing_clients', clients);
    return newClient;
}

export async function updateClient(id, updates) {
    await delay(200);
    const clients = await getClients();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    clients[index] = { ...clients[index], ...updates };
    setStorage('billing_clients', clients);
    return clients[index];
}

export async function deleteClient(id) {
    await delay(200);
    const clients = await getClients();
    setStorage('billing_clients', clients.filter(c => c.id !== id));
    return true;
}

export async function getClientStats(clientId) {
    await delay(200);
    const docs = await getDocuments();
    const payments = await getPayments();

    const clientDocs = docs.filter(d => d.clientId === clientId);
    const clientPayments = payments.filter(p => p.clientId === clientId);

    const totalInvoiced = clientDocs
        .filter(d => d.type === 'invoice')
        .reduce((sum, d) => sum + d.total, 0);

    const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
        totalInvoiced,
        totalPaid,
        outstanding: totalInvoiced - totalPaid,
        invoiceCount: clientDocs.filter(d => d.type === 'invoice').length,
        quoteCount: clientDocs.filter(d => d.type === 'quote').length
    };
}

// ============ PRODUCTS & SERVICES ============

export async function getProducts() {
    await delay(200);
    return getStorage('billing_products', DEFAULT_PRODUCTS);
}

export async function getProduct(id) {
    await delay(100);
    const products = await getProducts();
    return products.find(p => p.id === id) || null;
}

export async function createProduct(productData) {
    await delay(300);
    const products = await getProducts();
    const newProduct = {
        id: `prod_${Date.now()}`,
        active: true,
        ...productData
    };
    products.push(newProduct);
    setStorage('billing_products', products);
    return newProduct;
}

export async function updateProduct(id, updates) {
    await delay(200);
    const products = await getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    products[index] = { ...products[index], ...updates };
    setStorage('billing_products', products);
    return products[index];
}

export async function deleteProduct(id) {
    await delay(200);
    const products = await getProducts();
    setStorage('billing_products', products.filter(p => p.id !== id));
    return true;
}

// ============ TAXES ============

export async function getTaxes() {
    await delay(100);
    return getStorage('billing_taxes', DEFAULT_TAXES);
}

export async function createTax(taxData) {
    await delay(200);
    const taxes = await getTaxes();
    const newTax = {
        id: `tax_${Date.now()}`,
        ...taxData
    };
    taxes.push(newTax);
    setStorage('billing_taxes', taxes);
    return newTax;
}

// ============ DOCUMENTS (INVOICES & QUOTES) ============

export async function getDocuments(filters = {}) {
    await delay(300);
    let docs = getStorage('billing_documents', DEFAULT_DOCUMENTS);

    if (filters.type) {
        docs = docs.filter(d => d.type === filters.type);
    }
    if (filters.status) {
        docs = docs.filter(d => d.status === filters.status);
    }
    if (filters.clientId) {
        docs = docs.filter(d => d.clientId === filters.clientId);
    }
    if (filters.projectId) {
        docs = docs.filter(d => d.projectId === filters.projectId);
    }
    if (filters.search) {
        const term = filters.search.toLowerCase();
        docs = docs.filter(d =>
            d.number.toLowerCase().includes(term) ||
            d.clientName.toLowerCase().includes(term)
        );
    }

    return docs;
}

export async function getDocument(id) {
    await delay(200);
    const docs = await getDocuments();
    return docs.find(d => d.id === id) || null;
}

export async function createDocument(docData) {
    await delay(500);
    const docs = getStorage('billing_documents', DEFAULT_DOCUMENTS);

    const typePrefix = docData.type === 'invoice' ? 'INV' : 'QT';
    const year = new Date().getFullYear();
    const count = docs.filter(d => d.type === docData.type).length + 1;
    const number = `${typePrefix}-${year}-${count.toString().padStart(3, '0')}`;

    const subtotal = calculateSubtotal(docData.items || []);
    const taxTotal = calculateTaxTotal(docData.items || []);
    const discount = docData.discount || 0;
    const total = subtotal + taxTotal - discount;

    const newDoc = {
        id: `${docData.type.slice(0, 3)}_${Date.now()}`,
        number,
        status: 'draft',
        date: new Date().toISOString().split('T')[0],
        version: docData.type === 'quote' ? 1 : undefined,
        subtotal,
        taxTotal,
        total,
        amountPaid: 0,
        ...docData
    };

    docs.unshift(newDoc);
    setStorage('billing_documents', docs);
    return newDoc;
}

export async function updateDocument(id, updates) {
    await delay(300);
    const docs = getStorage('billing_documents', DEFAULT_DOCUMENTS);
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Document not found');

    // Recalculate totals if items changed
    if (updates.items) {
        updates.subtotal = calculateSubtotal(updates.items);
        updates.taxTotal = calculateTaxTotal(updates.items);
        updates.total = updates.subtotal + updates.taxTotal - (updates.discount || docs[index].discount || 0);
    }

    docs[index] = { ...docs[index], ...updates };
    setStorage('billing_documents', docs);
    return docs[index];
}

export async function updateDocumentStatus(id, status) {
    await delay(300);
    const docs = getStorage('billing_documents', DEFAULT_DOCUMENTS);
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Document not found');

    docs[index].status = status;
    setStorage('billing_documents', docs);
    return docs[index];
}

export async function deleteDocument(id) {
    await delay(300);
    const docs = getStorage('billing_documents', DEFAULT_DOCUMENTS);
    setStorage('billing_documents', docs.filter(d => d.id !== id));
    return true;
}

// ============ QUOTE VERSIONING ============

export async function createQuoteVersion(quoteId) {
    await delay(400);
    const docs = getStorage('billing_documents', DEFAULT_DOCUMENTS);
    const original = docs.find(d => d.id === quoteId);
    if (!original || original.type !== 'quote') throw new Error('Quote not found');

    const newVersion = {
        ...original,
        id: `qt_${Date.now()}`,
        version: (original.version || 1) + 1,
        status: 'draft',
        date: new Date().toISOString().split('T')[0],
        parentQuoteId: quoteId
    };

    docs.unshift(newVersion);
    setStorage('billing_documents', docs);
    return newVersion;
}

export async function getQuoteVersions(quoteNumber) {
    await delay(200);
    const docs = await getDocuments({ type: 'quote' });
    const baseNumber = quoteNumber.replace(/-v\d+$/, '');
    return docs.filter(d => d.number.startsWith(baseNumber));
}

// ============ QUOTE TO INVOICE CONVERSION ============

export async function convertQuoteToInvoice(quoteId) {
    await delay(500);
    const docs = getStorage('billing_documents', DEFAULT_DOCUMENTS);
    const quote = docs.find(d => d.id === quoteId);
    if (!quote || quote.type !== 'quote') throw new Error('Quote not found');

    const year = new Date().getFullYear();
    const invCount = docs.filter(d => d.type === 'invoice').length + 1;

    const invoice = {
        id: `inv_${Date.now()}`,
        type: 'invoice',
        number: `INV-${year}-${invCount.toString().padStart(3, '0')}`,
        clientId: quote.clientId,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        status: 'draft',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [...quote.items],
        subtotal: quote.subtotal,
        taxTotal: quote.taxTotal,
        discount: quote.discount,
        discountType: quote.discountType,
        total: quote.total,
        amountPaid: 0,
        currency: quote.currency,
        notes: quote.notes,
        projectId: quote.projectId,
        sourceQuoteId: quoteId
    };

    // Update quote status
    const quoteIndex = docs.findIndex(d => d.id === quoteId);
    docs[quoteIndex].status = 'converted';
    docs[quoteIndex].convertedToInvoice = invoice.id;

    docs.unshift(invoice);
    setStorage('billing_documents', docs);
    return invoice;
}

// ============ PAYMENTS ============

export async function getPayments(filters = {}) {
    await delay(200);
    let payments = getStorage('billing_payments', DEFAULT_PAYMENTS);

    if (filters.documentId) {
        payments = payments.filter(p => p.documentId === filters.documentId);
    }
    if (filters.clientId) {
        payments = payments.filter(p => p.clientId === filters.clientId);
    }

    return payments;
}

export async function recordPayment(paymentData) {
    await delay(400);
    const payments = getStorage('billing_payments', DEFAULT_PAYMENTS);
    const docs = getStorage('billing_documents', DEFAULT_DOCUMENTS);

    const doc = docs.find(d => d.id === paymentData.documentId);
    if (!doc) throw new Error('Document not found');

    const newPayment = {
        id: `pay_${Date.now()}`,
        documentNumber: doc.number,
        clientId: doc.clientId,
        clientName: doc.clientName,
        date: new Date().toISOString().split('T')[0],
        ...paymentData
    };

    payments.unshift(newPayment);
    setStorage('billing_payments', payments);

    // Update document paid amount
    const docIndex = docs.findIndex(d => d.id === paymentData.documentId);
    docs[docIndex].amountPaid = (docs[docIndex].amountPaid || 0) + paymentData.amount;

    // Update status based on payment
    if (docs[docIndex].amountPaid >= docs[docIndex].total) {
        docs[docIndex].status = 'paid';
    } else if (docs[docIndex].amountPaid > 0) {
        docs[docIndex].status = 'partial';
    }

    setStorage('billing_documents', docs);
    return newPayment;
}

export async function getPaymentsByDocument(documentId) {
    return getPayments({ documentId });
}

// ============ RECURRING INVOICES ============

export async function getRecurringInvoices() {
    await delay(200);
    return getStorage('billing_recurring', DEFAULT_RECURRING);
}

export async function createRecurringInvoice(recurringData) {
    await delay(400);
    const recurring = await getRecurringInvoices();
    const client = await getClient(recurringData.clientId);

    const newRecurring = {
        id: `rec_${Date.now()}`,
        clientName: client?.name || 'Unknown Client',
        active: true,
        ...recurringData
    };

    recurring.push(newRecurring);
    setStorage('billing_recurring', recurring);
    return newRecurring;
}

export async function updateRecurringInvoice(id, updates) {
    await delay(200);
    const recurring = await getRecurringInvoices();
    const index = recurring.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Recurring invoice not found');
    recurring[index] = { ...recurring[index], ...updates };
    setStorage('billing_recurring', recurring);
    return recurring[index];
}

export async function deleteRecurringInvoice(id) {
    await delay(200);
    const recurring = await getRecurringInvoices();
    setStorage('billing_recurring', recurring.filter(r => r.id !== id));
    return true;
}

// ============ REPORTS & ANALYTICS ============

export async function getDashboardStats() {
    await delay(300);
    const docs = await getDocuments();
    const payments = await getPayments();

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const invoices = docs.filter(d => d.type === 'invoice');
    const quotes = docs.filter(d => d.type === 'quote');

    const outstanding = invoices
        .filter(d => d.status === 'sent' || d.status === 'partial' || d.status === 'overdue')
        .reduce((sum, d) => sum + (d.total - (d.amountPaid || 0)), 0);

    const overdue = invoices
        .filter(d => d.status === 'overdue')
        .reduce((sum, d) => sum + (d.total - (d.amountPaid || 0)), 0);

    const paidThisMonth = payments
        .filter(p => {
            const date = new Date(p.date);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        })
        .reduce((sum, p) => sum + p.amount, 0);

    const quotesAwaiting = quotes.filter(q => q.status === 'sent').length;
    const overdueCount = invoices.filter(d => d.status === 'overdue').length;

    return {
        outstanding,
        overdue,
        overdueCount,
        paidThisMonth,
        quotesAwaiting,
        totalInvoices: invoices.length,
        totalQuotes: quotes.length,
        draftInvoices: invoices.filter(d => d.status === 'draft').length,
        sentInvoices: invoices.filter(d => d.status === 'sent').length,
        paidInvoices: invoices.filter(d => d.status === 'paid').length
    };
}

export async function getRevenueByMonth(months = 6) {
    await delay(300);
    const payments = await getPayments();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthPayments = payments.filter(p => {
            const pDate = new Date(p.date);
            return pDate.getMonth() === month && pDate.getFullYear() === year;
        });

        result.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0)
        });
    }

    return result;
}

export async function getClientProfitability() {
    await delay(300);
    const clients = await getClients();
    const docs = await getDocuments({ type: 'invoice' });
    const payments = await getPayments();

    return clients.map(client => {
        const clientInvoices = docs.filter(d => d.clientId === client.id);
        const clientPayments = payments.filter(p => p.clientId === client.id);

        return {
            id: client.id,
            name: client.name,
            invoiced: clientInvoices.reduce((sum, d) => sum + d.total, 0),
            paid: clientPayments.reduce((sum, p) => sum + p.amount, 0),
            outstanding: clientInvoices.reduce((sum, d) => sum + d.total, 0) -
                clientPayments.reduce((sum, p) => sum + p.amount, 0),
            invoiceCount: clientInvoices.length
        };
    }).sort((a, b) => b.paid - a.paid);
}

export async function getTaxSummary() {
    await delay(200);
    const docs = await getDocuments({ type: 'invoice' });
    const paidDocs = docs.filter(d => d.status === 'paid');

    return {
        totalTaxCollected: paidDocs.reduce((sum, d) => sum + (d.taxTotal || 0), 0),
        taxByRate: {} // Would aggregate by tax rate in a real implementation
    };
}

// ============ CALCULATION HELPERS ============

export function calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + (item.qty * item.price), 0);
}

export function calculateTaxTotal(items) {
    return items.reduce((sum, item) => {
        const lineTotal = item.qty * item.price;
        const taxRate = item.taxRate || 0;
        return sum + (lineTotal * taxRate / 100);
    }, 0);
}

export function calculateTotal(items, discount = 0) {
    const subtotal = calculateSubtotal(items);
    const tax = calculateTaxTotal(items);
    return subtotal + tax - discount;
}

// ============ AUTOMATION HOOKS ============

export async function checkOverdueInvoices() {
    await delay(200);
    const docs = getStorage('billing_documents', DEFAULT_DOCUMENTS);
    const today = new Date().toISOString().split('T')[0];
    let updated = false;

    docs.forEach((doc, index) => {
        if (doc.type === 'invoice' &&
            doc.status === 'sent' &&
            doc.dueDate < today) {
            docs[index].status = 'overdue';
            updated = true;
        }
    });

    if (updated) {
        setStorage('billing_documents', docs);
    }

    return docs.filter(d => d.status === 'overdue');
}

export async function generateInvoiceFromProject(projectId, projectName) {
    // Hook for auto-generating invoice when project completes
    await delay(300);
    console.log(`[Billing] Auto-invoice hook triggered for project: ${projectName}`);
    // In a real implementation, this would gather billable tasks and create an invoice
    return null;
}
