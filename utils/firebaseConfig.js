// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCndacyZmFXjN7JixfNYM8LjDMCwTIMyBI",
  authDomain: "sigmapore-52908.firebaseapp.com",
  projectId: "sigmapore-52908",
  storageBucket: "sigmapore-52908.firebasestorage.app",
  messagingSenderId: "470470428150",
  appId: "1:470470428150:web:e7c6c6c9abffa6e4f273d7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);

export default app; 