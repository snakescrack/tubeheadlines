// Script to fix ALL date formats in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, Timestamp } = require('firebase/firestore');

// Your web app's Firebase configuration with the correct project ID
const firebaseConfig = {
  projectId: 'tubeheadlines' // Correct project ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixAllDates() {
  try {
    console.log('Starting comprehensive date fix...');
    const videosRef = collection(db, 'videos');
    const querySnapshot = await getDocs(videosRef);
    
    console.log(`Found ${querySnapshot.size} videos to check.`);
    let updatedCount = 0;
    
    // Process each video
    for (const docSnapshot of querySnapshot.docs) {
      const video = docSnapshot.data();
      const videoId = docSnapshot.id;
      let needsUpdate = false;
      const updates = {};
      
      // Check createdAt field
      if (video.createdAt) {
        if (typeof video.createdAt === 'string') {
          console.log(`Video ${videoId}: Converting string createdAt to Timestamp`);
          updates.createdAt = Timestamp.fromDate(new Date(video.createdAt));
          needsUpdate = true;
        }
      }
      
      // Check scheduledAt field
      if (video.scheduledAt) {
        if (typeof video.scheduledAt === 'string') {
          console.log(`Video ${videoId}: Converting string scheduledAt to Timestamp`);
          updates.scheduledAt = Timestamp.fromDate(new Date(video.scheduledAt));
          needsUpdate = true;
        }
      }
      
      // Update if needed
      if (needsUpdate) {
        console.log(`Updating video ${videoId}`);
        await updateDoc(doc(db, 'videos', videoId), updates);
        updatedCount++;
      }
    }
    
    console.log(`Date fix complete! Updated ${updatedCount} videos.`);
  } catch (error) {
    console.error('Error fixing dates:', error);
  }
}

// Run the fix
fixAllDates().then(() => {
  console.log('Script completed.');
  setTimeout(() => process.exit(0), 3000);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

