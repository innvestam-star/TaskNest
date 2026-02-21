/**
 * Currency Utilities for TaskNest
 * Multi-currency support with ZAR (South African Rand) as default
 */

// Default currency for the application
export const DEFAULT_CURRENCY = 'ZAR';

// Comprehensive list of world currencies with symbols and names
export const CURRENCIES = {
    // Africa
    ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
    NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
    KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
    GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH' },
    EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'ar-EG' },
    MAD: { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', locale: 'ar-MA' },
    TZS: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', locale: 'sw-TZ' },
    UGX: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', locale: 'en-UG' },
    BWP: { code: 'BWP', symbol: 'P', name: 'Botswana Pula', locale: 'en-BW' },
    MUR: { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee', locale: 'en-MU' },

    // Americas
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
    BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
    MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX' },
    ARS: { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', locale: 'es-AR' },
    CLP: { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', locale: 'es-CL' },
    COP: { code: 'COP', symbol: 'CO$', name: 'Colombian Peso', locale: 'es-CO' },

    // Europe
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
    SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
    NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
    DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' },
    PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL' },
    CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ' },
    HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU' },
    RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },

    // Asia & Pacific
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
    HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK' },
    SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
    AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
    NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'en-PK' },
    BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD' },
    THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH' },
    VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN' },
    IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
    MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
    PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
    KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },

    // Middle East
    AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
    SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA' },
    ILS: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', locale: 'he-IL' },
    TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' }
};

// Common currencies shown first in dropdowns
export const COMMON_CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'NGN', 'KES', 'INR'];

// Default tax rates by currency (VAT/GST/Sales Tax)
export const CURRENCY_TAX_RATES = {
    // Africa
    ZAR: { rate: 15, name: 'VAT (15%)' },
    NGN: { rate: 7.5, name: 'VAT (7.5%)' },
    KES: { rate: 16, name: 'VAT (16%)' },
    GHS: { rate: 15, name: 'VAT (15%)' },
    EGP: { rate: 14, name: 'VAT (14%)' },
    MAD: { rate: 20, name: 'VAT (20%)' },
    TZS: { rate: 18, name: 'VAT (18%)' },
    UGX: { rate: 18, name: 'VAT (18%)' },
    BWP: { rate: 14, name: 'VAT (14%)' },
    MUR: { rate: 15, name: 'VAT (15%)' },
    // Americas
    USD: { rate: 0, name: 'No Tax' },
    CAD: { rate: 5, name: 'GST (5%)' },
    BRL: { rate: 17, name: 'ICMS (17%)' },
    MXN: { rate: 16, name: 'IVA (16%)' },
    ARS: { rate: 21, name: 'IVA (21%)' },
    CLP: { rate: 19, name: 'IVA (19%)' },
    COP: { rate: 19, name: 'IVA (19%)' },
    // Europe
    EUR: { rate: 21, name: 'VAT (21%)' },
    GBP: { rate: 20, name: 'VAT (20%)' },
    CHF: { rate: 8.1, name: 'VAT (8.1%)' },
    SEK: { rate: 25, name: 'VAT (25%)' },
    NOK: { rate: 25, name: 'VAT (25%)' },
    DKK: { rate: 25, name: 'VAT (25%)' },
    PLN: { rate: 23, name: 'VAT (23%)' },
    CZK: { rate: 21, name: 'VAT (21%)' },
    HUF: { rate: 27, name: 'VAT (27%)' },
    RUB: { rate: 20, name: 'VAT (20%)' },
    // Asia & Pacific
    JPY: { rate: 10, name: 'CT (10%)' },
    CNY: { rate: 13, name: 'VAT (13%)' },
    HKD: { rate: 0, name: 'No Tax' },
    SGD: { rate: 9, name: 'GST (9%)' },
    AUD: { rate: 10, name: 'GST (10%)' },
    NZD: { rate: 15, name: 'GST (15%)' },
    INR: { rate: 18, name: 'GST (18%)' },
    PKR: { rate: 18, name: 'GST (18%)' },
    BDT: { rate: 15, name: 'VAT (15%)' },
    THB: { rate: 7, name: 'VAT (7%)' },
    VND: { rate: 10, name: 'VAT (10%)' },
    IDR: { rate: 11, name: 'VAT (11%)' },
    MYR: { rate: 8, name: 'SST (8%)' },
    PHP: { rate: 12, name: 'VAT (12%)' },
    KRW: { rate: 10, name: 'VAT (10%)' },
    // Middle East
    AED: { rate: 5, name: 'VAT (5%)' },
    SAR: { rate: 15, name: 'VAT (15%)' },
    ILS: { rate: 17, name: 'VAT (17%)' },
    TRY: { rate: 20, name: 'VAT (20%)' }
};

/**
 * Get the default tax rate for a currency
 * @param {string} currencyCode - The ISO 4217 currency code
 * @returns {{ rate: number, name: string }} The default tax info
 */
export function getDefaultTaxRate(currencyCode) {
    return CURRENCY_TAX_RATES[currencyCode] || { rate: 0, name: 'No Tax' };
}

/**
 * Format a currency amount using the Intl.NumberFormat API
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The ISO 4217 currency code (default: ZAR)
 * @param {object} options - Additional formatting options
 * @returns {string} The formatted currency string
 */
export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY, options = {}) {
    const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];

    const defaultOptions = {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    };

    // Some currencies don't use decimal places
    const noDecimalCurrencies = ['JPY', 'KRW', 'VND', 'HUF', 'CLP', 'UGX', 'TZS'];
    if (noDecimalCurrencies.includes(currencyCode)) {
        defaultOptions.minimumFractionDigits = 0;
        defaultOptions.maximumFractionDigits = 0;
    }

    const mergedOptions = { ...defaultOptions, ...options };

    try {
        return new Intl.NumberFormat(currency.locale, mergedOptions).format(amount);
    } catch (error) {
        // Fallback to simple formatting
        return `${currency.symbol}${amount.toFixed(mergedOptions.minimumFractionDigits)}`;
    }
}

/**
 * Format currency with compact notation for large numbers (e.g., R1.2M)
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The ISO 4217 currency code
 * @returns {string} The formatted compact currency string
 */
export function formatCurrencyCompact(amount, currencyCode = DEFAULT_CURRENCY) {
    const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];

    try {
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            notation: 'compact',
            compactDisplay: 'short'
        }).format(amount);
    } catch (error) {
        // Fallback
        if (amount >= 1000000) return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${currency.symbol}${(amount / 1000).toFixed(1)}K`;
        return `${currency.symbol}${amount}`;
    }
}

/**
 * Get currency details by code
 * @param {string} currencyCode - The ISO 4217 currency code
 * @returns {object} Currency details (code, symbol, name, locale)
 */
export function getCurrency(currencyCode) {
    return CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
}

/**
 * Get a sorted list of currencies for dropdown menus
 * Common currencies appear first, followed by all others alphabetically
 * @returns {Array} Array of currency objects sorted for display
 */
export function getCurrencyList() {
    const commonList = COMMON_CURRENCIES
        .filter(code => CURRENCIES[code])
        .map(code => CURRENCIES[code]);

    const otherList = Object.values(CURRENCIES)
        .filter(c => !COMMON_CURRENCIES.includes(c.code))
        .sort((a, b) => a.name.localeCompare(b.name));

    return [...commonList, { divider: true }, ...otherList];
}

/**
 * Get currency symbol by code
 * @param {string} currencyCode - The ISO 4217 currency code
 * @returns {string} The currency symbol
 */
export function getCurrencySymbol(currencyCode) {
    const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
    return currency.symbol;
}

/**
 * Parse a formatted currency string back to a number
 * @param {string} formattedAmount - The formatted currency string
 * @returns {number} The numeric amount
 */
export function parseCurrencyString(formattedAmount) {
    if (typeof formattedAmount === 'number') return formattedAmount;

    // Remove currency symbols and formatting
    const cleaned = formattedAmount
        .replace(/[^\d.,\-]/g, '')  // Remove all non-numeric except . , and -
        .replace(/,(\d{3})/g, '$1') // Remove thousand separators
        .replace(/,/g, '.');        // Convert remaining commas to decimal points

    return parseFloat(cleaned) || 0;
}
