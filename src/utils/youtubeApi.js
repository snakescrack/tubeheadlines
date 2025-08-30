// YouTube API utilities with rate limiting
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

// Rate limiting configuration
const API_QUOTA_LIMIT = 9000; // Stay under 10,000 daily limit
const RATE_LIMIT_DOC = 'api-usage';

// Get current API usage from Firestore
const getApiUsage = async () => {
  try {
    const usageDoc = await getDoc(doc(db, 'system', RATE_LIMIT_DOC));
    if (usageDoc.exists()) {
      const data = usageDoc.data();
      const today = new Date().toDateString();
      
      // Reset counter if it's a new day
      if (data.date !== today) {
        return { count: 0, date: today };
      }
      return data;
    }
    return { count: 0, date: new Date().toDateString() };
  } catch (error) {
    console.error('Error getting API usage:', error);
    return { count: 0, date: new Date().toDateString() };
  }
};

// Update API usage counter
const updateApiUsage = async (currentUsage) => {
  try {
    const newUsage = {
      count: currentUsage.count + 1,
      date: currentUsage.date,
      lastUpdated: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'system', RATE_LIMIT_DOC), newUsage);
    return newUsage;
  } catch (error) {
    console.error('Error updating API usage:', error);
    return currentUsage;
  }
};

// Extract video ID from YouTube URL
const extractVideoId = (url) => {
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

// Fallback: Extract description from YouTube page HTML
const extractDescriptionFromHTML = async (videoId) => {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Look for description in various meta tags and JSON-LD
    const patterns = [
      /"shortDescription":"([^"]+)"/,
      /<meta name="description" content="([^"]+)"/,
      /<meta property="og:description" content="([^"]+)"/
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        // Decode HTML entities and clean up
        return match[1]
          .replace(/\\u0026/g, '&')
          .replace(/\\n/g, ' ')
          .replace(/\\/g, '')
          .trim();
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting from HTML:', error);
    return null;
  }
};

// Generate description from title if extraction fails
const generateDescriptionFromTitle = (title) => {
  return `Watch "${title}" - Latest video news and updates from top creators. Get breaking news, analysis, and trending stories delivered daily on TubeHeadlines.`;
};

// Main function to get YouTube video description
export const getYouTubeDescription = async (youtubeURL, customHeadline) => {
  const videoId = extractVideoId(youtubeURL);
  if (!videoId) {
    return generateDescriptionFromTitle(customHeadline);
  }

  try {
    // Check rate limit first
    const currentUsage = await getApiUsage();
    
    if (currentUsage.count >= API_QUOTA_LIMIT) {
      console.log('API quota exceeded, using HTML extraction');
      const description = await extractDescriptionFromHTML(videoId);
      return description || generateDescriptionFromTitle(customHeadline);
    }

    // Try YouTube Data API first (if you have API key)
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`
        );
        
        if (response.ok) {
          const data = await response.json();
          await updateApiUsage(currentUsage);

          if (data.items && data.items[0] && data.items[0].snippet) {
            const description = data.items[0].snippet.description;
            return description || generateDescriptionFromTitle(customHeadline);
          }
        } else {
          // Log detailed error information from the API
          console.error('YouTube API request failed!');
          console.error('Status:', response.status, response.statusText);
          const errorData = await response.json();
          console.error('Error Body:', errorData);
        }
      } catch (apiError) {
        console.log('API failed, falling back to HTML extraction');
      }
    }

    // Fallback to HTML extraction
    const description = await extractDescriptionFromHTML(videoId);
    return description || generateDescriptionFromTitle(customHeadline);

  } catch (error) {
    console.error('Error getting YouTube description:', error);
    return generateDescriptionFromTitle(customHeadline);
  }
};

// Get current API usage stats (for admin monitoring)
export const getApiUsageStats = async () => {
  const usage = await getApiUsage();
  return {
    ...usage,
    remaining: API_QUOTA_LIMIT - usage.count,
    percentUsed: Math.round((usage.count / API_QUOTA_LIMIT) * 100)
  };
};
