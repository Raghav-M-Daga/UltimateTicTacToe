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

// Debug: Log environment variables (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Firebase config environment variables:', {
    apiKey: firebaseConfig.apiKey ? 'SET' : 'MISSING',
    authDomain: firebaseConfig.authDomain ? 'SET' : 'MISSING',
    databaseURL: firebaseConfig.databaseURL ? 'SET' : 'MISSING',
    projectId: firebaseConfig.projectId ? 'SET' : 'MISSING',
    storageBucket: firebaseConfig.storageBucket ? 'SET' : 'MISSING',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'SET' : 'MISSING',
    appId: firebaseConfig.appId ? 'SET' : 'MISSING',
  });
}

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
    console.error('Firebase configuration is incomplete. Missing required environment variables:', {
      apiKey: !!firebaseConfig.apiKey,
      projectId: !!firebaseConfig.projectId,
      databaseURL: !!firebaseConfig.databaseURL
    });
    throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
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
      throw error;
    }
  }
  
  return app;
};

// Export functions that initialize Firebase when called
export const getFirebaseApp = () => {
  try {
    if (!app) {
      initializeFirebase();
    }
    return app;
  } catch (error) {
    console.error('Error getting Firebase app:', error);
    throw error;
  }
};

export const getFirebaseDatabase = () => {
  try {
    if (!database) {
      initializeFirebase();
    }
    return database;
  } catch (error) {
    console.error('Error getting Firebase database:', error);
    throw error;
  }
};

export const getFirebaseAuth = () => {
  try {
    if (!auth) {
      initializeFirebase();
    }
    return auth;
  } catch (error) {
    console.error('Error getting Firebase auth:', error);
    throw error;
  }
};

export const getGoogleProvider = () => {
  try {
    if (!googleProvider) {
      initializeFirebase();
    }
    return googleProvider;
  } catch (error) {
    console.error('Error getting Google provider:', error);
    throw error;
  }
};

// For backward compatibility, export the initialized instances
// These will be null during SSR but will be initialized when accessed in browser
export { database, auth, googleProvider }; 