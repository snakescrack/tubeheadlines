console.log('--- SCRIPT EXECUTION STARTED ---');
require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, limit, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey) {
  console.error('ERROR: Firebase API key is missing. Make sure your .env file is set up correctly.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDescriptions() {
  console.log('Connecting to Firestore and checking for video descriptions...');
  try {
    const q = query(collection(db, 'videos'), limit(3));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('Result: No videos found in the database.');
      return;
    }

    console.log('Result: Found videos. Checking for descriptions:');
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('---');
      console.log('  Video ID:', doc.id);
      if (data.description && data.description.length > 0) {
        console.log('  Description Exists: Yes');
        console.log('  Description Length:', data.description.length);
      } else {
        console.log('  Description Exists: No');
      }
    });
  } catch (error) {
    console.error('An error occurred while fetching data from Firestore:', error);
  }
}

checkDescriptions();
