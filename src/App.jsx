import React, { useState, useEffect } from 'react';
import { pageview, event } from './utils/analytics';
import { Link, Route } from 'react-router-dom';
import { getAllVideosForHomepage } from './utils/videoLoader';
import { checkEnvironmentVariables } from './utils/envTest';
import Stats from './components/Stats';
import CookieNotice from './components/CookieNotice';
import SEO from './components/SEO';
import ShareButton from './components/ShareButton';
import WelcomeBanner from './components/WelcomeBanner';
import Privacy from './components/Privacy';
import HomepageDescription from './components/HomepageDescription';
import './App.css';
import './components/ShareButton.css';
import './components/LoadingError.css';
import './components/WelcomeBanner.css';
import './components/PaginationTest.css';

function App() {
  useEffect(() => {
    // Track page view
    pageview(
      'TubeHeadlines - Home',
      window.location.href,
      window.location.pathname
    );
    
    // Send test event to verify analytics is working
    event({
      action: 'page_loaded',
      category: 'user_engagement',
      label: 'home_page',
      value: 1
    });
    
    // Log analytics status for debugging
    console.log('Analytics initialized:', !!window.gtag);
    
    // Check environment variables
    const envCheck = checkEnvironmentVariables();
    console.log('Environment variables check:', envCheck);
  }, []);

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
      const result = await getAllVideosForHomepage(pages);
      console.log('Received videos:', result);

      const newVideosState = {
        featured: result.featured || null,
        columns: {
          left: result.left?.videosByCategory || {},
          center: result.center?.videosByCategory || {},
          right: result.right?.videosByCategory || {},
        },
        pagination: {
          left: { currentPage: result.left?.currentPage || 1, totalPages: result.left?.totalPages || 1 },
          center: { currentPage: result.center?.currentPage || 1, totalPages: result.center?.totalPages || 1 },
          right: { currentPage: result.right?.currentPage || 1, totalPages: result.right?.totalPages || 1 },
        },
      };

      setVideos(newVideosState);
      console.log('Videos state after update:', newVideosState);
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

  const handleCategoryChange = (category) => {
    // Track category change event
    event({
      action: 'category_change',
      category: 'navigation',
      label: category,
      value: 1
    });
    setSelectedCategory(category);
  };

  const handleVideoClick = (e, video) => {
    // Prevent the link from opening immediately to ensure the analytics event has time to send
    e.preventDefault();

    // Track video click event
    event({
      action: 'video_click',
      category: 'engagement',
      label: video.customHeadline,
      value: 1
    });

    // Open the link in a new tab
    window.open(video.youtubeURL, '_blank');
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
        
        {/* Page Numbers */}
        <div className="page-numbers">
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            
            // Show first page, last page, current page, and 1 page before/after current
            if (
              pageNum === 1 || 
              pageNum === totalPages || 
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <button 
                  key={pageNum} 
                  onClick={() => handlePageChange(position, pageNum)}
                  className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            }
            
            // Show ellipsis for gaps
            if (pageNum === 2 || pageNum === totalPages - 1) {
              return <span key={pageNum} className="ellipsis">...</span>;
            }
            
            return null;
          })}
        </div>
        
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
      <a 
        href={video.youtubeURL} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="video-link"
        onClick={() => handleVideoClick(video)}
      >
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
        <SEO currentUrl={window.location.href} />
        <div className="loading-message">
          Loading headlines...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <SEO currentUrl={window.location.href} />
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  // Prepare all videos for structured data
  const allVideos = [];
  
  // Add featured video if available
  if (videos.featured) {
    allVideos.push(videos.featured);
  }
  
  // Add column videos
  Object.entries(videos.columns).forEach(([position, categories]) => {
    Object.values(categories).forEach(categoryVideos => {
      allVideos.push(...categoryVideos);
    });
  });
  
  return (
    <div className="app">
      <SEO 
        currentUrl={window.location.href}
        videos={allVideos}
        videoData={videos.featured} // Pass featured video as primary video
      />
      <WelcomeBanner />
      <header>
        <h1>TUBE HEADLINES</h1>
        <div className="updated">Updated {new Date().toLocaleString()}</div>
      </header>

      <HomepageDescription />

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
                          <a href={video.youtubeURL} target="_blank" rel="noopener noreferrer" className="video-link" onClick={(e) => handleVideoClick(e, video)}>
                            <img src={video.thumbnailURL} alt={video.customHeadline} />
                            <p>{video.customHeadline}</p>
                          </a>
                          <button 
                            className="video-share-button"
                            onClick={(e) => {
                              e.preventDefault();
                              navigator.share({
                                title: video.customHeadline,
                                url: video.youtubeURL
                              }).catch(console.error);
                            }}
                          >
                            Share
                          </button>
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
        <Link to="/faq">FAQ</Link>
        <span className="link-separator">|</span>
        <Link to="/blog/why-i-built-tubeheadlines">BLOG</Link>
        <span className="link-separator">|</span>
        <ShareButton />
      </div>
      <Stats />
      <CookieNotice />
    </div>
  );
}

export default App;
