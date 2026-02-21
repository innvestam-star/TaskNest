/**
 * Firebase Configuration
 * Initializes Firebase with Auth and Firestore for TaskNest
 */

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';

// Firebase configuration for tasknest-antigravity project
const firebaseConfig = {
    apiKey: "AIzaSyBKEt_9SKwfhz6-goEFUkEwjWqfKimRCnI",
    authDomain: "tasknest-antigravity.firebaseapp.com",
    projectId: "tasknest-antigravity",
    storageBucket: "tasknest-antigravity.firebasestorage.app",
    messagingSenderId: "1098257710676",
    appId: "1:1098257710676:web:a95e0f65655512d70637c1",
    measurementId: "G-6YNBG6XXRZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

/**
 * Sign up with email and password
 * Creates user in Firebase Auth and stores profile in Firestore
 */
export async function signUpWithEmail(email, password, firstName, lastName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name in Auth
    await updateProfile(user, {
        displayName: `${firstName} ${lastName}`.trim()
    });

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`.trim(),
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        subscription: {
            plan: 'free',
            status: 'active'
        },
        isNewUser: true
    });

    return user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if this is a new user
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const isNewUser = !userDoc.exists();

    if (isNewUser) {
        // Create profile for new Google user
        const nameParts = (user.displayName || '').split(' ');
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            subscription: {
                plan: 'free',
                status: 'active'
            },
            isNewUser: true,
            provider: 'google'
        });
    }

    return { user, isNewUser };
}

/**
 * Sign out current user
 */
export async function logOut() {
    await signOut(auth);
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
        return userDoc.data();
    }
    return null;
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(uid, updates) {
    await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: serverTimestamp()
    });
}

/**
 * Update subscription status in Firestore
 */
export async function updateSubscription(uid, subscriptionData) {
    await updateDoc(doc(db, 'users', uid), {
        subscription: subscriptionData,
        updatedAt: serverTimestamp()
    });
}

/**
 * Mark user as no longer new (after they've chosen a plan)
 */
export async function markUserNotNew(uid) {
    await updateDoc(doc(db, 'users', uid), {
        isNewUser: false,
        updatedAt: serverTimestamp()
    });
}

// Auth state observer helper
export { onAuthStateChanged };

export default app;
