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
  const [videos, setVideos] = useState([]); // Initialize as empty array
  const [scheduledVideos, setScheduledVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showScheduled, setShowScheduled] = useState(false);
  const [deadVideos, setDeadVideos] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

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


  // Scanner state
  const [lastScanTime, setLastScanTime] = useState(null);
  const [scanResults, setScanResults] = useState(null);

  // Safety wrapper with confirmation and cooldown
  const deleteDeadVideo = async (videoId) => {
      await handleDelete(videoId);
      setDeadVideos(prev => prev.filter(v => v.id !== videoId));
  };


  const getCategoryDescription = (position) => {
    const categories = CATEGORIES[position] || [];
    return `Available categories: ${categories.join(', ')}`;
  };

  const renderVideoList = () => {
    if (!videos || videos.length === 0) return <div className="no-videos">No videos found.</div>;

    // Helper to group videos by category
    const groupVideosByCategory = (videoList) => {
        return videoList.reduce((acc, video) => {
            const cat = video.category || 'General';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(video);
            return acc;
        }, {});
    };

    // Helper to render a group
    const renderVideoGroup = (title, videoList) => {
      if (!videoList || videoList.length === 0) return null;
      const byCategory = groupVideosByCategory(videoList);

      return (
        <div className="video-group">
          <h3>{title}</h3>
          {Object.entries(byCategory).map(([category, categoryVideos]) => (
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

    // Filter videos by position_type for display
    const featured = videos.find(v => v.position_type === 'featured'); // Only one featured usually? Or list all?
    // Actually featured videos are just position_type='featured'
    const featuredVideos = videos.filter(v => v.position_type === 'featured');
    const leftVideos = videos.filter(v => v.position_type === 'left');
    const centerVideos = videos.filter(v => v.position_type === 'center');
    const rightVideos = videos.filter(v => v.position_type === 'right');

    return (
      <div className="video-list">
        <h2>Current Headlines</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {renderVideoGroup('Featured', featuredVideos)}
            {renderVideoGroup('Left Column', leftVideos)}
            {renderVideoGroup('Center Column', centerVideos)}
            {renderVideoGroup('Right Column', rightVideos)}
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
              {(CATEGORIES[selectedPosition] || []).map(category => (
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
            <button type="submit" className="submit-button">Add Headline</button>
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

      {/* Dead Video Scanner Section */}
      <div className="admin-panel" style={{ marginTop: '2rem', borderTop: '2px solid #eee', paddingTop: '1rem' }}>
          <h2>Maintenance Tool</h2>
          <p>Scan your library for videos that have been deleted or made private on YouTube.</p>
          <button
              onClick={scanForDeadVideos}
              disabled={isScanning}
              style={{
                  backgroundColor: isScanning ? '#ccc' : '#ff4444',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isScanning ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
              }}
          >
              {isScanning ? 'Scanning...' : 'Scan for Dead Videos'}
          </button>

          {deadVideos.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                  <h3>Found {deadVideos.length} Dead Videos</h3>
                  <div className="dead-video-list">
                      {deadVideos.map(video => (
                          <div key={video.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fff0f0', marginBottom: '5px', borderRadius: '4px' }}>
                              <span>{video.customHeadline}</span>
                              <button
                                  onClick={() => deleteDeadVideo(video.id)}
                                  style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}
                              >
                                  Delete
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
}


