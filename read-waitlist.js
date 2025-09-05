const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration from your .env file
const firebaseConfig = {
  apiKey: "AIzaSyD0cbavYFbKZ1zekFGSE3FRLIIGGtsT0DA",
  authDomain: "tubeheadlines.firebaseapp.com",
  projectId: "tubeheadlines",
  storageBucket: "tubeheadlines.firebasestorage.app",
  messagingSenderId: "890101518195",
  appId: "1:890101518195:web:b80b59e9611d5184c8bf06",
  measurementId: "G-GQZQZWZ1NE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function readWaitlist() {
  try {
    console.log('Fetching documents from the "waitlist" collection...');
    const querySnapshot = await getDocs(collection(db, 'waitlist'));
    
    if (querySnapshot.empty) {
      console.log('No documents found in the waitlist collection.');
      return;
    }

    console.log('--- Waitlist Submissions ---');
    querySnapshot.forEach((doc) => {
      console.log(`Document ID: ${doc.id}`);
      console.log('Data:', doc.data());
      console.log('----------------------------');
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
  } finally {
    // The script will exit automatically
  }
}

readWaitlist();
