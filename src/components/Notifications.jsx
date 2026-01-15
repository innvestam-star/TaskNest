import { useState, useEffect } from 'react';
import { Bell, X, Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import styles from './Notifications.module.css';

const Notifications = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Sample data - in production would come from context/state
    const tasks = [
        { id: 1, title: 'Design System Update', time: '10:00 AM', dueDate: '2026-01-16', status: 'In Progress', priority: 'High' },
        { id: 2, title: 'Client Meeting', time: '2:00 PM', dueDate: '2026-01-15', status: 'Pending', priority: 'Medium' },
        { id: 3, title: 'Fix Auth Bug', time: '4:30 PM', dueDate: '2026-01-14', status: 'Completed', priority: 'Low' },
    ];

    const appointments = [
        { id: 101, title: 'Team Standup', time: '09:00 AM', date: '2026-01-16', duration: '30 min' },
        { id: 102, title: 'Client Presentation', time: '02:00 PM', date: '2026-01-16', duration: '1 hour' },
    ];

    useEffect(() => {
        generateNotifications();
    }, []);

    const generateNotifications = () => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const notifs = [];

        // Overdue tasks
        tasks.forEach(task => {
            if (task.status !== 'Completed' && task.dueDate < todayStr) {
                notifs.push({
                    id: `overdue-${task.id}`,
                    type: 'overdue',
                    title: 'Overdue Task',
                    message: task.title,
                    time: `Due: ${formatDate(task.dueDate)}`,
                    icon: AlertTriangle,
                    read: false
                });
            }
        });

        // Tasks due today
        tasks.forEach(task => {
            if (task.status !== 'Completed' && task.dueDate === todayStr) {
                notifs.push({
                    id: `today-${task.id}`,
                    type: 'today',
                    title: 'Due Today',
                    message: task.title,
                    time: task.time,
                    icon: Clock,
                    read: false
                });
            }
        });

        // Appointments today
        appointments.forEach(apt => {
            if (apt.date === todayStr) {
                notifs.push({
                    id: `apt-${apt.id}`,
                    type: 'appointment',
                    title: 'Upcoming Appointment',
                    message: apt.title,
                    time: apt.time,
                    icon: Calendar,
                    read: false
                });
            }
        });

        // Completed tasks (recent)
        tasks.filter(t => t.status === 'Completed').slice(0, 1).forEach(task => {
            notifs.push({
                id: `completed-${task.id}`,
                type: 'completed',
                title: 'Task Completed',
                message: task.title,
                time: 'Just now',
                icon: CheckCircle,
                read: true
            });
        });

        setNotifications(notifs);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const clearAll = () => {
        setNotifications([]);
        setIsOpen(false);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className={styles.container}>
            <button
                className={styles.bellBtn}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Notifications</h3>
                        {notifications.length > 0 && (
                            <button className={styles.clearBtn} onClick={clearAll}>Clear All</button>
                        )}
                    </div>

                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>No notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`${styles.item} ${styles[notif.type]} ${notif.read ? styles.read : ''}`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className={styles.iconWrapper}>
                                        <notif.icon size={18} />
                                    </div>
                                    <div className={styles.content}>
                                        <span className={styles.title}>{notif.title}</span>
                                        <span className={styles.message}>{notif.message}</span>
                                        <span className={styles.time}>{notif.time}</span>
                                    </div>
                                    {!notif.read && <span className={styles.dot}></span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
