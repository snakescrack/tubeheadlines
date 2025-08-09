import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, addDoc, Timestamp, orderBy, limit, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export const CATEGORIES = {
  left: ['Breaking News', 'Viral Videos', 'Top Stories'],
  center: ['Trending Now', 'Must Watch', 'Going Viral'],
  right: ['Entertainment', 'Sports', 'Amazing Videos'],
  featured: ['Featured']
};

// Add a new video
export const addVideo = async (data) => {
  try {
    const videoId = data.youtubeURL.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Add timestamp and generate thumbnail URL
    const finalData = {
      ...data,
      createdAt: Timestamp.fromDate(new Date()),
      scheduledAt: data.scheduledAt || null,
      published: !data.scheduledAt || new Date(data.scheduledAt) <= new Date(),
      thumbnailURL: data.thumbnailURL || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      videoId
    };

    // If this is a featured video, remove featured status from any existing featured video
    if (finalData.position_type === 'featured') {
      const videosRef = collection(db, 'videos');
      const q = query(videosRef, where('position_type', '==', 'featured'));
      const querySnapshot = await getDocs(q);
      
      // Update existing featured video to be in the center column
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { 
          position_type: 'center',
          category: getDefaultCategory('center')
        })
      );
      await Promise.all(updatePromises);
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'videos'), finalData);
    return docRef.id;
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
        thumbnailURL: data.thumbnailURL || `https://i.ytimg.com/vi/${newVideoId}/hqdefault.jpg`
      };
    }

    // Update scheduled status
    if ('scheduledAt' in data) {
      updateData.scheduledAt = data.scheduledAt || null;
      updateData.published = !data.scheduledAt || new Date(data.scheduledAt) <= new Date();
    }

    // If this video is being updated to featured, remove featured status from any existing featured video
    if (updateData.position_type === 'featured') {
      const videosRef = collection(db, 'videos');
      const q = query(videosRef, where('position_type', '==', 'featured'));
      const querySnapshot = await getDocs(q);
      
      // Update existing featured video to be in the center column, excluding the current video
      const updatePromises = querySnapshot.docs
        .filter(doc => doc.id !== videoId)
        .map(doc => 
          updateDoc(doc.ref, { 
            position_type: 'center',
            category: getDefaultCategory('center')
          })
        );
      await Promise.all(updatePromises);
    }

    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, updateData);
    return true;
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

// Get all videos for admin
export const getAllVideos = async () => {
  try {
    const videos = {
      featured: null,
      columns: {
        left: {},
        center: {},
        right: {}
      }
    };

    // Get all videos
    const videosRef = collection(db, 'videos');
    const querySnapshot = await getDocs(videosRef);
    
    const allVideos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      category: doc.data().category || getDefaultCategory(doc.data().position_type)
    }));

    // Sort by scheduled/published status and date
    allVideos.sort((a, b) => {
      if (a.published !== b.published) return a.published ? 1 : -1;
      const dateA = a.scheduledAt || a.createdAt;
      const dateB = b.scheduledAt || b.createdAt;
      return new Date(dateB) - new Date(dateA);
    });

    // Group by position and category
    allVideos.forEach(video => {
      if (video.position_type === 'featured') {
        if (!videos.featured || new Date(video.createdAt) > new Date(videos.featured.createdAt)) {
          videos.featured = video;
        }
      } else {
        const category = video.category || getDefaultCategory(video.position_type);
        if (!videos.columns[video.position_type][category]) {
          videos.columns[video.position_type][category] = [];
        }
        videos.columns[video.position_type][category].push(video);
      }
    });

    // Sort each category's videos by createdAt in descending order
    Object.keys(videos.columns).forEach(position => {
      Object.keys(videos.columns[position]).forEach(category => {
        videos.columns[position][category].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      });
    });

    return videos;
  } catch (error) {
    console.error('Error getting videos:', error);
    throw new Error('Error getting videos: ' + error.message);
  }
};

// One-time migration function to fix createdAt fields
export const migrateCreatedAt = async () => {
  try {
    const videosRef = collection(db, 'videos');
    const querySnapshot = await getDocs(videosRef);
    const updates = [];

    querySnapshot.forEach(docSnapshot => {
      const video = docSnapshot.data();
      // Check if createdAt is a string, which is the incorrect format
      if (typeof video.createdAt === 'string') {
        const videoRef = doc(db, 'videos', docSnapshot.id);
        updates.push(updateDoc(videoRef, { createdAt: Timestamp.fromDate(new Date(video.createdAt)) }));
      }
    });

    await Promise.all(updates);
    console.log(`Migration complete. Updated ${updates.length} videos.`);
    return updates.length;
  } catch (error) {
    console.error('Error migrating video data:', error);
    throw error;
  }
};
