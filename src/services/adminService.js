/**
 * Admin Service for TaskNest
 * Handles user management operations for the Admin panel.
 * Reads from the Firestore 'users' collection.
 */

import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';

/**
 * Get all registered users from Firestore
 */
export async function getAllUsers() {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            name: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
            email: data.email || '',
            role: data.role || 'user',
            plan: data.subscription?.plan || 'free',
            status: data.disabled ? 'Disabled' : 'Active',
            lastActive: data.updatedAt?.toDate?.()
                ? formatTimeAgo(data.updatedAt.toDate())
                : data.createdAt?.toDate?.()
                    ? formatTimeAgo(data.createdAt.toDate())
                    : 'Unknown',
        };
    });
}

/**
 * Set a user's role (admin or user)
 */
export async function setUserRole(uid, role) {
    await updateDoc(doc(db, 'users', uid), {
        role,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Disable or enable a user account
 */
export async function toggleUserDisabled(uid, disabled) {
    await updateDoc(doc(db, 'users', uid), {
        disabled,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete a user from Firestore
 */
export async function deleteUser(uid) {
    await deleteDoc(doc(db, 'users', uid));
}

/**
 * Compute admin stats from a users array
 */
export function computeAdminStats(users) {
    return {
        total: users.length,
        active: users.filter(u => u.status === 'Active').length,
        admins: users.filter(u => u.role === 'admin').length,
    };
}

/**
 * Format a Date into a relative "time ago" string
 */
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
