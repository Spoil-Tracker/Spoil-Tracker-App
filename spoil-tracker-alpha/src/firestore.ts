import admin from "firebase-admin";

// Initialize Firebase Admin
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Get Firestore instance
const db = admin.firestore();

export {admin, db};
