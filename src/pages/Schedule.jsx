import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Pencil, Trash2, AlignLeft, Eye } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CreateAppointmentModal from '../components/CreateAppointmentModal';
import EventDetailsModal from '../components/EventDetailsModal';
import { generateRecurringInstances } from '../services/recurringService';

export default function Schedule() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTimePosition, setCurrentTimePosition] = useState(0);
    const [editingEvent, setEditingEvent] = useState(null);
    const [viewingEvent, setViewingEvent] = useState(null);

    // Helper to get today's date string for mock data
    const getTodayDateStr = () => new Date().toISOString().split('T')[0];

    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Product Review',
            start: '10:00',
            end: '11:00',
            startISO: `${getTodayDateStr()}T10:00`,
            endISO: `${getTodayDateStr()}T11:00`,
            location: 'Google Meet',
            type: 'Work',
            notes: 'Review Q3 roadmap'
        },
        {
            id: 2,
            title: 'Lunch with Team',
            start: '12:30',
            end: '13:30',
            startISO: `${getTodayDateStr()}T12:30`,
            endISO: `${getTodayDateStr()}T13:30`,
            location: 'Downtown Bistro',
            type: 'Personal',
            notes: ''
        },
        {
            id: 3,
            title: 'Strategy Sync',
            start: '15:00',
            end: '16:00',
            startISO: `${getTodayDateStr()}T15:00`,
            endISO: `${getTodayDateStr()}T16:00`,
            location: 'Conference Room A',
            type: 'Work',
            notes: 'Discuss marketing budget'
        },
    ]);

    // Dynamically calculate current time indicator position
    useEffect(() => {
        const updateTimePosition = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const startHour = 6; // Updated to match new timeSlots
            const slotHeight = 100; // matches min-h-[100px]

            if (hours >= startHour && hours <= 23) {
                const position = ((hours - startHour) + (minutes / 60)) * slotHeight;
                setCurrentTimePosition(position);
            }
        };

        updateTimePosition();
        const interval = setInterval(updateTimePosition, 60000); // update every minute
        return () => clearInterval(interval);
    }, []);

    const handleSaveEvent = (eventData) => {
        const start = new Date(eventData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const end = new Date(eventData.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        const refinedEvent = {
            ...eventData,
            start,
            end,
            startISO: eventData.startTime,
            endISO: eventData.endTime,
            type: eventData.title.toLowerCase().includes('lunch') || eventData.title.toLowerCase().includes('personal') ? 'Personal' : 'Work'
        };

        if (editingEvent) {
            setEvents(events.map(ev => ev.id === editingEvent.id ? { ...refinedEvent, id: editingEvent.id } : ev));
            setEditingEvent(null);
        } else {
            setEvents([...events, { ...refinedEvent, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteEvent = (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this event?')) {
            setEvents(events.filter(ev => ev.id !== id));
        }
    };

    const handleEditEvent = (event, e) => {
        e.stopPropagation();
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const formatScheduleDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);

        const diffDays = Math.round((selected - today) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return `Today, ${selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
        if (diffDays === 1) return `Tomorrow, ${selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
        if (diffDays === -1) return `Yesterday, ${selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
        return selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const handlePreviousDay = () => {
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        setSelectedDate(prev);
    };

    const handleNextDay = () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        setSelectedDate(next);
    };

    const handleToday = () => {
        setSelectedDate(new Date());
    };

    const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

    const isSameDay = (date1, date2) => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    };

    // Filter events for the selected date, including recurring ones
    const getEventsForDate = (date) => {
        // 1. Get single events for this day
        // Ensure startISO exists before creating Date
        const singleEvents = events.filter(e => !e.recurrence && e.startISO && isSameDay(new Date(e.startISO), date));

        // 2. Generate instances for recurring events
        const recurringEvents = events.filter(e => e.recurrence);
        const recurringInstances = [];

        // Define day start/end for the selected date
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        recurringEvents.forEach(event => {
            const instances = generateRecurringInstances(event, dayStart, dayEnd);
            recurringInstances.push(...instances);
        });

        return [...singleEvents, ...recurringInstances];
    };

    const displayEvents = getEventsForDate(selectedDate);

    const formatHour = (hour) => {
        const h = hour > 12 ? hour - 12 : hour;
        return `${h}:00`;
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-all duration-500">
            <PageHeader
                title="Schedule"
                subtitle={formatScheduleDate()}
            >
                <div className="flex items-center gap-3 bg-surface/50 border border-border/50 rounded-2xl p-1.5 shadow-inner glass-panel">
                    <button onClick={handlePreviousDay} className="p-2 text-slate-500 hover:bg-slate-900 hover:text-primary rounded-xl transition-all"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={handleToday} className="text-xs font-black uppercase tracking-widest px-3 text-text-main hover:text-primary transition-colors">Today</button>
                    <button onClick={handleNextDay} className="p-2 text-slate-500 hover:bg-slate-900 hover:text-primary rounded-xl transition-all"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all glow-blue ml-4 text-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Event
                </button>
            </PageHeader>

            {/* Timeline View */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-5xl mx-auto bg-surface/40 rounded-[3rem] border border-border/50 overflow-hidden glass-panel shadow-2xl relative">
                    {timeSlots.map(hour => (
                        <div key={hour} className="flex border-b border-border/20 min-h-[100px] relative group hover:bg-slate-900/10 transition-colors">
                            {/* Time Column */}
                            <div className="w-28 border-r border-border/20 p-6 flex flex-col items-end">
                                <span className="text-sm font-black text-text-main tracking-tighter">{formatHour(hour)}</span>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1 opacity-60">{hour < 12 ? 'AM' : 'PM'}</span>
                            </div>

                            {/* Event Area */}
                            <div className="flex-1 relative p-4">
                                {displayEvents.map(event => {
                                    // Use startISO for reliable parsing, or fallback to start time string for recurring instances that might not have full ISO
                                    // For recurring instances generated by service, instanceDate is the key.
                                    const eventDate = event.instanceDate ? new Date(event.instanceDate) : new Date(event.startISO);
                                    const eventStartHour = eventDate.getHours();

                                    if (eventStartHour === hour) {
                                        return (
                                            <div
                                                key={event.id}
                                                onClick={() => setViewingEvent(event)}
                                                className="absolute inset-x-4 inset-y-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer group/event animate-in fade-in slide-in-from-right-4 duration-500"
                                            >
                                                <div className="absolute left-0 top-4 bottom-4 w-1.5 bg-primary rounded-r-full shadow-[0_0_15px_var(--color-primary)]"></div>
                                                <div className="flex justify-between items-start pl-4">
                                                    <div>
                                                        <h4 className="text-lg font-black text-text-main tracking-tight group-hover/event:text-primary transition-colors flex items-center gap-2">
                                                            {event.title}
                                                            {event.recurrence && (
                                                                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-700">
                                                                    RPC
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold opacity-70">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {event.start} - {event.end}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold opacity-70">
                                                                <MapPin className="w-3.5 h-3.5 text-primary/60" />
                                                                {event.location}
                                                            </div>
                                                            {event.notes && (
                                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium opacity-60">
                                                                    <AlignLeft className="w-3.5 h-3.5" />
                                                                    <span className="truncate max-w-[150px]">{event.notes}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 uppercase tracking-widest">{event.type}</span>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover/event:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setViewingEvent(event);
                                                                }}
                                                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleEditEvent(event, e)}
                                                                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                                                                title="Edit Event"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteEvent(event.id, e)}
                                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                                                                title="Delete Event"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Dynamic Current Time Indicator */}
                    {currentTimePosition > 0 && (
                        <div
                            className="absolute left-28 right-0 border-t-2 border-primary/50 z-20 pointer-events-none transition-all duration-1000"
                            style={{ top: `${currentTimePosition}px` }}
                        >
                            <div className="absolute -left-2 -top-2 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_var(--color-primary)] ring-4 ring-background"></div>
                        </div>
                    )}
                </div>
            </div>
            <CreateAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                initialData={editingEvent}
            />

            <EventDetailsModal
                isOpen={!!viewingEvent}
                onClose={() => setViewingEvent(null)}
                event={viewingEvent}
                onEdit={(event) => {
                    handleEditEvent(event, { stopPropagation: () => { } });
                }}
                onDelete={(id) => {
                    handleDeleteEvent(id, { stopPropagation: () => { } });
                }}
            />
        </div>
    );
}
