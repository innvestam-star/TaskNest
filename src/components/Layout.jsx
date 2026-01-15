import { Outlet } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import Sidebar from './Sidebar';
import Notifications from './Notifications';
import styles from './Layout.module.css';

const Layout = () => {
    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.searchBar}>
                        <Search size={18} className={styles.searchIcon} />
                        <input type="text" placeholder="Search tasks, projects..." />
                    </div>

                    <div className={styles.actions}>
                        <Notifications />
                        <button className={styles.profileBtn}>
                            <User size={20} />
                        </button>
                    </div>
                </header>


                <div className={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
