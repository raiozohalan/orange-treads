import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
// Check if Firebase is already initialized to avoid duplicate initialization
// let firebaseApp: FirebaseApp;
// if (getApps().length === 0) {
const firebaseApp = initializeApp(firebaseConfig);
// } else {
//   firebaseApp = getApps()[0];
// }

// Initialize Firebase Auth
export const auth: Auth = getAuth(firebaseApp);
// Initialize Firestore with the named database "orange-treads" as specified in firebase.json
export const db = getFirestore(
  firebaseApp,
  process.env.NEXT_PUBLIC_FIRESTORE_DATABASE as string
);

// Export the app instance
export default firebaseApp;
