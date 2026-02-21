import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Calendar, Users, CheckCircle, Plus, Circle, Clock, Mic, Sparkles, FileText } from 'lucide-react';
import { getProject, updateProject } from '../services/projectService';
import CreateTaskModal from '../components/CreateTaskModal';
import VoiceRecorder from '../components/VoiceRecorder';
import TranscriptEditor from '../components/TranscriptEditor';
import MeetingSummary from '../components/MeetingSummary';
import PageHeader from '../components/PageHeader';
import { useRBAC } from '../context/RBACContext';
import { ACTIONS } from '../utils/permissions';
import { analyzeMeeting } from '../services/aiService';

import { getRelativeDate } from '../utils/dateUtils';

export default function ProjectDetail() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'meetings'

    // Meeting state
    const [currentRecording, setCurrentRecording] = useState(null);
    const [meetingAnalysis, setMeetingAnalysis] = useState(null);
    const [analyzingMeeting, setAnalyzingMeeting] = useState(false);

    // RBAC
    const { getUserRole, can, PROJECT_ROLE_LABELS, ROLE_COLORS } = useRBAC();

    // Mock tasks for this project — dates relative to today
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Draft initial requirements', completed: true, dueDate: getRelativeDate(-5), priority: 'High' },
        { id: 2, title: 'Review with stakeholders', completed: false, dueDate: getRelativeDate(7), priority: 'Medium' },
        { id: 3, title: 'Finalize design mockups', completed: false, dueDate: getRelativeDate(14), priority: 'High' },
    ]);

    useEffect(() => {
        loadProject();
    }, [id]);

    const loadProject = async () => {
        try {
            const data = await getProject(id);
            setProject(data);
        } catch (error) {
            console.error('Failed to load project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = (taskData) => {
        const newTask = {
            id: Date.now(),
            ...taskData,
        };
        setTasks([...tasks, newTask]);

        // Update project progress
        const completedCount = tasks.filter(t => t.completed).length;
        const newProgress = Math.round((completedCount / (tasks.length + 1)) * 100);
        updateProject(id, { progress: newProgress });
        setProject(prev => ({ ...prev, progress: newProgress }));
    };

    const handleEditProject = (updates) => {
        updateProject(id, updates);
        setProject(prev => ({ ...prev, ...updates }));
        setIsEditModalOpen(false);
    };

    const toggleTask = (taskId) => {
        const updatedTasks = tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        setTasks(updatedTasks);

        const completedCount = updatedTasks.filter(t => t.completed).length;
        const newProgress = Math.round((completedCount / updatedTasks.length) * 100);
        updateProject(id, { progress: newProgress });
        setProject(prev => ({ ...prev, progress: newProgress }));
    };

    const handleRecordingComplete = (recording) => {
        setCurrentRecording(recording);
    };

    const handleGenerateSummary = async () => {
        if (!currentRecording || !currentRecording.transcript) return;

        setAnalyzingMeeting(true);
        try {
            const analysis = await analyzeMeeting(currentRecording.transcript, {
                title: `Meeting - ${new Date().toLocaleDateString()}`,
                projectId: id,
                projectName: project?.name
            });
            setMeetingAnalysis(analysis);
        } catch (error) {
            console.error('Failed to analyze meeting:', error);
        } finally {
            setAnalyzingMeeting(false);
        }
    };

    const handleCreateTaskFromAction = (actionItem) => {
        const newTask = {
            id: Date.now(),
            title: actionItem.title,
            completed: false,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: actionItem.priority
        };
        setTasks([...tasks, newTask]);
    };

    const userRole = project ? getUserRole(project) : null;
    const canCreateTask = project ? can(project, ACTIONS.TASK_CREATE) : false;
    const canRecordMeeting = project ? can(project, ACTIONS.MEETING_RECORD) : false;

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-screen">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Retrieving Project Data...</p>
        </div>
    );
    if (!project) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-screen">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 border border-slate-800 shadow-2xl">
                <FileText className="w-10 h-10 text-slate-700" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Project Not Found</h1>
            <p className="text-slate-500 font-bold max-w-xs mx-auto mb-8 text-center">This workspace entry has been decommissioned or does not exist.</p>
            <Link to="/projects" className="text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/10 transition-colors">Return to Registry</Link>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-colors duration-500 overflow-hidden">
            <PageHeader
                title={project.name}
                subtitle={
                    <Link to="/projects" className="hover:text-primary transition-colors flex items-center gap-1.5 font-black uppercase tracking-[0.2em]">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
                    </Link>
                }
                icon={
                    <div className="w-full h-full flex items-center justify-center text-white text-xl font-black">
                        {project.name.charAt(0)}
                    </div>
                }
                iconStyle={{ backgroundColor: project.color }}
                iconClassName="overflow-hidden"
            >
                <div className="flex gap-4">
                    <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-3 bg-surface/50 border border-border/50 text-text-main px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-900 transition-all shadow-xl shadow-black/5 active:scale-95 group">
                        <Sparkles className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                        Edit Project
                    </button>
                    {canCreateTask && (
                        <button className="flex items-center gap-3 bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-2xl shadow-primary/20 active:scale-95 glow-blue" onClick={() => setIsTaskModalOpen(true)}>
                            <Plus className="w-5 h-5" /> Add Task
                        </button>
                    )}
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-[1400px] mx-auto space-y-12">
                    {/* Stats & Members - Moved from Header */}
                    <div className="flex flex-wrap items-center gap-8 bg-surface/30 backdrop-blur-xl border border-border/40 p-8 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center gap-4 bg-surface/30 px-5 py-2.5 rounded-[1.25rem] border border-border/40">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
                            <span className="text-xs font-black uppercase tracking-widest text-text-main">Active Project</span>
                        </div>

                        <div className="flex items-center gap-3 text-slate-400 font-bold">
                            <Calendar className="w-5 h-5 text-primary/70" />
                            <span className="text-sm">Due {new Date(project.dueDate).toLocaleDateString()}</span>
                        </div>

                        {/* Team Members */}
                        <div className="flex items-center gap-4 bg-surface/20 px-4 py-2 rounded-2xl border border-white/5 ml-auto">
                            <div className="flex -space-x-3">
                                {project.members.map((member, i) => (
                                    <div
                                        key={i}
                                        className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border-2 border-surface flex items-center justify-center text-xs font-black text-slate-400 relative group shadow-xl"
                                        title={`${member.name} (${PROJECT_ROLE_LABELS[member.role] || member.role})`}
                                    >
                                        {member.name.charAt(0)}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl whitespace-nowrap ${ROLE_COLORS[member.role] || 'bg-slate-800 text-slate-400'}`}>
                                                {PROJECT_ROLE_LABELS[member.role] || member.role}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-9 h-9 rounded-2xl bg-surface/50 border-2 border-dashed border-border/50 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-all cursor-pointer">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{project.members.length} Members Syncing</span>
                        </div>

                        {/* Your Role Badge */}
                        {userRole && (
                            <div className="flex items-center gap-3 border-l border-border/50 pl-8">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Your Role</span>
                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${ROLE_COLORS[userRole] || 'bg-slate-800 text-slate-400'} border border-white/5 shadow-xl`}>
                                    {PROJECT_ROLE_LABELS[userRole] || userRole}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-surface/30 backdrop-blur-xl rounded-[2.5rem] p-8 border border-border/40 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Project Overview</h3>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed opacity-90">{project.description}</p>
                    </div>

                    {/* Progress */}
                    <div className="bg-surface/30 backdrop-blur-xl rounded-[2.5rem] p-8 border border-border/40 shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-text-main tracking-tight">Project Progress</h3>
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Timeline Health Check</p>
                            </div>
                            <span className="text-5xl font-black text-primary tracking-tighter leading-none">{project.progress}%</span>
                        </div>
                        <div className="w-full h-4 bg-slate-800/50 rounded-full overflow-hidden shadow-inner flex items-center px-1">
                            <div
                                className="h-2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_var(--color-primary)]"
                                style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-border/40">
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`pb-5 px-2 font-black text-xs uppercase tracking-widest transition-all relative group ${activeTab === 'tasks'
                                ? 'text-primary'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <CheckCircle className={`w-4 h-4 ${activeTab === 'tasks' ? 'text-primary' : 'text-slate-500 group-hover:text-primary'} transition-colors`} />
                                Tasks & Subtasks
                            </div>
                            {activeTab === 'tasks' && (
                                <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_0_10px_var(--color-primary)]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('meetings')}
                            className={`pb-5 px-2 font-black text-xs uppercase tracking-widest transition-all relative group ${activeTab === 'meetings'
                                ? 'text-primary'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Mic className={`w-4 h-4 ${activeTab === 'meetings' ? 'text-primary' : 'text-slate-500 group-hover:text-primary'} transition-colors`} />
                                Meetings & Intelligence
                            </div>
                            {activeTab === 'meetings' && (
                                <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_0_10px_var(--color-primary)]" />
                            )}
                        </button>
                    </div>

                    {/* Tasks Tab */}
                    {activeTab === 'tasks' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-text-main tracking-tight">Active Tasks</h3>
                                <div className="flex bg-surface/50 p-1.5 rounded-2xl border border-border/50 shadow-inner">
                                    <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary bg-slate-900 rounded-xl shadow-lg">All</button>
                                    <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-text-main transition-colors">My Tasks</button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {tasks.map(task => (
                                    <div key={task.id} className={`flex items-center gap-6 p-6 rounded-[2rem] transition-all border ${task.completed ? 'bg-slate-900/40 border-slate-800/50 opacity-50' : 'bg-slate-900/60 border-slate-800/40 hover:border-primary/30 hover:bg-slate-900/80 shadow-2xl group'}`}>
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${task.completed ? 'bg-primary border-primary text-white shadow-[0_0_15px_var(--color-primary)]' : 'border-slate-700/50 text-slate-500 group-hover:border-primary/50'}`}
                                        >
                                            {task.completed ? <CheckCircle className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-700/50"></div>}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xl font-black tracking-tight ${task.completed ? 'text-slate-500 line-through' : 'text-text-main group-hover:text-primary transition-colors'}`}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-6 mt-2">
                                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-widest ${task.priority === 'High' ? 'text-red-500/80 bg-red-400/5 border-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]' :
                                                    task.priority === 'Medium' ? 'text-amber-500/80 bg-amber-400/5 border-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'text-blue-500/80 bg-blue-400/5 border-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                                <span className="text-xs text-slate-500 font-bold flex items-center gap-2 opacity-70">
                                                    <Calendar className="w-4 h-4 text-primary/60" /> {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <button className="text-slate-500 hover:text-primary p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-surface border border-transparent hover:border-border">
                                            <MoreHorizontal className="w-6 h-6" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {canCreateTask && (
                                <button
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="w-full py-6 mt-6 text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-2 border-dashed border-border/40 rounded-[2rem] hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-4 cursor-pointer group shadow-inner"
                                >
                                    <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" /> Quick-Add Task Pipeline
                                </button>
                            )}
                        </div>
                    )}

                    {/* Meetings Tab */}
                    {activeTab === 'meetings' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Meeting Recording</h3>
                            </div>

                            {/* Voice Recorder */}
                            {canRecordMeeting ? (
                                <VoiceRecorder
                                    onRecordingComplete={handleRecordingComplete}
                                />
                            ) : (
                                <div className="bg-gray-50 rounded-xl p-6 text-center">
                                    <Mic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">You don't have permission to record meetings in this project.</p>
                                </div>
                            )}

                            {/* Transcript Editor */}
                            {currentRecording && currentRecording.transcript && currentRecording.transcript.length > 0 && (
                                <TranscriptEditor
                                    transcript={currentRecording.transcript}
                                    audioUrl={currentRecording.audioUrl}
                                    onGenerateSummary={handleGenerateSummary}
                                />
                            )}

                            {/* AI Summary */}
                            {(meetingAnalysis || analyzingMeeting) && (
                                <MeetingSummary
                                    analysis={meetingAnalysis}
                                    loading={analyzingMeeting}
                                    onCreateTask={handleCreateTaskFromAction}
                                />
                            )}
                        </div>
                    )}

                    <CreateTaskModal
                        isOpen={isTaskModalOpen}
                        onClose={() => setIsTaskModalOpen(false)}
                        onSave={handleAddTask}
                    />

                    {/* Edit Project Modal */}
                    {
                        isEditModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
                                <div className="relative bg-surface border border-border/50 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                                    <div className="px-8 py-6 border-b border-border/40 flex items-center justify-between bg-surface/50">
                                        <div>
                                            <h2 className="text-xl font-black text-text-main tracking-tight text-gradient-electric">Configure Project</h2>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">NestAI Settings</p>
                                        </div>
                                        <button onClick={() => setIsEditModalOpen(false)} className="p-3 text-slate-500 hover:bg-slate-900 hover:text-primary rounded-2xl transition-all cursor-pointer">
                                            <span className="text-2xl font-black">×</span>
                                        </button>
                                    </div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.target);
                                        handleEditProject({
                                            name: formData.get('name'),
                                            description: formData.get('description'),
                                        });
                                    }} className="p-8 space-y-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Project Identifier</label>
                                            <input
                                                type="text"
                                                name="name"
                                                defaultValue={project.name}
                                                className="w-full px-5 py-4 bg-slate-900/50 border border-border/50 rounded-2xl text-base font-bold text-text-main focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner placeholder-slate-600"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Vision & Scope</label>
                                            <textarea
                                                name="description"
                                                rows="4"
                                                defaultValue={project.description}
                                                className="w-full px-5 py-4 bg-slate-900/50 border border-border/50 rounded-2xl text-base font-medium text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none shadow-inner"
                                            ></textarea>
                                        </div>
                                        <div className="pt-4 flex justify-end gap-4">
                                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-900 rounded-2xl transition-all cursor-pointer">
                                                Decline
                                            </button>
                                            <button type="submit" className="px-10 py-4 bg-primary hover:bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 transition-all glow-blue active:scale-95 cursor-pointer">
                                                Sync Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
