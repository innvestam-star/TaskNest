/**
 * Client Booking Service for TaskNest
 * Manages public booking page and client appointments
 */

// Simulated delay for async operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Default booking configuration
const DEFAULT_CONFIG = {
    businessName: 'My Business',
    description: 'Book a meeting with me',
    timezone: 'Africa/Johannesburg',
    workingHours: {
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: true, start: '09:00', end: '17:00' },
        saturday: { enabled: false, start: '10:00', end: '14:00' },
        sunday: { enabled: false, start: '10:00', end: '14:00' },
    },
    bufferTime: 15, // minutes between appointments
    leadTime: 24, // hours in advance required
    maxAdvanceDays: 30, // how far in future clients can book
};

// Default service types
const DEFAULT_SERVICES = [
    {
        id: 'consultation',
        name: 'Initial Consultation',
        duration: 30,
        description: 'A 30-minute introductory call to discuss your needs.',
        price: 0,
        color: '#3B82F6',
    },
    {
        id: 'meeting',
        name: 'Strategy Meeting',
        duration: 60,
        description: 'A 1-hour deep-dive session for detailed planning.',
        price: 0,
        color: '#8B5CF6',
    },
];

/**
 * Get the booking configuration for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Booking configuration
 */
export async function getBookingConfig(userId) {
    await delay(200);

    // In production, fetch from database
    const stored = localStorage.getItem(`booking_config_${userId}`);
    if (stored) {
        return JSON.parse(stored);
    }

    return { ...DEFAULT_CONFIG, services: [...DEFAULT_SERVICES] };
}

/**
 * Save booking configuration
 * @param {string} userId - User ID
 * @param {Object} config - Booking configuration
 */
export async function saveBookingConfig(userId, config) {
    await delay(300);
    localStorage.setItem(`booking_config_${userId}`, JSON.stringify(config));
    return { success: true };
}

/**
 * Get available time slots for a specific date and service
 * @param {string} userId - Provider's user ID
 * @param {Date} date - Date to check
 * @param {string} serviceId - Service type ID
 * @returns {Promise<Array>} Available time slots
 */
export async function getAvailableSlots(userId, date, serviceId) {
    await delay(400);

    const config = await getBookingConfig(userId);
    const service = config.services?.find(s => s.id === serviceId) || DEFAULT_SERVICES[0];

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayConfig = config.workingHours?.[dayName];

    if (!dayConfig?.enabled) {
        return [];
    }

    const slots = [];
    const [startHour, startMin] = dayConfig.start.split(':').map(Number);
    const [endHour, endMin] = dayConfig.end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const slotDuration = service.duration + (config.bufferTime || 15);

    // Get existing bookings for this date (mock)
    const existingBookings = await getBookingsForDate(userId, date);

    for (let time = startMinutes; time + service.duration <= endMinutes; time += 30) {
        const slotStart = `${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`;
        const slotEnd = `${Math.floor((time + service.duration) / 60).toString().padStart(2, '0')}:${((time + service.duration) % 60).toString().padStart(2, '0')}`;

        // Check if slot conflicts with existing bookings
        const hasConflict = existingBookings.some(booking => {
            const bookingStart = timeToMinutes(booking.start);
            const bookingEnd = timeToMinutes(booking.end);
            return time < bookingEnd && time + service.duration > bookingStart;
        });

        if (!hasConflict) {
            slots.push({
                start: slotStart,
                end: slotEnd,
                available: true,
            });
        }
    }

    return slots;
}

/**
 * Get bookings for a specific date
 */
async function getBookingsForDate(userId, date) {
    // Mock existing bookings
    return [
        { start: '10:00', end: '10:30', title: 'Existing meeting' },
        { start: '14:00', end: '15:00', title: 'Team sync' },
    ];
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Create a new booking
 * @param {Object} bookingData - Booking details
 * @returns {Promise<Object>} Created booking
 */
export async function createBooking(bookingData) {
    await delay(500);

    const booking = {
        id: `booking_${Date.now()}`,
        ...bookingData,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
    };

    // Store booking in localStorage (mock database)
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));

    return {
        success: true,
        booking,
        message: 'Your appointment has been booked successfully!',
    };
}

/**
 * Confirm a booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Confirmation result
 */
export async function confirmBooking(bookingId) {
    await delay(300);

    return {
        success: true,
        message: 'Booking confirmed. A confirmation email has been sent.',
        calendarLink: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting&dates=...`,
    };
}

/**
 * Cancel a booking
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Cancellation result
 */
export async function cancelBooking(bookingId, reason = '') {
    await delay(300);

    return {
        success: true,
        message: 'Booking has been cancelled. We hope to see you again soon.',
    };
}

/**
 * Get all bookings for a provider
 * @param {string} userId - Provider's user ID
 * @returns {Promise<Array>} List of bookings
 */
export async function getProviderBookings(userId) {
    await delay(300);

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    return bookings.filter(b => b.providerId === userId);
}

/**
 * Generate booking page URL slug
 * @param {string} businessName - Business name
 * @returns {string} URL-safe slug
 */
export function generateSlug(businessName) {
    return businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/**
 * Validate booking page slug availability
 * @param {string} slug - URL slug
 * @returns {Promise<boolean>} Whether slug is available
 */
export async function isSlugAvailable(slug) {
    await delay(200);
    // In production, check against database
    const reserved = ['admin', 'api', 'app', 'www', 'booking'];
    return !reserved.includes(slug);
}
