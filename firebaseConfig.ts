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
  databaseURL: "https://ultimatetictactoe-23767-default-rtdb.firebaseio.com",
  projectId: "ultimatetictactoe-23767",
  storageBucket: "ultimatetictactoe-23767.firebasestorage.app",
  messagingSenderId: "147072612784",
  appId: "1:147072612784:web:b6636431d65c2219767e75",
  measurementId: "G-3KBZW8XMTQ"
};

// Initialize Firebase
let app;
let database: Database | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  // Log initialization status
  console.log('Firebase initialized successfully with config:', {
    authDomain: firebaseConfig.authDomain,
    databaseURL: firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId
  });
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  if (typeof window !== 'undefined') {
    throw error;
  }
}

// Helper functions for consistent access
export const getFirebaseAuth = (): Auth => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return auth;
};

export const getFirebaseDatabase = (): Database => {
  if (!database) throw new Error('Firebase Database not initialized');
  return database;
};

// Export initialized instances
export { database, auth, googleProvider }; 