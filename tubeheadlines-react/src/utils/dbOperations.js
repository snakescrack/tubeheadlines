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
  // If there's no scheduledAt field, the video is immediately visible.
  if (!video.scheduledAt) {
    return true;
  }

  const now = new Date();
  // Firestore Timestamps must be converted to JS Dates with the .toDate() method.
  const scheduledAt = video.scheduledAt.toDate();

  return scheduledAt <= now;
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
export const addVideo = async (data) => {
  try {
    const videoId = data.youtubeURL.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // If this is a featured video, handle it specially
    if (data.position_type === 'featured') {
      // Get all featured videos
      const q = query(collection(db, 'videos'), where('position_type', '==', 'featured'));
      const querySnapshot = await getDocs(q);
      const videos = querySnapshot.docs;

      // Get current max priority
      const maxPriority = videos.reduce((max, doc) => {
        const priority = doc.data().priority || 0;
        return Math.max(max, priority);
      }, 0);

      // Prepare the new video data
      const finalData = {
        ...data,
        createdAt: new Date().toISOString(),
        thumbnailURL: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        videoId,
        scheduledAt: data.scheduledAt || null,
        // If replacing current or no videos exist, give highest priority
        // Otherwise give lower priority than existing videos
        priority: (!data.scheduledAt && data.replaceCurrent) || videos.length === 0 
          ? maxPriority + 1 
          : maxPriority - 1
      };

      // Add the new video
      const docRef = await addDoc(collection(db, 'videos'), finalData);

      // If replacing current, lower priority of all other videos
      if (!data.scheduledAt && data.replaceCurrent) {
        const batch = writeBatch(db);
        videos.forEach(doc => {
          batch.update(doc.ref, { priority: 0 });
        });
        await batch.commit();
      }

      return docRef.id;
    } else {
      // For non-featured videos, just add normally
      const finalData = {
        ...data,
        createdAt: new Date().toISOString(),
        thumbnailURL: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        videoId,
        scheduledAt: data.scheduledAt || null
      };
      const docRef = await addDoc(collection(db, 'videos'), finalData);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error adding video:', error);
    throw error;
  }
};

// Update a video by ID
export const updateVideo = async (videoId, data) => {
  try {
    let updateData = { ...data };
    
    // If YouTube URL is being updated, extract new video ID and update thumbnail
    if (data.youtubeURL) {
      const newVideoId = data.youtubeURL.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
      
      if (!newVideoId) {
        throw new Error('Invalid YouTube URL');
      }

      updateData = {
        ...updateData,
        videoId: newVideoId,
        thumbnailURL: `https://i.ytimg.com/vi/${newVideoId}/hqdefault.jpg`
      };
    }

    // Get the current video data to preserve createdAt
    const videoRef = doc(db, 'videos', videoId);
    const videoSnap = await getDoc(videoRef);
    
    if (!videoSnap.exists()) {
      throw new Error('Video not found');
    }

    const currentData = videoSnap.data();

    // Always preserve the original createdAt timestamp
    updateData = {
      ...updateData,
      createdAt: currentData.createdAt
    };

    // If this is updating a featured video's schedule
    if (data.scheduledAt !== undefined && data.position_type === 'featured') {
      updateData.isCurrentFeatured = !data.scheduledAt && data.replaceCurrent;
    }

    // Update the video
    await updateDoc(videoRef, updateData);
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

// Get all videos at once and cache them
export const getAllVideos = async () => {
  const now = Date.now();
  
  // Return cached data if it's fresh
  if (allVideosCache && (now - lastFetchTime) < CACHE_TTL) {
    console.log('Using cached videos data');
    return allVideosCache;
  }
  
  try {
    console.log('Fetching ALL videos from database');
    const videosRef = collection(db, 'videos');
    
    // Get all videos with no filtering or sorting
    const querySnapshot = await getDocs(videosRef);
    console.log(`Found ${querySnapshot.size} total videos in database`);
    
    // Process all videos
    allVideosCache = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    lastFetchTime = now;
    return allVideosCache;
  } catch (error) {
    console.error('Error fetching all videos:', error);
    return [];
  }
};

// Get total number of videos for a position
export const getTotalVideos = async (position_type) => {
  try {
    console.log('Getting total videos for position:', position_type);
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, where('position_type', '==', position_type));
    const snapshot = await getDocs(q);
    
    // Filter out scheduled videos
    const visibleVideos = snapshot.docs
      .map(doc => doc.data())
      .filter(isVideoVisible);
    
    console.log('Total videos for', position_type, ':', visibleVideos.length);
    return visibleVideos.length;
  } catch (error) {
    console.error('Error fetching all videos:', error);
    return 0;
  }
}

// Fetch videos for a specific position with pagination
export const getPositionVideos = async (position_type, page = 1) => {
  try {
    console.log('Getting videos for position:', position_type, 'page:', page);
    
    // Get all videos
    const allVideos = await getAllVideos();
    
    // Filter by position and visibility
    const visibleVideos = allVideos
      .filter(video => video.position_type === position_type)
      .filter(isVideoVisible)
      // Sort on the client side
      .sort((a, b) => {
        // Handle different date formats safely
        const getTime = (date) => {
          if (!date) return 0;
          if (date.toDate && typeof date.toDate === 'function') {
            return date.toDate().getTime();
          }
          if (date.seconds) {
            return new Date(date.seconds * 1000).getTime();
          }
          return new Date(date).getTime();
        };
        
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
    
    // Add default category if missing
    const processedVideos = visibleVideos.map(video => ({
      ...video,
      category: video.category || getDefaultCategory(position_type)
    }));

    console.log(`Found ${processedVideos.length} visible videos for position ${position_type}`);
    
    // Paginate
    const start = (page - 1) * VIDEOS_PER_PAGE;
    const paginatedVideos = processedVideos.slice(start, start + VIDEOS_PER_PAGE);
    
    console.log(`Returning ${paginatedVideos.length} videos for page ${page}`);
    return paginatedVideos;
  } catch (error) {
    console.error(`Error getting videos for ${position_type}:`, error);
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
