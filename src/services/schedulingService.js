/**
 * Smart Scheduling Service for TaskNest
 * AI-powered time suggestions and schedule optimization
 */

// Simulated delay for async operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Default working hours
const DEFAULT_WORKING_HOURS = {
    start: 9, // 9 AM
    end: 18,  // 6 PM
};

// Time slot duration in minutes
const SLOT_DURATION = 30;

/**
 * Get mock existing events for a given date
 * In production, this would fetch from calendar/database
 */
function getMockEvents(date) {
    const dateStr = date.toISOString().split('T')[0];

    // Simulate some existing events
    const mockEvents = [
        { start: '09:00', end: '09:30', title: 'Morning standup' },
        { start: '12:00', end: '13:00', title: 'Lunch break' },
        { start: '15:00', end: '16:00', title: 'Team meeting' },
    ];

    return mockEvents;
}

/**
 * Parse time string to minutes from midnight
 */
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight to time string
 */
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Find available time slots for a given date and duration
 * @param {Date} date - The date to check
 * @param {number} duration - Required duration in minutes
 * @param {Object} workingHours - Optional custom working hours
 * @returns {Array<{start: string, end: string}>} Available slots
 */
export function findAvailableSlots(date, duration = 60, workingHours = DEFAULT_WORKING_HOURS) {
    const events = getMockEvents(date);
    const slots = [];

    const dayStart = workingHours.start * 60;
    const dayEnd = workingHours.end * 60;

    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) =>
        timeToMinutes(a.start) - timeToMinutes(b.start)
    );

    let currentTime = dayStart;

    for (const event of sortedEvents) {
        const eventStart = timeToMinutes(event.start);
        const eventEnd = timeToMinutes(event.end);

        // Check if there's a gap before this event
        if (eventStart - currentTime >= duration) {
            slots.push({
                start: minutesToTime(currentTime),
                end: minutesToTime(currentTime + duration),
                available: true,
            });
        }

        // Move current time past this event
        currentTime = Math.max(currentTime, eventEnd);
    }

    // Check remaining time until day end
    while (currentTime + duration <= dayEnd) {
        slots.push({
            start: minutesToTime(currentTime),
            end: minutesToTime(currentTime + duration),
            available: true,
        });
        currentTime += SLOT_DURATION;
    }

    return slots;
}

/**
 * Suggest optimal time for a task based on various factors
 * @param {Object} task - Task object with title, priority, duration
 * @returns {Promise<Object>} Suggested time slot with reasoning
 */
export async function suggestOptimalTime(task) {
    await delay(500); // Simulate processing

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get available slots for today and tomorrow
    const todaySlots = findAvailableSlots(today, task.duration || 60);
    const tomorrowSlots = findAvailableSlots(tomorrow, task.duration || 60);

    let suggestion = null;
    let reasoning = '';

    // Priority-based time suggestions
    if (task.priority === 'High') {
        // High priority: suggest morning slots (9-11 AM) for peak focus
        suggestion = todaySlots.find(slot => {
            const startHour = parseInt(slot.start.split(':')[0]);
            return startHour >= 9 && startHour < 11;
        });
        reasoning = 'Morning hours are optimal for high-priority tasks when focus is at its peak.';
    } else if (task.priority === 'Medium') {
        // Medium priority: suggest afternoon slots
        suggestion = todaySlots.find(slot => {
            const startHour = parseInt(slot.start.split(':')[0]);
            return startHour >= 14 && startHour < 17;
        });
        reasoning = 'Afternoon slots work well for medium-priority tasks after the morning focus block.';
    } else {
        // Low priority: find any available slot
        suggestion = todaySlots[todaySlots.length - 1];
        reasoning = 'Scheduling low-priority tasks later in the day leaves prime hours for more urgent work.';
    }

    // If no slot today, try tomorrow
    if (!suggestion && tomorrowSlots.length > 0) {
        suggestion = tomorrowSlots[0];
        reasoning = "Today looks busy! I've found a slot for tomorrow morning.";
    }

    return {
        suggestion,
        reasoning,
        alternatives: todaySlots.slice(0, 3),
    };
}

/**
 * Detect schedule conflicts for a new event
 * @param {Object} newEvent - Event with start and end times
 * @param {Array} existingEvents - Array of existing events
 * @returns {Array} List of conflicting events
 */
export function detectScheduleConflicts(newEvent, existingEvents = []) {
    const newStart = timeToMinutes(newEvent.start);
    const newEnd = timeToMinutes(newEvent.end);

    const conflicts = existingEvents.filter(event => {
        const eventStart = timeToMinutes(event.start);
        const eventEnd = timeToMinutes(event.end);

        // Check for overlap
        return (newStart < eventEnd && newEnd > eventStart);
    });

    return conflicts;
}

/**
 * Estimate task duration based on title/description
 * Uses simple heuristics in mock; would use ML in production
 * @param {string} taskTitle - Title of the task
 * @returns {number} Estimated duration in minutes
 */
export function estimateTaskDuration(taskTitle) {
    const lowerTitle = taskTitle.toLowerCase();

    // Duration heuristics
    if (lowerTitle.includes('quick') || lowerTitle.includes('brief')) {
        return 15;
    }
    if (lowerTitle.includes('review') || lowerTitle.includes('check')) {
        return 30;
    }
    if (lowerTitle.includes('meeting') || lowerTitle.includes('call')) {
        return 60;
    }
    if (lowerTitle.includes('deep work') || lowerTitle.includes('focus')) {
        return 120;
    }
    if (lowerTitle.includes('project') || lowerTitle.includes('build')) {
        return 180;
    }

    // Default duration
    return 45;
}

/**
 * Rebalance an overloaded day by suggesting redistributions
 * @param {Array} events - Events for the day
 * @returns {Object} Rebalancing suggestions
 */
export async function rebalanceDay(events) {
    await delay(300);

    const totalMinutes = events.reduce((sum, event) => {
        return sum + (timeToMinutes(event.end) - timeToMinutes(event.start));
    }, 0);

    const workMinutesAvailable = (DEFAULT_WORKING_HOURS.end - DEFAULT_WORKING_HOURS.start) * 60;
    const utilizationRate = totalMinutes / workMinutesAvailable;

    const isOverloaded = utilizationRate > 0.8;

    let suggestions = [];

    if (isOverloaded) {
        // Find moveable events (non-meetings)
        const moveableEvents = events.filter(e =>
            !e.title?.toLowerCase().includes('meeting') &&
            !e.title?.toLowerCase().includes('call')
        );

        if (moveableEvents.length > 0) {
            suggestions.push({
                type: 'move',
                event: moveableEvents[0],
                reason: 'Consider moving this to tomorrow to reduce today\'s workload.',
            });
        }

        suggestions.push({
            type: 'break',
            reason: 'Your day is quite packed. Don\'t forget to take short breaks!',
        });
    }

    return {
        isOverloaded,
        utilizationRate: Math.round(utilizationRate * 100),
        suggestions,
    };
}

/**
 * Suggest reschedule options for a missed task
 * @param {Object} missedTask - The task that was missed
 * @returns {Promise<Object>} Reschedule suggestions
 */
export async function suggestReschedule(missedTask) {
    await delay(400);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const duration = missedTask.duration || estimateTaskDuration(missedTask.title);
    const slots = findAvailableSlots(tomorrow, duration);

    return {
        message: `No worries! Let's find a better time for "${missedTask.title}".`,
        suggestedSlots: slots.slice(0, 3),
        recommendedSlot: slots[0],
    };
}

/**
 * Analyze workload for a day
 * @param {Date} date - Date to analyze
 * @returns {Object} Workload analysis
 */
export function analyzeWorkload(date) {
    const events = getMockEvents(date);
    const slots = findAvailableSlots(date, 30);

    const totalEventMinutes = events.reduce((sum, event) => {
        return sum + (timeToMinutes(event.end) - timeToMinutes(event.start));
    }, 0);

    const freeMinutes = slots.length * SLOT_DURATION;

    return {
        totalMeetings: events.filter(e => e.title?.toLowerCase().includes('meeting')).length,
        busyHours: Math.round(totalEventMinutes / 60 * 10) / 10,
        freeHours: Math.round(freeMinutes / 60 * 10) / 10,
        focusBlocksAvailable: slots.filter((_, i, arr) => {
            // Count blocks of 2+ consecutive slots
            return i < arr.length - 1;
        }).length,
    };
}
