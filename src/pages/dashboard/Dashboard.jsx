import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, Briefcase } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const stats = [
        { title: 'Total Tasks', value: '12', icon: Briefcase, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
        { title: 'In Progress', value: '4', icon: Clock, color: 'text-brand-warning', bg: 'bg-brand-warning/10' },
        { title: 'Completed', value: '8', icon: CheckCircle2, color: 'text-brand-success', bg: 'bg-brand-success/10' },
        { title: 'Overdue', value: '0', icon: AlertCircle, color: 'text-brand-error', bg: 'bg-brand-error/10' },
    ];

    const recentTasks = [
        { id: 1, title: 'Design System Update', time: '10:00 AM', tag: 'Design', status: 'In Progress' },
        { id: 2, title: 'Client Meeting', time: '2:00 PM', tag: 'Meeting', status: 'Pending' },
        { id: 3, title: 'Fix Auth Bug', time: '4:30 PM', tag: 'Dev', status: 'Completed' },
    ];

    return (
        <motion.div
            className="space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* Welcome Section */}
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold text-white mb-2">{getGreeting()}, {user?.displayName || 'User'}</h1>
                <p className="text-brand-text-secondary">Here's your daily overview.</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={item}
            >
                {stats.map((stat, index) => (
                    <Card key={index} className="border-brand-primary/10 hover:border-brand-primary/30 transition-colors">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-brand-text-secondary">{stat.title}</p>
                                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Recent Tasks */}
            <motion.div variants={item}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
                    <button className="text-sm text-brand-primary hover:text-brand-primaryHover">View All</button>
                </div>

                <Card className="border-brand-primary/10">
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {recentTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-4 hover:bg-brand-surfaceHighlight/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-brand-surfaceHighlight flex items-center justify-center border border-white/5">
                                            <Briefcase className="h-4 w-4 text-brand-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{task.title}</h3>
                                            <p className="text-sm text-brand-text-secondary">{task.time} • {task.tag}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${task.status === 'Completed' ? 'bg-brand-success/10 text-brand-success' :
                                            task.status === 'In Progress' ? 'bg-brand-warning/10 text-brand-warning' :
                                                'bg-brand-surfaceHighlight text-brand-text-secondary'}`}>
                                        {task.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
