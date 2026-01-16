import { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Booking.module.css';

const Booking = () => {
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [isBooked, setIsBooked] = useState(false);

    const availableTimes = [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
    ];

    const getDaysInMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const isDateAvailable = (date) => {
        if (!date) return false;
        const day = date.getDay();
        return day !== 0 && day !== 6 && date >= new Date();
    };

    const formatDate = (date) => {
        return date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const handleBook = () => {
        setIsBooked(true);
    };

    if (isBooked) {
        return (
            <div className={styles.container}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>
                        <Check size={40} />
                    </div>
                    <h2>Booking Confirmed!</h2>
                    <p>Your appointment has been scheduled.</p>
                    <div className={styles.bookingDetails}>
                        <div><Calendar size={16} /> {formatDate(selectedDate)}</div>
                        <div><Clock size={16} /> {selectedTime}</div>
                        <div><User size={16} /> {formData.name}</div>
                    </div>
                    <p className={styles.confirmMsg}>A confirmation email has been sent to {formData.email}</p>
                    <button className={styles.newBookingBtn} onClick={() => {
                        setIsBooked(false);
                        setStep(1);
                        setSelectedDate(null);
                        setSelectedTime(null);
                        setFormData({ name: '', email: '', phone: '', notes: '' });
                    }}>
                        Book Another Appointment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Book an Appointment</h1>
                <p>Schedule a meeting with our team.</p>
            </header>

            <div className={styles.steps}>
                {['Select Date', 'Choose Time', 'Your Details'].map((label, i) => (
                    <div key={i} className={`${styles.step} ${step > i + 1 ? styles.completed : ''} ${step === i + 1 ? styles.active : ''}`}>
                        <span className={styles.stepNumber}>{step > i + 1 ? <Check size={14} /> : i + 1}</span>
                        <span className={styles.stepLabel}>{label}</span>
                    </div>
                ))}
            </div>

            <div className={styles.content}>
                {step === 1 && (
                    <div className={styles.dateStep}>
                        <h3>Select a Date</h3>
                        <div className={styles.calendarGrid}>
                            <div className={styles.weekDays}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <span key={d}>{d}</span>
                                ))}
                            </div>
                            <div className={styles.days}>
                                {getDaysInMonth().map((date, i) => (
                                    <button
                                        key={i}
                                        className={`${styles.day} ${!date ? styles.empty : ''} ${!isDateAvailable(date) ? styles.disabled : ''} ${selectedDate?.getDate() === date?.getDate() ? styles.selected : ''}`}
                                        onClick={() => isDateAvailable(date) && setSelectedDate(date)}
                                        disabled={!isDateAvailable(date)}
                                    >
                                        {date?.getDate()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className={styles.nextBtn} disabled={!selectedDate} onClick={() => setStep(2)}>
                            Continue
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.timeStep}>
                        <h3>Choose a Time on {formatDate(selectedDate)}</h3>
                        <div className={styles.timeGrid}>
                            {availableTimes.map(time => (
                                <button
                                    key={time}
                                    className={`${styles.timeSlot} ${selectedTime === time ? styles.selected : ''}`}
                                    onClick={() => setSelectedTime(time)}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                        <div className={styles.navBtns}>
                            <button className={styles.backBtn} onClick={() => setStep(1)}>
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button className={styles.nextBtn} disabled={!selectedTime} onClick={() => setStep(3)}>
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className={styles.detailsStep}>
                        <h3>Your Details</h3>
                        <div className={styles.summary}>
                            <span><Calendar size={14} /> {formatDate(selectedDate)}</span>
                            <span><Clock size={14} /> {selectedTime}</span>
                        </div>
                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label><User size={14} /> Full Name *</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label><Mail size={14} /> Email *</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label><Phone size={14} /> Phone</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 234 567 8900" />
                            </div>
                            <div className={styles.formGroup}>
                                <label><MessageSquare size={14} /> Notes</label>
                                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any additional information..." />
                            </div>
                        </div>
                        <div className={styles.navBtns}>
                            <button className={styles.backBtn} onClick={() => setStep(2)}>
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button className={styles.bookBtn} disabled={!formData.name || !formData.email} onClick={handleBook}>
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Booking;
