/**
 * Voice Recording and Transcription Service for TaskNest
 * Uses Web Audio API for recording and Web Speech API for transcription
 */

// ============ RECORDING STATE ============
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;

// ============ SPEECH RECOGNITION ============
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let transcriptParts = [];

/**
 * Check if browser supports required APIs
 * @returns {Object} Support status for each API
 */
export function checkBrowserSupport() {
    return {
        mediaRecorder: typeof MediaRecorder !== 'undefined',
        speechRecognition: typeof SpeechRecognition !== 'undefined',
        mediaDevices: navigator.mediaDevices && navigator.mediaDevices.getUserMedia,
        isSupported: typeof MediaRecorder !== 'undefined' &&
            typeof SpeechRecognition !== 'undefined' &&
            navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    };
}

/**
 * Request microphone permission
 * @returns {Promise<MediaStream>} The audio stream
 */
export async function requestMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });
        return stream;
    } catch (error) {
        if (error.name === 'NotAllowedError') {
            throw new Error('Microphone permission denied. Please allow microphone access to record.');
        } else if (error.name === 'NotFoundError') {
            throw new Error('No microphone found. Please connect a microphone and try again.');
        }
        throw error;
    }
}

/**
 * Start audio recording
 * @param {Function} onDataAvailable - Callback when audio data is available
 * @param {Function} onTranscript - Callback when transcript is updated
 * @returns {Promise<Object>} Recording controls
 */
export async function startRecording(onDataAvailable, onTranscript) {
    // Reset state
    audioChunks = [];
    transcriptParts = [];
    recordingStartTime = Date.now();

    // Get microphone stream
    const stream = await requestMicrophonePermission();

    // Set up MediaRecorder
    const options = { mimeType: 'audio/webm;codecs=opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = '';
    }

    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
            if (onDataAvailable) {
                onDataAvailable(event.data);
            }
        }
    };

    // Start recording
    mediaRecorder.start(1000); // Collect data every second

    // Set up Speech Recognition for live transcription
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const timestamp = Math.floor((Date.now() - recordingStartTime) / 1000);

                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                    transcriptParts.push({
                        text: transcript.trim(),
                        timestamp: timestamp,
                        isFinal: true
                    });
                } else {
                    interimTranscript += transcript;
                }
            }

            if (onTranscript) {
                onTranscript({
                    finalTranscript: transcriptParts.map(p => p.text).join(' '),
                    interimTranscript,
                    parts: transcriptParts
                });
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                // Restart recognition if no speech detected
                try {
                    recognition.stop();
                    recognition.start();
                } catch (e) {
                    // Ignore restart errors
                }
            }
        };

        recognition.start();
    }

    return {
        stream,
        mediaRecorder,
        recognition,
        getElapsedTime: () => Math.floor((Date.now() - recordingStartTime) / 1000)
    };
}

/**
 * Stop recording and return the audio blob
 * @returns {Promise<Object>} Recording result with audio and transcript
 */
export function stopRecording() {
    return new Promise((resolve) => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            resolve({ audioBlob: null, transcript: transcriptParts });
            return;
        }

        // Stop speech recognition
        if (recognition) {
            recognition.stop();
            recognition = null;
        }

        mediaRecorder.onstop = () => {
            // Create audio blob
            const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });

            // Stop all tracks
            mediaRecorder.stream.getTracks().forEach(track => track.stop());

            const duration = Math.floor((Date.now() - recordingStartTime) / 1000);

            resolve({
                audioBlob,
                audioUrl: URL.createObjectURL(audioBlob),
                transcript: transcriptParts,
                fullTranscript: transcriptParts.map(p => p.text).join(' '),
                duration,
                recordedAt: new Date().toISOString()
            });
        };

        mediaRecorder.stop();
    });
}

/**
 * Pause recording
 */
export function pauseRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        if (recognition) {
            recognition.stop();
        }
    }
}

/**
 * Resume recording
 */
export function resumeRecording() {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        if (recognition) {
            recognition.start();
        }
    }
}

/**
 * Get current recording state
 * @returns {string} 'inactive' | 'recording' | 'paused'
 */
export function getRecordingState() {
    return mediaRecorder ? mediaRecorder.state : 'inactive';
}

// ============ STORAGE ============

/**
 * Save recording to localStorage (for demo purposes)
 * In production, this would upload to a server
 * @param {string} meetingId - The meeting ID
 * @param {Object} recordingData - The recording data
 */
export async function saveRecording(meetingId, recordingData) {
    // Convert blob to base64 for localStorage storage
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
            const recordings = JSON.parse(localStorage.getItem('meeting_recordings') || '{}');
            recordings[meetingId] = {
                audioBase64: reader.result,
                transcript: recordingData.transcript,
                fullTranscript: recordingData.fullTranscript,
                duration: recordingData.duration,
                recordedAt: recordingData.recordedAt
            };
            localStorage.setItem('meeting_recordings', JSON.stringify(recordings));
            resolve(true);
        };
        reader.onerror = reject;
        reader.readAsDataURL(recordingData.audioBlob);
    });
}

/**
 * Get recording for a meeting
 * @param {string} meetingId - The meeting ID
 * @returns {Object|null} The recording data
 */
export function getRecording(meetingId) {
    const recordings = JSON.parse(localStorage.getItem('meeting_recordings') || '{}');
    return recordings[meetingId] || null;
}

/**
 * Delete a recording
 * @param {string} meetingId - The meeting ID
 */
export function deleteRecording(meetingId) {
    const recordings = JSON.parse(localStorage.getItem('meeting_recordings') || '{}');
    delete recordings[meetingId];
    localStorage.setItem('meeting_recordings', JSON.stringify(recordings));
}

// ============ TRANSCRIPT UTILITIES ============

/**
 * Format transcript with timestamps
 * @param {Array} parts - Transcript parts with timestamps
 * @returns {string} Formatted transcript
 */
export function formatTranscriptWithTimestamps(parts) {
    return parts.map(part => {
        const minutes = Math.floor(part.timestamp / 60);
        const seconds = part.timestamp % 60;
        const time = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
        return `${time} ${part.text}`;
    }).join('\n');
}

/**
 * Parse formatted transcript back to parts
 * @param {string} formattedTranscript - Transcript with timestamps
 * @returns {Array} Transcript parts
 */
export function parseFormattedTranscript(formattedTranscript) {
    const lines = formattedTranscript.split('\n');
    const parts = [];

    for (const line of lines) {
        const match = line.match(/^\[(\d{2}):(\d{2})\]\s*(.+)$/);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            parts.push({
                timestamp: minutes * 60 + seconds,
                text: match[3].trim(),
                isFinal: true
            });
        }
    }

    return parts;
}
