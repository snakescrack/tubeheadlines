import { useState, useEffect } from 'react';
import { addVideo, CATEGORIES, getDefaultCategory, deleteVideo, getAllVideos, updateVideo, getScheduledVideos, checkScheduledVideos } from '../utils/dbOperations';
import '../styles/Admin.css';

export default function Admin() {
  const [formData, setFormData] = useState({
    youtubeURL: '',
    customHeadline: '',
    position: 'featured',
    category: 'Featured',
    showThumbnail: true,
    thumbnailURL: '',
    isScheduled: false,
    scheduledAt: ''
  });
  const [message, setMessage] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('featured');
  const [videos, setVideos] = useState(null);
  const [scheduledVideos, setScheduledVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showScheduled, setShowScheduled] = useState(false);

  // Load videos on mount and start scheduling check
  useEffect(() => {
    loadVideos();
    loadScheduledVideos();
    
    // Check for scheduled videos every minute
    const interval = setInterval(async () => {
      const published = await checkScheduledVideos();
      if (published > 0) {
        loadVideos();
        loadScheduledVideos();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadScheduledVideos = async () => {
    try {
      const scheduled = await getScheduledVideos();
      setScheduledVideos(scheduled);
    } catch (error) {
      console.error('Error loading scheduled videos:', error);
    }
  };

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await getAllVideos();
      setVideos(data);
    } catch (error) {
      setMessage('Error loading videos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'position') {
      setSelectedPosition(value);
      // Set default category when position changes
      setFormData(prev => ({
        ...prev,
        position: value,
        category: getDefaultCategory(value)
      }));
    } else if (name === 'isScheduled') {
      setFormData(prev => ({
        ...prev,
        isScheduled: checked,
        scheduledAt: checked ? prev.scheduledAt || new Date(Date.now() + 3600000).toISOString().slice(0, 16) : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Processing...');

    try {
      // 1. Extract Video ID from URL (improved regex)
      const url = formData.youtubeURL;
      const videoIdRegex = /(?:youtube\.com\/(?:[^/]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
      const videoIdMatch = url.match(videoIdRegex);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        throw new Error('Could not extract video ID from URL. Please check the format.');
      }

      // 2. Fetch Video Description from YouTube API
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API key is missing.');
      }
      
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`);
      const youtubeData = await response.json();

      if (!youtubeData.items || youtubeData.items.length === 0) {
        throw new Error('Video not found on YouTube.');
      }

      const description = youtubeData.items[0].snippet.description;

      // 3. Prepare data for submission
      const submitData = {
        ...formData,
        description: description, // Add the fetched description
        scheduledAt: formData.isScheduled ? formData.scheduledAt : null,
        thumbnailURL: formData.showThumbnail ? formData.thumbnailURL : '',
      };

      // Use default thumbnail if none is provided
      if (formData.showThumbnail && !formData.thumbnailURL) {
        submitData.thumbnailURL = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }

      // 4. Add or Update video in Firestore
      if (editMode && editId) {
        await updateVideo(editId, submitData);
        setMessage('Video updated successfully!');
      } else {
        await addVideo(submitData);
        setMessage(formData.isScheduled ? 'Video scheduled successfully!' : 'Video added successfully!');
      }

      await loadVideos();
      await loadScheduledVideos();

      // Reset form
      setFormData({
        youtubeURL: '',
        customHeadline: '',
        position: 'featured',
        category: 'Featured',
        showThumbnail: true,
        thumbnailURL: '',
        isScheduled: false,
        scheduledAt: ''
      });
      setSelectedPosition('featured');
      setEditMode(false);
      setEditId(null);
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const handleDelete = async (videoId) => {
    if (!videoId) return;
    
    try {
      await deleteVideo(videoId);
      setMessage('Video deleted successfully!');
      await loadVideos();
      
      // Reset form if we were editing this video
      if (editId === videoId) {
        setFormData({
          youtubeURL: '',
          customHeadline: '',
          position: 'featured',
          category: 'Featured',
          showThumbnail: true,
          thumbnailURL: ''
        });
        setEditMode(false);
        setEditId(null);
      }
    } catch (error) {
      setMessage('Error deleting video: ' + error.message);
    }
  };

  const handleEdit = (video) => {
    setFormData({
      youtubeURL: video.youtubeURL,
      customHeadline: video.customHeadline,
      position: video.position,
      category: video.category,
      showThumbnail: !!video.thumbnailURL,
      thumbnailURL: video.thumbnailURL || '',
      isScheduled: !!video.scheduledAt,
      scheduledAt: video.scheduledAt ? video.scheduledAt.slice(0, 16) : ''
    });
    setSelectedPosition(video.position);
    setEditMode(true);
    setEditId(video.id);
  };

  const getCategoryDescription = (position) => {
    const categories = CATEGORIES[position];
    return `Available categories: ${categories.join(', ')}`;
  };

  const renderVideoList = () => {
    if (!videos) return null;

    const renderVideoGroup = (title, items) => {
      if (!items || Object.keys(items).length === 0) return null;
      return (
        <div className="video-group">
          <h3>{title}</h3>
          {Object.entries(items).map(([category, categoryVideos]) => (
            <div key={category} className="category-group">
              <h4>{category}</h4>
              {categoryVideos.map(video => (
                <div key={video.id} className="video-item">
                  <div className="video-content">
                    <h5>{video.customHeadline}</h5>
                    {video.thumbnailURL && (
                      <img src={video.thumbnailURL} alt="" className="video-thumbnail" />
                    )}
                    <a href={video.youtubeURL} target="_blank" rel="noopener noreferrer" className="video-link">
                      View on YouTube
                    </a>
                  </div>
                  <div className="video-actions">
                    <button onClick={() => handleEdit(video)} className="edit-button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(video.id)} className="delete-button">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="video-list">
        <h2>Current Headlines</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {videos.featured && renderVideoGroup('Featured', { Featured: [videos.featured] })}
            {renderVideoGroup('Left Column', videos.columns.left)}
            {renderVideoGroup('Center Column', videos.columns.center)}
            {renderVideoGroup('Right Column', videos.columns.right)}
          </>
        )}
      </div>
    );
  };

  const renderScheduledVideos = () => {
    if (scheduledVideos.length === 0) {
      return <p>No scheduled videos</p>;
    }

    return (
      <div className="video-list">
        <h3>Scheduled Videos</h3>
        {scheduledVideos.map(video => {
          const scheduledDate = new Date(video.scheduledAt);
          const timeUntil = scheduledDate - new Date();
          const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
          const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
          
          return (
            <div key={video.id} className="video-item scheduled">
              <div className="video-info">
                <h4>{video.customHeadline}</h4>
                <p>Position: {video.position} - {video.category}</p>
                <p className="scheduled-time">
                  Scheduled for: {new Date(video.scheduledAt).toLocaleString()}
                  <br />
                  ({hoursUntil}h {minutesUntil}m until publish)
                </p>
              </div>
              <div className="video-actions">
                <button onClick={() => handleEdit(video)} className="edit-button">
                  Edit
                </button>
                <button onClick={() => handleDelete(video.id)} className="delete-button">
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="admin-container">
      <div className="admin-panel">
        <h2>{editMode ? 'Edit' : 'Add'} Video Headline</h2>
        
        {message && (
          <div className={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="youtubeURL">YouTube URL:</label>
            <input
              type="url"
              id="youtubeURL"
              name="youtubeURL"
              value={formData.youtubeURL}
              onChange={handleInputChange}
              required
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="customHeadline">Custom Headline:</label>
            <input
              type="text"
              id="customHeadline"
              name="customHeadline"
              value={formData.customHeadline}
              onChange={handleInputChange}
              required
              placeholder="Enter headline in DRUDGE style..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="position">Position:</label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
            >
              <option value="featured">Featured</option>
              <option value="left">Left Column</option>
              <option value="center">Center Column</option>
              <option value="right">Right Column</option>
            </select>
            <div className="helper-text">
              {getCategoryDescription(selectedPosition)}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {CATEGORIES[selectedPosition].map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isScheduled"
                checked={formData.isScheduled}
                onChange={handleInputChange}
              />
              Schedule for Later
            </label>
          </div>

          {formData.isScheduled && (
            <div className="form-group">
              <label htmlFor="scheduledAt">Publish Date/Time:</label>
              <input
                type="datetime-local"
                id="scheduledAt"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                required={formData.isScheduled}
              />
            </div>
          )}

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="showThumbnail"
                checked={formData.showThumbnail}
                onChange={handleInputChange}
              />
              Show Thumbnail
            </label>
          </div>

          {formData.showThumbnail && (
            <div className="form-group">
              <label htmlFor="thumbnailURL">Custom Thumbnail URL (optional):</label>
              <input
                type="url"
                id="thumbnailURL"
                name="thumbnailURL"
                value={formData.thumbnailURL}
                onChange={handleInputChange}
                placeholder="Leave blank to use YouTube's thumbnail"
              />
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="submit-button">
              {editMode ? 'Update' : formData.isScheduled ? 'Schedule' : 'Add'} Headline
            </button>
            {editMode && (
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setEditMode(false);
                  setEditId(null);
                  setFormData({
                    youtubeURL: '',
                    customHeadline: '',
                    position: 'featured',
                    category: 'Featured',
                    showThumbnail: true,
                    thumbnailURL: '',
                    isScheduled: false,
                    scheduledAt: ''
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="video-lists">
        <div className="list-controls">
          <button 
            className={`tab-button ${!showScheduled ? 'active' : ''}`}
            onClick={() => setShowScheduled(false)}
          >
            Published Videos
          </button>
          <button 
            className={`tab-button ${showScheduled ? 'active' : ''}`}
            onClick={() => setShowScheduled(true)}
          >
            Scheduled Videos ({scheduledVideos.length})
          </button>
        </div>

        {showScheduled ? renderScheduledVideos() : renderVideoList()}
      </div>
    </div>
  );
}
