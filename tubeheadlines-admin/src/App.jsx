import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import './App.css';

function App() {
  const initialFormState = {
    youtubeURL: '',
    position_type: 'featured',
    scheduledAt: '',
    scheduleEnabled: false,
    replaceCurrent: false,
    title: '',
    showThumbnail: true
  };

  const [formData, setFormData] = useState(initialFormState);
  const [videos, setVideos] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const POSITION_TYPES = {
    featured: 'featured',
    breaking: 'left',
    trending: 'center',
    entertainment: 'right'
  };

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load videos on component mount
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const videosRef = collection(db, 'videos');
      const querySnapshot = await getDocs(videosRef);
      const loadedVideos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVideos(loadedVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const videoId = formData.youtubeURL.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/shorts\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      if (!formData.title) {
        throw new Error('Please enter a custom headline');
      }

      const videoData = {
        youtubeURL: formData.youtubeURL,
        position_type: POSITION_TYPES[formData.position_type] || 'featured',
        scheduledAt: formData.scheduleEnabled && formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
        replaceCurrent: formData.position_type === 'featured' ? formData.replaceCurrent : false,
        customHeadline: formData.title,
        showThumbnail: Boolean(formData.showThumbnail),
        thumbnailURL: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        createdAt: new Date().toISOString()
      };

      if (editMode && editId) {
        const docRef = doc(db, 'videos', editId);
        await updateDoc(docRef, videoData);
      } else {
        await addDoc(collection(db, 'videos'), videoData);
      }

      // Reset form
      setFormData(initialFormState);
      setEditMode(false);
      setEditId(null);
      await loadVideos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteDoc(doc(db, 'videos', id));
        loadVideos();
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const handleEdit = (video) => {
    setFormData({
      youtubeURL: video.youtubeURL || '',
      position_type: Object.keys(POSITION_TYPES).find(key => POSITION_TYPES[key] === video.position_type) || 'featured',
      scheduledAt: video.scheduledAt || '',
      scheduleEnabled: !!video.scheduledAt,
      replaceCurrent: false,
      title: video.customHeadline || '',
      showThumbnail: video.showThumbnail !== false
    });
    setEditMode(true);
    setEditId(video.id);
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setEditMode(false);
    setEditId(null);
  };

  const handleURLChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      youtubeURL: url
    }));
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      getVideoTitle(url);
    }
  };

  const getVideoTitle = (url) => {
    try {
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/shorts\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
      
      if (!videoId) return;

      fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
        .then(response => response.json())
        .then(data => {
          if (data.title) {
            const seoTitle = convertToSEOTitle(data.title);
            setFormData(prev => ({
              ...prev,
              title: seoTitle
            }));
          }
        })
        .catch(error => {
          console.error('Error fetching video title:', error);
        });
    } catch (error) {
      console.error('Error parsing video URL:', error);
    }
  };

  const convertToSEOTitle = (title) => {
    title = title.replace(/\s*\|.*$/, '')
                .replace(/\s*-\s*YouTube$/, '')
                .replace(/\s*\(.*?\)/, '');

    title = title.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    const attentionWords = ['BREAKING', 'WATCH', 'EXCLUSIVE', 'REVEALED'];
    if (!attentionWords.some(word => title.includes(word))) {
      title = 'BREAKING: ' + title;
    }

    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }

    return title;
  };

  return (
    <div className="admin-container">
      <div className="header">
        <h1>TubeHeadlines Admin</h1>
        <div className="subheader">Local admin tool for managing your headlines</div>
        <div className="clock">Current Time: {currentTime.toLocaleTimeString()}</div>
      </div>

      <div className="container">
        <div className="form-section">
          <h2>Add New Headline</h2>
          <form onSubmit={handleSubmit} className="add-form">
            <div className="form-group">
              <label htmlFor="youtubeURL">YouTube URL:</label>
              <input
                type="url"
                id="youtubeURL"
                value={formData.youtubeURL || ''}
                onChange={handleURLChange}
                required
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Custom Headline:</label>
              <input
                type="text"
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                required
                placeholder="Enter headline in DRUDGE style..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Position:</label>
              <select
                id="position"
                value={formData.position_type || 'featured'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  position_type: e.target.value
                }))}
                required
              >
                <option value="featured">Featured</option>
                <option value="breaking">Breaking News</option>
                <option value="trending">Trending Now</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>

            {formData.position_type === 'featured' && (
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={!!formData.replaceCurrent}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      replaceCurrent: e.target.checked
                    }))}
                  />
                  Replace Current Featured Video
                </label>
              </div>
            )}

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={!!formData.showThumbnail}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    showThumbnail: e.target.checked
                  }))}
                />
                Show Thumbnail
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={!!formData.scheduleEnabled}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    scheduleEnabled: e.target.checked,
                    scheduledAt: e.target.checked ? prev.scheduledAt || '' : ''
                  }))}
                />
                Schedule for Later
              </label>
              {formData.scheduleEnabled && (
                <div className="schedule-time">
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      scheduledAt: e.target.value
                    }))}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editMode ? 'Update Headline' : 'Add Headline'}
              </button>
              {editMode && (
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="headlines-section">
          <h2 className="section-header">Current Headlines</h2>
          
          <div className="video-list">
            <h3 className="section-header">Featured</h3>
            {videos
              .filter(video => video.position_type === 'featured')
              .map(video => (
                <div key={video.id} className="video-item">
                  <h4>{video.customHeadline}</h4>
                  {video.scheduledAt && (
                    <div className="scheduled-time">
                      Scheduled: {new Date(video.scheduledAt).toLocaleString()}
                    </div>
                  )}
                  {video.thumbnailURL && video.showThumbnail && (
                    <img src={video.thumbnailURL} alt="Video thumbnail" className="thumbnail" />
                  )}
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(video)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(video.id)} className="delete-btn">Delete</button>
                    <a href={video.youtubeURL} target="_blank" rel="noopener noreferrer">
                      View on YouTube
                    </a>
                  </div>
                </div>
              ))}
          </div>

          <div className="video-list">
            <h3 className="section-header">Breaking News</h3>
            {videos
              .filter(video => video.position_type === 'left')
              .map(video => (
                <div key={video.id} className="video-item">
                  <h4>{video.customHeadline}</h4>
                  {video.scheduledAt && (
                    <div className="scheduled-time">
                      Scheduled: {new Date(video.scheduledAt).toLocaleString()}
                    </div>
                  )}
                  {video.thumbnailURL && video.showThumbnail && (
                    <img src={video.thumbnailURL} alt="Video thumbnail" className="thumbnail" />
                  )}
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(video)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(video.id)} className="delete-btn">Delete</button>
                    <a href={video.youtubeURL} target="_blank" rel="noopener noreferrer">
                      View on YouTube
                    </a>
                  </div>
                </div>
              ))}
          </div>

          <div className="video-list">
            <h3 className="section-header">Trending Now</h3>
            {videos
              .filter(video => video.position_type === 'center')
              .map(video => (
                <div key={video.id} className="video-item">
                  <h4>{video.customHeadline}</h4>
                  {video.scheduledAt && (
                    <div className="scheduled-time">
                      Scheduled: {new Date(video.scheduledAt).toLocaleString()}
                    </div>
                  )}
                  {video.thumbnailURL && video.showThumbnail && (
                    <img src={video.thumbnailURL} alt="Video thumbnail" className="thumbnail" />
                  )}
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(video)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(video.id)} className="delete-btn">Delete</button>
                    <a href={video.youtubeURL} target="_blank" rel="noopener noreferrer">
                      View on YouTube
                    </a>
                  </div>
                </div>
              ))}
          </div>

          <div className="video-list">
            <h3 className="section-header">Entertainment</h3>
            {videos
              .filter(video => video.position_type === 'right')
              .map(video => (
                <div key={video.id} className="video-item">
                  <h4>{video.customHeadline}</h4>
                  {video.scheduledAt && (
                    <div className="scheduled-time">
                      Scheduled: {new Date(video.scheduledAt).toLocaleString()}
                    </div>
                  )}
                  {video.thumbnailURL && video.showThumbnail && (
                    <img src={video.thumbnailURL} alt="Video thumbnail" className="thumbnail" />
                  )}
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(video)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(video.id)} className="delete-btn">Delete</button>
                    <a href={video.youtubeURL} target="_blank" rel="noopener noreferrer">
                      View on YouTube
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
