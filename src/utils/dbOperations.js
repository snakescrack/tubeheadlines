import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, addDoc, Timestamp, orderBy, limit, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export const VIDEOS_PER_PAGE = 10;

export const CATEGORIES = {
  left: ['Breaking News', 'Viral Videos', 'Top Stories'],
  center: ['Trending Now', 'Must Watch', 'Going Viral'],
  right: ['Entertainment', 'Sports', 'Amazing Videos'],
  featured: ['Featured'] // Featured can be any category
};

// Helper function to check if a video should be visible
const isVideoVisible = (video) => {
  if (!video.scheduledAt) return true;
  
  try {
    let scheduledAt;
    const s = video.scheduledAt;
    
    // Handle Firestore Timestamp
    if (s.toDate && typeof s.toDate === 'function') {
      scheduledAt = s.toDate();
    } 
    // Handle object with seconds/nanoseconds
    else if (s.seconds !== undefined) {
      scheduledAt = new Date(s.seconds * 1000);
    }
    // Handle string or numeric timestamp
    else {
      scheduledAt = new Date(s);
    }
    
    // Fallback if Date is invalid
    if (isNaN(scheduledAt.getTime())) return true;
    
    const now = new Date();
    return scheduledAt <= now;
  } catch (error) {
    console.error('Error in isVideoVisible date parsing:', error);
    return true; // Default to visible on error to avoid crashing the whole grid
  }
};

// Extract video ID from YouTube URL
export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\/\s]{11})/,
    /youtube\.com\/watch\?.*v=([^&?\/\s]{11})/,
    /youtube\.com\/shorts\/([^&?\/\s]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Add a new video
export const addVideo = async (videoData) => {
  try {
    const dataWithTimestamp = {
      ...videoData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'videos'), dataWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error adding video:', error);
    throw error;
  }
};

// Update a video by ID
export const updateVideo = async (videoId, videoData) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, videoData);
    return videoId;
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
};

// Delete a video by ID
export const deleteVideo = async (videoId) => {
  try {
    await deleteDoc(doc(db, 'videos', videoId));
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

// Helper function to get default category based on position
export const getDefaultCategory = (position) => {
  switch (position) {
    case 'featured':
      return 'Featured';
    case 'left':
      return 'Breaking News';
    case 'center':
      return 'Trending Now';
    case 'right':
      return 'Entertainment';
    default:
      return 'Breaking News';
  }
};

// Fetch featured video
export const getFeaturedVideo = async () => {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, where('position_type', '==', 'featured'));
    const querySnapshot = await getDocs(q);
    const videos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    if (videos.length === 0) return null;
    const now = new Date();
    // Only show videos that are unscheduled or scheduled and time has come
    const eligibleVideos = videos.filter(
      v => !v.scheduledAt || new Date(v.scheduledAt) <= now
    );
    // Show the most recently created eligible video
    const mostRecent = eligibleVideos.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
    return mostRecent || null;
  } catch (error) {
    console.error('Error fetching featured video:', error);
    return null;
  }
};

// Cache for all videos to avoid repeated queries
let allVideosCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

// Get all videos (REMOVED: this was causing 5xx errors by pulling 1000+ videos)
// Instead, use paginated queries below.
export const getAllVideos = async () => {
  console.warn('getAllVideos called - please use paginated functions instead for performance');
  try {
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('createdAt', 'desc'), limit(30));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error in getAllVideos fallback:', error);
    return [];
  }
};

// Get total number of videos for a position (OPTIMIZED: Use getCountFromServer)
export const getTotalVideos = async (position_type) => {
  try {
    const { getCountFromServer } = await import('firebase/firestore');
    const videosRef = collection(db, 'videos');
    const q = query(
      videosRef, 
      where('position_type', '==', position_type)
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error fetching count:', error);
    return 0;
  }
}

// Fetch videos for a specific position with pagination
export const getPositionVideos = async (position_type, page = 1, pageSize = VIDEOS_PER_PAGE) => {
  try {
    console.log(`Fetching server-side page ${page} for ${position_type} with pageSize ${pageSize}`);
    
    const videosRef = collection(db, 'videos');
    
    // Implementation: Fetch (page * pageSize) documents to simulate offset
    // This is much safer than fetching 1000+, as page 1-5 only pulls 10-50 docs.
    const q = query(
      videosRef,
      where('position_type', '==', position_type),
      orderBy('createdAt', 'desc'),
      limit(page * pageSize)
    );
    
    const querySnapshot = await getDocs(q);
    const allFetched = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      category: doc.data().category || getDefaultCategory(position_type)
    }));
    
    // Filter scheduled videos manually since where() filters only allow one field with range
    const visibleVideos = allFetched.filter(isVideoVisible);
    
    // Take the specific slice for this page
    const start = (page - 1) * pageSize;
    return visibleVideos.slice(start, start + pageSize);
    
  } catch (error) {
    console.error(`Error in getPositionVideos for ${position_type}:`, error);
    return [];
  }
};



// Fetch all videos for the homepage with pagination
export const getAllVideosForHomepage = async (pages = { left: 1, center: 1, right: 1 }) => {
  try {
    console.log('Getting all videos with pages:', pages);
    const videos = {
      featured: null,
      columns: {
        left: {},
        center: {},
        right: {}
      },
      pagination: {
        left: { currentPage: pages.left, totalPages: 1 },
        center: { currentPage: pages.center, totalPages: 1 },
        right: { currentPage: pages.right, totalPages: 1 }
      }
    };

    // Get featured video
    const featured = await getFeaturedVideo();
    if (featured) {
      videos.featured = featured;
    }

    // Get videos for each position with pagination
    const positions = ['left', 'center', 'right'];
    for (const position of positions) {
      console.log('Processing position:', position);
      const positionVideos = await getPositionVideos(position, pages[position]);
      const totalVideos = await getTotalVideos(position);
      
      videos.pagination[position].totalPages = Math.max(1, Math.ceil(totalVideos / VIDEOS_PER_PAGE));
      console.log('Total pages for', position, ':', videos.pagination[position].totalPages);

      // Group videos by category
      positionVideos.forEach(video => {
        const category = video.category || getDefaultCategory(position);
        if (!videos.columns[position][category]) {
          videos.columns[position][category] = [];
        }
        videos.columns[position][category].push(video);
      });

      // Sort each category's videos by original timestamp
      Object.keys(videos.columns[position]).forEach(category => {
        if (videos.columns[position][category] && videos.columns[position][category].length > 0) {
          console.log('Before sort:', position, category, videos.columns[position][category].map(v => ({ id: v.id, createdAt: v.createdAt })));
          videos.columns[position][category].sort((a, b) => {
            // Log each comparison for debugging
            console.log('Comparing:', {
              a: { id: a.id, createdAt: a.createdAt },
              b: { id: b.id, createdAt: b.createdAt }
            });
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          });
          console.log('After sort:', position, category, videos.columns[position][category].map(v => ({ id: v.id, createdAt: v.createdAt })));
        }
      });
    }

    console.log('Final videos object:', videos);
    return videos;
  } catch (error) {
    console.error('Error getting videos:', error);
    throw new Error('Error getting videos: ' + error.message);
  }
};
