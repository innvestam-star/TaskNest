// Meeting Notes Firebase Service
// Handles all Firestore operations for projects and meeting notes

import { db } from './firebase';
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';

// Collection references
const PROJECTS_COLLECTION = 'projects';
const MEETINGS_SUBCOLLECTION = 'meetings';

// ============================================
// PROJECT OPERATIONS
// ============================================

/**
 * Create a new project
 * @param {Object} projectData - { name, color, icon }
 * @returns {Promise<string>} - The new project ID
 */
export const createProject = async (projectData) => {
    try {
        const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
            name: projectData.name,
            color: projectData.color || '#8B5CF6', // Default purple
            icon: projectData.icon || '📁',
            meetingCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

/**
 * Get all projects with real-time updates
 * @param {Function} callback - Called with array of projects on each update
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToProjects = (callback) => {
    const q = query(
        collection(db, PROJECTS_COLLECTION),
        orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
        }));
        callback(projects);
    }, (error) => {
        console.error('Error subscribing to projects:', error);
        callback([]);
    });
};

/**
 * Get all projects (one-time fetch)
 * @returns {Promise<Array>} - Array of projects
 */
export const getProjects = async () => {
    try {
        const q = query(
            collection(db, PROJECTS_COLLECTION),
            orderBy('updatedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
        }));
    } catch (error) {
        console.error('Error getting projects:', error);
        throw error;
    }
};

/**
 * Update a project
 * @param {string} projectId - The project ID
 * @param {Object} updates - Fields to update
 */
export const updateProject = async (projectId, updates) => {
    try {
        const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
        await updateDoc(projectRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
};

/**
 * Delete a project and all its meetings
 * @param {string} projectId - The project ID
 */
export const deleteProject = async (projectId) => {
    try {
        const batch = writeBatch(db);

        // Delete all meetings in the project
        const meetingsRef = collection(db, PROJECTS_COLLECTION, projectId, MEETINGS_SUBCOLLECTION);
        const meetingsSnapshot = await getDocs(meetingsRef);
        meetingsSnapshot.docs.forEach(meetingDoc => {
            batch.delete(meetingDoc.ref);
        });

        // Delete the project itself
        const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
        batch.delete(projectRef);

        await batch.commit();
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
};

// ============================================
// MEETING OPERATIONS
// ============================================

/**
 * Create a new meeting note within a project
 * @param {string} projectId - The parent project ID
 * @param {Object} meetingData - { title, transcript, duration, hasAudio, audioUrl, isFollowUp, previousMeetingId }
 * @returns {Promise<string>} - The new meeting ID
 */
export const createMeeting = async (projectId, meetingData) => {
    try {
        const meetingsRef = collection(db, PROJECTS_COLLECTION, projectId, MEETINGS_SUBCOLLECTION);
        const docRef = await addDoc(meetingsRef, {
            title: meetingData.title,
            transcript: meetingData.transcript || '',
            duration: meetingData.duration || '0:00',
            hasAudio: meetingData.hasAudio || false,
            audioUrl: meetingData.audioUrl || null,
            isFollowUp: meetingData.isFollowUp || false,
            previousMeetingId: meetingData.previousMeetingId || null,
            date: serverTimestamp(),
            createdAt: serverTimestamp()
        });

        // Update project's meeting count and timestamp
        const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
            await updateDoc(projectRef, {
                meetingCount: (projectSnap.data().meetingCount || 0) + 1,
                updatedAt: serverTimestamp()
            });
        }

        return docRef.id;
    } catch (error) {
        console.error('Error creating meeting:', error);
        throw error;
    }
};

/**
 * Subscribe to meetings for a specific project
 * @param {string} projectId - The project ID
 * @param {Function} callback - Called with array of meetings on each update
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToMeetings = (projectId, callback) => {
    const meetingsRef = collection(db, PROJECTS_COLLECTION, projectId, MEETINGS_SUBCOLLECTION);
    const q = query(meetingsRef, orderBy('date', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const meetings = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate?.() || new Date(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        callback(meetings);
    }, (error) => {
        console.error('Error subscribing to meetings:', error);
        callback([]);
    });
};

/**
 * Get all meetings for a project (one-time fetch)
 * @param {string} projectId - The project ID
 * @returns {Promise<Array>} - Array of meetings
 */
export const getMeetings = async (projectId) => {
    try {
        const meetingsRef = collection(db, PROJECTS_COLLECTION, projectId, MEETINGS_SUBCOLLECTION);
        const q = query(meetingsRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate?.() || new Date(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
    } catch (error) {
        console.error('Error getting meetings:', error);
        throw error;
    }
};

/**
 * Update a meeting note
 * @param {string} projectId - The project ID
 * @param {string} meetingId - The meeting ID
 * @param {Object} updates - Fields to update
 */
export const updateMeeting = async (projectId, meetingId, updates) => {
    try {
        const meetingRef = doc(db, PROJECTS_COLLECTION, projectId, MEETINGS_SUBCOLLECTION, meetingId);
        await updateDoc(meetingRef, updates);

        // Update project timestamp
        const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
        await updateDoc(projectRef, {
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating meeting:', error);
        throw error;
    }
};

/**
 * Delete a meeting note
 * @param {string} projectId - The project ID
 * @param {string} meetingId - The meeting ID
 */
export const deleteMeeting = async (projectId, meetingId) => {
    try {
        const meetingRef = doc(db, PROJECTS_COLLECTION, projectId, MEETINGS_SUBCOLLECTION, meetingId);
        await deleteDoc(meetingRef);

        // Update project's meeting count
        const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
            const currentCount = projectSnap.data().meetingCount || 0;
            await updateDoc(projectRef, {
                meetingCount: Math.max(0, currentCount - 1),
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error deleting meeting:', error);
        throw error;
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format duration from seconds to MM:SS string
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
export const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format date for display
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};
