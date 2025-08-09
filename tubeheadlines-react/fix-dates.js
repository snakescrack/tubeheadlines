// Script to fix createdAt dates in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, Timestamp } = require('firebase/firestore');

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixDates() {
  try {
    console.log('Starting date migration...');
    const videosRef = collection(db, 'videos');
    const querySnapshot = await getDocs(videosRef);
    const updates = [];

    console.log(`Found ${querySnapshot.size} videos to check.`);
    
    querySnapshot.forEach(docSnapshot => {
      const video = docSnapshot.data();
      // Check if createdAt is a string, which is the incorrect format
      if (typeof video.createdAt === 'string') {
        console.log(`Fixing video ${docSnapshot.id}: ${video.customHeadline || 'No title'}`);
        const videoRef = doc(db, 'videos', docSnapshot.id);
        updates.push(updateDoc(videoRef, { 
          createdAt: Timestamp.fromDate(new Date(video.createdAt)) 
        }));
      } else {
        console.log(`Video ${docSnapshot.id} already has correct date format.`);
      }
    });

    if (updates.length > 0) {
      console.log(`Updating ${updates.length} videos...`);
      await Promise.all(updates);
      console.log('Migration complete! All videos updated successfully.');
    } else {
      console.log('No videos need updating. All dates are already in the correct format.');
    }
  } catch (error) {
    console.error('Error migrating video data:', error);
  }
}

// Run the fix
fixDates().then(() => {
  console.log('Script completed.');
  // Keep the process alive for a bit to ensure all Firebase operations complete
  setTimeout(() => process.exit(0), 5000);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
