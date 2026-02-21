import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Zap, CalendarDays, ListTodo, CheckCircle, Clock, Lock, User, Bot, Paperclip, Mic, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Paywall from '../components/Paywall';
import { breakDownGoal, planMyDay, chat } from '../services/aiService';
import { useSubscription } from '../context/SubscriptionContext';

export default function NestAI() {
    const { canUse, isFree } = useSubscription();
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Initialization complete. I am NestAI, your productivity co-pilot. 🚀\n\nI can facilitate the following protocols:\n• Goal Deconstruction: Break complex objectives into executable tasks\n• Temporal Optimization: Plan your day for maximum efficiency\n• Contextual Intelligence: Answer queries and suggest workflows\n\nChoose a protocol below or input your command.",
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [freeTrialMessages, setFreeTrialMessages] = useState(2);
    const [addedTasks, setAddedTasks] = useState(new Set());
    const messagesEndRef = useRef(null);

    const hasAIAccess = canUse('aiAssistant');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (type, content, extra = {}) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type,
            content,
            timestamp: new Date(),
            ...extra
        }]);
    };

    const checkAccess = () => {
        if (hasAIAccess) return true;
        if (freeTrialMessages > 0) {
            setFreeTrialMessages(prev => prev - 1);
            return true;
        }
        setShowPaywall(true);
        return false;
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        if (!checkAccess()) return;

        const userMessage = input.trim();
        setInput('');
        addMessage('user', userMessage);
        setIsTyping(true);

        try {
            const lowerInput = userMessage.toLowerCase();
            if (lowerInput.includes('plan my day') || lowerInput.includes('schedule') || lowerInput.includes('plan today')) {
                const result = await planMyDay();
                addMessage('ai', result.message, { schedule: result.schedule });
            } else if (lowerInput.includes('i need') || lowerInput.includes('i want') || lowerInput.includes('help me') || lowerInput.includes('prepare') || lowerInput.includes('create')) {
                const result = await breakDownGoal(userMessage);
                addMessage('ai', result.message, { tasks: result.tasks });
            } else {
                const response = await chat(userMessage);
                addMessage('ai', response);
            }
        } catch (error) {
            addMessage('ai', "System Interrupt: Neural link failed. Please re-authenticate your request.");
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickAction = async (action) => {
        if (!checkAccess()) return;
        addMessage('user', action);
        setIsTyping(true);

        try {
            if (action === 'Plan my day') {
                const result = await planMyDay();
                addMessage('ai', result.message, { schedule: result.schedule });
            } else if (action === 'Break down a goal') {
                addMessage('ai', "Protocol Activated. Specify your objective. For example:\n• 'Orchestrate a market entry strategy'\n• 'Deconstruct the software development lifecycle'\n• 'Formulate a budget for Q3 operations'");
            } else if (action === 'Show my tasks') {
                addMessage('ai', "Detecting 5 active task identifiers for today. Shall I prioritize them for maximum throughput?");
            }
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-all duration-500 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

            <PageHeader
                title="NestAI / Core"
                subtitle="High-fidelity productivity co-pilot"
            >
                <div className="flex items-center gap-4">
                    {isFree && !hasAIAccess && (
                        <div className="px-4 py-1.5 bg-surface/50 border border-border/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 glass-panel shadow-inner">
                            {freeTrialMessages > 0 ? `${freeTrialMessages} Credits Remaining` : 'Credits Exhausted'}
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-violet-500/20 glow-purple animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        AI Node Active
                    </div>
                </div>
            </PageHeader>

            {/* Trial Banner */}
            {isFree && !hasAIAccess && freeTrialMessages === 0 && (
                <div className="bg-violet-600 px-6 py-2 animate-in slide-in-from-top duration-500 relative z-10">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-white" />
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Neural Link Restricted. Upgrade to Pro for unlimited telemetry.</p>
                        </div>
                        <Link to="/pricing" className="px-4 py-1 bg-white text-violet-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all">
                            Upgrade Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Chat Interface */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar relative z-10">
                <div className="max-w-4xl mx-auto space-y-12">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                            <div className={`max-w-2xl flex gap-6 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg transition-transform hover:scale-110 ${msg.type === 'ai'
                                        ? 'bg-gradient-to-br from-violet-500 to-indigo-600 border-white/10 glow-purple'
                                        : 'bg-surface border-border/50'
                                    }`}>
                                    {msg.type === 'ai' ? <Bot className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-primary" />}
                                </div>
                                <div className="space-y-4">
                                    <div className={`p-6 rounded-[2rem] text-sm leading-relaxed ${msg.type === 'user'
                                            ? 'bg-primary text-white font-bold rounded-tr-md shadow-2xl shadow-primary/20 glow-blue'
                                            : 'bg-surface/50 border border-border/50 glass-panel shadow-2xl text-text-main font-medium rounded-tl-md'
                                        }`}>
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>

                                    {/* Task Breakdown Cards */}
                                    {msg.tasks && (
                                        <div className="grid grid-cols-1 gap-4 mt-6 animate-in fade-in slide-in-from-left-4 duration-700">
                                            {msg.tasks.map((task, i) => (
                                                <div key={i} className="bg-surface/50 border border-border/50 rounded-[1.5rem] p-5 glass-panel flex items-center gap-5 group hover:border-primary/50 transition-all electric-card">
                                                    <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                        <CheckCircle className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-black text-text-main tracking-tight uppercase">{task.title}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{task.duration}</span>
                                                            <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'text-red-500' :
                                                                    task.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                                                                }`}>{task.priority}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const existingTasks = JSON.parse(localStorage.getItem('tasknest_tasks') || '[]');
                                                    const newTasks = msg.tasks.map((task, i) => ({
                                                        id: Date.now() + i,
                                                        title: task.title,
                                                        priority: task.priority,
                                                        duration: task.duration,
                                                        completed: false,
                                                        createdAt: new Date().toISOString(),
                                                        source: 'NestAI'
                                                    }));
                                                    localStorage.setItem('tasknest_tasks', JSON.stringify([...existingTasks, ...newTasks]));
                                                    setAddedTasks(prev => new Set([...prev, msg.id]));
                                                }}
                                                disabled={addedTasks.has(msg.id)}
                                                className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 glow-blue disabled:opacity-20"
                                            >
                                                {addedTasks.has(msg.id) ? '✓ Tasks Synchronized' : '⚡ Commit Protocol to Registry'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Schedule Timeline */}
                                    {msg.schedule && (
                                        <div className="mt-6 bg-surface/50 border border-border/50 rounded-[2.5rem] overflow-hidden glass-panel shadow-2xl animate-in zoom-in-95 duration-700">
                                            <div className="px-8 py-5 border-b border-border/10 bg-slate-900/20">
                                                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Chronological Optimization</h4>
                                            </div>
                                            <div className="divide-y divide-border/10">
                                                {msg.schedule.map((item, i) => (
                                                    <div key={i} className={`flex items-center gap-6 p-5 transition-colors hover:bg-slate-900/20 ${item.type === 'break' ? 'bg-green-500/5' :
                                                            item.type === 'meeting' ? 'bg-blue-500/5' : ''
                                                        }`}>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-16 text-center">{item.time}</span>
                                                        <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${item.type === 'focus' ? 'bg-purple-500 glow-purple' :
                                                                item.type === 'meeting' ? 'bg-blue-500 glow-blue' :
                                                                    item.type === 'break' ? 'bg-green-500 glow-green' : 'bg-slate-600'
                                                            }`}></div>
                                                        <span className="text-xs font-bold text-text-main uppercase tracking-tight">{item.task}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="bg-surface/50 border border-border/50 rounded-[2rem] p-6 glass-panel flex items-center gap-6 shadow-2xl">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce glow-blue" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce glow-purple" style={{ animationDelay: '200ms' }} />
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce glow-blue" style={{ animationDelay: '400ms' }} />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Processing Telemetry...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions Dock */}
            <div className="px-8 py-6 border-t border-border/10 bg-background/50 backdrop-blur-xl relative z-20">
                <div className="max-w-4xl mx-auto flex gap-3 justify-center">
                    {[
                        { label: 'Plan my day', icon: CalendarDays },
                        { label: 'Break down a goal', icon: ListTodo },
                        { label: 'Show my tasks', icon: CheckCircle },
                    ].map(action => (
                        <button
                            key={action.label}
                            onClick={() => handleQuickAction(action.label)}
                            disabled={isFree && freeTrialMessages === 0 && !hasAIAccess}
                            className="flex items-center gap-3 px-6 py-2.5 bg-surface border border-border/50 hover:border-primary/50 text-text-main text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 glass-panel shadow-sm disabled:opacity-20 hover:scale-105"
                        >
                            <action.icon className="w-4 h-4 text-primary" />
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Command Input Center */}
            <div className="p-8 border-t border-border/20 bg-background/80 backdrop-blur-2xl relative z-20">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-primary/20 blur-2xl group-focus-within:opacity-100 opacity-0 transition-opacity" />
                    <div className="relative flex items-center bg-surface/80 border border-border/50 rounded-[2.5rem] p-2 pr-4 shadow-2xl glass-panel group-focus-within:border-primary/50 transition-all">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                            <Paperclip className="w-5 h-5 text-slate-600 hover:text-primary transition-colors cursor-pointer" />
                        </div>
                        <input
                            type="text"
                            placeholder={isFree && freeTrialMessages === 0 && !hasAIAccess ? "Upgrade to continue..." : "Execute AI Command..."}
                            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-text-main px-2 py-4 placeholder:text-slate-800 placeholder:uppercase placeholder:tracking-widest"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isFree && freeTrialMessages === 0 && !hasAIAccess}
                        />
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-primary transition-colors">
                                <Mic className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping || (isFree && freeTrialMessages === 0 && !hasAIAccess)}
                                className="w-14 h-14 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all glow-blue disabled:opacity-10 group/btn"
                            >
                                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Paywall
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="NestAI assistant"
            />
        </div>
    );
}
