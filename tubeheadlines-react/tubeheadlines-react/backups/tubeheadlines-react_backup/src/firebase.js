import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
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
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);

  // Enable offline persistence
  if (typeof window !== 'undefined') {  // Only run in browser environment
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('Persistence not supported');
        }
      });
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { db };
