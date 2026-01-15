import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

export default function Tasks() {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Design System Update', description: 'Update UI components', time: '10:00 AM', tag: 'Design', status: 'In Progress' },
        { id: 2, title: 'Client Meeting', description: 'Discuss project requirements', time: '2:00 PM', tag: 'Meeting', status: 'Pending' },
        { id: 3, title: 'Fix Auth Bug', description: 'Resolve authentication issue', time: '4:30 PM', tag: 'Dev', status: 'Completed' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', time: '', tag: 'General' });
    const [filter, setFilter] = useState('All');

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

    const tags = ['General', 'Design', 'Dev', 'Meeting', 'Personal'];
    const filters = ['All', 'Pending', 'In Progress', 'Completed'];

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;

        const task = {
            id: Date.now(),
            ...newTask,
            status: 'Pending'
        };

        setTasks([task, ...tasks]);
        setNewTask({ title: '', description: '', time: '', tag: 'General' });
        setIsModalOpen(false);
    };

    const handleDeleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const handleToggleStatus = (id) => {
        setTasks(tasks.map(task => {
            if (task.id === id) {
                const statusOrder = ['Pending', 'In Progress', 'Completed'];
                const currentIndex = statusOrder.indexOf(task.status);
                const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
                return { ...task, status: nextStatus };
            }
            return task;
        }));
    };

    const filteredTasks = filter === 'All' ? tasks : tasks.filter(task => task.status === filter);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 className="h-4 w-4 text-brand-success" />;
            case 'In Progress': return <Clock className="h-4 w-4 text-brand-warning" />;
            default: return <AlertCircle className="h-4 w-4 text-brand-text-secondary" />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-brand-success/10 text-brand-success';
            case 'In Progress': return 'bg-brand-warning/10 text-brand-warning';
            default: return 'bg-brand-surfaceHighlight text-brand-text-secondary';
        }
    };

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
                    <h1 className="text-3xl font-bold text-white">My Tasks</h1>
                    <p className="text-brand-text-secondary mt-1">Manage your tasks efficiently</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Plus size={20} />
                    Add Task
                </Button>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div variants={item} className="flex gap-2 flex-wrap">
                {filters.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                ? 'bg-brand-primary text-white shadow-glow'
                                : 'bg-brand-surfaceHighlight text-brand-text-secondary hover:text-white'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </motion.div>

            {/* Tasks List */}
            <motion.div variants={item}>
                <Card className="border-brand-primary/10">
                    <CardContent className="p-0">
                        {filteredTasks.length === 0 ? (
                            <div className="p-8 text-center text-brand-text-secondary">
                                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No tasks found. Add a new task to get started!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredTasks.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center justify-between p-4 hover:bg-brand-surfaceHighlight/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <button
                                                onClick={() => handleToggleStatus(task.id)}
                                                className="h-10 w-10 rounded-full bg-brand-surfaceHighlight flex items-center justify-center border border-white/5 hover:border-brand-primary/50 transition-colors flex-shrink-0"
                                            >
                                                {getStatusIcon(task.status)}
                                            </button>
                                            <div className="min-w-0 flex-1">
                                                <h3 className={`font-medium truncate ${task.status === 'Completed' ? 'text-brand-text-secondary line-through' : 'text-white'}`}>
                                                    {task.title}
                                                </h3>
                                                <p className="text-sm text-brand-text-secondary truncate">
                                                    {task.time && `${task.time} • `}{task.tag}
                                                    {task.description && ` • ${task.description}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(task.status)}`}>
                                                {task.status}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="p-2 rounded-lg text-brand-text-secondary hover:text-brand-error hover:bg-brand-error/10 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Add Task Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Task">
                <form onSubmit={handleAddTask} className="space-y-4">
                    <Input
                        label="Task Title"
                        placeholder="Enter task title..."
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        required
                    />
                    <Input
                        label="Description"
                        placeholder="Enter description (optional)..."
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                    <Input
                        label="Time"
                        type="time"
                        value={newTask.time}
                        onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    />
                    <div>
                        <label className="text-sm font-medium text-brand-text-secondary block mb-2">Tag</label>
                        <div className="flex gap-2 flex-wrap">
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setNewTask({ ...newTask, tag })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${newTask.tag === tag
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-brand-surfaceHighlight text-brand-text-secondary hover:text-white'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            Add Task
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}
