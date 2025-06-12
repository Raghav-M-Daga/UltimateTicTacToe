import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// const firebaseConfig = {
//   // Replace these with your Firebase config values
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
// };

const firebaseConfig = {
  apiKey: "AIzaSyAQdnM8SYZSxLRM3T2jPeTwyYjBWyn6OQA",
  authDomain: "ultimatetictactoe-23767.firebaseapp.com",
  projectId: "ultimatetictactoe-23767",
  storageBucket: "ultimatetictactoe-23767.firebasestorage.app",
  messagingSenderId: "147072612784",
  appId: "1:147072612784:web:b6636431d65c2219767e75",
  measurementId: "G-3KBZW8XMTQ"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 