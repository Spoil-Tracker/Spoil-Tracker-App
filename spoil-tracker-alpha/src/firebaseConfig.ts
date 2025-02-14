// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
//import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAVvtIf7Hff80mbzUkB0krwKEnQ-Qog0bY',
  authDomain: 'spoil-tracker-b1302.firebaseapp.com',
  projectId: 'spoil-tracker-b1302',
  storageBucket: 'spoil-tracker-b1302.firebasestorage.app',
  messagingSenderId: '619491391684',
  appId: '1:619491391684:web:989cfba6d2c5092c97f191',
  measurementId: 'G-4RXNJ7V1JX',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
//const analytics = getAnalytics(app);
export const auth = getAuth(app);
