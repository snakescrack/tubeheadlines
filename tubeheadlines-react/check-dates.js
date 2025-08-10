// Script to check date formats in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

// Firebase configuration with the correct project ID
const firebaseConfig = {
  projectId: 'tubeheadlines' // Correct project ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDateFormats() {
  try {
    console.log('Checking date formats in videos collection...');
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, limit(5)); // Just check 5 videos for a quick sample
    const querySnapshot = await getDocs(q);
    
    console.log(`Checking ${querySnapshot.size} sample videos:`);
    
    // Check each video
    querySnapshot.forEach(docSnapshot => {
      const video = docSnapshot.data();
      const videoId = docSnapshot.id;
      
      console.log(`\nVideo ID: ${videoId}`);
      
      // Check createdAt field
      if (video.createdAt) {
        const createdAtType = typeof video.createdAt;
        console.log(`createdAt type: ${createdAtType}`);
        
        if (createdAtType === 'object') {
          if (video.createdAt.toDate) {
            console.log('✓ createdAt is a Firestore Timestamp (correct format)');
          } else if (video.createdAt.seconds) {
            console.log('✓ createdAt has seconds property (correct format)');
          } else {
            console.log('⚠️ createdAt is an object but not a Firestore Timestamp');
          }
        } else if (createdAtType === 'string') {
          console.log('❌ createdAt is still a string (needs fixing)');
        } else {
          console.log(`⚠️ createdAt is an unexpected type: ${createdAtType}`);
        }
      } else {
        console.log('⚠️ No createdAt field found');
      }
    });
    
    console.log('\nCheck complete!');
  } catch (error) {
    console.error('Error checking dates:', error);
  }
}

// Run the check
checkDateFormats().then(() => {
  console.log('Script completed.');
  setTimeout(() => process.exit(0), 1000);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
