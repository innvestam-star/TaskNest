import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, User, Mail, MessageSquare, ArrowLeft, Zap, ShieldCheck, CheckCircle } from 'lucide-react';
import { getBookingConfig, getAvailableSlots, createBooking } from '../services/bookingService';

export default function PublicBooking() {
    const { userSlug } = useParams();

    const [step, setStep] = useState(1); // 1: Select service, 2: Pick time, 3: Enter details, 4: Confirmation
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    // Client form
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientNotes, setClientNotes] = useState('');

    useEffect(() => {
        loadConfig();
    }, [userSlug]);

    useEffect(() => {
        if (selectedService && selectedDate) {
            loadSlots();
        }
    }, [selectedService, selectedDate]);

    const loadConfig = async () => {
        try {
            const savedConfig = await getBookingConfig(userSlug || 'demo');
            setConfig(savedConfig);

            if (savedConfig.services?.length === 1) {
                setSelectedService(savedConfig.services[0]);
                setStep(2);
            }
        } catch (error) {
            console.error('Error loading config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSlots = async () => {
        setIsLoadingSlots(true);
        try {
            const slots = await getAvailableSlots(userSlug || 'demo', selectedDate, selectedService?.id);
            setAvailableSlots(slots);
        } catch (error) {
            console.error('Error loading slots:', error);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setStep(2);
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setStep(3);
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setIsBooking(true);

        try {
            const result = await createBooking({
                providerId: userSlug || 'demo',
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                date: selectedDate.toISOString().split('T')[0],
                start: selectedSlot.start,
                end: selectedSlot.end,
                clientName,
                clientEmail,
                clientNotes,
            });

            setBookingResult(result);
            setStep(4);
        } catch (error) {
            console.error('Booking error:', error);
        } finally {
            setIsBooking(false);
        }
    };

    const navigateDate = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + direction);
        if (newDate >= new Date().setHours(0, 0, 0, 0)) {
            setSelectedDate(newDate);
            setSelectedSlot(null);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Initiating sync sequence...</p>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 border border-slate-800 shadow-2xl">
                    <ShieldCheck className="w-10 h-10 text-slate-700" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Protocol Error</h1>
                <p className="text-slate-500 font-bold max-w-xs mx-auto mb-8">This public registry entry has been decommissioned or does not exist.</p>
                <div className="text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20 px-4 py-2 rounded-xl">Error 404: Endpoint Offline</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30 selection:text-white transition-colors duration-500 font-sans relative overflow-x-hidden">
            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full opacity-50 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full opacity-30" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-24">
                {/* Header Section */}
                <header className="mb-16 text-center">
                    <div className="inline-flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-2 px-4 mb-8 glass-panel animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="w-10 h-10 rounded-lg bg-[#020617] flex items-center justify-center border border-slate-800 shadow-lg p-1.5 overflow-hidden">
                            <img src="/logo-icon-v4.png" alt="TaskNest" className="w-full h-full object-contain filter invert grayscale brightness-[10] contrast-[10] mix-blend-screen" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Public Booking Interface</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">{config.businessName || 'Protocol Sync'}</h1>
                    {config.description && (
                        <p className="text-slate-400 font-bold max-w-xl mx-auto leading-relaxed">{config.description}</p>
                    )}
                </header>

                {/* Progress Hub */}
                <div className="mb-16 px-4">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-slate-800 z-0" />
                        {['Protocol', 'Coordinate', 'Authentication', 'Finalize'].map((label, i) => (
                            <div key={label} className="relative z-10 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 ${step > i + 1
                                    ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                                    : step === i + 1
                                        ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110'
                                        : 'bg-slate-900 border border-slate-800 text-slate-600'
                                    }`}>
                                    {step > i + 1 ? <Check className="w-5 h-5 font-black" /> : i + 1}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest mt-4 transition-colors ${step >= i + 1 ? 'text-white' : 'text-slate-700'}`}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Action Area */}
                <main className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Navigation Back */}
                    {step > 1 && step < 4 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors text-[10px] font-black uppercase tracking-widest group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Return to previous phase
                        </button>
                    )}

                    {/* Step 1: Select Service */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 border-l-4 border-primary pl-4">Initialization: Service Choice</h2>
                            {(config.services || []).map(service => (
                                <button
                                    key={service.id}
                                    onClick={() => handleServiceSelect(service)}
                                    className="w-full bg-slate-900/40 rounded-[2.5rem] border border-slate-800/60 p-8 text-left hover:border-primary/50 hover:bg-slate-900/60 transition-all relative group overflow-hidden glass-panel active:scale-[0.98] electric-card"
                                >
                                    <div className="flex items-start gap-8 relative z-10">
                                        <div
                                            className="w-1.5 h-16 rounded-full shrink-0 transition-all group-hover:h-20"
                                            style={{ backgroundColor: service.color, boxShadow: `0 0 20px ${service.color}44` }}
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
                                            {service.description && (
                                                <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6 h-10 line-clamp-2">{service.description}</p>
                                            )}
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800 px-3 py-1.5 rounded-xl">
                                                    <Clock className="w-3 h-3 text-primary" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{service.duration} mins sync</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800 px-3 py-1.5 rounded-xl">
                                                    <Zap className="w-3 h-3 text-amber-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Session</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="self-center">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-primary/50 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4">
                                                <ChevronRight className="w-6 h-6 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Pick Time */}
                    {step === 2 && (
                        <div className="space-y-10">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter border-l-4 border-primary pl-4">Navigation: Coordinate Temporal Slot</h2>

                            <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between glass-panel gap-6">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => navigateDate(-1)}
                                        disabled={selectedDate <= new Date().setHours(0, 0, 0, 0)}
                                        className="p-4 bg-slate-950 border border-slate-800 hover:border-primary/50 rounded-2xl disabled:opacity-20 transition-all active:scale-90 shadow-2xl"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-slate-400" />
                                    </button>

                                    <div className="px-10 text-center flex flex-col items-center gap-1 min-w-[200px]">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{formatDate(selectedDate).split(',')[0]}</span>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter whitespace-nowrap">
                                            {formatDate(selectedDate).split(',')[1]}
                                        </h3>
                                    </div>

                                    <button
                                        onClick={() => navigateDate(1)}
                                        className="p-4 bg-slate-950 border border-slate-800 hover:border-primary/50 rounded-2xl transition-all active:scale-90 shadow-2xl"
                                    >
                                        <ChevronRight className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="h-10 w-px bg-slate-800 hidden md:block" />

                                <div className="flex items-center gap-4 bg-slate-950/80 px-6 py-3 rounded-2xl border border-slate-800">
                                    <div className="w-2 h-10 rounded-full" style={{ backgroundColor: selectedService?.color }} />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Target Protocol</p>
                                        <p className="text-sm font-black text-white uppercase tracking-tighter">{selectedService?.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/30 rounded-[3rem] border border-slate-800/60 p-10 glass-panel shadow-2xl">
                                {isLoadingSlots ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Scanning availability grid...</p>
                                    </div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {availableSlots.map((slot, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSlotSelect(slot)}
                                                className={`py-4 px-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all active:scale-95 ${selectedSlot?.start === slot.start
                                                    ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-primary hover:text-white'
                                                    }`}
                                            >
                                                {slot.start}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 flex flex-col items-center border border-dashed border-slate-800 rounded-[2rem]">
                                        <Clock className="w-12 h-12 text-slate-800 mb-6" />
                                        <h4 className="text-lg font-black text-slate-600 uppercase tracking-widest">Zero Coordinates found</h4>
                                        <p className="text-xs font-bold text-slate-700 mt-2">Adjust temporal range for more options.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Enter Details */}
                    {step === 3 && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter border-l-4 border-primary pl-4">Authentication: Signal Registry</h2>

                            <form onSubmit={handleBooking} className="bg-slate-900/40 rounded-[3rem] border border-slate-800 p-12 glass-panel shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                                    <div className="md:col-span-2 p-6 bg-slate-950/50 border border-slate-800 rounded-[2rem] flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20">
                                                <Zap className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sync Coordinates</p>
                                                <p className="text-lg font-black text-white tracking-tighter uppercase">{selectedService?.name} @ {selectedSlot?.start}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{formatDate(selectedDate).split(',')[0]}</p>
                                            <p className="text-xs font-black text-white uppercase tracking-[0.1em]">{formatDate(selectedDate).split(',')[1]}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Primary Identifier / Name</label>
                                        <div className="relative">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            <input
                                                type="text"
                                                value={clientName}
                                                onChange={(e) => setClientName(e.target.value)}
                                                required
                                                className="w-full pl-14 pr-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-white transition-all placeholder:text-slate-800 shadow-inner"
                                                placeholder="Identity Reference"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Communications Hub / Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            <input
                                                type="email"
                                                value={clientEmail}
                                                onChange={(e) => setClientEmail(e.target.value)}
                                                required
                                                className="w-full pl-14 pr-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-white transition-all placeholder:text-slate-800 shadow-inner"
                                                placeholder="Digital Correspondence"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-3">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Operational Brief / Notes</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-5 top-5 w-4 h-4 text-primary" />
                                            <textarea
                                                value={clientNotes}
                                                onChange={(e) => setClientNotes(e.target.value)}
                                                rows="4"
                                                className="w-full pl-14 pr-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-white transition-all placeholder:text-slate-800 shadow-inner resize-none leading-relaxed"
                                                placeholder="Detailed sync objectives (optional)..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isBooking}
                                    className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 glow-blue group disabled:opacity-50"
                                >
                                    {isBooking ? (
                                        <div className="animate-spin w-4 h-4 border-2 border-white/50 border-t-white rounded-full"></div>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5 transition-transform group-hover:scale-125 group-hover:rotate-12" />
                                            Transmit Reservation
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && (
                        <div className="text-center animate-in zoom-in-95 duration-700">
                            <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] border border-green-500/30 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                                <Check className="w-12 h-12 text-green-500" />
                            </div>

                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Sync Confirmed</h2>
                            <p className="text-slate-400 font-bold max-w-sm mx-auto mb-12">Registry complete. A secure dispatch has been transmitted to <span className="text-white">{clientEmail}</span></p>

                            <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800 p-10 glass-panel shadow-2xl max-w-md mx-auto relative overflow-hidden text-left mb-12">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-xl" />
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4">Payload Summary</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center group">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol</span>
                                        <span className="text-sm font-black text-white hover:text-primary transition-colors cursor-default">{selectedService?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chronology</span>
                                        <span className="text-sm font-black text-white">{formatDate(selectedDate)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temporal Window</span>
                                        <span className="text-sm font-black text-white">{selectedSlot?.start} - {selectedSlot?.end}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => window.close()}
                                className="px-10 py-4 bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 font-black text-[10px] uppercase tracking-[0.4em] rounded-[1.5rem] transition-all active:scale-95"
                            >
                                Close Interface
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Public Footer */}
            <footer className="fixed bottom-0 left-0 w-full border-t border-slate-900 bg-[#020617]/80 backdrop-blur-xl py-6 text-center z-50">
                <div className="flex items-center justify-center gap-3">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Synchronized via</span>
                    <div className="flex items-center gap-1.5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default group">
                        <img src="/logo-icon-v4.png" alt="TaskNest" className="w-4 h-4 object-contain group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black text-white tracking-widest">TASKNEST.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
