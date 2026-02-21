import { CheckCircle, Calendar, Plus, Search, Bell, Sparkles, TrendingUp, Clock, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { getTaskStats, getTasks } from '../services/taskService';
import { getProjects } from '../services/projectService';
import { isToday, getGreetingTime, formatTime } from '../utils/dateUtils';
import { useState, useEffect } from 'react';

function getTodayScheduleEvents() {
    try {
        const stored = localStorage.getItem('tasknest_schedule_events');
        if (!stored) return [];
        const events = JSON.parse(stored);
        const todayStr = new Date().toISOString().split('T')[0];
        return events.filter(e => {
            const eventDate = (e.start || e.date || '').split('T')[0];
            return eventDate === todayStr;
        });
    } catch {
        return [];
    }
}

export default function Dashboard() {
    const { user, getInitials } = useAuth();
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, today: 0 });
    const [todaysTasks, setTodaysTasks] = useState([]);
    const [todaysEvents, setTodaysEvents] = useState([]);
    const [projectsCount, setProjectsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const taskStats = await getTaskStats();
                setStats(taskStats);

                const allTasks = await getTasks();
                const today = allTasks.filter(t => isToday(t.date) || isToday(t.dueDate));
                setTodaysTasks(today.slice(0, 4));

                const allProjects = await getProjects();
                setProjectsCount(allProjects.length);

                setTodaysEvents(getTodayScheduleEvents());
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-colors duration-500">
            <PageHeader
                title="Dashboard"
                subtitle="Overview of your productivity"
            >
                <div className="hidden md:flex items-center bg-surface/50 border border-border/50 rounded-2xl px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm ml-3 w-full text-text-main placeholder-slate-500" />
                </div>

                <div className="flex items-center gap-4 ml-4">
                    <button className="relative p-2.5 text-slate-400 hover:bg-surface hover:text-primary rounded-2xl transition-all border border-transparent hover:border-border group">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface group-hover:scale-125 transition-transform"></span>
                    </button>

                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-500/20 ring-2 ring-white/10 uppercase">
                        {getInitials()}
                    </div>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-[1400px] mx-auto space-y-12">
                    {/* Welcome Section */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div>
                            <h2 className="text-5xl font-black text-text-main tracking-tighter leading-tight text-gradient-electric">
                                Good {getGreetingTime()}, {user?.firstName || 'User'}! <span className="inline-block animate-bounce">👋</span>
                            </h2>
                            <p className="text-slate-400 mt-3 text-lg font-medium opacity-80">
                                You have <span className="text-primary font-black">{stats.pending} tasks</span> pending and <span className="text-amber-500 font-bold">{todaysEvents.length} appointment{todaysEvents.length !== 1 ? 's' : ''}</span> today.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                to="/schedule"
                                className="flex items-center gap-3 bg-surface border border-border/80 text-text-main px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-900 transition-all shadow-xl shadow-black/5 active:scale-95 group"
                            >
                                <Plus className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                                Appointment
                            </Link>
                            <Link
                                to="/tasks"
                                className="flex items-center gap-3 bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-2xl shadow-primary/20 active:scale-95 glow-blue"
                            >
                                <Plus className="w-5 h-5" />
                                New Task
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-surface p-8 rounded-[2rem] border border-border/50 electric-card relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                            <div className="flex justify-between items-center mb-6">
                                <div className="p-4 bg-primary/10 text-primary rounded-[1.25rem]">
                                    <CheckCircle className="w-7 h-7" />
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-text-main tracking-tighter">{stats.completed}</span>
                                </div>
                            </div>
                            <h3 className="text-slate-500 font-black text-xs uppercase tracking-widest">Tasks Completed</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-500 font-black">+20% <span className="text-slate-500 font-bold ml-1">vs yesterday</span></span>
                            </div>
                        </div>

                        <div className="bg-surface p-8 rounded-[2rem] border border-border/50 electric-card relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="flex justify-between items-center mb-6">
                                <div className="p-4 bg-amber-500/10 text-amber-500 rounded-[1.25rem]">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-text-main tracking-tighter">4.5h</span>
                                </div>
                            </div>
                            <h3 className="text-slate-500 font-black text-xs uppercase tracking-widest">Focus Time</h3>
                            <p className="text-sm text-slate-400 mt-2 font-bold opacity-70">Tracked this week</p>
                        </div>

                        <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white p-8 rounded-[2rem] shadow-2xl shadow-primary/30 relative overflow-hidden group transition-all hover:scale-[1.02]">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-4 h-4 text-yellow-300" />
                                    <h3 className="text-blue-100 font-black text-xs uppercase tracking-widest">Productivity Score</h3>
                                </div>
                                <div className="flex items-end gap-3">
                                    <span className="text-6xl font-black tracking-tighter leading-none">85</span>
                                    <span className="text-blue-900 text-[10px] font-black bg-blue-100 px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">High</span>
                                </div>
                                <p className="text-sm text-blue-100/80 mt-6 font-medium leading-relaxed">You're more productive than <span className="text-white font-black underline decoration-2 decoration-yellow-300 underline-offset-4">80% of users</span> today!</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                        {/* Today's Tasks */}
                        <div className="bg-surface/30 backdrop-blur-xl rounded-[2.5rem] border border-border/40 shadow-2xl overflow-hidden flex flex-col h-full">
                            <div className="p-8 pb-4 flex justify-between items-center">
                                <h3 className="text-xl font-black text-text-main tracking-tight">Today's Tasks</h3>
                                <Link to="/tasks" className="text-sm text-primary font-bold hover:underline">View All</Link>
                            </div>
                            <div className="p-6 pt-2 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                                {todaysTasks.length > 0 ? (
                                    todaysTasks.map((task, i) => (
                                        <div key={i} className={`flex items-center gap-4 p-5 rounded-3xl transition-all border ${task.completed ? 'bg-slate-900/40 border-slate-800/50 opacity-50' : 'bg-slate-900/60 border-slate-800/40 hover:border-primary/30 hover:bg-slate-900/80 shadow-lg'}`}>
                                            <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-primary border-primary text-white' : 'border-slate-700/50 text-slate-500'}`}>
                                                {task.completed ? <CheckCircle className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-700/50"></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-base font-bold truncate ${task.completed ? 'text-slate-500 line-through' : 'text-text-main'}`}>{task.title}</h4>
                                                <div className="text-xs text-slate-500 mt-1 font-medium">{task.priority} Priority</div>
                                            </div>
                                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${task.priority === 'High' ? 'text-red-500/80 bg-red-400/5 border-red-500/10' : 'text-blue-500/80 bg-blue-400/5 border-blue-500/10'}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm font-medium">No tasks for today</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Appointments */}
                        <div className="bg-surface/30 backdrop-blur-xl rounded-[2.5rem] border border-border/40 shadow-2xl overflow-hidden flex flex-col h-full">
                            <div className="p-8 pb-4 flex justify-between items-center">
                                <h3 className="text-xl font-black text-text-main tracking-tight">Schedule</h3>
                                <Link to="/schedule" className="text-sm text-primary font-bold hover:underline">Full Calendar</Link>
                            </div>
                            <div className="p-8 pt-4 space-y-0 relative flex-1">
                                {/* Continuous Timeline Line */}
                                <div className="absolute left-[40px] top-[48px] bottom-12 w-0.5 bg-slate-800/50"></div>

                                {todaysEvents.length > 0 ? todaysEvents.slice(0, 4).map((event, i) => {
                                    const startTime = event.start ? new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                    const endTime = event.end ? new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                    const timeStr = startTime && endTime ? `${startTime} - ${endTime}` : startTime || '';
                                    const now = new Date();
                                    const isActive = event.start && event.end && new Date(event.start) <= now && now <= new Date(event.end);
                                    return (
                                        <div key={event.id || i} className="flex gap-6 relative pb-10 last:pb-0 group">
                                            <div className="relative z-10 flex flex-col items-center justify-center w-4 h-4 mt-1.5 ml-0.5">
                                                <div className={`w-3.5 h-3.5 rounded-full ring-4 ring-slate-900 ${isActive ? 'bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`}></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-lg font-bold tracking-tight ${isActive ? 'text-primary' : 'text-white'}`}>{event.title}</h4>
                                                <div className="mt-1 space-y-1">
                                                    {timeStr && <div className="text-sm text-slate-400 font-medium">{timeStr}</div>}
                                                    {event.location && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <MapPin className="w-3.5 h-3.5 text-red-500/70" />
                                                            {event.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm font-medium">No events scheduled today</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
