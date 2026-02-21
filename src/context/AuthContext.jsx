import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    auth,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    logOut,
    getUserProfile,
    updateUserProfile as updateFirestoreProfile,
    onAuthStateChanged
} from '../services/firebaseConfig';

const AuthContext = createContext(null);

const ADMIN_EMAILS = [
    'innvestam@gmail.com',
    'eagleeyetp@gmail.com',
];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);

    // Listen to Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get user profile from Firestore
                const profile = await getUserProfile(firebaseUser.uid);
                const userData = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                    firstName: profile?.firstName || firebaseUser.displayName?.split(' ')?.[0] || 'User',
                    lastName: profile?.lastName || firebaseUser.displayName?.split(' ')?.slice(1)?.join(' ') || '',
                    displayName: profile?.displayName || firebaseUser.displayName || 'User',
                    avatarUrl: firebaseUser.photoURL || null,
                    createdAt: profile?.createdAt || new Date().toISOString(),
                    subscription: profile?.subscription || { plan: 'free', status: 'active' },
                    isNewUser: profile?.isNewUser || false,
                    role: ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase()) ? 'admin' : (profile?.role || 'user'),
                    // Business & Banking Details
                    businessName: profile?.businessName || '',
                    businessAddress: profile?.businessAddress || '',
                    businessLogo: profile?.businessLogo || null,
                    bankName: profile?.bankName || '',
                    accountHolder: profile?.accountHolder || '',
                    accountNumber: profile?.accountNumber || '',
                    branchCode: profile?.branchCode || '',
                    contactPerson: profile?.contactPerson || '',
                    contactNumber: profile?.contactNumber || ''
                };
                setUser(userData);
                setIsAuthenticated(true);
                setIsNewUser(profile?.isNewUser || false);

                // Also store in localStorage for offline access
                localStorage.setItem('tasknest_user', JSON.stringify(userData));
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setIsNewUser(false);
                localStorage.removeItem('tasknest_user');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const firebaseUser = await signInWithEmail(email, password);
            const profile = await getUserProfile(firebaseUser.uid);

            return {
                success: true,
                user: firebaseUser,
                isNewUser: profile?.isNewUser || false
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: getAuthErrorMessage(error.code)
            };
        } finally {
            setLoading(false);
        }
    }, []);

    const signup = useCallback(async (email, password, firstName, lastName) => {
        setLoading(true);
        try {
            const firebaseUser = await signUpWithEmail(email, password, firstName, lastName);
            setIsNewUser(true);

            return {
                success: true,
                user: firebaseUser,
                isNewUser: true
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                error: getAuthErrorMessage(error.code)
            };
        } finally {
            setLoading(false);
        }
    }, []);

    const loginWithGoogle = useCallback(async () => {
        setLoading(true);
        try {
            const { user: firebaseUser, isNewUser: isNew } = await signInWithGoogle();
            setIsNewUser(isNew);

            return {
                success: true,
                user: firebaseUser,
                isNewUser: isNew
            };
        } catch (error) {
            console.error('Google login error:', error);
            return {
                success: false,
                error: getAuthErrorMessage(error.code)
            };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await logOut();
            setUser(null);
            setIsAuthenticated(false);
            setIsNewUser(false);
            localStorage.removeItem('tasknest_user');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    const updateProfile = useCallback(async (updates) => {
        if (!user?.id) return;

        // Optimistic: update local state immediately so data is always available
        setUser(prev => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('tasknest_user', JSON.stringify(updated));
            return updated;
        });

        try {
            await updateFirestoreProfile(user.id, updates);
        } catch (error) {
            console.error('Profile update: local state updated, Firestore sync failed:', error);
        }
    }, [user]);

    // Get user's initials for avatar
    const getInitials = useCallback(() => {
        if (!user) return 'U';
        const first = user.firstName?.[0] || '';
        const last = user.lastName?.[0] || '';
        return (first + last).toUpperCase() || 'U';
    }, [user]);

    const isAdmin = user?.role === 'admin';

    const value = {
        // State
        user,
        loading,
        isAuthenticated,
        isNewUser,
        isAdmin,

        // Actions
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,

        // Utilities
        getInitials,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Helper function to convert Firebase error codes to user-friendly messages
function getAuthErrorMessage(code) {
    const errors = {
        'auth/email-already-in-use': 'This email is already registered. Please log in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
        'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    };
    return errors[code] || 'An error occurred. Please try again.';
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
