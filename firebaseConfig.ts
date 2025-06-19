import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  // Replace these with your Firebase config values
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// const firebaseConfig = {
//   apiKey: "AIzaSyAQdnM8SYZSxLRM3T2jPeTwyYjBWyn6OQA",
//   authDomain: "ultimatetictactoe-23767.firebaseapp.com",
//   databaseURL: "https://ultimatetictactoe-23767-default-rtdb.firebaseio.com",
//   projectId: "ultimatetictactoe-23767",
//   storageBucket: "ultimatetictactoe-23767.firebasestorage.app",
//   messagingSenderId: "147072612784",
//   appId: "1:147072612784:web:b6636431d65c2219767e75",
//   measurementId: "G-3KBZW8XMTQ"
// };

// Lazy initialization - only initialize if not already initialized and in browser
let app: any = null;
let database: any = null;
let auth: any = null;
let googleProvider: any = null;

// Initialize Firebase only in browser environment
const initializeFirebase = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.log('Firebase initialization skipped - server-side rendering');
    return null;
  }

  // Check if all required environment variables are present
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.databaseURL) {
    console.error('Firebase configuration is incomplete. Please check your environment variables.');
    return null;
  }

  if (!app) {
    try {
      // Check if Firebase is already initialized
      const apps = getApps();
      if (apps.length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = apps[0];
      }
      
      // Initialize services
      database = getDatabase(app);
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      
      console.log('Firebase initialized successfully with config:', {
        authDomain: firebaseConfig.authDomain,
        databaseURL: firebaseConfig.databaseURL,
        projectId: firebaseConfig.projectId
      });
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return null;
    }
  }
  
  return app;
};

// Export functions that initialize Firebase when called
export const getFirebaseApp = () => {
  if (!app) {
    initializeFirebase();
  }
  return app;
};

export const getFirebaseDatabase = () => {
  if (!database) {
    initializeFirebase();
  }
  return database;
};

export const getFirebaseAuth = () => {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
};

export const getGoogleProvider = () => {
  if (!googleProvider) {
    initializeFirebase();
  }
  return googleProvider;
};

// For backward compatibility, export the initialized instances
// These will be null during SSR but will be initialized when accessed in browser
export { database, auth, googleProvider }; 