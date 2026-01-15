import { useState } from 'react';
import { ChevronLeft, ChevronRight, Briefcase, Calendar as CalendarIcon, Clock, Video, MapPin } from 'lucide-react';
import styles from './Calendar.module.css';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'

    // Sample data - in production this would come from state/context
    const tasks = [
        { id: 1, title: 'Design System Update', time: '10:00 AM', dueDate: '2026-01-16', type: 'task', priority: 'High' },
        { id: 2, title: 'Client Meeting', time: '2:00 PM', dueDate: '2026-01-15', type: 'task', priority: 'Medium' },
        { id: 3, title: 'Fix Auth Bug', time: '4:30 PM', dueDate: '2026-01-17', type: 'task', priority: 'Low' },
    ];

    const appointments = [
        { id: 101, title: 'Team Standup', time: '09:00 AM', date: '2026-01-16', duration: '30 min', location: 'Online', type: 'appointment' },
        { id: 102, title: 'Client Presentation', time: '02:00 PM', date: '2026-01-16', duration: '1 hour', location: 'Conference Room', type: 'appointment' },
        { id: 103, title: 'Design Review', time: '11:00 AM', date: '2026-01-17', duration: '45 min', location: 'Online', type: 'appointment' },
    ];

    const allEvents = [
        ...tasks.map(t => ({ ...t, date: t.dueDate })),
        ...appointments
    ];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];
        // Previous month's days
        for (let i = 0; i < startingDay; i++) {
            const prevDate = new Date(year, month, -startingDay + i + 1);
            days.push({ date: prevDate, isCurrentMonth: false });
        }
        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        // Next month's days to complete the grid
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        return days;
    };

    const getWeekDays = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const formatDateKey = (date) => {
        return date.toISOString().split('T')[0];
    };

    const getEventsForDate = (date) => {
        const dateKey = formatDateKey(date);
        return allEvents.filter(event => event.date === dateKey);
    };

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + direction);
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else {
            newDate.setMonth(newDate.getMonth() + direction);
        }
        setCurrentDate(newDate);
    };

    const isToday = (date) => {
        const today = new Date();
        return formatDateKey(date) === formatDateKey(today);
    };

    const formatHeader = () => {
        if (viewMode === 'day') {
            return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        } else if (viewMode === 'week') {
            const weekDays = getWeekDays(currentDate);
            const start = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const end = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `${start} - ${end}`;
        } else {
            return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
    };

    const renderDayView = () => {
        const events = getEventsForDate(currentDate);
        return (
            <div className={styles.dayView}>
                {events.length === 0 ? (
                    <div className={styles.noEvents}>No events scheduled for this day.</div>
                ) : (
                    events.map(event => (
                        <div key={`${event.type}-${event.id}`} className={`${styles.eventCard} ${styles[event.type]}`}>
                            <div className={styles.eventTime}>{event.time}</div>
                            <div className={styles.eventContent}>
                                <h4>{event.title}</h4>
                                {event.type === 'appointment' && (
                                    <span className={styles.eventMeta}>
                                        {event.location === 'Online' ? <Video size={12} /> : <MapPin size={12} />}
                                        {event.location} • {event.duration}
                                    </span>
                                )}
                                {event.type === 'task' && (
                                    <span className={styles.eventMeta}>
                                        <Briefcase size={12} /> {event.priority} Priority
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    const renderWeekView = () => {
        const weekDays = getWeekDays(currentDate);
        return (
            <div className={styles.weekView}>
                <div className={styles.weekHeader}>
                    {weekDays.map((day, i) => (
                        <div key={i} className={`${styles.weekDay} ${isToday(day) ? styles.today : ''}`}>
                            <span className={styles.dayName}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className={styles.dayNumber}>{day.getDate()}</span>
                        </div>
                    ))}
                </div>
                <div className={styles.weekBody}>
                    {weekDays.map((day, i) => {
                        const events = getEventsForDate(day);
                        return (
                            <div key={i} className={styles.weekColumn}>
                                {events.map(event => (
                                    <div key={`${event.type}-${event.id}`} className={`${styles.weekEvent} ${styles[event.type]}`}>
                                        <span className={styles.eventTime}>{event.time}</span>
                                        <span className={styles.eventTitle}>{event.title}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const days = getDaysInMonth(currentDate);
        return (
            <div className={styles.monthView}>
                <div className={styles.monthHeader}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className={styles.monthDayName}>{day}</div>
                    ))}
                </div>
                <div className={styles.monthGrid}>
                    {days.map((day, i) => {
                        const events = getEventsForDate(day.date);
                        return (
                            <div
                                key={i}
                                className={`${styles.monthDay} ${!day.isCurrentMonth ? styles.otherMonth : ''} ${isToday(day.date) ? styles.today : ''}`}
                            >
                                <span className={styles.monthDayNumber}>{day.date.getDate()}</span>
                                <div className={styles.monthEvents}>
                                    {events.slice(0, 2).map(event => (
                                        <div key={`${event.type}-${event.id}`} className={`${styles.monthEvent} ${styles[event.type]}`}>
                                            {event.title}
                                        </div>
                                    ))}
                                    {events.length > 2 && (
                                        <div className={styles.moreEvents}>+{events.length - 2} more</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1>Calendar</h1>
                    <p>View your tasks and appointments.</p>
                </div>
                <div className={styles.viewToggle}>
                    {['day', 'week', 'month'].map(mode => (
                        <button
                            key={mode}
                            className={`${styles.toggleBtn} ${viewMode === mode ? styles.active : ''}`}
                            onClick={() => setViewMode(mode)}
                        >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                    ))}
                </div>
            </header>

            <div className={styles.navigation}>
                <button className={styles.navBtn} onClick={() => navigateDate(-1)}>
                    <ChevronLeft size={20} />
                </button>
                <h2 className={styles.currentPeriod}>{formatHeader()}</h2>
                <button className={styles.navBtn} onClick={() => navigateDate(1)}>
                    <ChevronRight size={20} />
                </button>
                <button className={styles.todayBtn} onClick={() => setCurrentDate(new Date())}>Today</button>
            </div>

            <div className={styles.legend}>
                <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.task}`}></span> Tasks</span>
                <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.appointment}`}></span> Appointments</span>
            </div>

            <div className={styles.calendarContent}>
                {viewMode === 'day' && renderDayView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'month' && renderMonthView()}
            </div>
        </div>
    );
};

export default Calendar;
