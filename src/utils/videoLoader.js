// videoLoader.js - A simple, reliable way to load videos
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Cache for videos to avoid repeated fetching
let videosCache = null;
let lastFetchTime = null;
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Get all videos from Firestore without any complex queries
 * This is a simple, reliable approach that will work regardless of data format
 */
export const loadAllVideos = async () => {
  // Check cache first
  const now = Date.now();
  if (videosCache && lastFetchTime && (now - lastFetchTime < CACHE_TTL)) {
    return videosCache;
  }
  
  try {
    // IMPORTANT: We still use a small limit for "initial load" to avoid 5xx errors.
    // Deep pages are handled by specific paginated functions.
    const { query, orderBy, limit } = await import('firebase/firestore');
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('createdAt', 'desc'), limit(50)); 
    const querySnapshot = await getDocs(q);
    
    const videos = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: parseDate(data.createdAt),
        scheduledAt: data.scheduledAt ? parseDate(data.scheduledAt) : null,
        category: data.category || getDefaultCategory(data.position_type)
      };
    });
    
    videosCache = videos;
    lastFetchTime = now;
    return videos;
  } catch (error) {
    console.error('Error loading videos:', error);
    return [];
  }
};

/**
 * Parse any date format into a JavaScript Date
 * Handles Firestore Timestamps, objects with seconds, and string dates
 */
const parseDate = (date) => {
  if (!date) return new Date(); // Default to current date if none provided
  
  try {
    // If it's a Firestore Timestamp with toDate() method
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate();
    }
    // If it's an object with seconds (Firestore Timestamp-like)
    else if (date.seconds) {
      return new Date(date.seconds * 1000);
    }
    // If it's a string date
    else if (typeof date === 'string') {
      return new Date(date);
    }
    // If it's already a Date
    else if (date instanceof Date) {
      return date;
    }
    // Default fallback
    return new Date();
  } catch (e) {
    console.error('Error parsing date:', e, date);
    return new Date(); // Fallback to current date
  }
};

/**
 * Get default category based on position type
 */
const getDefaultCategory = (positionType) => {
  switch (positionType) {
    case 'top':
      return 'News';
    case 'left':
      return 'Politics';
    case 'right':
      return 'Entertainment';
    default:
      return 'General';
  }
};

/**
 * Filter function to check if a video should be visible
 * (not scheduled for future)
 */
export const isVideoVisible = (video) => {
  if (!video.scheduledAt) return true;
  const now = new Date();
  return video.scheduledAt <= now;
};

/**
 * Get videos for a specific position
 */
export const getVideosForPosition = async (positionType, page = 1, pageSize = 10) => {
  const allVideos = await loadAllVideos();
  
  // Filter by position and visibility
  const filteredVideos = allVideos
    .filter(video => video.position_type === positionType)
    .filter(video => video.id) // Ensure video has a valid ID
    .filter(isVideoVisible)
    .sort((a, b) => b.createdAt - a.createdAt); // Sort by date descending
  
  // Calculate pagination
  const totalVideos = filteredVideos.length;
  const totalPages = Math.ceil(totalVideos / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  // Get the videos for the current page
  const paginatedVideos = filteredVideos.slice(startIndex, endIndex);
  
  return {
    videos: paginatedVideos,
    totalVideos,
    totalPages,
    currentPage: page
  };
};

/**
 * Get all videos for homepage, organized by position
 */
export const getAllVideosForHomepage = async (pages = { top: 1, left: 1, right: 1 }, pageSize = 10) => {
  const columnPositions = ['left', 'center', 'right'];
  const { getPositionVideos, getTotalVideos, getFeaturedVideo } = await import('./dbOperations');
  
  const result = {
    featured: await getFeaturedVideo(),
  };

  for (const position of columnPositions) {
    const currentPage = pages[position] || 1;
    
    // Fetch ONLY the specific page for this position
    const paginatedVideos = await getPositionVideos(position, currentPage);
    const totalVideosCount = await getTotalVideos(position);
    
    // Group by category
    const videosByCategory = {};
    for (const video of paginatedVideos) {
      const category = video.category || getDefaultCategory(position);
      if (!videosByCategory[category]) {
        videosByCategory[category] = [];
      }
      videosByCategory[category].push(video);
    }

    result[position] = {
      videos: paginatedVideos,
      videosByCategory,
      totalVideos: totalVideosCount,
      totalPages: Math.ceil(totalVideosCount / pageSize),
      currentPage: currentPage,
    };
  }

  return result;
};
