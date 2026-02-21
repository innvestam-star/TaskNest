import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Save, X, Clock, Trash2, Download, Sparkles } from 'lucide-react';
import { formatTranscriptWithTimestamps, parseFormattedTranscript } from '../services/voiceService';

/**
 * Transcript Editor Component
 * Displays and allows editing of meeting transcripts with timestamps
 */
export default function TranscriptEditor({
    transcript = [],
    audioUrl = null,
    onSave,
    onExtractActionItems,
    onGenerateSummary,
    readOnly = false
}) {
    const [editMode, setEditMode] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState('');
    const [selectedTimestamp, setSelectedTimestamp] = useState(null);

    const audioRef = useRef(null);

    // Format transcript for display
    useEffect(() => {
        if (transcript && transcript.length > 0) {
            setEditedTranscript(formatTranscriptWithTimestamps(transcript));
        }
    }, [transcript]);

    // Jump to timestamp in audio
    const handleTimestampClick = (timestamp) => {
        if (audioRef.current) {
            audioRef.current.currentTime = timestamp;
            audioRef.current.play();
        }
        setSelectedTimestamp(timestamp);
    };

    // Save edited transcript
    const handleSave = () => {
        const parts = parseFormattedTranscript(editedTranscript);
        if (onSave) {
            onSave(parts);
        }
        setEditMode(false);
    };

    // Cancel editing
    const handleCancel = () => {
        setEditedTranscript(formatTranscriptWithTimestamps(transcript));
        setEditMode(false);
    };

    // Format timestamp for display
    const formatTimestamp = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Download transcript as text file
    const handleDownload = () => {
        const content = formatTranscriptWithTimestamps(transcript);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!transcript || transcript.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transcript available</p>
                <p className="text-gray-400 text-sm mt-1">Record a meeting to generate a transcript</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Meeting Transcript</h3>
                    <span className="text-sm text-gray-500">({transcript.length} segments)</span>
                </div>

                <div className="flex items-center gap-2">
                    {!readOnly && (
                        <>
                            {editMode ? (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            )}
                        </>
                    )}

                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>

            {/* Audio Player */}
            {audioUrl && (
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        controls
                        className="w-full"
                    />
                </div>
            )}

            {/* Transcript Content */}
            <div className="p-4">
                {editMode ? (
                    <textarea
                        value={editedTranscript}
                        onChange={(e) => setEditedTranscript(e.target.value)}
                        className="w-full min-h-[300px] p-4 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="[00:00] Start typing transcript..."
                    />
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {transcript.map((part, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-50 ${selectedTimestamp === part.timestamp ? 'bg-blue-50' : ''
                                    }`}
                                onClick={() => handleTimestampClick(part.timestamp)}
                            >
                                <span className="text-sm font-mono text-primary font-medium shrink-0">
                                    [{formatTimestamp(part.timestamp)}]
                                </span>
                                <p className="text-gray-700">{part.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {!editMode && (
                <div className="p-4 border-t border-gray-100 flex gap-3">
                    {onExtractActionItems && (
                        <button
                            onClick={onExtractActionItems}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Extract Action Items
                        </button>
                    )}

                    {onGenerateSummary && (
                        <button
                            onClick={onGenerateSummary}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate AI Summary
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
