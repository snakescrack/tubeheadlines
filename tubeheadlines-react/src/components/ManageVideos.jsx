import { useState, useEffect } from 'react';
import { getAllVideos, deleteVideo, updateVideo, CATEGORIES } from '../utils/dbOperations';
import '../styles/ManageVideos.css';

export default function ManageVideos() {
  const [videos, setVideos] = useState({
    featured: null,
    columns: {
      left: {},
      center: {},
      right: {}
    }
  });
  const [message, setMessage] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);
  const [showScheduled, setShowScheduled] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const data = await getAllVideos();
      setVideos(data);
    } catch (error) {
      setMessage('Error loading videos: ' + error.message);
    }
  };

  const handleDelete = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this headline?')) {
      try {
        await deleteVideo(videoId);
        setMessage('Video deleted successfully!');
        loadVideos(); // Refresh the list
      } catch (error) {
        setMessage('Error deleting video: ' + error.message);
      }
    }
  };

  const handleEdit = (video) => {
    setEditingVideo({
      ...video,
      showThumbnail: !!video.thumbnailURL
    });
  };

  const handleCancelEdit = () => {
    setEditingVideo(null);
    setMessage('');
  };

  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    try {
      const videoId = editingVideo.id;
      const { id, showThumbnail, ...updateData } = editingVideo;
      
      // If showThumbnail is false, remove the thumbnail URL
      if (!showThumbnail) {
        updateData.thumbnailURL = '';
      }

      // If no custom thumbnail URL is provided but showThumbnail is true,
      // use YouTube's default thumbnail
      if (showThumbnail && !updateData.thumbnailURL) {
        const videoId = updateData.youtubeURL.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
        if (videoId) {
          updateData.thumbnailURL = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }

      await updateVideo(videoId, updateData);
      setMessage('Video updated successfully!');
      setEditingVideo(null);
      loadVideos(); // Refresh the list
    } catch (error) {
      setMessage('Error updating video: ' + error.message);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingVideo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Clear scheduledAt if scheduling is disabled
      scheduledAt: type === 'checkbox' && name === 'isScheduled' && !checked ? null : prev.scheduledAt
    }));
  };

  const VideoItem = ({ video }) => (
    <div className={`video-item ${video.scheduledAt ? 'scheduled' : ''}`}>
      <div className="video-content">
        {video.thumbnailURL && (
          <img src={video.thumbnailURL} alt="" className="video-thumbnail" />
        )}
        <div className="video-info">
          <h3>{video.customHeadline}</h3>
          <div className="video-meta">
            <span className="video-category">{video.category}</span>
            {video.scheduledAt && (
              <span className="scheduled-time">
                Scheduled: {new Date(video.scheduledAt).toLocaleString()}
              </span>
            )}
            <a href={video.youtubeURL} target="_blank" rel="noopener noreferrer" className="video-link">
              View on YouTube
            </a>
          </div>
        </div>
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

  const filterVideos = (videos) => {
    if (!showScheduled) {
      // Show only published videos
      return {
        featured: videos.featured && !videos.featured.scheduledAt ? videos.featured : null,
        columns: Object.fromEntries(
          Object.entries(videos.columns).map(([position, categories]) => [
            position,
            Object.fromEntries(
              Object.entries(categories).map(([category, items]) => [
                category,
                items.filter(video => !video.scheduledAt)
              ])
            )
          ])
        ),
        pagination: videos.pagination
      };
    }
    // Show only scheduled videos
    return {
      featured: videos.featured && videos.featured.scheduledAt ? videos.featured : null,
      columns: Object.fromEntries(
        Object.entries(videos.columns).map(([position, categories]) => [
          position,
          Object.fromEntries(
            Object.entries(categories).map(([category, items]) => [
              category,
              items.filter(video => video.scheduledAt)
            ])
          )
        ])
      ),
      pagination: videos.pagination
    };
  };

  return (
    <div className="manage-container">
      <h2>Manage Headlines</h2>
      <div className="view-toggle">
        <button 
          className={!showScheduled ? 'active' : ''} 
          onClick={() => setShowScheduled(false)}
        >
          Published
        </button>
        <button 
          className={showScheduled ? 'active' : ''} 
          onClick={() => setShowScheduled(true)}
        >
          Scheduled
        </button>
      </div>

      {message && (
        <div className={message.includes('Error') ? 'error' : 'success'}>
          {message}
        </div>
      )}

      {editingVideo ? (
        <div className="edit-form-container">
          <h3>Edit Headline</h3>
          <form onSubmit={handleUpdateVideo} className="edit-form">
            <div className="form-group">
              <label htmlFor="youtubeURL">YouTube URL:</label>
              <input
                type="url"
                id="youtubeURL"
                name="youtubeURL"
                value={editingVideo.youtubeURL}
                onChange={handleEditChange}
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
                value={editingVideo.customHeadline}
                onChange={handleEditChange}
                required
                placeholder="Enter headline in DRUDGE style..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Position:</label>
              <select
                id="position"
                name="position"
                value={editingVideo.position}
                onChange={handleEditChange}
                required
              >
                <option value="featured">Featured</option>
                <option value="left">Left Column</option>
                <option value="center">Center Column</option>
                <option value="right">Right Column</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                name="category"
                value={editingVideo.category}
                onChange={handleEditChange}
                required
              >
                {CATEGORIES[editingVideo.position].map(category => (
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
                  name="showThumbnail"
                  checked={editingVideo.showThumbnail}
                  onChange={handleEditChange}
                />
                Show Thumbnail
              </label>
            </div>

            {editingVideo.showThumbnail && (
              <div className="form-group">
                <label htmlFor="thumbnailURL">Custom Thumbnail URL (optional):</label>
                <input
                  type="url"
                  id="thumbnailURL"
                  name="thumbnailURL"
                  value={editingVideo.thumbnailURL}
                  onChange={handleEditChange}
                  placeholder="Leave blank to use YouTube's thumbnail"
                />
              </div>
            )}

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isScheduled"
                  checked={!!editingVideo.scheduledAt}
                  onChange={handleEditChange}
                />
                Schedule for Later
              </label>
            </div>

            {editingVideo.scheduledAt !== null && (
              <div className="form-group">
                <label htmlFor="scheduledAt">Publish Date/Time:</label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  name="scheduledAt"
                  value={editingVideo.scheduledAt ? new Date(editingVideo.scheduledAt).toISOString().slice(0, 16) : ''}
                  onChange={handleEditChange}
                  min={new Date().toISOString().slice(0, 16)}
                  required={!!editingVideo.scheduledAt}
                />
              </div>
            )}

            <div className="edit-form-buttons">
              <button type="submit" className="save-button">Save Changes</button>
              <button type="button" onClick={handleCancelEdit} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="videos-section">
          {filterVideos(videos).featured && (
            <>
              <h3 className="section-title">Featured</h3>
              <VideoItem video={filterVideos(videos).featured} />
            </>
          )}

          {Object.entries(filterVideos(videos).columns).map(([position, categoryVideos]) => (
            <div key={position} className="column-section">
              <h3 className="section-title">{position.charAt(0).toUpperCase() + position.slice(1)} Column</h3>
              {Object.entries(categoryVideos).map(([category, videos]) => (
                videos.length > 0 && (
                  <div key={category} className="category-section">
                    <h4 className="category-title">{category}</h4>
                    {videos.map(video => (
                      <VideoItem key={video.id} video={video} />
                    ))}
                  </div>
                )
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
