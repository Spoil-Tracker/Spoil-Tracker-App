import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (you can get this from your Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyAVvtIf7Hff80mbzUkB0krwKEnQ-Qog0bY",
  authDomain: "spoil-tracker-b1302.firebaseapp.com",
  projectId: "spoil-tracker-b1302",
  storageBucket: "spoil-tracker-b1302.firebasestorage.app",
  messagingSenderId: "619491391684",
  appId: "1:619491391684:web:989cfba6d2c5092c97f191",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export default db ;
