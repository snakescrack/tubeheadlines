import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getYouTubeDescription } from '../src/utils/youtubeApi.js';
import fs from 'fs';
import path from 'path';

console.log('Script started.');

// Manually load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFileContent = fs.readFileSync(envPath, 'utf8');
  envFileContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
  console.log('.env file loaded successfully.');
} else {
  console.error('ERROR: .env file not found at project root.');
  process.exit(1);
}

// Check for environment variables
if (!process.env.REACT_APP_FIREBASE_PROJECT_ID || !process.env.REACT_APP_YOUTUBE_API_KEY) {
    console.error('ERROR: Missing required environment variables from .env file.');
    process.exit(1); // Exit with an error code
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('Firebase initialized successfully.');
} catch (e) {
    console.error('Error initializing Firebase:', e.message);
    process.exit(1);
}

// Delay function to respect rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const updateExistingVideos = async () => {
  console.log('Starting to update existing videos with descriptions...');

  try {
    const videosCollection = collection(db, 'videos');
    const videoSnapshot = await getDocs(videosCollection);
    const videosToUpdate = [];

    videoSnapshot.forEach((doc) => {
      const videoData = doc.data();
      if (!videoData.description) {
        videosToUpdate.push({ id: doc.id, ...videoData });
      }
    });

    console.log(`Found ${videosToUpdate.length} videos missing a description.`);

    const videosToProcess = videosToUpdate.slice(0, 5); // Limit to 5 videos for the dry run

    console.log(`\n--- Starting Dry Run: Fetching descriptions for ${videosToProcess.length} videos ---`);

    for (let i = 0; i < videosToProcess.length; i++) {
      const video = videosToProcess[i];
      console.log(`\n[${i + 1}/${videosToProcess.length}] Processing Video: ${video.customHeadline} (ID: ${video.id})`);

      try {
        const description = await getYouTubeDescription(video.youtubeURL, video.customHeadline);
        
        if (description) {
          console.log(`  [SUCCESS] Fetched Description Preview:`);
          console.log(`  ----------------------------------------`);
          console.log(`  ${description.substring(0, 250).replace(/\n/g, '\n  ')}...`);
          console.log(`  ----------------------------------------`);
        } else {
          console.log(`  [SKIPPED] Could not fetch description for video ID: ${video.id}.`);
        }

        if (i < videosToProcess.length - 1) {
            await delay(1000); // 1-second delay between requests
        }

      } catch (error) {
        console.error(`  [ERROR] Failed to process video ID: ${video.id}. Error: ${error.message}`);
      }
    }

    console.log('\n--- Dry Run Complete ---');
    console.log('No changes were made to the database.');

  } catch (error) {
    console.error('An error occurred during the update process:', error);
  }
};

updateExistingVideos();
