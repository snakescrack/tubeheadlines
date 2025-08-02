import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDOcbavYFbKZlzekFGSE3FRLIIGGtsT0DA",
  authDomain: "tubeheadlines.firebaseapp.com",
  projectId: "tubeheadlines",
  storageBucket: "tubeheadlines.appspot.com",
  messagingSenderId: "890101518195",
  appId: "1:890101518195:web:40602a22c644f0bac8bf06",
  measurementId: "G-SVJLLJKJHR"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase app:", error);
  throw error;
}

// Initialize Firestore
let db;
try {
  db = getFirestore(app);
} catch (error) {
  console.error("Error initializing Firestore:", error);
  throw error;
}

// Initialize Storage with CORS settings
let storage;
try {
  storage = getStorage(app);
  
  // Add CORS headers to storage requests
  storage._customHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  console.log("Firebase Storage initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase Storage:", error);
  throw error;
}

export { db, storage };
