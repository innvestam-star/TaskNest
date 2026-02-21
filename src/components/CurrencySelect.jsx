import React from 'react';
import { CURRENCIES, COMMON_CURRENCIES, DEFAULT_CURRENCY, getCurrencySymbol } from '../utils/currency';

/**
 * Currency Select Dropdown Component
 * Displays common currencies first, then all others alphabetically
 */
export default function CurrencySelect({
    value = DEFAULT_CURRENCY,
    onChange,
    className = '',
    disabled = false,
    showSymbol = true
}) {
    // Get common currencies first
    const commonCurrencies = COMMON_CURRENCIES
        .filter(code => CURRENCIES[code])
        .map(code => CURRENCIES[code]);

    // Get other currencies, sorted alphabetically by name
    const otherCurrencies = Object.values(CURRENCIES)
        .filter(c => !COMMON_CURRENCIES.includes(c.code))
        .sort((a, b) => a.name.localeCompare(b.name));

    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <select
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={`px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white ${className}`}
        >
            {/* Common Currencies */}
            <optgroup label="Common Currencies">
                {commonCurrencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                        {showSymbol ? `${currency.symbol} - ` : ''}{currency.code} ({currency.name})
                    </option>
                ))}
            </optgroup>

            {/* Other Currencies */}
            <optgroup label="All Currencies">
                {otherCurrencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                        {showSymbol ? `${currency.symbol} - ` : ''}{currency.code} ({currency.name})
                    </option>
                ))}
            </optgroup>
        </select>
    );
}

/**
 * Inline Currency Display Component
 * Shows the currency code with its symbol
 */
export function CurrencyBadge({ code = DEFAULT_CURRENCY, className = '' }) {
    const currency = CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 ${className}`}>
            <span>{currency.symbol}</span>
            <span>{currency.code}</span>
        </span>
    );
}
