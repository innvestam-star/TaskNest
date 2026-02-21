/**
 * Recurring Items Service for TaskNest
 * Manages recurring tasks and appointments
 */

// Recurrence patterns
export const RECURRENCE_PATTERNS = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    BIWEEKLY: 'biweekly',
    MONTHLY: 'monthly',
    CUSTOM: 'custom',
};

// Days of the week
export const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' },
];

/**
 * Create a recurrence object
 * @param {string} pattern - Recurrence pattern
 * @param {Object} options - Additional options
 * @returns {Object} Recurrence configuration
 */
export function createRecurrence(pattern, options = {}) {
    const recurrence = {
        pattern,
        interval: options.interval || 1,
        daysOfWeek: options.daysOfWeek || [],
        dayOfMonth: options.dayOfMonth || null,
        endType: options.endType || 'never', // 'never', 'date', 'occurrences'
        endDate: options.endDate || null,
        occurrences: options.occurrences || null,
        createdAt: new Date().toISOString(),
    };

    return recurrence;
}

/**
 * Calculate the next occurrence date based on recurrence pattern
 * @param {Date} fromDate - Starting date
 * @param {Object} recurrence - Recurrence configuration
 * @returns {Date|null} Next occurrence date or null if series ended
 */
export function getNextOccurrence(fromDate, recurrence) {
    const current = new Date(fromDate);
    let next = new Date(current);

    // Check if end conditions are met
    if (recurrence.endType === 'date' && recurrence.endDate) {
        const endDate = new Date(recurrence.endDate);
        if (current >= endDate) {
            return null;
        }
    }

    switch (recurrence.pattern) {
        case RECURRENCE_PATTERNS.DAILY:
            next.setDate(next.getDate() + recurrence.interval);
            break;

        case RECURRENCE_PATTERNS.WEEKLY:
            next.setDate(next.getDate() + (7 * recurrence.interval));
            break;

        case RECURRENCE_PATTERNS.BIWEEKLY:
            next.setDate(next.getDate() + 14);
            break;

        case RECURRENCE_PATTERNS.MONTHLY:
            next.setMonth(next.getMonth() + recurrence.interval);
            // Handle month-end edge cases
            if (recurrence.dayOfMonth) {
                next.setDate(Math.min(recurrence.dayOfMonth, getDaysInMonth(next)));
            }
            break;

        case RECURRENCE_PATTERNS.CUSTOM:
            // For custom, find next matching day of week
            if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
                do {
                    next.setDate(next.getDate() + 1);
                } while (!recurrence.daysOfWeek.includes(next.getDay()));
            }
            break;

        default:
            next.setDate(next.getDate() + 1);
    }

    // Final check against end date
    if (recurrence.endType === 'date' && recurrence.endDate) {
        const endDate = new Date(recurrence.endDate);
        if (next > endDate) {
            return null;
        }
    }

    return next;
}

/**
 * Generate all instances of a recurring item within a date range
 * @param {Object} item - The recurring item (task or appointment)
 * @param {Date} rangeStart - Start of date range
 * @param {Date} rangeEnd - End of date range
 * @returns {Array} Array of instances
 */
export function generateRecurringInstances(item, rangeStart, rangeEnd) {
    if (!item.recurrence) {
        return [item];
    }

    const instances = [];
    let currentDate = new Date(item.dueDate || item.startTime);
    let occurrenceCount = 0;
    const maxOccurrences = item.recurrence.occurrences || 365; // Safety limit

    // Start from original date or range start, whichever is later
    if (currentDate < rangeStart) {
        currentDate = new Date(rangeStart);
    }

    while (currentDate <= rangeEnd && occurrenceCount < maxOccurrences) {
        // Check end conditions
        if (item.recurrence.endType === 'date' && item.recurrence.endDate) {
            if (currentDate > new Date(item.recurrence.endDate)) {
                break;
            }
        }
        if (item.recurrence.endType === 'occurrences' && item.recurrence.occurrences) {
            if (occurrenceCount >= item.recurrence.occurrences) {
                break;
            }
        }

        instances.push({
            ...item,
            id: `${item.id}-instance-${occurrenceCount}`,
            instanceDate: currentDate.toISOString(),
            isRecurringInstance: true,
            parentId: item.id,
            occurrenceIndex: occurrenceCount,
        });

        currentDate = getNextOccurrence(currentDate, item.recurrence);
        if (!currentDate) break;
        occurrenceCount++;
    }

    return instances;
}

/**
 * Update all future instances in a recurring series
 * @param {string} seriesId - ID of the recurring series
 * @param {Object} changes - Changes to apply
 * @param {string} updateType - 'single', 'future', or 'all'
 * @returns {Object} Update result
 */
export function updateRecurringSeries(seriesId, changes, updateType = 'all') {
    // In production, this would update the database
    return {
        success: true,
        message: updateType === 'single'
            ? 'This instance has been updated.'
            : updateType === 'future'
                ? 'This and all future instances have been updated.'
                : 'All instances in this series have been updated.',
        affectedInstances: updateType === 'single' ? 1 : 'all',
    };
}

/**
 * Delete a recurring series or instance
 * @param {string} seriesId - ID of the recurring series
 * @param {string} deleteType - 'single', 'future', or 'all'
 * @returns {Object} Delete result
 */
export function deleteRecurringSeries(seriesId, deleteType = 'all') {
    return {
        success: true,
        message: deleteType === 'single'
            ? 'This instance has been deleted. Other occurrences remain.'
            : deleteType === 'future'
                ? 'This and all future instances have been cancelled.'
                : 'The entire recurring series has been deleted.',
        deleteType,
    };
}

/**
 * Get human-readable recurrence description
 * @param {Object} recurrence - Recurrence configuration
 * @returns {string} Human-readable description
 */
export function getRecurrenceDescription(recurrence) {
    if (!recurrence) return '';

    let description = '';

    switch (recurrence.pattern) {
        case RECURRENCE_PATTERNS.DAILY:
            description = recurrence.interval === 1
                ? 'Repeats daily'
                : `Repeats every ${recurrence.interval} days`;
            break;

        case RECURRENCE_PATTERNS.WEEKLY:
            description = recurrence.interval === 1
                ? 'Repeats weekly'
                : `Repeats every ${recurrence.interval} weeks`;
            break;

        case RECURRENCE_PATTERNS.BIWEEKLY:
            description = 'Repeats every 2 weeks';
            break;

        case RECURRENCE_PATTERNS.MONTHLY:
            description = recurrence.interval === 1
                ? 'Repeats monthly'
                : `Repeats every ${recurrence.interval} months`;
            break;

        case RECURRENCE_PATTERNS.CUSTOM:
            if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
                const days = recurrence.daysOfWeek
                    .map(d => DAYS_OF_WEEK.find(day => day.value === d)?.short)
                    .join(', ');
                description = `Repeats on ${days}`;
            } else {
                description = 'Custom recurrence';
            }
            break;

        default:
            description = 'Repeating';
    }

    // Add end information
    if (recurrence.endType === 'date' && recurrence.endDate) {
        const endDate = new Date(recurrence.endDate).toLocaleDateString();
        description += ` until ${endDate}`;
    } else if (recurrence.endType === 'occurrences' && recurrence.occurrences) {
        description += `, ${recurrence.occurrences} times`;
    }

    return description;
}

/**
 * Helper function to get days in a month
 */
function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Check if an item has active recurrence
 */
export function isRecurring(item) {
    return item.recurrence && item.recurrence.pattern;
}

/**
 * Get recurrence icon/badge info
 */
export function getRecurrenceBadge(recurrence) {
    if (!recurrence) return null;

    const iconMap = {
        [RECURRENCE_PATTERNS.DAILY]: '📅',
        [RECURRENCE_PATTERNS.WEEKLY]: '📆',
        [RECURRENCE_PATTERNS.BIWEEKLY]: '🗓️',
        [RECURRENCE_PATTERNS.MONTHLY]: '📊',
        [RECURRENCE_PATTERNS.CUSTOM]: '🔄',
    };

    return {
        icon: iconMap[recurrence.pattern] || '🔁',
        label: getRecurrenceDescription(recurrence),
    };
}
