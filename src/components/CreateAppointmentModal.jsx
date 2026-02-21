import React, { useState } from 'react';
import { X, Calendar, MapPin, AlignLeft, Clock, Repeat, Lock } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { RECURRENCE_PATTERNS, createRecurrence, getRecurrenceDescription } from '../services/recurringService';
import { getNowDateTimeLocal, getDateTimeLocalOffset } from '../utils/dateUtils';

export default function CreateAppointmentModal({ isOpen, onClose, onSave, initialData }) {
    if (!isOpen) return null;

    const { subscription } = useSubscription();
    const plan = subscription?.plan || 'free';
    const isPro = plan === 'pro' || plan === 'business';

    const defaultStart = getNowDateTimeLocal();
    const defaultEnd = getDateTimeLocalOffset(defaultStart, 1);

    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState(defaultStart);
    const [endTime, setEndTime] = useState(defaultEnd);
    const [location, setLocation] = useState('Online');
    const [notes, setNotes] = useState('');

    // Effect to populate form when modal opens
    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || '');
                // Ensure time formats match what raw input expects if necessary, 
                // but usually datetime-local expects YYYY-MM-DDTHH:mm
                setStartTime(initialData.startISO || initialData.startTime || defaultStart);
                setEndTime(initialData.endISO || initialData.endTime || defaultEnd);
                setLocation(initialData.location || 'Online');
                setNotes(initialData.notes || '');
                setIsRecurring(!!initialData.recurrence);
            } else {
                // Reset to defaults for new appointment
                const freshStart = getNowDateTimeLocal();
                setTitle('');
                setStartTime(freshStart);
                setEndTime(getDateTimeLocalOffset(freshStart, 1));
                setLocation('Online');
                setNotes('');
                setIsRecurring(false);
                setRecurrencePattern(RECURRENCE_PATTERNS.WEEKLY);
                setRecurrenceEndType('occurrences');
                setShowRecurrenceOptions(false);
            }
        }
    }, [isOpen, initialData]);

    // Recurring appointment state
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrencePattern, setRecurrencePattern] = useState(RECURRENCE_PATTERNS.WEEKLY);
    const [recurrenceEndType, setRecurrenceEndType] = useState('occurrences');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
    const [recurrenceOccurrences, setRecurrenceOccurrences] = useState(10);
    const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

    const handleRecurringToggle = () => {
        if (!isPro) {
            setShowUpgradePrompt(true);
            return;
        }
        setIsRecurring(!isRecurring);
        setShowRecurrenceOptions(!isRecurring);
    };

    const handleStartTimeChange = (value) => {
        setStartTime(value);
        // Auto-update end time to 1 hour after new start
        if (value) {
            setEndTime(getDateTimeLocalOffset(value, 1));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let recurrence = null;
        if (isRecurring && isPro) {
            recurrence = createRecurrence(recurrencePattern, {
                endType: recurrenceEndType,
                endDate: recurrenceEndType === 'date' ? recurrenceEndDate : null,
                occurrences: recurrenceEndType === 'occurrences' ? recurrenceOccurrences : null,
            });
        }

        onSave({
            title,
            startTime,
            endTime,
            location,
            notes,
            recurrence,
        });

        onClose();
    };

    const getRecurrencePreview = () => {
        if (!isRecurring) return '';
        const recurrence = createRecurrence(recurrencePattern, {
            endType: recurrenceEndType,
            endDate: recurrenceEndType === 'date' ? recurrenceEndDate : null,
            occurrences: recurrenceEndType === 'occurrences' ? recurrenceOccurrences : null,
        });
        return getRecurrenceDescription(recurrence);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-950 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto border border-transparent dark:border-slate-800 transition-colors duration-300">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{initialData ? 'Edit Appointment' : 'New Appointment'}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <input
                            type="text"
                            placeholder="Appointment Title"
                            className="w-full text-xl font-semibold placeholder-gray-400 border-none outline-none bg-transparent text-gray-900 dark:text-white"
                            autoFocus
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> Start Time
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                value={startTime}
                                onChange={(e) => handleStartTimeChange(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> End Time
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Recurring Appointment Toggle */}
                    <div>
                        <div
                            onClick={handleRecurringToggle}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${isRecurring
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isRecurring ? 'bg-primary/10' : 'bg-gray-100 dark:bg-slate-800'}`}>
                                    <Repeat className={`w-4 h-4 ${isRecurring ? 'text-primary' : 'text-gray-500'}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white">Recurring Meeting</span>
                                        {!isPro && (
                                            <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">
                                                <Lock className="w-3 h-3" /> Pro
                                            </span>
                                        )}
                                    </div>
                                    {isRecurring && (
                                        <span className="text-xs text-primary">{getRecurrencePreview()}</span>
                                    )}
                                </div>
                            </div>
                            <div className={`w-10 h-6 rounded-full transition-colors ${isRecurring ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${isRecurring ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'}`} />
                            </div>
                        </div>

                        {/* Upgrade Prompt */}
                        {showUpgradePrompt && !isPro && (
                            <div className="mt-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                                <p className="text-sm text-amber-800 mb-2">
                                    <strong>Unlock Recurring Meetings</strong> — Schedule weekly team syncs, monthly reviews, and more automatically.
                                </p>
                                <a
                                    href="/pricing"
                                    className="inline-block text-sm font-medium text-amber-700 hover:text-amber-900 underline"
                                >
                                    Upgrade to Pro →
                                </a>
                            </div>
                        )}

                        {/* Recurrence Options */}
                        {showRecurrenceOptions && isRecurring && isPro && (
                            <div className="mt-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-xl space-y-4 border border-gray-100 dark:border-slate-700">
                                {/* Pattern Selection */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Repeat
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { value: RECURRENCE_PATTERNS.DAILY, label: 'Daily' },
                                            { value: RECURRENCE_PATTERNS.WEEKLY, label: 'Weekly' },
                                            { value: RECURRENCE_PATTERNS.BIWEEKLY, label: 'Bi-weekly' },
                                            { value: RECURRENCE_PATTERNS.MONTHLY, label: 'Monthly' },
                                        ].map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setRecurrencePattern(option.value)}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer ${recurrencePattern === option.value
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* End Condition */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Ends
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="endType"
                                                value="never"
                                                checked={recurrenceEndType === 'never'}
                                                onChange={() => setRecurrenceEndType('never')}
                                                className="text-primary"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-slate-300">Never</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="endType"
                                                value="date"
                                                checked={recurrenceEndType === 'date'}
                                                onChange={() => setRecurrenceEndType('date')}
                                                className="text-primary"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-slate-300">On date</span>
                                            {recurrenceEndType === 'date' && (
                                                <input
                                                    type="date"
                                                    value={recurrenceEndDate}
                                                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                                                    className="ml-2 px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                                                />
                                            )}
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="endType"
                                                value="occurrences"
                                                checked={recurrenceEndType === 'occurrences'}
                                                onChange={() => setRecurrenceEndType('occurrences')}
                                                className="text-primary"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-slate-300">After</span>
                                            {recurrenceEndType === 'occurrences' && (
                                                <>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="100"
                                                        value={recurrenceOccurrences}
                                                        onChange={(e) => setRecurrenceOccurrences(parseInt(e.target.value))}
                                                        className="w-16 ml-2 px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-center text-gray-900 dark:text-white"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-slate-300">times</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> Location
                        </label>
                        <div className="flex gap-2">
                            {['Online', 'Physical'].map((loc) => (
                                <button
                                    key={loc}
                                    type="button"
                                    onClick={() => setLocation(loc)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer ${location === loc
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <AlignLeft className="w-3.5 h-3.5" /> Notes
                        </label>
                        <textarea
                            rows="3"
                            placeholder="Add meeting notes (optional)..."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-600 dark:text-slate-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                        >
                            {initialData ? 'Update Schedule' : 'Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
