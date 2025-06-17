// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork, disableNetwork } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0TwinKuJzfZ1ZnROtsR6Mag8lZ1L3tSo",
  authDomain: "health-pulse-5d20b.firebaseapp.com",
  projectId: "health-pulse-5d20b",
  storageBucket: "health-pulse-5d20b.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Helper functions for network management
export const goOnline = () => enableNetwork(db);
export const goOffline = () => disableNetwork(db);

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  REPORTS: 'reports'
};

// User data structure
export const createUserData = (uid, email, fullName, country, phoneNumber = '') => ({
  uid,
  email,
  fullName,
  phoneNumber,
  country,
  points: 0,
  badges: [],
  totalReports: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Report data structure
export const createReportData = (title, description, lat, lng, userId, userName) => ({
  title,
  description,
  lat,
  lng,
  userId,
  userName,
  verified: false,
  createdAt: new Date().toISOString(),
  timestamp: null // Will be set to serverTimestamp() when saving
});

export default app; 