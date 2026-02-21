import React, { useState } from 'react';
import { X, Layout, Users, Lock, ChevronRight } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

const PROJECT_COLORS = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Green', value: '#10B981' },
    { name: 'Teal', value: '#14B8A6' },
];

export default function CreateProjectModal({ isOpen, onClose, onSave, projectCount = 0 }) {
    if (!isOpen) return null;

    const { subscription } = useSubscription();
    const plan = subscription?.plan || 'free';
    // Free plan limit: 1 project
    // Pro plan limit: 5 projects
    // Business plan limit: Unlimited
    const canCreateProject =
        plan === 'business' ||
        (plan === 'pro' && projectCount < 5) ||
        (plan === 'free' && projectCount < 1);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(PROJECT_COLORS[0].value);
    const [members, setMembers] = useState(''); // Comma separated emails

    const handleSubmit = (e) => {
        e.preventDefault();

        onSave({
            name,
            description,
            color,
            members: members.split(',').map(e => e.trim()).filter(Boolean).map(email => ({
                name: email.split('@')[0], // Mock name
                role: 'viewer', // Default role
                email
            }))
        });

        // Reset and close
        setName('');
        setDescription('');
        setColor(PROJECT_COLORS[0].value);
        setMembers('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-slate-950 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800 transition-colors duration-300">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
                    <h2 className="text-lg font-bold text-gray-900">New Project</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!canCreateProject ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Project Limit Reached</h3>
                        <p className="text-gray-500 mb-6">
                            {plan === 'free'
                                ? "Free users can only manage 1 active project at a time."
                                : "Pro users can manage up to 5 active projects."}
                            <br />Upgrade to {plan === 'free' ? 'Pro' : 'Business'} for more.
                        </p>
                        <a
                            href="/pricing"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                        >
                            Upgrade Plan <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Layout className="w-3.5 h-3.5" /> Project Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Website Redesign"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-semibold text-gray-900"
                                autoFocus
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Color Code
                            </label>
                            <div className="flex gap-3 flex-wrap">
                                {PROJECT_COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setColor(c.value)}
                                        className={`w-8 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center ${color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: c.value }}
                                        title={c.name}
                                    >
                                        {color === c.value && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Description
                            </label>
                            <textarea
                                rows="3"
                                placeholder="What is this project about?"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none font-semibold text-gray-900"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" /> Team Members
                            </label>
                            <input
                                type="text"
                                placeholder="Enter emails separated by commas..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-semibold text-gray-900"
                                value={members}
                                onChange={(e) => setMembers(e.target.value)}
                            />
                            <p className="text-xs text-gray-400 mt-1.5">
                                Invites will be sent automatically. Requires Pro/Business for collab.
                            </p>
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                            >
                                Create Project
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
