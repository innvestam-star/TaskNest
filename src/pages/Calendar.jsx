import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { getTasks } from '../services/taskService';

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('Month');
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, [currentDate]);

    const loadEvents = async () => {
        try {
            setIsLoading(true);
            const tasks = await getTasks();

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            const mapped = tasks
                .filter(t => {
                    const dateStr = t.dueDate || t.date;
                    if (!dateStr) return false;
                    const d = new Date(dateStr);
                    return d.getFullYear() === year && d.getMonth() === month;
                })
                .map(t => {
                    const dateStr = t.dueDate || t.date;
                    const d = new Date(dateStr);
                    return {
                        id: t.id,
                        title: t.title,
                        date: d.getDate(),
                        type: 'task',
                        priority: t.priority || 'Medium',
                        completed: t.completed,
                        time: t.dueTime || null,
                    };
                });

            setEvents(mapped);
        } catch (err) {
            console.error('Failed to load calendar events:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const today = new Date();
    const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth();

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background transition-colors duration-500">

            {/* Header */}
            <header className="bg-surface/30 backdrop-blur-xl border-b border-border/40 h-20 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-black text-text-main tracking-tight text-gradient-electric">Calendar</h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Time Management Sync</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-900/50 rounded-2xl p-1.5 border border-border/40 shadow-inner">
                        <button onClick={handlePreviousMonth} className="p-2 text-slate-500 hover:bg-slate-800 hover:text-primary rounded-xl transition-all"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-xs font-black uppercase tracking-widest px-4 text-text-main">
                            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={handleNextMonth} className="p-2 text-slate-500 hover:bg-slate-800 hover:text-primary rounded-xl transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="flex bg-slate-900/50 rounded-2xl p-1.5 border border-border/40 shadow-inner">
                    {['Month', 'Week', 'Day'].map(view => (
                        <button
                            key={view}
                            onClick={() => setCurrentView(view)}
                            className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${view === currentView ? 'bg-primary text-white shadow-lg glow-blue' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {view}
                        </button>
                    ))}
                </div>
            </header>

            {/* Calendar Grid */}
            <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="bg-surface/30 backdrop-blur-xl rounded-[2.5rem] border border-border/40 shadow-2xl overflow-hidden h-full flex flex-col relative">
                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 border-b border-border/20 bg-slate-900/30">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                            {/* Empty Padding Days */}
                            {paddingDays.map(padding => (
                                <div key={`padding-${padding}`} className="bg-gray-50/20 border-b border-r border-gray-100"></div>
                            ))}

                            {/* Actual Days */}
                            {days.map(day => {
                                const dayEvents = events.filter(e => e.date === day);
                                const isToday = isCurrentMonth && day === today.getDate();
                                return (
                                    <div key={day} className="border-b border-r border-border/10 p-3 min-h-[120px] relative hover:bg-slate-900/20 transition-all group cursor-pointer">
                                        <span className={`text-sm font-black block mb-2 tracking-tighter ${isToday ? 'text-white bg-primary w-7 h-7 rounded-full flex items-center justify-center' : dayEvents.length > 0 ? 'text-primary' : 'text-slate-600'}`}>
                                            {day}
                                        </span>

                                        <div className="space-y-1.5">
                                            {dayEvents.map(event => (
                                                <div
                                                    key={event.id}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest truncate shadow-lg border transition-all ${event.completed
                                                        ? 'bg-slate-900/30 text-slate-600 border-slate-800/30 line-through opacity-60'
                                                        : event.priority === 'High'
                                                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:border-red-500/50'
                                                            : 'bg-slate-900/60 text-primary border-primary/20 hover:border-primary/50'
                                                        }`}
                                                >
                                                    {event.time && <span className="opacity-80 mr-1.5">{event.time}</span>}
                                                    {event.title}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Button on Hover */}
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                            <button className="p-1.5 bg-primary text-white rounded-full shadow-lg glow-blue hover:scale-110 transition-all">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Fill remaining cells */}
                            {Array.from({ length: 42 - (days.length + paddingDays.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="bg-slate-900/20 border-b border-r border-border/10"></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
