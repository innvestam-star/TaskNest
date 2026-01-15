import { useState } from 'react';
import { Plus, Edit2, Trash2, Filter, Flag, Briefcase, Calendar, Repeat, Sparkles, Wand2 } from 'lucide-react';
import Modal from '../components/Modal';
import modalStyles from '../components/Modal.module.css';
import styles from './MyTasks.module.css';

const MyTasks = () => {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Design System Update', time: '10:00 AM', category: 'Design', status: 'In Progress', priority: 'High', dueDate: '2026-01-16', recurring: 'none' },
        { id: 2, title: 'Client Meeting', time: '2:00 PM', category: 'Meeting', status: 'Pending', priority: 'Medium', dueDate: '2026-01-15', recurring: 'weekly' },
        { id: 3, title: 'Fix Auth Bug', time: '4:30 PM', category: 'Dev', status: 'Completed', priority: 'Low', dueDate: '2026-01-14', recurring: 'none' },
        { id: 4, title: 'Write Documentation', time: '11:00 AM', category: 'Dev', status: 'Pending', priority: 'Medium', dueDate: '2026-01-17', recurring: 'none' },
        { id: 5, title: 'Daily Standup', time: '9:00 AM', category: 'Meeting', status: 'Pending', priority: 'High', dueDate: '2026-01-16', recurring: 'daily' },
    ]);

    const [filter, setFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [aiInput, setAiInput] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [formData, setFormData] = useState({
        title: '', time: '', category: '', status: 'Pending', priority: 'Medium', dueDate: '', recurring: 'none'
    });

    const filteredTasks = tasks.filter(task => {
        const statusMatch = filter === 'All' || task.status === filter;
        const priorityMatch = priorityFilter === 'All' || task.priority === priorityFilter;
        return statusMatch && priorityMatch;
    });

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
        setFormData({ title: '', time: '', category: '', status: 'Pending', priority: 'Medium', dueDate: '', recurring: 'none' });
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({ ...task });
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
            setTasks([...tasks, { id: Date.now(), ...formData }]);
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
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // AI Task Assistant - breaks down complex tasks
    const handleAIBreakdown = () => {
        if (!aiInput.trim()) return;

        // Simulated AI breakdown (in production, this would call an AI API)
        const breakdowns = {
            'prepare for exam': [
                { title: 'Gather study materials', priority: 'High', category: 'Study', time: '9:00 AM' },
                { title: 'Create study schedule', priority: 'High', category: 'Planning', time: '10:00 AM' },
                { title: 'Review Chapter 1-3', priority: 'Medium', category: 'Study', time: '11:00 AM' },
                { title: 'Practice exercises', priority: 'Medium', category: 'Study', time: '2:00 PM' },
                { title: 'Take mock test', priority: 'High', category: 'Study', time: '4:00 PM' },
            ],
            'launch website': [
                { title: 'Finalize design assets', priority: 'High', category: 'Design', time: '9:00 AM' },
                { title: 'Complete frontend development', priority: 'High', category: 'Dev', time: '10:00 AM' },
                { title: 'Set up hosting', priority: 'Medium', category: 'Dev', time: '2:00 PM' },
                { title: 'Configure domain', priority: 'Medium', category: 'Dev', time: '3:00 PM' },
                { title: 'Test all features', priority: 'High', category: 'QA', time: '4:00 PM' },
                { title: 'Deploy to production', priority: 'High', category: 'Dev', time: '5:00 PM' },
            ],
            'organize event': [
                { title: 'Set event date and venue', priority: 'High', category: 'Planning', time: '9:00 AM' },
                { title: 'Create guest list', priority: 'Medium', category: 'Planning', time: '10:00 AM' },
                { title: 'Send invitations', priority: 'High', category: 'Communication', time: '11:00 AM' },
                { title: 'Arrange catering', priority: 'Medium', category: 'Logistics', time: '2:00 PM' },
                { title: 'Prepare agenda', priority: 'Medium', category: 'Planning', time: '3:00 PM' },
            ]
        };

        const inputLower = aiInput.toLowerCase();
        let suggestions = [];

        // Match against known patterns or generate generic breakdown
        if (inputLower.includes('exam') || inputLower.includes('test') || inputLower.includes('study')) {
            suggestions = breakdowns['prepare for exam'];
        } else if (inputLower.includes('website') || inputLower.includes('launch') || inputLower.includes('deploy')) {
            suggestions = breakdowns['launch website'];
        } else if (inputLower.includes('event') || inputLower.includes('party') || inputLower.includes('meeting')) {
            suggestions = breakdowns['organize event'];
        } else {
            // Generic breakdown
            suggestions = [
                { title: `Research: ${aiInput}`, priority: 'High', category: 'Research', time: '9:00 AM' },
                { title: `Plan: ${aiInput}`, priority: 'High', category: 'Planning', time: '10:00 AM' },
                { title: `Execute: ${aiInput}`, priority: 'Medium', category: 'Work', time: '2:00 PM' },
                { title: `Review: ${aiInput}`, priority: 'Medium', category: 'Review', time: '4:00 PM' },
            ];
        }

        setAiSuggestions(suggestions);
    };

    const addAISuggestions = () => {
        const today = new Date().toISOString().split('T')[0];
        const newTasks = aiSuggestions.map((s, i) => ({
            id: Date.now() + i,
            title: s.title,
            time: s.time,
            category: s.category,
            status: 'Pending',
            priority: s.priority,
            dueDate: today,
            recurring: 'none'
        }));
        setTasks([...tasks, ...newTasks]);
        setIsAIModalOpen(false);
        setAiInput('');
        setAiSuggestions([]);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>My Tasks</h1>
                    <p>View and manage all your tasks.</p>
                </div>
                <div className={styles.headerBtns}>
                    <button className={styles.aiBtn} onClick={() => setIsAIModalOpen(true)}>
                        <Sparkles size={18} />
                        AI Assistant
                    </button>
                    <button className={styles.addBtn} onClick={openAddModal}>
                        <Plus size={18} />
                        New Task
                    </button>
                </div>
            </header>

            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <Filter size={16} />
                    <span>Status:</span>
                    {['All', 'Pending', 'In Progress', 'Completed'].map(status => (
                        <button key={status} className={`${styles.filterBtn} ${filter === status ? styles.active : ''}`} onClick={() => setFilter(status)}>
                            {status}
                        </button>
                    ))}
                </div>
                <div className={styles.filterGroup}>
                    <Flag size={16} />
                    <span>Priority:</span>
                    {['All', 'High', 'Medium', 'Low'].map(priority => (
                        <button key={priority} className={`${styles.filterBtn} ${priorityFilter === priority ? styles.active : ''}`} onClick={() => setPriorityFilter(priority)}>
                            {priority}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.taskList}>
                {filteredTasks.map(task => (
                    <div key={task.id} className={styles.taskItem}>
                        <div className={styles.taskLeft}>
                            <div className={styles.taskIcon}>
                                <Briefcase size={18} />
                            </div>
                            <div className={styles.taskInfo}>
                                <h3>
                                    {task.title}
                                    {task.recurring !== 'none' && <span className={styles.recurringBadge}><Repeat size={12} /> {task.recurring}</span>}
                                </h3>
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
                            <span className={styles.statusBadge} style={{ color: getStatusColor(task.status), backgroundColor: getStatusBg(task.status) }}>
                                {task.status}
                            </span>
                            <button className={styles.editBtn} onClick={() => openEditModal(task)}>
                                <Edit2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {filteredTasks.length === 0 && (
                    <div className={styles.emptyState}>No tasks match the current filters.</div>
                )}
            </div>

            {/* Task Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTask ? 'Edit Task' : 'New Task'}>
                <form className={modalStyles.form} onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label>Task Title *</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter task title" required />
                    </div>
                    <div className={modalStyles.formRow}>
                        <div className={modalStyles.formGroup}>
                            <label>Due Date</label>
                            <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                        </div>
                        <div className={modalStyles.formGroup}>
                            <label>Time</label>
                            <input type="text" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder="e.g., 10:00 AM" />
                        </div>
                    </div>
                    <div className={modalStyles.formRow}>
                        <div className={modalStyles.formGroup}>
                            <label>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div className={modalStyles.formGroup}>
                            <label>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div className={modalStyles.formRow}>
                        <div className={modalStyles.formGroup}>
                            <label>Category</label>
                            <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Design, Dev" />
                        </div>
                        <div className={modalStyles.formGroup}>
                            <label>Recurring</label>
                            <select value={formData.recurring} onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}>
                                <option value="none">None</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>
                    <div className={modalStyles.formActions}>
                        {editingTask && <button type="button" className={modalStyles.deleteBtn} onClick={handleDelete}><Trash2 size={16} /> Delete</button>}
                        <button type="button" className={modalStyles.cancelBtn} onClick={closeModal}>Cancel</button>
                        <button type="submit" className={modalStyles.submitBtn}>{editingTask ? 'Save' : 'Add Task'}</button>
                    </div>
                </form>
            </Modal>

            {/* AI Assistant Modal */}
            <Modal isOpen={isAIModalOpen} onClose={() => { setIsAIModalOpen(false); setAiSuggestions([]); setAiInput(''); }} title="AI Task Assistant">
                <div className={modalStyles.form}>
                    <div className={modalStyles.formGroup}>
                        <label>Describe your goal or project</label>
                        <input
                            type="text"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder="e.g., Prepare for final exam, Launch new website"
                            onKeyPress={(e) => e.key === 'Enter' && handleAIBreakdown()}
                        />
                    </div>
                    <button type="button" className={styles.generateBtn} onClick={handleAIBreakdown}>
                        <Wand2 size={16} />
                        Break Down into Tasks
                    </button>

                    {aiSuggestions.length > 0 && (
                        <div className={styles.aiSuggestions}>
                            <h4>Suggested Tasks:</h4>
                            {aiSuggestions.map((s, i) => (
                                <div key={i} className={styles.suggestionItem}>
                                    <span className={styles.suggestionTitle}>{s.title}</span>
                                    <span className={styles.suggestionMeta}>{s.category} • {s.priority}</span>
                                </div>
                            ))}
                            <button type="button" className={modalStyles.submitBtn} onClick={addAISuggestions} style={{ marginTop: '1rem' }}>
                                Add All Tasks
                            </button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default MyTasks;
