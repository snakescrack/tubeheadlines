// Force Admin deploy trigger for automated internal backlinking feature
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import './components/Login.css';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  const [cleaningStatus, setCleaningStatus] = useState('');
  const [scanProgress, setScanProgress] = useState(null);
  const [brokenVideos, setBrokenVideos] = useState([]);
  const [showBrokenList, setShowBrokenList] = useState(false);

  const [formData, setFormData] = useState({
    youtubeURL: '',
    position_type: 'featured',
    scheduledAt: '',
    scheduleEnabled: false,
    replaceCurrent: false,
    title: '',
    editorsTake: '',
    showThumbnail: true
  });

  const [videos, setVideos] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

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

  const handleLogin = () => {
    localStorage.setItem('isAdminLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsLoggedIn(false);
  };

  const loadVideos = async (forceRefresh = false) => {
    try {
      // Clear existing videos first if force refreshing
      if (forceRefresh) {
        setVideos([]);
      }

      const videosRef = collection(db, 'videos');

      // Create a query to fetch videos (sorting removed temporarily)
      const q = query(videosRef);

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

  const handleGenerateAI = async () => {
    if (!formData.title) {
      setAiMessage('Error: Enter a Custom Headline first.');
      return;
    }
    setIsGenerating(true);
    setAiMessage("Generating Editor's Take...");
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error('OpenAI API key missing (VITE_OPENAI_API_KEY).');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a professional SEO content editor for a YouTube curation platform called TubeHeadlines. Write a 3-sentence, highly engaging editorial paragraph about the provided video title. Tease the value and create curiosity. CRITICAL INSTRUCTION: About 30% of the time, naturally add a 4th sentence at the end that includes an HTML anchor tag linking to one of our free tools. Use exactly this HTML: <a href="/viral-idea-generator">Free Viral Idea Generator</a> or <a href="/youtube-income-calculator">YouTube Income Calculator</a>. Make the transition smooth, e.g., "If you want to create a hook like this, try our..."' },
            { role: 'user', content: formData.title }
          ],
          temperature: 0.7
        })
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || 'API call failed'); }
      const data = await res.json();
      const text = data.choices[0].message.content.trim();
      setFormData(prev => ({ ...prev, editorsTake: text }));
      setAiMessage("Editor's Take generated!");
    } catch (err) {
      setAiMessage(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Extract Video ID from URL
      const url = formData.youtubeURL.trim();
      const videoIdMatch = url.match(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)|(?:\?v=))([^#&?]*).*/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        throw new Error('Could not extract video ID from URL. Please check the format.');
      }

      if (!formData.title) {
        throw new Error('Please enter a custom headline');
      }

      // 2. Fetch Video Description from YouTube API
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API key is missing. Please configure it in your environment variables.');
      }

      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`YouTube API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      const youtubeData = await response.json();
      const description = youtubeData.items && youtubeData.items.length > 0 ? youtubeData.items[0].snippet.description : '';

      // 3. Check for duplicates if not in edit mode
      if (!editMode) {
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, where('youtubeURL', '==', formData.youtubeURL));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          throw new Error('This video URL has already been posted');
        }
      }

      // 4. Prepare data and save to Firestore
      if (editMode && editId) {
        const updateData = {
          youtubeURL: formData.youtubeURL,
          position_type: POSITION_TYPES[formData.position_type] || 'featured',
          scheduledAt: formData.scheduleEnabled && formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
          replaceCurrent: formData.position_type === 'featured' ? formData.replaceCurrent : false,
          customHeadline: formData.title,
          showThumbnail: Boolean(formData.showThumbnail),
          thumbnailURL: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          description: description, // Add description
          editorsTake: formData.editorsTake || ''
        };
        const docRef = doc(db, 'videos', editId);
        await updateDoc(docRef, updateData);
      } else {
        const newVideoData = {
          youtubeURL: formData.youtubeURL,
          position_type: POSITION_TYPES[formData.position_type] || 'featured',
          scheduledAt: formData.scheduleEnabled && formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
          replaceCurrent: formData.position_type === 'featured' ? formData.replaceCurrent : false,
          customHeadline: formData.title,
          showThumbnail: Boolean(formData.showThumbnail),
          thumbnailURL: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          createdAt: new Date().toISOString(),
          description: description, // Add description
          editorsTake: formData.editorsTake || ''
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
        editorsTake: '',
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
      editorsTake: video.editorsTake || '',
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
      editorsTake: '',
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
      const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/shorts\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
      const videoId = videoIdMatch && videoIdMatch[1];

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

  const checkVideoAvailability = async () => {
    if (!window.confirm('Start DEEP SCAN (Embed & Restriction Check)?\n\nThis will check for:\n- Broken/Deleted videos\n- Embedding disabled\n- Age restrictions\n- Region blocks')) {
      return;
    }

    setBrokenVideos([]);
    setShowBrokenList(false);
    setScanProgress({ current: 0, total: videos.length, status: 'Starting scan (Enhanced Mode)...' });

    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API key is missing.');
      }

      const allVideos = [...videos];
      const videosToDelete = [];
      const videoIds = [];
      const videoIdToDocId = {};

      // Extract IDs
      allVideos.forEach(video => {
        if (video.youtubeURL) {
          const match = video.youtubeURL.match(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)|(?:\?v=))([^#\&?]*).*/);
          const videoId = match ? match[1] : null;
          if (videoId) {
            videoIds.push(videoId);
            videoIdToDocId[videoId] = { id: video.id, title: video.customHeadline };
          }
        }
      });

      // Process in batches of 50
      for (let i = 0; i < videoIds.length; i += 50) {
        const batchIds = videoIds.slice(i, i + 50).map(id => id.trim()).filter(id => id);
        if (batchIds.length === 0) continue;

        setScanProgress({
          current: i + batchIds.length,
          total: videoIds.length,
          status: `Scanning batch ${Math.floor(i / 50) + 1} of ${Math.ceil(videoIds.length / 50)}...`
        });

        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails,snippet&id=${batchIds.join(',')}&key=${apiKey}`);

        if (!response.ok) {
          console.error('API Error:', response.status);
          continue;
        }

        const data = await response.json();
        console.log('Batch results:', data.items?.map(i => ({ id: i.id, embeddable: i.status?.embeddable, status: i.status })));

        const foundIds = new Set();

        if (data.items) {
          data.items.forEach(item => {
            foundIds.add(item.id);
            if (item.status) {
              const isPrivate = item.status.privacyStatus === 'private';
              const isRejected = item.status.uploadStatus === 'rejected';
              const isDeleted = item.status.uploadStatus === 'deleted';
              const isFailed = item.status.uploadStatus === 'failed';
              const isEmbedDisabled = item.status.embeddable === false;

              const isAgeRestricted = item.contentDetails?.contentRating?.ytRating === 'ytAgeRestricted';
              const isRegionRestricted = item.contentDetails?.regionRestriction?.blocked?.includes('US'); // Assume US target for now

              if (isPrivate || isRejected || isDeleted || isFailed || isEmbedDisabled || isAgeRestricted || isRegionRestricted) {
                let reason = 'Unknown';
                if (isPrivate) reason = 'Private';
                else if (isDeleted) reason = 'Deleted';
                else if (isFailed) reason = 'Upload Failed';
                else if (isRejected) reason = 'Rejected';
                else if (isEmbedDisabled) reason = 'Embedding Disabled';
                else if (isAgeRestricted) reason = 'Age Restricted';
                else if (isRegionRestricted) reason = 'Region Blocked';

                videosToDelete.push({
                  ...videoIdToDocId[item.id],
                  reason: reason
                });
              }
            }
          });
        }

        // Videos not found at all
        batchIds.forEach(id => {
          if (!foundIds.has(id) && videoIdToDocId[id]) {
            videosToDelete.push({
              ...videoIdToDocId[id],
              reason: 'Not found (deleted)'
            });
          }
        });
      }

      const uniqueToDelete = Array.from(new Map(videosToDelete.map(v => [v.id, v])).values());
      const skippedCount = videos.length - videoIds.length;

      if (uniqueToDelete.length > 0) {
        setBrokenVideos(uniqueToDelete);
        setShowBrokenList(true);
        setScanProgress(null);
        setCleaningStatus(`Scan Complete. Found ${uniqueToDelete.length} issues in ${videoIds.length} videos. (${skippedCount} skipped due to invalid URLs)`);
      } else {
        setScanProgress(null);
        setCleaningStatus(`Scan Complete. Clean bill of health! Scanned ${videoIds.length} videos. (${skippedCount} skipped)`);
        setTimeout(() => setCleaningStatus(''), 5000);
      }

    } catch (error) {
      console.error('Error scanning videos:', error);
      setScanProgress(null);
      setCleaningStatus(`Error: ${error.message}`);
    }
  };

  const deleteBrokenVideos = async () => {
    if (!window.confirm(`Delete ${brokenVideos.length} broken videos?\n\nThis cannot be undone.`)) {
      return;
    }

    try {
      const batch = writeBatch(db);
      brokenVideos.forEach(video => {
        const docRef = doc(db, 'videos', video.id);
        batch.delete(docRef);
      });

      await batch.commit();
      setCleaningStatus(`Successfully deleted ${brokenVideos.length} videos!`);
      setBrokenVideos([]);
      setShowBrokenList(false);

      // Refresh
      setVideos([]);
      await loadVideos(true);

      setTimeout(() => setCleaningStatus(''), 3000);
    } catch (error) {
      setCleaningStatus(`Error deleting: ${error.message}`);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>TubeHeadlines Admin</h1>
        <p>Local admin tool for managing your headlines</p>
        <div className="clock">{currentTime.toLocaleTimeString()}</div>
        <div className="header-controls">
          <button onClick={checkVideoAvailability} className="clean-btn" title="Uses free YouTube API quota">
            Scan & Clean Broken Videos
          </button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      {scanProgress && (
        <div className="status-bar">
          <p className="status-message">
            {scanProgress.status} ({scanProgress.current}/{scanProgress.total})
          </p>
          <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '4px', marginTop: '10px' }}>
            <div style={{
              width: `${(scanProgress.current / scanProgress.total) * 100}%`,
              backgroundColor: '#4CAF50',
              height: '20px',
              borderRadius: '4px',
              transition: 'width 0.3s'
            }}></div>
          </div>
        </div>
      )}

      {cleaningStatus && (
        <div className="status-bar">
          <p className="status-message">{cleaningStatus}</p>
        </div>
      )}

      {showBrokenList && brokenVideos.length > 0 && (
        <div className="broken-videos-panel" style={{
          margin: '20px',
          padding: '20px',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#856404' }}> Found {brokenVideos.length} Broken Videos</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '15px' }}>
            {brokenVideos.map((video, index) => (
              <div key={video.id} style={{
                padding: '10px',
                marginBottom: '8px',
                backgroundColor: 'white',
                borderLeft: '4px solid #dc3545',
                borderRadius: '4px'
              }}>
                <strong>{index + 1}. {video.title}</strong>
                <span style={{
                  marginLeft: '10px',
                  padding: '2px 8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}>
                  {video.reason}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={deleteBrokenVideos}
            style={{
              marginTop: '15px',
              padding: '12px 24px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Delete All {brokenVideos.length} Broken Videos
          </button>
          <button
            onClick={() => { setBrokenVideos([]); setShowBrokenList(false); setCleaningStatus(''); }}
            style={{
              marginLeft: '10px',
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>
        </div>
      )}

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

            <div className="form-group" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label htmlFor="editorsTake" style={{ margin: 0 }}>Editor's Take (SEO Paragraph):</label>
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !formData.title}
                  style={{ backgroundColor: '#0066cc', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: isGenerating ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
                >
                  ✨ {isGenerating ? 'Generating...' : 'Auto-Generate SEO Hook'}
                </button>
              </div>
              {aiMessage && <p style={{ color: aiMessage.startsWith('Error') ? 'red' : 'green', margin: '5px 0', fontSize: '0.85rem' }}>{aiMessage}</p>}
              <textarea
                id="editorsTake"
                value={formData.editorsTake || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, editorsTake: e.target.value }))}
                rows={4}
                placeholder="Enter or generate an engaging 3-sentence SEO hook..."
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
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




