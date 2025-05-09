import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllVideos } from './utils/dbOperations';
import Stats from './components/Stats';
import CookieNotice from './components/CookieNotice';
import SEO from './components/SEO';
import ShareButton from './components/ShareButton';
import './App.css';
import './components/ShareButton.css';
import './components/LoadingError.css';

function App() {
  const [videos, setVideos] = useState({
    featured: null,
    columns: {
      left: {},
      center: {},
      right: {}
    },
    pagination: {
      left: { currentPage: 1, totalPages: 1 },
      center: { currentPage: 1, totalPages: 1 },
      right: { currentPage: 1, totalPages: 1 }
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState({
    left: 1,
    center: 1,
    right: 1
  });


  const loadVideos = async () => {
    try {
      console.log('Loading videos with pages:', pages);
      setLoading(true);
      setError(null);
      const result = await getAllVideos(pages);
      console.log('Received videos:', result);
      setVideos(result);
      console.log('Videos state after update:', result);
    } catch (err) {
      setError('Failed to load videos. Please try again.');
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [pages.left, pages.center, pages.right]);

  const handlePageChange = (position, newPage) => {
    if (newPage < 1 || newPage > videos.pagination[position].totalPages) {
      return;
    }
    setPages(prev => ({
      ...prev,
      [position]: newPage
    }));
  };

  const renderPagination = (position) => {
    const { currentPage, totalPages } = videos.pagination[position];
    
    return (
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(position, currentPage - 1)}
          disabled={currentPage === 1}
          className="page-button"
        >
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => handlePageChange(position, currentPage + 1)}
          disabled={currentPage === totalPages}
          className="page-button"
        >
          Next
        </button>
      </div>
    );
  };

  const VideoItem = ({ video }) => (
    <div className="video-item">
      <a href={video.youtubeURL} target="_blank" rel="noopener noreferrer" className="video-link">
        <img src={video.thumbnailURL} alt={video.customHeadline} />
        <p>{video.customHeadline}</p>
      </a>
    </div>
  );

  const getColumnTitle = (position) => {
    switch (position) {
      case 'left':
        return 'BREAKING NEWS';
      case 'center':
        return 'TRENDING NOW';
      case 'right':
        return 'ENTERTAINMENT';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="app">
        <SEO />
        <div className="loading-message">
          Loading headlines...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <SEO />
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <SEO />
      <header>
        <h1>TUBE HEADLINES</h1>
        <div className="updated">Updated {new Date().toLocaleString()}</div>
      </header>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && (
        <>
          {videos.featured && (
            <div className="featured-video">
              <a href={videos.featured.youtubeURL} target="_blank" rel="noopener noreferrer">
                <img src={videos.featured.thumbnailURL} alt={videos.featured.customHeadline} />
                <h2>{videos.featured.customHeadline}</h2>
              </a>
            </div>
          )}

          <div className="columns">
            {['left', 'center', 'right'].map((position) => (
              <div key={position} className="column">
                <div className="column-header">
                  <h3>{getColumnTitle(position)}</h3>
                </div>
                {Object.entries(videos.columns[position]).length > 0 ? (
                  Object.entries(videos.columns[position]).map(([category, categoryVideos]) => (
                    <div key={category} className="category-section">
                      {categoryVideos.length > 0 && categoryVideos.map((video) => (
                        <div key={video.id} className="video-item">
                          <a href={video.youtubeURL} target="_blank" rel="noopener noreferrer" className="video-link">
                            <img src={video.thumbnailURL} alt={video.customHeadline} />
                            <p>{video.customHeadline}</p>
                          </a>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="category-section">
                    <div className="no-videos">No videos available</div>
                  </div>
                )}
                {renderPagination(position)}
              </div>
            ))}
          </div>
        </>
      )}
      
      <div className="fixed-links">
        <Link to="/privacy">PRIVACY</Link>
        <span className="link-separator">|</span>
        <Link to="/terms">TERMS</Link>
        <span className="link-separator">|</span>
        <ShareButton />
      </div>
      <Stats />
      <CookieNotice />
    </div>
  );
}

export default App;
