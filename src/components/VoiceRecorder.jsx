import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Pause, Play, AlertCircle, Clock } from 'lucide-react';
import {
    checkBrowserSupport,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getRecordingState
} from '../services/voiceService';

/**
 * Voice Recorder Component
 * Provides UI for recording audio with live transcription
 */
export default function VoiceRecorder({
    onRecordingComplete,
    onTranscriptUpdate,
    disabled = false
}) {
    const [recordingState, setRecordingState] = useState('inactive'); // 'inactive' | 'recording' | 'paused'
    const [elapsedTime, setElapsedTime] = useState(0);
    const [transcript, setTranscript] = useState({ finalTranscript: '', interimTranscript: '', parts: [] });
    const [error, setError] = useState(null);
    const [browserSupport, setBrowserSupport] = useState(null);

    const timerRef = useRef(null);
    const recordingControlsRef = useRef(null);

    // Check browser support on mount
    useEffect(() => {
        const support = checkBrowserSupport();
        setBrowserSupport(support);
        if (!support.isSupported) {
            setError('Your browser does not support voice recording. Please use Chrome or Edge.');
        }
    }, []);

    // Timer for elapsed time
    useEffect(() => {
        if (recordingState === 'recording') {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [recordingState]);

    // Format elapsed time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle transcript updates
    const handleTranscriptUpdate = useCallback((data) => {
        setTranscript(data);
        if (onTranscriptUpdate) {
            onTranscriptUpdate(data);
        }
    }, [onTranscriptUpdate]);

    // Start recording
    const handleStartRecording = async () => {
        setError(null);
        setElapsedTime(0);
        setTranscript({ finalTranscript: '', interimTranscript: '', parts: [] });

        try {
            const controls = await startRecording(null, handleTranscriptUpdate);
            recordingControlsRef.current = controls;
            setRecordingState('recording');
        } catch (err) {
            setError(err.message);
            setRecordingState('inactive');
        }
    };

    // Stop recording
    const handleStopRecording = async () => {
        try {
            const result = await stopRecording();
            setRecordingState('inactive');

            if (onRecordingComplete) {
                onRecordingComplete(result);
            }
        } catch (err) {
            setError('Failed to stop recording: ' + err.message);
        }
    };

    // Pause recording
    const handlePauseRecording = () => {
        pauseRecording();
        setRecordingState('paused');
    };

    // Resume recording
    const handleResumeRecording = () => {
        resumeRecording();
        setRecordingState('recording');
    };

    // Render browser support error
    if (browserSupport && !browserSupport.isSupported) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                    <p className="text-red-700 font-medium">Voice Recording Not Supported</p>
                    <p className="text-red-600 text-sm mt-1">
                        Please use Chrome, Edge, or Safari for voice recording and transcription.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700 text-sm">{error}</span>
                </div>
            )}

            {/* Recording controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Main record button */}
                    {recordingState === 'inactive' ? (
                        <button
                            onClick={handleStartRecording}
                            disabled={disabled}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Mic className="w-5 h-5" />
                            Start Recording
                        </button>
                    ) : (
                        <>
                            {/* Stop button */}
                            <button
                                onClick={handleStopRecording}
                                className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                            >
                                <Square className="w-4 h-4" />
                                Stop
                            </button>

                            {/* Pause/Resume button */}
                            {recordingState === 'recording' ? (
                                <button
                                    onClick={handlePauseRecording}
                                    className="flex items-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
                                >
                                    <Pause className="w-4 h-4" />
                                    Pause
                                </button>
                            ) : (
                                <button
                                    onClick={handleResumeRecording}
                                    className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                                >
                                    <Play className="w-4 h-4" />
                                    Resume
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Timer display */}
                {recordingState !== 'inactive' && (
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${recordingState === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
                        <span className="font-mono text-lg font-semibold text-gray-700">
                            {formatTime(elapsedTime)}
                        </span>
                    </div>
                )}
            </div>

            {/* Live transcription preview */}
            {recordingState !== 'inactive' && (
                <div className="mt-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Live Transcription</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
                        {transcript.finalTranscript || transcript.interimTranscript ? (
                            <p className="text-gray-700">
                                {transcript.finalTranscript}
                                <span className="text-gray-400 italic">{transcript.interimTranscript}</span>
                            </p>
                        ) : (
                            <p className="text-gray-400 italic">Start speaking to see transcription...</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
