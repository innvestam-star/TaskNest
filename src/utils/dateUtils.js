/**
 * Date Utility Module for TaskNest
 * Centralised date formatting, comparison, and helper functions.
 */

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current time as HH:MM string, rounded to nearest 15 minutes
 */
export function getNowTimeString() {
    const now = new Date();
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    const rounded = new Date(now);
    rounded.setMinutes(minutes % 60);
    if (minutes === 60) rounded.setHours(rounded.getHours() + 1);
    rounded.setSeconds(0);
    return rounded.toTimeString().slice(0, 5);
}

/**
 * Get current datetime as datetime-local input value
 */
export function getNowDateTimeLocal() {
    const now = new Date();
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    const rounded = new Date(now);
    rounded.setMinutes(minutes % 60);
    if (minutes === 60) rounded.setHours(rounded.getHours() + 1);
    rounded.setSeconds(0);
    rounded.setMilliseconds(0);
    const year = rounded.getFullYear();
    const month = String(rounded.getMonth() + 1).padStart(2, '0');
    const day = String(rounded.getDate()).padStart(2, '0');
    const hours = String(rounded.getHours()).padStart(2, '0');
    const mins = String(rounded.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
}

/**
 * Get a datetime-local value offset by a number of hours from a reference
 */
export function getDateTimeLocalOffset(refDateTimeLocal, offsetHours) {
    const ref = new Date(refDateTimeLocal);
    ref.setHours(ref.getHours() + offsetHours);
    const year = ref.getFullYear();
    const month = String(ref.getMonth() + 1).padStart(2, '0');
    const day = String(ref.getDate()).padStart(2, '0');
    const hours = String(ref.getHours()).padStart(2, '0');
    const mins = String(ref.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
}

/**
 * Format an ISO date (or legacy string) as a human-readable relative string
 * Returns "Today", "Tomorrow", "Yesterday", or "Feb 12" style
 */
export function formatDateRelative(dateStr) {
    if (!dateStr) return '';

    // Handle legacy string dates
    const legacyMap = { today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday' };
    const lower = dateStr.toLowerCase?.();
    if (legacyMap[lower]) return legacyMap[lower];

    const input = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    if (isNaN(input.getTime())) return dateStr;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDay = new Date(input);
    inputDay.setHours(0, 0, 0, 0);

    const diffMs = inputDay.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return input.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Format a 24h time string (HH:MM) to 12h format (5:00 PM)
 */
export function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Get time-aware greeting
 */
export function getGreetingTime() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
}

/**
 * Check if a date string represents today
 */
export function isToday(dateStr) {
    if (!dateStr) return false;
    if (dateStr.toLowerCase?.() === 'today') return true;
    const todayISO = getTodayISO();
    const inputISO = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    return inputISO === todayISO;
}

/**
 * Get an ISO date string relative to today
 * @param {number} daysOffset - Number of days from today (negative for past)
 */
export function getRelativeDate(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
}
