import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file at the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Firebase configuration using Node.js process.env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.error('Error initializing Firebase for prerender script:', error.message);
    // Exit gracefully if Firebase can't be initialized
    process.exit(0);
}

// Fetches all video IDs from the 'videos' collection.
const getAllVideoIds = async () => {
  try {
    const videosRef = collection(db, 'videos');
    const querySnapshot = await getDocs(videosRef);
    const videoIds = querySnapshot.docs.map(doc => doc.id);
    return videoIds;
  } catch (error) {
    console.error('Error fetching video IDs for prerendering:', error);
    return [];
  }
};

// Generates a list of dynamic video routes to be prerendered.
export const generateRoutes = async () => {
  console.log('Generating dynamic video routes for prerendering...');
  const videoIds = await getAllVideoIds();
  const videoRoutes = videoIds.map(id => `/video/${id}`);
  console.log(`Generated ${videoRoutes.length} dynamic video routes.`);
  return videoRoutes;
};
