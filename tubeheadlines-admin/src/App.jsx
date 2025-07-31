import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import './components/Login.css';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { migrateCreatedAt } from './utils/dbOperations';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  const [formData, setFormData] = useState({
    youtubeURL: '',
    position_type: 'featured',
    scheduledAt: '',
    scheduleEnabled: false,
    replaceCurrent: false,
    title: '',
    showThumbnail: true
  });

  const [videos, setVideos] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [migrationStatus, setMigrationStatus] = useState('');

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

  const loadVideos = async (forceRefresh = false) => {
    try {
      // Clear existing videos first if force refreshing
      if (forceRefresh) {
        setVideos([]);
      }
      
      const videosRef = collection(db, 'videos');
      
      // Create a query with explicit ordering by createdAt descending
      const q = query(videosRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      
      const loadedVideos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Set the videos in state
      setVideos(loadedVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simple and reliable URL validation
      let videoId = null;
      const url = formData.youtubeURL.trim();
      
      // Extract video ID from various URL formats
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // For youtube.com/watch?v=VIDEO_ID format
        if (url.includes('watch?v=')) {
          const vParam = new URL(url).searchParams.get('v');
          if (vParam) videoId = vParam;
        }
        // For youtu.be/VIDEO_ID format
        else if (url.includes('youtu.be/')) {
          const parts = url.split('youtu.be/');
          if (parts[1]) videoId = parts[1].split('?')[0].split('&')[0];
        }
        // For youtube.com/live/VIDEO_ID format
        else if (url.includes('/live/')) {
          const parts = url.split('/live/');
          if (parts[1]) videoId = parts[1].split('?')[0].split('&')[0];
        }
      }
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      if (!formData.title) {
        throw new Error('Please enter a custom headline');
      }

      // Check if URL already exists
      if (!editMode) {
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, where('youtubeURL', '==', formData.youtubeURL));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          throw new Error('This video URL has already been posted');
        }
      }

      if (editMode && editId) {
        // When editing, only update the fields that changed
        const updateData = {
          youtubeURL: formData.youtubeURL,
          position_type: POSITION_TYPES[formData.position_type] || 'featured',
          scheduledAt: formData.scheduleEnabled && formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
          replaceCurrent: formData.position_type === 'featured' ? formData.replaceCurrent : false,
          customHeadline: formData.title,
          showThumbnail: Boolean(formData.showThumbnail),
          thumbnailURL: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
        const docRef = doc(db, 'videos', editId);
        await updateDoc(docRef, updateData);
      } else {
        // For new videos, include createdAt
        const newVideoData = {
          youtubeURL: formData.youtubeURL,
          position_type: POSITION_TYPES[formData.position_type] || 'featured',
          scheduledAt: formData.scheduleEnabled && formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
          replaceCurrent: formData.position_type === 'featured' ? formData.replaceCurrent : false,
          customHeadline: formData.title,
          showThumbnail: Boolean(formData.showThumbnail),
          thumbnailURL: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'videos'), newVideoData);
      }

      // Show success message
      const message = editMode ? 'Headline updated successfully!' : 'New headline added!';
      setSuccessMessage(message);
      
      // Reset form
      setFormData({
        youtubeURL: '',
        position_type: 'featured',
        scheduledAt: '',
        scheduleEnabled: false,
        replaceCurrent: false,
        title: '',
        showThumbnail: true
      });
      setEditMode(false);
      setEditId(null);
      await loadVideos();
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
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
    setFormData({
      youtubeURL: '',
      position_type: 'featured',
      scheduledAt: '',
      scheduleEnabled: false,
      replaceCurrent: false,
      title: '',
      showThumbnail: true
    });
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

  const handleMigrate = async () => {
    setMigrationStatus('Migrating...');
    try {
      const count = await migrateCreatedAt();
      setMigrationStatus(`Migration successful! Updated ${count} videos.`);
    } catch (error) {
      setMigrationStatus(`Migration failed: ${error.message}`);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="admin-container">
      <div className="migration-controls">
        <button onClick={handleMigrate}>Migrate Video Data</button>
        {migrationStatus && <p>{migrationStatus}</p>}
      </div>
      <header className="admin-header">
        <h1>TubeHeadlines Admin</h1>
        <p>Local admin tool for managing your headlines</p>
        <div className="clock">{currentTime.toLocaleTimeString()}</div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search videos by title or URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="container">
        <div className="form-section">
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
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
              .filter(video => 
                searchTerm === '' || 
                video.customHeadline?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                video.youtubeURL?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              
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
              .filter(video => 
                searchTerm === '' || 
                video.customHeadline?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                video.youtubeURL?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              
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
              .filter(video => 
                searchTerm === '' || 
                video.customHeadline?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                video.youtubeURL?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              
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
              .filter(video => 
                searchTerm === '' || 
                video.customHeadline?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                video.youtubeURL?.toLowerCase().includes(searchTerm.toLowerCase())
              )
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
