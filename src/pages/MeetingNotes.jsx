import { useState, useRef, useEffect } from 'react';
import {
    Mic, MicOff, Play, Pause, Save, Trash2, FileText, Volume2, Clock, Calendar,
    Plus, X, FolderPlus, Edit3, ChevronRight, Link2, AlertTriangle, Loader2
} from 'lucide-react';
import {
    subscribeToProjects,
    subscribeToMeetings,
    createProject,
    updateProject,
    deleteProject,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    formatDuration,
    formatDate
} from '../lib/meetingService';
import styles from './MeetingNotes.module.css';

// Project color options
const PROJECT_COLORS = [
    '#8B5CF6', '#EC4899', '#EF4444', '#F97316', '#EAB308',
    '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1'
];

// Project icon options
const PROJECT_ICONS = ['📁', '🎯', '💼', '🚀', '💡', '📊', '🔧', '🎨', '📱', '🌟'];

const MeetingNotes = () => {
    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);

    // Projects & meetings state
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [viewMode, setViewMode] = useState('text');

    // Loading & UI state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showEditMeetingModal, setShowEditMeetingModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // { type: 'project'/'meeting', id, name }

    // Form states
    const [noteTitle, setNoteTitle] = useState('');
    const [isFollowUp, setIsFollowUp] = useState(false);
    const [followUpMeetingId, setFollowUpMeetingId] = useState(null);
    const [projectForm, setProjectForm] = useState({ name: '', color: PROJECT_COLORS[0], icon: PROJECT_ICONS[0] });
    const [editMeetingForm, setEditMeetingForm] = useState({ title: '', transcript: '' });

    // Refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Subscribe to projects on mount
    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToProjects((projectsData) => {
            setProjects(projectsData);
            setLoading(false);
            // Auto-select first project if none selected
            if (!selectedProject && projectsData.length > 0) {
                setSelectedProject(projectsData[0]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Subscribe to meetings when project changes
    useEffect(() => {
        if (!selectedProject) {
            setMeetings([]);
            return;
        }
        const unsubscribe = subscribeToMeetings(selectedProject.id, (meetingsData) => {
            setMeetings(meetingsData);
        });
        return () => unsubscribe();
    }, [selectedProject?.id]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript + ' ';
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
        }
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Recording functions
    const startRecording = async () => {
        if (!selectedProject) {
            alert('Please select or create a project first.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            setTranscript('');

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            if (recognitionRef.current) {
                recognitionRef.current.start();
            }
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            setIsPaused(false);
            clearInterval(timerRef.current);

            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setShowSaveModal(true);
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
                if (recognitionRef.current) {
                    recognitionRef.current.start();
                }
            } else {
                mediaRecorderRef.current.pause();
                clearInterval(timerRef.current);
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                }
            }
            setIsPaused(!isPaused);
        }
    };

    // Project functions
    const handleCreateProject = async () => {
        if (!projectForm.name.trim()) return;
        setSaving(true);
        try {
            await createProject(projectForm);
            setShowProjectModal(false);
            setProjectForm({ name: '', color: PROJECT_COLORS[0], icon: PROJECT_ICONS[0] });
        } catch (error) {
            alert('Failed to create project. Please try again.');
        }
        setSaving(false);
    };

    const handleDeleteProject = async () => {
        if (!showDeleteConfirm || showDeleteConfirm.type !== 'project') return;
        setSaving(true);
        try {
            await deleteProject(showDeleteConfirm.id);
            if (selectedProject?.id === showDeleteConfirm.id) {
                setSelectedProject(null);
                setMeetings([]);
            }
            setShowDeleteConfirm(null);
        } catch (error) {
            alert('Failed to delete project. Please try again.');
        }
        setSaving(false);
    };

    // Meeting functions
    const handleSaveMeeting = async () => {
        if (!selectedProject) return;
        setSaving(true);
        try {
            await createMeeting(selectedProject.id, {
                title: noteTitle || `Meeting Notes - ${new Date().toLocaleDateString()}`,
                transcript: transcript,
                duration: formatDuration(recordingTime),
                hasAudio: !!audioUrl,
                audioUrl: audioUrl,
                isFollowUp: isFollowUp,
                previousMeetingId: followUpMeetingId
            });
            setShowSaveModal(false);
            setNoteTitle('');
            setTranscript('');
            setAudioUrl(null);
            setRecordingTime(0);
            setIsFollowUp(false);
            setFollowUpMeetingId(null);
        } catch (error) {
            alert('Failed to save meeting. Please try again.');
        }
        setSaving(false);
    };

    const handleStartFollowUp = (meetingId) => {
        setIsFollowUp(true);
        setFollowUpMeetingId(meetingId);
        startRecording();
    };

    const handleEditMeeting = async () => {
        if (!selectedProject || !selectedMeeting) return;
        setSaving(true);
        try {
            await updateMeeting(selectedProject.id, selectedMeeting.id, {
                title: editMeetingForm.title,
                transcript: editMeetingForm.transcript
            });
            setShowEditMeetingModal(false);
            setSelectedMeeting({ ...selectedMeeting, ...editMeetingForm });
        } catch (error) {
            alert('Failed to update meeting. Please try again.');
        }
        setSaving(false);
    };

    const handleDeleteMeeting = async () => {
        if (!showDeleteConfirm || showDeleteConfirm.type !== 'meeting' || !selectedProject) return;
        setSaving(true);
        try {
            await deleteMeeting(selectedProject.id, showDeleteConfirm.id);
            if (selectedMeeting?.id === showDeleteConfirm.id) {
                setSelectedMeeting(null);
            }
            setShowDeleteConfirm(null);
        } catch (error) {
            alert('Failed to delete meeting. Please try again.');
        }
        setSaving(false);
    };

    const openEditMeetingModal = (meeting) => {
        setEditMeetingForm({ title: meeting.title, transcript: meeting.transcript });
        setShowEditMeetingModal(true);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Meeting Notes</h1>
                    <p>Record meetings and organize by project.</p>
                </div>
            </header>

            <div className={styles.mainLayout}>
                {/* Projects Sidebar */}
                <div className={styles.projectsSidebar}>
                    <div className={styles.sidebarHeader}>
                        <h3>Projects</h3>
                        <button className={styles.addProjectBtn} onClick={() => setShowProjectModal(true)}>
                            <FolderPlus size={18} />
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loadingState}>
                            <Loader2 size={24} className={styles.spinner} />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className={styles.emptyProjects}>
                            <FolderPlus size={32} />
                            <p>No projects yet</p>
                            <button onClick={() => setShowProjectModal(true)}>Create First Project</button>
                        </div>
                    ) : (
                        <div className={styles.projectsList}>
                            {projects.map(project => (
                                <div
                                    key={project.id}
                                    className={`${styles.projectCard} ${selectedProject?.id === project.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedProject(project)}
                                    style={{ '--project-color': project.color }}
                                >
                                    <div className={styles.projectIcon} style={{ backgroundColor: project.color + '20' }}>
                                        <span>{project.icon}</span>
                                    </div>
                                    <div className={styles.projectInfo}>
                                        <h4>{project.name}</h4>
                                        <span>{project.meetingCount || 0} meeting{project.meetingCount !== 1 ? 's' : ''}</span>
                                    </div>
                                    <button
                                        className={styles.projectDeleteBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteConfirm({ type: 'project', id: project.id, name: project.name });
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className={styles.mainContent}>
                    {/* Recording Panel */}
                    <div className={styles.recordingPanel}>
                        <div className={styles.recorder}>
                            {!isRecording ? (
                                <button
                                    className={styles.recordBtn}
                                    onClick={startRecording}
                                    disabled={!selectedProject}
                                >
                                    <Mic size={28} />
                                    <span>{selectedProject ? 'Start Recording' : 'Select a Project First'}</span>
                                </button>
                            ) : (
                                <div className={styles.recordingControls}>
                                    <div className={styles.recordingIndicator}>
                                        <span className={`${styles.recordingDot} ${isPaused ? styles.paused : ''}`}></span>
                                        <span className={styles.recordingTime}>{formatDuration(recordingTime)}</span>
                                        <span className={styles.recordingLabel}>{isPaused ? 'Paused' : 'Recording...'}</span>
                                        {isFollowUp && <span className={styles.followUpBadge}><Link2 size={12} /> Follow-up</span>}
                                    </div>
                                    <div className={styles.controlBtns}>
                                        <button className={styles.pauseBtn} onClick={pauseRecording}>
                                            {isPaused ? <Play size={20} /> : <Pause size={20} />}
                                        </button>
                                        <button className={styles.stopBtn} onClick={stopRecording}>
                                            <MicOff size={20} />
                                            Stop & Save
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isRecording && transcript && (
                            <div className={styles.liveTranscript}>
                                <h4><FileText size={16} /> Live Transcription</h4>
                                <p>{transcript}</p>
                            </div>
                        )}
                    </div>

                    {/* Meetings Section */}
                    {selectedProject ? (
                        <div className={styles.notesSection}>
                            <div className={styles.notesHeader}>
                                <h2>
                                    <span className={styles.projectBadge} style={{ backgroundColor: selectedProject.color + '20', color: selectedProject.color }}>
                                        {selectedProject.icon}
                                    </span>
                                    {selectedProject.name} - Meetings
                                </h2>
                            </div>

                            <div className={styles.notesGrid}>
                                <div className={styles.notesList}>
                                    {meetings.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <Mic size={40} />
                                            <p>No meetings recorded yet.</p>
                                            <span>Click "Start Recording" to create your first meeting note.</span>
                                        </div>
                                    ) : (
                                        meetings.map((meeting, index) => (
                                            <div key={meeting.id} className={styles.meetingItem}>
                                                {meeting.isFollowUp && (
                                                    <div className={styles.followUpConnector}>
                                                        <Link2 size={12} />
                                                    </div>
                                                )}
                                                <div
                                                    className={`${styles.noteCard} ${selectedMeeting?.id === meeting.id ? styles.selected : ''}`}
                                                    onClick={() => setSelectedMeeting(meeting)}
                                                >
                                                    <div className={styles.noteHeader}>
                                                        <h4>{meeting.title}</h4>
                                                        <div className={styles.noteActions}>
                                                            <button
                                                                className={styles.followUpBtn}
                                                                onClick={(e) => { e.stopPropagation(); handleStartFollowUp(meeting.id); }}
                                                                title="Add follow-up meeting"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                            <button
                                                                className={styles.deleteBtn}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowDeleteConfirm({ type: 'meeting', id: meeting.id, name: meeting.title });
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className={styles.noteMeta}>
                                                        <span><Calendar size={12} /> {formatDate(meeting.date)}</span>
                                                        <span><Clock size={12} /> {meeting.duration}</span>
                                                        {meeting.hasAudio && <span><Volume2 size={12} /> Audio</span>}
                                                        {meeting.isFollowUp && <span className={styles.followUpTag}><Link2 size={10} /> Follow-up</span>}
                                                    </div>
                                                    <p className={styles.notePreview}>
                                                        {meeting.transcript?.slice(0, 120)}{meeting.transcript?.length > 120 ? '...' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {selectedMeeting && (
                                    <div className={styles.noteDetail}>
                                        <div className={styles.detailHeader}>
                                            <h3>{selectedMeeting.title}</h3>
                                            <div className={styles.detailActions}>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => openEditMeetingModal(selectedMeeting)}
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button className={styles.closeBtn} onClick={() => setSelectedMeeting(null)}>
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.detailMeta}>
                                            <span><Calendar size={14} /> {formatDate(selectedMeeting.date)}</span>
                                            <span><Clock size={14} /> {selectedMeeting.duration}</span>
                                        </div>
                                        <div className={styles.viewToggle}>
                                            <button
                                                className={`${styles.toggleBtn} ${viewMode === 'text' ? styles.active : ''}`}
                                                onClick={() => setViewMode('text')}
                                            >
                                                <FileText size={16} /> Text
                                            </button>
                                            {selectedMeeting.hasAudio && (
                                                <button
                                                    className={`${styles.toggleBtn} ${viewMode === 'audio' ? styles.active : ''}`}
                                                    onClick={() => setViewMode('audio')}
                                                >
                                                    <Volume2 size={16} /> Audio
                                                </button>
                                            )}
                                        </div>
                                        <div className={styles.detailContent}>
                                            {viewMode === 'text' ? (
                                                <div className={styles.transcriptView}>
                                                    <p>{selectedMeeting.transcript || 'No transcript available.'}</p>
                                                </div>
                                            ) : (
                                                <div className={styles.audioView}>
                                                    {selectedMeeting.audioUrl ? (
                                                        <audio controls src={selectedMeeting.audioUrl} className={styles.audioPlayer} />
                                                    ) : (
                                                        <p className={styles.audioPlaceholder}>Audio playback available after recording.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noProjectSelected}>
                            <ChevronRight size={48} />
                            <h3>Select a Project</h3>
                            <p>Choose a project from the sidebar or create a new one to start recording meetings.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Meeting Modal */}
            {showSaveModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Save Meeting Note</h3>
                        {selectedProject && (
                            <div className={styles.projectTag} style={{ backgroundColor: selectedProject.color + '20', color: selectedProject.color }}>
                                {selectedProject.icon} {selectedProject.name}
                            </div>
                        )}
                        {isFollowUp && (
                            <div className={styles.followUpNote}>
                                <Link2 size={14} /> This is a follow-up meeting
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <label>Note Title</label>
                            <input
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder="e.g., Sprint Planning - Jan 16"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Transcription</label>
                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Edit or add to the transcription..."
                                rows={5}
                            />
                        </div>
                        <div className={styles.recordingInfo}>
                            <span><Clock size={14} /> Duration: {formatDuration(recordingTime)}</span>
                            {audioUrl && <span><Volume2 size={14} /> Audio recorded</span>}
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setShowSaveModal(false);
                                    setAudioUrl(null);
                                    setTranscript('');
                                    setIsFollowUp(false);
                                    setFollowUpMeetingId(null);
                                }}
                            >
                                Discard
                            </button>
                            <button className={styles.saveBtn} onClick={handleSaveMeeting} disabled={saving}>
                                {saving ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
                                {saving ? 'Saving...' : 'Save Note'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Project Modal */}
            {showProjectModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Create New Project</h3>
                        <div className={styles.formGroup}>
                            <label>Project Name</label>
                            <input
                                type="text"
                                value={projectForm.name}
                                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                                placeholder="e.g., Website Redesign"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Color</label>
                            <div className={styles.colorPicker}>
                                {PROJECT_COLORS.map(color => (
                                    <button
                                        key={color}
                                        className={`${styles.colorOption} ${projectForm.color === color ? styles.selected : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setProjectForm({ ...projectForm, color })}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Icon</label>
                            <div className={styles.iconPicker}>
                                {PROJECT_ICONS.map(icon => (
                                    <button
                                        key={icon}
                                        className={`${styles.iconOption} ${projectForm.icon === icon ? styles.selected : ''}`}
                                        onClick={() => setProjectForm({ ...projectForm, icon })}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowProjectModal(false)}>
                                Cancel
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={handleCreateProject}
                                disabled={saving || !projectForm.name.trim()}
                            >
                                {saving ? <Loader2 size={16} className={styles.spinner} /> : <FolderPlus size={16} />}
                                {saving ? 'Creating...' : 'Create Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Meeting Modal */}
            {showEditMeetingModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Edit Meeting Note</h3>
                        <div className={styles.formGroup}>
                            <label>Title</label>
                            <input
                                type="text"
                                value={editMeetingForm.title}
                                onChange={(e) => setEditMeetingForm({ ...editMeetingForm, title: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Transcript</label>
                            <textarea
                                value={editMeetingForm.transcript}
                                onChange={(e) => setEditMeetingForm({ ...editMeetingForm, transcript: e.target.value })}
                                rows={8}
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowEditMeetingModal(false)}>
                                Cancel
                            </button>
                            <button className={styles.saveBtn} onClick={handleEditMeeting} disabled={saving}>
                                {saving ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modal} ${styles.deleteModal}`}>
                        <div className={styles.deleteIcon}>
                            <AlertTriangle size={32} />
                        </div>
                        <h3>Delete {showDeleteConfirm.type === 'project' ? 'Project' : 'Meeting'}?</h3>
                        <p>
                            Are you sure you want to delete <strong>"{showDeleteConfirm.name}"</strong>?
                            {showDeleteConfirm.type === 'project' && (
                                <span className={styles.deleteWarning}> This will also delete all meetings in this project.</span>
                            )}
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button
                                className={styles.deleteConfirmBtn}
                                onClick={showDeleteConfirm.type === 'project' ? handleDeleteProject : handleDeleteMeeting}
                                disabled={saving}
                            >
                                {saving ? <Loader2 size={16} className={styles.spinner} /> : <Trash2 size={16} />}
                                {saving ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingNotes;
