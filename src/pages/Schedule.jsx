import { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Video, FileText, Repeat, AlertTriangle } from 'lucide-react';
import Modal from '../components/Modal';
import modalStyles from '../components/Modal.module.css';
import styles from './Schedule.module.css';

const Schedule = () => {
    const [appointments, setAppointments] = useState([
        { id: 1, title: 'Team Standup', date: '2026-01-16', time: '09:00 AM', duration: '30 min', location: 'Online', notes: 'Daily sync', recurring: 'daily' },
        { id: 2, title: 'Client Presentation', date: '2026-01-16', time: '02:00 PM', duration: '1 hour', location: 'Conference Room A', notes: 'Q1 review', recurring: 'none' },
        { id: 3, title: 'Design Review', date: '2026-01-17', time: '11:00 AM', duration: '45 min', location: 'Online', notes: '', recurring: 'weekly' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [conflictWarning, setConflictWarning] = useState('');
    const [formData, setFormData] = useState({
        title: '', date: '', time: '', duration: '30 min', location: 'Online', notes: '', recurring: 'none'
    });

    // Smart scheduling - check for conflicts
    const checkConflicts = (date, time, excludeId = null) => {
        const existingAppts = appointments.filter(a =>
            a.date === date && a.id !== excludeId
        );

        if (existingAppts.length === 0) return null;

        // Simple time overlap check (in production, would parse times properly)
        const conflicting = existingAppts.find(a => a.time === time);
        if (conflicting) {
            return `Conflict: "${conflicting.title}" is already scheduled at ${time}`;
        }
        return null;
    };

    const openAddModal = () => {
        setEditingAppointment(null);
        setFormData({ title: '', date: '', time: '', duration: '30 min', location: 'Online', notes: '', recurring: 'none' });
        setConflictWarning('');
        setIsModalOpen(true);
    };

    const openEditModal = (appointment) => {
        setEditingAppointment(appointment);
        setFormData({ ...appointment });
        setConflictWarning('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAppointment(null);
        setConflictWarning('');
    };

    const handleDateTimeChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);

        if (newData.date && newData.time) {
            const conflict = checkConflicts(newData.date, newData.time, editingAppointment?.id);
            setConflictWarning(conflict || '');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check for conflicts before saving
        const conflict = checkConflicts(formData.date, formData.time, editingAppointment?.id);
        if (conflict) {
            if (!window.confirm(`${conflict}\n\nDo you want to schedule anyway?`)) {
                return;
            }
        }

        if (editingAppointment) {
            setAppointments(appointments.map(a => a.id === editingAppointment.id ? { ...a, ...formData } : a));
        } else {
            setAppointments([...appointments, { id: Date.now(), ...formData }]);
        }
        closeModal();
    };

    const handleDelete = () => {
        if (editingAppointment) {
            setAppointments(appointments.filter(a => a.id !== editingAppointment.id));
            closeModal();
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const groupedAppointments = appointments.reduce((groups, appointment) => {
        const date = appointment.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(appointment);
        return groups;
    }, {});

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Schedule</h1>
                    <p>Manage your appointments and events.</p>
                </div>
                <button className={styles.addBtn} onClick={openAddModal}>
                    <Plus size={18} />
                    New Appointment
                </button>
            </header>

            <div className={styles.appointmentList}>
                {Object.keys(groupedAppointments).sort().map(date => (
                    <div key={date} className={styles.dayGroup}>
                        <h3 className={styles.dayHeader}>{formatDate(date)}</h3>
                        {groupedAppointments[date].map(appointment => (
                            <div key={appointment.id} className={styles.appointmentItem}>
                                <div className={styles.timeColumn}>
                                    <span className={styles.time}>{appointment.time}</span>
                                    <span className={styles.duration}>{appointment.duration}</span>
                                </div>
                                <div className={styles.appointmentContent}>
                                    <h4>
                                        {appointment.title}
                                        {appointment.recurring !== 'none' && (
                                            <span className={styles.recurringBadge}>
                                                <Repeat size={12} /> {appointment.recurring}
                                            </span>
                                        )}
                                    </h4>
                                    <div className={styles.appointmentMeta}>
                                        {appointment.location === 'Online' ? (
                                            <span><Video size={14} /> Online</span>
                                        ) : (
                                            <span><MapPin size={14} /> {appointment.location}</span>
                                        )}
                                        {appointment.notes && <span><FileText size={14} /> {appointment.notes}</span>}
                                    </div>
                                </div>
                                <button className={styles.editBtn} onClick={() => openEditModal(appointment)}>
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ))}
                {appointments.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No appointments scheduled. Click "New Appointment" to add one.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}>
                <form className={modalStyles.form} onSubmit={handleSubmit}>
                    <div className={modalStyles.formGroup}>
                        <label>Title *</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter appointment title" required />
                    </div>
                    <div className={modalStyles.formRow}>
                        <div className={modalStyles.formGroup}>
                            <label>Date *</label>
                            <input type="date" value={formData.date} onChange={(e) => handleDateTimeChange('date', e.target.value)} required />
                        </div>
                        <div className={modalStyles.formGroup}>
                            <label>Time *</label>
                            <input type="text" value={formData.time} onChange={(e) => handleDateTimeChange('time', e.target.value)} placeholder="e.g., 10:00 AM" required />
                        </div>
                    </div>

                    {conflictWarning && (
                        <div className={styles.conflictWarning}>
                            <AlertTriangle size={16} />
                            {conflictWarning}
                        </div>
                    )}

                    <div className={modalStyles.formRow}>
                        <div className={modalStyles.formGroup}>
                            <label>Duration</label>
                            <select value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}>
                                <option value="15 min">15 min</option>
                                <option value="30 min">30 min</option>
                                <option value="45 min">45 min</option>
                                <option value="1 hour">1 hour</option>
                                <option value="1.5 hours">1.5 hours</option>
                                <option value="2 hours">2 hours</option>
                            </select>
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
                    <div className={modalStyles.formGroup}>
                        <label>Location</label>
                        <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Online or physical address" />
                    </div>
                    <div className={modalStyles.formGroup}>
                        <label>Notes</label>
                        <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Add any notes..." />
                    </div>
                    <div className={modalStyles.formActions}>
                        {editingAppointment && <button type="button" className={modalStyles.deleteBtn} onClick={handleDelete}><Trash2 size={16} /> Delete</button>}
                        <button type="button" className={modalStyles.cancelBtn} onClick={closeModal}>Cancel</button>
                        <button type="submit" className={modalStyles.submitBtn}>{editingAppointment ? 'Save' : 'Add Appointment'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Schedule;
