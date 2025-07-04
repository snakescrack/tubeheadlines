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
    console.log('Using cached videos');
    return videosCache;
  }
  
  try {
    console.log('Fetching all videos from Firestore...');
    
    // Simple query - just get all videos without any filtering or ordering
    const videosRef = collection(db, 'videos');
    const querySnapshot = await getDocs(videosRef);
    
    // Convert to array of video objects
    const videos = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure createdAt is a JavaScript Date regardless of its stored format
        createdAt: parseDate(data.createdAt),
        // Ensure scheduledAt is a JavaScript Date if it exists
        scheduledAt: data.scheduledAt ? parseDate(data.scheduledAt) : null,
        // Ensure category exists
        category: data.category || getDefaultCategory(data.position_type)
      };
    });
    
    console.log(`Loaded ${videos.length} videos from Firestore`);
    
    // Update cache
    videosCache = videos;
    lastFetchTime = now;
    
    return videos;
  } catch (error) {
    console.error('Error loading videos:', error);
    // Return empty array in case of error to avoid breaking the UI
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
  const allVideos = await loadAllVideos();

  // Filter only visible videos
  const visibleVideos = allVideos.filter(isVideoVisible);

  // 1. Get the featured video - the newest one from the 'top' position
  const featuredVideo = visibleVideos
    .filter(v => v.position_type === 'top')
    .sort((a, b) => b.createdAt - a.createdAt)[0] || null;

  const result = {
    featured: featuredVideo,
  };

  // 2. Get videos for the columns
  const columnPositions = ['left', 'center', 'right'];
  for (const position of columnPositions) {
    // Get videos for this position
    const positionVideos = visibleVideos
      .filter(video => video.position_type === position)
      .sort((a, b) => b.createdAt - a.createdAt); // Sort by date descending

    // Calculate pagination for this position
    const currentPage = pages[position] || 1;
    const totalVideos = positionVideos.length;
    const totalPages = Math.ceil(totalVideos / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Get the videos for the current page
    const paginatedVideos = positionVideos.slice(startIndex, endIndex);

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
      totalVideos,
      totalPages,
      currentPage: currentPage,
    };
  }

  return result;
};
