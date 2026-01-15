// Firebase configuration for TaskNest
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
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

// Initialize Analytics (only in browser)
let analytics = null;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}
export { analytics };

export default app;
