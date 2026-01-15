// Firebase configuration for TaskNest2
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA3usuA1bKc6uU6yNR_GJzSV-t0ZEq4AOc",
    authDomain: "tasknest2-app.firebaseapp.com",
    projectId: "tasknest2-app",
    storageBucket: "tasknest2-app.firebasestorage.app",
    messagingSenderId: "923396307412",
    appId: "1:923396307412:web:931e88d1ad2bc87df07e41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;
