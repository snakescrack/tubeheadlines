import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

// Sample video data
const sampleVideos = [
  // Featured Video
  {
    youtubeURL: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    customHeadline: 'SHOCK VIDEO: Never Gonna Give You Up Hits 1 BILLION Views...',
    position_type: 'featured',
    thumbnailURL: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
  },
  
  // Left Column (NEWS & CURRENT)
  {
    youtubeURL: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    customHeadline: 'GANGNAM STYLE BECOMES FIRST VIDEO TO REACH 4.7 BILLION...',
    position_type: 'left'
  },
  {
    youtubeURL: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    customHeadline: 'DESPACITO SURPASSES 8 BILLION VIEWS ON YOUTUBE...',
    position_type: 'left',
    thumbnailURL: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg'
  },
  {
    youtubeURL: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    customHeadline: 'SHAPE OF YOU DOMINATES CHARTS WORLDWIDE...',
    position_type: 'left'
  },

  // Center Column (ENTERTAINMENT)
  {
    youtubeURL: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    customHeadline: 'FLASHBACK: First Ever YouTube Video "Me at the Zoo"...',
    position_type: 'center',
    thumbnailURL: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg'
  },
  {
    youtubeURL: 'https://www.youtube.com/watch?v=OPf0YbXqDm0',
    customHeadline: 'UPTOWN FUNK REACHES NEW MILESTONE ON YOUTUBE...',
    position_type: 'center'
  },
  {
    youtubeURL: 'https://www.youtube.com/watch?v=RgKAFK5djSk',
    customHeadline: 'SEE YOU AGAIN TRIBUTE TOUCHES HEARTS WORLDWIDE...',
    position_type: 'center',
    thumbnailURL: 'https://img.youtube.com/vi/RgKAFK5djSk/hqdefault.jpg'
  },

  // Right Column (AMAZING & UNEXPECTED)
  {
    youtubeURL: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    customHeadline: 'VIRAL SENSATION: Baby Shark Dance BREAKS RECORDS...',
    position_type: 'right',
    thumbnailURL: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg'
  },
  {
    youtubeURL: 'https://www.youtube.com/watch?v=dzsuE5ugxf4',
    customHeadline: 'INCREDIBLE: Man Builds Castle Using Only Primitive Tools...',
    position_type: 'right'
  },
  {
    youtubeURL: 'https://www.youtube.com/watch?v=VSPuRXkUWoU',
    customHeadline: 'SHOCKING: Giant Squid Filmed in Pacific Depths...',
    position_type: 'right',
    thumbnailURL: 'https://img.youtube.com/vi/VSPuRXkUWoU/hqdefault.jpg'
  }
];

// Initialize videos collection
export const initializeVideos = async () => {
  try {
    // Check if videos already exist
    console.log('Checking for existing videos...');
    const videosRef = collection(db, 'videos');
    const snapshot = await getDocs(videosRef);
    
    // Only initialize if there are no videos
    if (snapshot.empty) {
      console.log('No existing videos found. Adding sample videos...');
      // Add new sample videos
      for (const video of sampleVideos) {
        await addDoc(collection(db, 'videos'), {
          ...video,
          createdAt: new Date().toISOString()
        });
      }
      console.log('Sample videos added successfully!');
    } else {
      console.log('Videos already exist. Skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing videos:', error);
  }
};

// Main initialization function
export const initializeDatabase = async () => {
  console.log('Starting database initialization...');
  await initializeVideos();
  console.log('Database initialization complete!');
};
