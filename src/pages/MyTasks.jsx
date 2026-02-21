import { Plus, Search, Filter, CheckCircle, Clock, AlertCircle, Sparkles, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import CreateTaskModal from '../components/CreateTaskModal';
import UpgradeModal from '../components/UpgradeModal';
import { useSubscription } from '../context/SubscriptionContext';
import { checkActionLimit, FREE_LIMITS } from '../services/paymentService';
import { getTasks, addTask, toggleTaskCompletion, updateTask, deleteTask } from '../services/taskService';
import { formatDateRelative } from '../utils/dateUtils';
import { useState, useEffect } from 'react';

export default function MyTasks() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState('taskLimit');
    const [filter, setFilter] = useState('All');
    const { isFree, incrementTaskCount, usage, canCreateTask } = useSubscription();

    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Check task limit before showing create modal
    const handleAddTaskClick = () => {
        const limitCheck = canCreateTask();
        if (!limitCheck.allowed) {
            setUpgradeReason('taskLimit');
            setShowUpgradeModal(true);
            return;
        }
        setEditingTask(null); // Ensure we are in create mode
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (editingTask) {
                const updated = await updateTask(editingTask.id, taskData);
                setTasks(tasks.map(t => t.id === updated.id ? updated : t));
                setEditingTask(null);
            } else {
                const newTask = await addTask(taskData);
                setTasks([newTask, ...tasks]);
                incrementTaskCount('tasks');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    };

    const handleEdit = (task, e) => {
        e.stopPropagation();
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleDelete = async (taskId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            await deleteTask(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const toggleTask = async (id) => {
        // Optimistic update
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

        try {
            await toggleTaskCompletion(id);
        } catch (error) {
            console.error('Failed to toggle task:', error);
            // Revert on error
            setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'All') return true;
        if (filter === 'Completed') return t.completed;
        if (filter === 'Pending') return !t.completed;
        return t.priority === filter;
    });

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-slate-500 font-medium">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-all duration-500">
            <PageHeader
                title="My Tasks"
                subtitle={`You have ${tasks.filter(t => !t.completed).length} pending tasks`}
            >
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="bg-surface/50 border border-border/50 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:ring-4 focus:ring-primary/10 outline-none w-72 transition-all shadow-inner placeholder-slate-600"
                        />
                    </div>
                    <button
                        onClick={handleAddTaskClick}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl text-sm font-black transition-all shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 glow-blue"
                    >
                        <Plus className="w-4 h-4" />
                        Add Task
                    </button>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    {/* Stats & Filters */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex gap-2 p-1.5 bg-surface/50 border border-border/50 rounded-[1.25rem] glass-panel shadow-inner">
                            {['All', 'Pending', 'Completed', 'High', 'Medium', 'Low'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${filter === f ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-500 hover:text-white hover:bg-slate-900/50'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Health Score</span>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-2 text-xs font-black text-green-500 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        {tasks.filter(t => t.completed).length} Done
                                    </span>
                                    <span className="flex items-center gap-2 text-xs font-black text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                        {tasks.filter(t => !t.completed).length} Pending
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="space-y-4">
                        {filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                className={`group flex items-center gap-6 p-6 rounded-[2rem] transition-all cursor-pointer electric-card border border-border/50 ${task.completed ? 'bg-slate-900/40 opacity-50' : 'bg-surface/80 glass-panel shadow-xl shadow-black/5 hover:shadow-primary/5 hover:bg-slate-950/40'}`}
                                onClick={() => toggleTask(task.id)}
                            >
                                <button className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-primary border-primary text-white scale-90 shadow-lg shadow-primary/20' : 'border-slate-800 group-hover:border-primary group-hover:scale-110 shadow-inner'}`}>
                                    {task.completed && <CheckCircle className="w-5 h-5" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-lg font-black tracking-tight ${task.completed ? 'line-through text-slate-500' : 'text-text-main group-hover:text-primary transition-colors'}`}>
                                        {task.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium truncate mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">{task.description}</p>
                                </div>

                                <div className="flex items-center gap-6 shrink-0">
                                    <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-60">
                                        <Clock className="w-4 h-4 text-primary/60" />
                                        {formatDateRelative(task.dueDate || task.date)}
                                    </div>
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm transition-transform group-hover:scale-105 active:scale-95 ${task.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                        task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                        }`}>
                                        {task.priority}
                                    </span>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleEdit(task, e)}
                                            className="p-2 text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                                            title="Edit Task"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(task.id, e)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                                            title="Delete Task"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredTasks.length === 0 && (
                            <div className="text-center py-24 bg-surface/30 border border-dashed border-slate-800 rounded-[3rem] group">
                                <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 transition-transform group-hover:scale-110 duration-700">
                                    <Sparkles className="w-10 h-10 text-primary opacity-30 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black text-text-main mb-2 tracking-tighter">Mission Accomplished!</h3>
                                <p className="text-slate-500 font-medium max-w-xs mx-auto opacity-70">
                                    {filter === 'All' ? "No tasks yet. Start by creating one!" : `No ${filter} tasks found.`}
                                </p>
                                {filter === 'All' && (
                                    <button
                                        onClick={handleAddTaskClick}
                                        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl text-sm font-black transition-all shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create First Task
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                initialData={editingTask}
            />

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                reason={upgradeReason}
            />
        </div>
    );
}
