import { LayoutDashboard, CheckSquare, Calendar, CalendarDays, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: CheckSquare, label: 'My Tasks', path: '/my-tasks' },
        { icon: Calendar, label: 'Schedule', path: '/schedule' },
        { icon: CalendarDays, label: 'Calendar', path: '/calendar' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                Task<span>Nest</span>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className={styles.footer}>
                <button className={styles.signOut}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
