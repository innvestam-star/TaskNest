/**
 * Reminder Service for TaskNest
 * Manages reminders for tasks and appointments
 */

// Default reminder preferences
const DEFAULT_PREFERENCES = {
    taskReminder: '30', // minutes before
    appointmentReminder: '15', // minutes before
    emailEnabled: true,
    pushEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
};

// Reminder timing options
export const REMINDER_OPTIONS = [
    { value: '0', label: 'At time of event' },
    { value: '5', label: '5 minutes before' },
    { value: '10', label: '10 minutes before' },
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '120', label: '2 hours before' },
    { value: '1440', label: '1 day before' },
    { value: 'custom', label: 'Custom time' },
];

/**
 * Get user's reminder preferences
 * @param {string} userId - User ID
 * @returns {Object} Reminder preferences
 */
export function getReminderPreferences(userId) {
    const stored = localStorage.getItem(`reminder_prefs_${userId || 'demo'}`);
    if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
    return { ...DEFAULT_PREFERENCES };
}

/**
 * Save user's reminder preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - Reminder preferences
 */
export function setReminderPreferences(userId, preferences) {
    localStorage.setItem(`reminder_prefs_${userId || 'demo'}`, JSON.stringify(preferences));
    return { success: true };
}

/**
 * Schedule a reminder for an item
 * @param {Object} item - Task or appointment object
 * @param {string} timing - Minutes before to remind
 * @returns {Object} Scheduled reminder
 */
export function scheduleReminder(item, timing) {
    const reminder = {
        id: `reminder_${Date.now()}`,
        itemId: item.id,
        itemType: item.startTime ? 'appointment' : 'task',
        itemTitle: item.title,
        timing: parseInt(timing),
        scheduledFor: calculateReminderTime(item, timing),
        notified: false,
        createdAt: new Date().toISOString(),
    };

    // Store reminder
    const reminders = JSON.parse(localStorage.getItem('scheduled_reminders') || '[]');
    reminders.push(reminder);
    localStorage.setItem('scheduled_reminders', JSON.stringify(reminders));

    return reminder;
}

/**
 * Calculate when a reminder should fire
 * @param {Object} item - Task or appointment
 * @param {string} timing - Minutes before
 * @returns {string} ISO timestamp for reminder
 */
function calculateReminderTime(item, timing) {
    const eventTime = item.startTime
        ? new Date(item.startTime)
        : new Date(`${item.dueDate}T${item.dueTime || '09:00'}`);

    const reminderTime = new Date(eventTime.getTime() - parseInt(timing) * 60000);
    return reminderTime.toISOString();
}

/**
 * Get pending reminders
 * @returns {Array} Reminders that should be shown
 */
export function getPendingReminders() {
    const reminders = JSON.parse(localStorage.getItem('scheduled_reminders') || '[]');
    const now = new Date();

    return reminders.filter(reminder => {
        const reminderTime = new Date(reminder.scheduledFor);
        return reminderTime <= now && !reminder.notified;
    });
}

/**
 * Mark a reminder as notified
 * @param {string} reminderId - Reminder ID
 */
export function markReminderNotified(reminderId) {
    const reminders = JSON.parse(localStorage.getItem('scheduled_reminders') || '[]');
    const updated = reminders.map(r =>
        r.id === reminderId ? { ...r, notified: true } : r
    );
    localStorage.setItem('scheduled_reminders', JSON.stringify(updated));
}

/**
 * Dismiss a reminder
 * @param {string} reminderId - Reminder ID
 */
export function dismissReminder(reminderId) {
    const reminders = JSON.parse(localStorage.getItem('scheduled_reminders') || '[]');
    const updated = reminders.filter(r => r.id !== reminderId);
    localStorage.setItem('scheduled_reminders', JSON.stringify(updated));
}

/**
 * Snooze a reminder
 * @param {string} reminderId - Reminder ID
 * @param {number} minutes - Minutes to snooze
 */
export function snoozeReminder(reminderId, minutes = 10) {
    const reminders = JSON.parse(localStorage.getItem('scheduled_reminders') || '[]');
    const updated = reminders.map(r => {
        if (r.id === reminderId) {
            const newTime = new Date(Date.now() + minutes * 60000);
            return { ...r, scheduledFor: newTime.toISOString(), notified: false };
        }
        return r;
    });
    localStorage.setItem('scheduled_reminders', JSON.stringify(updated));
}

/**
 * Check if we're in quiet hours
 * @param {Object} preferences - User preferences
 * @returns {boolean} Whether quiet hours are active
 */
export function isQuietHours(preferences) {
    if (!preferences.quietHoursEnabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Get upcoming reminders for today
 * @returns {Array} Today's reminders
 */
export function getTodaysReminders() {
    const reminders = JSON.parse(localStorage.getItem('scheduled_reminders') || '[]');
    const today = new Date().toISOString().split('T')[0];

    return reminders.filter(reminder => {
        const reminderDate = reminder.scheduledFor.split('T')[0];
        return reminderDate === today && !reminder.notified;
    }).sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
}

/**
 * Create default reminders for a new item based on user preferences
 * @param {Object} item - New task or appointment
 * @param {string} userId - User ID
 * @returns {Object} Created reminder
 */
export function createDefaultReminder(item, userId) {
    const preferences = getReminderPreferences(userId);
    const timing = item.startTime
        ? preferences.appointmentReminder
        : preferences.taskReminder;

    if (timing && timing !== 'none') {
        return scheduleReminder(item, timing);
    }

    return null;
}
