// Script to check progress of date fixes in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration with the correct project ID
const firebaseConfig = {
  projectId: 'tubeheadlines' // Correct project ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProgress() {
  try {
    console.log('Checking progress of date fixes...');
    const videosRef = collection(db, 'videos');
    const querySnapshot = await getDocs(videosRef);
    
    let totalVideos = querySnapshot.size;
    let stringDates = 0;
    let timestampDates = 0;
    let noDates = 0;
    
    // Check each video
    querySnapshot.forEach(docSnapshot => {
      const video = docSnapshot.data();
      
      if (!video.createdAt) {
        noDates++;
      } else if (typeof video.createdAt === 'string') {
        stringDates++;
      } else if (typeof video.createdAt === 'object') {
        timestampDates++;
      }
    });
    
    console.log('\n===== PROGRESS REPORT =====');
    console.log(`Total videos: ${totalVideos}`);
    console.log(`Videos with Timestamp dates: ${timestampDates} (${Math.round(timestampDates/totalVideos*100)}%)`);
    console.log(`Videos with string dates: ${stringDates} (${Math.round(stringDates/totalVideos*100)}%)`);
    console.log(`Videos with no dates: ${noDates} (${Math.round(noDates/totalVideos*100)}%)`);
    console.log('===========================\n');
    
    if (stringDates === 0) {
      console.log('✅ ALL DATES FIXED! The script has completed successfully.');
      console.log('You can now switch your website back to the main branch.');
    } else {
      console.log(`⏳ Fix in progress: ${stringDates} videos still need fixing.`);
    }
    
  } catch (error) {
    console.error('Error checking progress:', error);
  }
}

// Run the check
checkProgress().then(() => {
  console.log('\nProgress check completed.');
  setTimeout(() => process.exit(0), 1000);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
