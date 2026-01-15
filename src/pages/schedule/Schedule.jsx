import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Clock, Trash2 } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

export default function Schedule() {
    const [appointments, setAppointments] = useState([
        { id: 1, title: 'Team Standup', time: '09:00', endTime: '09:30', date: new Date(), location: 'Conference Room A', notes: 'Daily sync' },
        { id: 2, title: 'Client Presentation', time: '14:00', endTime: '15:00', date: new Date(), location: 'Zoom Meeting', notes: 'Q1 Review' },
        { id: 3, title: 'Design Review', time: '16:30', endTime: '17:00', date: addDays(new Date(), 1), location: 'Design Lab', notes: 'New mockups' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAppointment, setNewAppointment] = useState({ title: '', time: '', endTime: '', date: '', location: '', notes: '' });
    const [viewMode, setViewMode] = useState('Day');
    const [selectedDate, setSelectedDate] = useState(new Date());

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const viewModes = ['Day', 'Week', 'Month'];

    // Generate week days for the date picker
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const handleAddAppointment = (e) => {
        e.preventDefault();
        if (!newAppointment.title.trim() || !newAppointment.time) return;

        const appointment = {
            id: Date.now(),
            ...newAppointment,
            date: newAppointment.date ? new Date(newAppointment.date) : selectedDate
        };

        setAppointments([...appointments, appointment].sort((a, b) => {
            const dateCompare = new Date(a.date) - new Date(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
        }));
        setNewAppointment({ title: '', time: '', endTime: '', date: '', location: '', notes: '' });
        setIsModalOpen(false);
    };

    const handleDeleteAppointment = (id) => {
        setAppointments(appointments.filter(apt => apt.id !== id));
    };

    // Filter appointments based on selected date and view mode
    const getFilteredAppointments = () => {
        if (viewMode === 'Day') {
            return appointments.filter(apt => isSameDay(new Date(apt.date), selectedDate));
        }
        // For Week/Month view, show all appointments for simplicity
        return appointments.sort((a, b) => {
            const dateCompare = new Date(a.date) - new Date(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
        });
    };

    const filteredAppointments = getFilteredAppointments();

    return (
        <motion.div
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* Header */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Schedule</h1>
                    <p className="text-brand-text-secondary mt-1">Manage your appointments</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Plus size={20} />
                    Add Appointment
                </Button>
            </motion.div>

            {/* View Mode Toggle */}
            <motion.div variants={item} className="flex gap-2">
                {viewModes.map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === mode
                                ? 'bg-brand-primary text-white shadow-glow'
                                : 'bg-brand-surfaceHighlight text-brand-text-secondary hover:text-white'
                            }`}
                    >
                        {mode}
                    </button>
                ))}
            </motion.div>

            {/* Date Picker (Week View) */}
            <motion.div variants={item}>
                <Card className="border-brand-primary/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">
                                {format(selectedDate, 'MMMM yyyy')}
                            </h3>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {weekDays.map((day) => {
                                const isSelected = isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, new Date());
                                const hasAppointments = appointments.some(apt => isSameDay(new Date(apt.date), day));

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={`flex flex-col items-center p-3 rounded-xl transition-all ${isSelected
                                                ? 'bg-brand-primary text-white shadow-glow'
                                                : isToday
                                                    ? 'bg-brand-accent/20 text-brand-accent'
                                                    : 'hover:bg-brand-surfaceHighlight text-brand-text-secondary'
                                            }`}
                                    >
                                        <span className="text-xs font-medium mb-1">
                                            {format(day, 'EEE')}
                                        </span>
                                        <span className="text-lg font-bold">
                                            {format(day, 'd')}
                                        </span>
                                        {hasAppointments && (
                                            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-brand-primary'}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Appointments Timeline */}
            <motion.div variants={item}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                        {viewMode === 'Day' ? format(selectedDate, 'EEEE, MMMM d') : 'All Appointments'}
                    </h2>
                    <span className="text-sm text-brand-text-secondary">
                        {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <Card className="border-brand-primary/10">
                    <CardContent className="p-0">
                        {filteredAppointments.length === 0 ? (
                            <div className="p-8 text-center text-brand-text-secondary">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No appointments scheduled. Add one to get started!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredAppointments.map((apt, index) => {
                                    const isActive = index === 0 && viewMode === 'Day';
                                    return (
                                        <motion.div
                                            key={apt.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-4 transition-colors ${isActive
                                                    ? 'bg-brand-primary/10 border-l-4 border-brand-primary'
                                                    : 'hover:bg-brand-surfaceHighlight/50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex gap-4 flex-1 min-w-0">
                                                    {/* Time Column */}
                                                    <div className="text-right min-w-[70px]">
                                                        <p className="text-sm font-semibold text-white">{apt.time}</p>
                                                        {apt.endTime && (
                                                            <p className="text-xs text-brand-text-secondary">{apt.endTime}</p>
                                                        )}
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-white truncate">{apt.title}</h3>
                                                        <div className="flex flex-wrap gap-3 mt-1">
                                                            {viewMode !== 'Day' && (
                                                                <span className="flex items-center gap-1 text-xs text-brand-text-secondary">
                                                                    <Calendar size={12} />
                                                                    {format(new Date(apt.date), 'MMM d')}
                                                                </span>
                                                            )}
                                                            {apt.location && (
                                                                <span className="flex items-center gap-1 text-xs text-brand-text-secondary">
                                                                    <MapPin size={12} />
                                                                    {apt.location}
                                                                </span>
                                                            )}
                                                            {apt.notes && (
                                                                <span className="text-xs text-brand-text-secondary">
                                                                    {apt.notes}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDeleteAppointment(apt.id)}
                                                    className="p-2 rounded-lg text-brand-text-secondary hover:text-brand-error hover:bg-brand-error/10 transition-colors flex-shrink-0"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Add Appointment Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Appointment">
                <form onSubmit={handleAddAppointment} className="space-y-4">
                    <Input
                        label="Title"
                        placeholder="Enter appointment title..."
                        value={newAppointment.title}
                        onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Start Time"
                            type="time"
                            value={newAppointment.time}
                            onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                            required
                        />
                        <Input
                            label="End Time"
                            type="time"
                            value={newAppointment.endTime}
                            onChange={(e) => setNewAppointment({ ...newAppointment, endTime: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Date"
                        type="date"
                        value={newAppointment.date}
                        onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    />
                    <Input
                        label="Location"
                        placeholder="Enter location (optional)..."
                        value={newAppointment.location}
                        onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                    />
                    <Input
                        label="Notes"
                        placeholder="Add notes (optional)..."
                        value={newAppointment.notes}
                        onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            Add Appointment
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}
