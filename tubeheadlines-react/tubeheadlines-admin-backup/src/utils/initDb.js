import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

const sampleHeadlines = [
  {
    youtubeURL: 'https://www.youtube.com/watch?v=example1',
    customHeadline: 'Breaking: LIVERPOOL FC CHAMPIONS OF PREMIER LEAGUE',
    position: 'featured',
    category: 'Featured',
    thumbnailURL: 'https://img.youtube.com/vi/example1/hqdefault.jpg',
    dateAdded: new Date()
  },
  {
    youtubeURL: 'https://www.youtube.com/watch?v=example2',
    customHeadline: 'OMG GUESS I TRICKED THE INTERNET WITH ROCKET LEAGUE TWO',
    position: 'left',
    category: 'Politics',
    thumbnailURL: 'https://img.youtube.com/vi/example2/hqdefault.jpg',
    dateAdded: new Date()
  },
  {
    youtubeURL: 'https://www.youtube.com/watch?v=example3',
    customHeadline: 'SHAPE OF YOU DOMINATES CHARTS WORLDWIDE...',
    position: 'left',
    category: 'Politics',
    thumbnailURL: 'https://img.youtube.com/vi/example3/hqdefault.jpg',
    dateAdded: new Date()
  },
  {
    youtubeURL: 'https://www.youtube.com/watch?v=example4',
    customHeadline: 'DESPACITO SURPASSES 8 BILLION VIEWS...',
    position: 'left',
    category: 'Politics',
    thumbnailURL: 'https://img.youtube.com/vi/example4/hqdefault.jpg',
    dateAdded: new Date()
  }
];

export async function initializeDb() {
  try {
    for (const headline of sampleHeadlines) {
      await addDoc(collection(db, 'videos'), headline);
    }
    console.log('Sample headlines added successfully!');
  } catch (error) {
    console.error('Error adding sample headlines:', error);
  }
}
