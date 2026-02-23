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
    scheduledAt: '',
    editorsTake: ''
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
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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
  const scanForDeadVideos = async () => {
    // Check cooldown (1 hour)
    if (lastScanTime) {
      const hoursSinceLastScan = (Date.now() - lastScanTime) / (1000 * 60 * 60);
      if (hoursSinceLastScan < 1) {
        const minutesRemaining = Math.ceil((1 - hoursSinceLastScan) * 60);
        setMessage(`Please wait ${minutesRemaining} minutes before scanning again to preserve API quota.`);
        return;
      }
    }

    // Get video count for confirmation
    const allVideos = await getAllVideos();
    const estimatedCalls = Math.ceil(allVideos.length / 50);

    // Confirmation dialog
    const confirmed = window.confirm(
      `Scanner will check ${allVideos.length} videos using approximately ${estimatedCalls} YouTube API calls.\n\n` +
      `Your daily quota is 10,000 calls.\n\n` +
      `Continue with scan?`
    );

    if (!confirmed) {
      return;
    }

    setLastScanTime(Date.now());
    await performScan();
  };

  // Main scanner function with batch optimization
  const performScan = async () => {
    setIsScanning(true);
    setMessage('Scanning videos for broken links...');
    setDeadVideos([]);
    setScanResults(null);

    try {
      const allVideos = await getAllVideos();
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

      if (!apiKey) {
        throw new Error('YouTube API key is missing');
      }

      const brokenVideos = [];
      const workingVideos = [];

      // Extract all video IDs first
      const videoIdRegex = /(?:youtube\.com\/(?:[^/]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?\&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
      const videoMap = new Map();

      for (const video of allVideos) {
        const videoIdMatch = video.youtubeURL?.match(videoIdRegex);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) {
          brokenVideos.push({ ...video, reason: 'Invalid URL format' });
        } else {
          videoMap.set(videoId, video);
        }
      }

      // Check videos in batches of 50 (YouTube API limit)
      const videoIds = Array.from(videoMap.keys());
      const batchSize = 50;
      const totalBatches = Math.ceil(videoIds.length / batchSize);

      for (let i = 0; i < videoIds.length; i += batchSize) {
        const batch = videoIds.slice(i, i + batchSize);
        const currentBatch = Math.floor(i / batchSize) + 1;
        setMessage(`Scanning batch ${currentBatch} of ${totalBatches} (${batch.length} videos)...`);

        try {
          // Single API call for up to 50 videos
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${batch.join(',')}&part=snippet&key=${apiKey}`
          );
          const data = await response.json();

          if (data.error) {
            // If batch fails, mark all as broken with API error
            batch.forEach(videoId => {
              brokenVideos.push({ ...videoMap.get(videoId), reason: `API Error: ${data.error.message}` });
            });
          } else {
            // Create a set of found video IDs
            const foundIds = new Set((data.items || []).map(item => item.id));

            // Check which videos were found and which weren't
            batch.forEach(videoId => {
              const video = videoMap.get(videoId);
              if (foundIds.has(videoId)) {
                workingVideos.push(video);
              } else {
                brokenVideos.push({ ...video, reason: 'Video not found on YouTube (deleted or private)' });
              }
            });
          }

          // Small delay between batches to be respectful of API limits
          if (i + batchSize < videoIds.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (error) {
          // If batch request fails, mark all videos in batch as broken
          batch.forEach(videoId => {
            brokenVideos.push({ ...videoMap.get(videoId), reason: `Error: ${error.message}` });
          });
        }
      }

      // Set dead videos for display
      setDeadVideos(brokenVideos);

      setScanResults({
        total: allVideos.length,
        working: workingVideos.length,
        broken: brokenVideos.length,
        apiCallsUsed: totalBatches
      });

      setMessage(`Scan complete! Used ${totalBatches} API calls. Found ${brokenVideos.length} broken videos. ${workingVideos.length} videos are working.`);
    } catch (error) {
      setMessage('Error scanning videos: ' + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  // Delete a single dead video
  const deleteDeadVideo = async (videoId) => {
    try {
      await deleteVideo(videoId);
      setDeadVideos(prev => prev.filter(v => v.id !== videoId));
      setMessage('Video deleted successfully!');
      await loadVideos();
    } catch (error) {
      setMessage('Error deleting video: ' + error.message);
    }
  }; const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await getAllVideos();
      // Ensure data is an array
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage('Error loading videos: ' + error.message);
      setVideos([]);
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

  const handleGenerateAI = async () => {
    if (!formData.customHeadline) {
      setMessage('Error: Please enter a Custom Headline first.');
      return;
    }

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setMessage('Error: OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your .env file.');
      return;
    }

    setIsGeneratingAI(true);
    setMessage('Generating Editor\'s Take...');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a professional SEO content editor for a YouTube curation platform called TubeHeadlines. Write a 3-sentence, highly engaging editorial paragraph about the following video title. Do not summarize it directly; tease the value, create curiosity, and include relevant keywords naturally. Tone: Authoritative but exciting.'
            },
            {
              role: 'user',
              content: formData.customHeadline
            }
          ]
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.choices && data.choices[0]) {
        setFormData(prev => ({
          ...prev,
          editorsTake: data.choices[0].message.content.trim()
        }));
        setMessage('AI generation successful!');
      } else {
        throw new Error('Unexpected response format from OpenAI');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      setMessage(`Error generating AI text: ${error.message}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Processing...');

    try {
      // 1. Extract Video ID from URL
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
        throw new Error('YouTube API key is missing. Please set VITE_YOUTUBE_API_KEY in your environment.');
      }

      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`);
      const youtubeData = await response.json();

      if (youtubeData.error) {
        throw new Error(`YouTube API Error: ${youtubeData.error.message}`);
      }

      if (!youtubeData.items || youtubeData.items.length === 0) {
        throw new Error('Video not found on YouTube.');
      }

      const description = youtubeData.items[0].snippet.description;

      // 3. Prepare data for submission
      const submitData = {
        ...formData,
        description: description,
        scheduledAt: formData.isScheduled ? formData.scheduledAt : null,
        thumbnailURL: formData.showThumbnail ? formData.thumbnailURL : '',
        videoId: videoId,
        editorsTake: formData.editorsTake,
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
        scheduledAt: '',
        editorsTake: ''
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

      if (editId === videoId) {
        setFormData({
          youtubeURL: '',
          customHeadline: '',
          position: 'featured',
          category: 'Featured',
          showThumbnail: true,
          thumbnailURL: '',
          editorsTake: ''
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
      scheduledAt: video.scheduledAt ? video.scheduledAt.slice(0, 16) : '',
      editorsTake: video.editorsTake || ''
    });
    setSelectedPosition(video.position);
    setEditMode(true);
    setEditId(video.id);
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

          <div className="form-group" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="editorsTake" style={{ margin: 0 }}>Editor's Take (SEO Paragraph):</label>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI || !formData.customHeadline}
                style={{
                  backgroundColor: '#6b21a8',
                  color: 'white',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  cursor: isGeneratingAI || !formData.customHeadline ? 'not-allowed' : 'pointer',
                  opacity: isGeneratingAI || !formData.customHeadline ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isGeneratingAI ? '⏳ Generating...' : '✨ Auto-Generate SEO Hook'}
              </button>
            </div>
            <textarea
              id="editorsTake"
              name="editorsTake"
              value={formData.editorsTake}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter optimal SEO editorial paragraph (or generate with AI)..."
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
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
                    scheduledAt: '',
                    editorsTake: ''
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

