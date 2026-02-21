import React from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, Tag, Repeat, Pencil, Trash2 } from 'lucide-react';
import { getRecurrenceDescription } from '../services/recurringService';

export default function EventDetailsModal({ isOpen, onClose, event, onEdit, onDelete }) {
    if (!isOpen || !event) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const recurrenceDesc = event.recurrence ? getRecurrenceDescription(event.recurrence) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-950 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">

                {/* Header */}
                <div className="relative h-24 bg-gradient-to-br from-primary/20 to-primary/5">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-600 dark:text-slate-300 backdrop-blur-md"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-6 left-8">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 transform rotate-3">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="pt-10 px-8 pb-8 space-y-6">

                    {/* Title & Type */}
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{event.title}</h2>
                            <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {event.type}
                            </span>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time</p>
                                <p className="font-medium">{formatDate(event.startISO)}</p>
                                <p className="text-sm text-slate-500">{event.start} - {event.end}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
                                <p className="font-medium">{event.location}</p>
                            </div>
                        </div>

                        {recurrenceDesc && (
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                                    <Repeat className="w-4 h-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recurrence</p>
                                    <p className="font-medium">{recurrenceDesc}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {event.notes && (
                        <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                <AlignLeft className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Notes</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {event.notes}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => {
                                onEdit(event);
                                onClose();
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onDelete(event.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
