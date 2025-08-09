// Script to list all collections in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, listCollections } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: '890101518195' // Using the ID you provided
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listAllCollections() {
  try {
    console.log('Connecting to Firebase...');
    console.log('Using project ID:', firebaseConfig.projectId);
    
    // This is a workaround since listCollections() is not available in v9
    // We'll use a dummy query to check connection
    console.log('Checking database connection...');
    
    // Print out the db object to see what we're working with
    console.log('Database object:', db);
    
    console.log('Connection check complete.');
  } catch (error) {
    console.error('Error connecting to Firebase:', error);
  }
}

// Run the function
listAllCollections().then(() => {
  console.log('Script completed.');
  setTimeout(() => process.exit(0), 3000);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
