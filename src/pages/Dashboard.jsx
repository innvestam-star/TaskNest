import { useState } from 'react';
import { Briefcase, Clock, CheckCircle, AlertCircle, Plus, Edit2, Trash2, Calendar, Flag } from 'lucide-react';
import Modal from '../components/Modal';
import modalStyles from '../components/Modal.module.css';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Design System Update', time: '10:00 AM', category: 'Design', status: 'In Progress', priority: 'High', dueDate: '2026-01-16' },
        { id: 2, title: 'Client Meeting', time: '2:00 PM', category: 'Meeting', status: 'Pending', priority: 'Medium', dueDate: '2026-01-15' },
        { id: 3, title: 'Fix Auth Bug', time: '4:30 PM', category: 'Dev', status: 'Completed', priority: 'Low', dueDate: '2026-01-14' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        time: '',
        category: '',
        status: 'Pending',
        priority: 'Medium',
        dueDate: ''
    });

    const stats = [
        { label: 'Total Tasks', value: tasks.length, icon: Briefcase, color: 'var(--status-purple)' },
        { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, icon: Clock, color: 'var(--status-orange)' },
        { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, icon: CheckCircle, color: 'var(--status-green)' },
        { label: 'Overdue', value: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length, icon: AlertCircle, color: 'var(--status-red)' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return 'var(--status-orange)';
            case 'Completed': return 'var(--status-green)';
            default: return 'var(--text-secondary)';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'In Progress': return 'var(--status-orange-bg)';
            case 'Completed': return 'var(--status-green-bg)';
            default: return 'rgba(143, 144, 152, 0.15)';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'var(--status-red)';
            case 'Medium': return 'var(--status-orange)';
            case 'Low': return 'var(--status-green)';
            default: return 'var(--text-muted)';
        }
    };

    const openAddModal = () => {
        setEditingTask(null);
        setFormData({ title: '', time: '', category: '', status: 'Pending', priority: 'Medium', dueDate: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            time: task.time,
            category: task.category,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTask) {
            setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData } : t));
        } else {
            const newTask = { id: Date.now(), ...formData };
            setTasks([...tasks, newTask]);
        }
        closeModal();
    };

    const handleDelete = () => {
        if (editingTask) {
            setTasks(tasks.filter(t => t.id !== editingTask.id));
            closeModal();
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <p>Here's your daily overview.</p>
            </header>

            <div className={styles.statsGrid}>
                {stats.map((stat) => (
                    <div key={stat.label} className={styles.statCard}>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>{stat.label}</span>
                            <span className={styles.statValue}>{stat.value}</span>
                        </div>
                        <div className={styles.statIcon} style={{ color: stat.color }}>
                            <stat.icon size={18} />
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.sectionHeader}>
                <h2>Recent Tasks</h2>
                <div className={styles.headerActions}>
                    <button className={styles.viewAllBtn}>View All</button>
                    <button className={styles.addTaskBtn} onClick={openAddModal}>
                        <Plus size={16} />
                        New Task
                    </button>
                </div>
            </div>

            <div className={styles.taskList}>
                {tasks.map((task) => (
                    <div key={task.id} className={styles.taskItem}>
                        <div className={styles.taskLeft}>
                            <div className={styles.taskIcon}>
                                <Briefcase size={18} />
                            </div>
                            <div className={styles.taskInfo}>
                                <h3>{task.title}</h3>
                                <p>
                                    {task.time} • {task.category}
                                    {task.dueDate && <span className={styles.dueDateBadge}><Calendar size={12} /> {formatDate(task.dueDate)}</span>}
                                </p>
                            </div>
                        </div>
                        <div className={styles.taskRight}>
                            <span className={styles.priorityBadge} style={{ color: getPriorityColor(task.priority) }}>
                                <Flag size={12} /> {task.priority}
                            </span>
                            <span
                                className={styles.statusBadge}
                                style={{
                                    color: getStatusColor(task.status),
                                    backgroundColor: getStatusBg(task.status)
                                }}
                            >
                                {task.status}
                            </span>
                            <button className={styles.editBtn} onClick={() => openEditModal(task)}>
                                <Edit2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div className={styles.emptyState}>No tasks yet. Click "New Task" to add one.</div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTask ? 'Edit Task' : 'New Task'}>
                <form className={modalStyles.form} onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label>Task Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter task title"
                            required
                        />
                    </div>
                    <div className={modalStyles.formRow}>
                        <div className={modalStyles.formGroup}>
                            <label>Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                        <div className={modalStyles.formGroup}>
                            <label>Time</label>
                            <input
                                type="text"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                placeholder="e.g., 10:00 AM"
                            />
                        </div>
                    </div>
                    <div className={modalStyles.formRow}>
                        <div className={modalStyles.formGroup}>
                            <label>Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div className={modalStyles.formGroup}>
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label>Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="e.g., Design, Dev, Meeting"
                        />
                    </div>
                    <div className={modalStyles.formActions}>
                        {editingTask && (
                            <button type="button" className={modalStyles.deleteBtn} onClick={handleDelete}>
                                <Trash2 size={16} /> Delete
                            </button>
                        )}
                        <button type="button" className={modalStyles.cancelBtn} onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className={modalStyles.submitBtn}>
                            {editingTask ? 'Save' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Dashboard;
