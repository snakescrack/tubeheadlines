import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { pageview, event } from './utils/analytics';
import { checkEnvironmentVariables } from './utils/envTest';
import Stats from './components/Stats';
import CookieNotice from './components/CookieNotice';
import ShareButton from './components/ShareButton';
import { getAllVideosForHomepage } from './utils/videoLoader';
import SEO from './components/SEO';
import WelcomeBanner from './components/WelcomeBanner';
import HomepageDescription from './components/HomepageDescription';

import Privacy from './components/Privacy';
import Terms from './components/Terms';
import FAQ from './components/FAQ';
import BlogPost from './components/BlogPost';
import VideoPage from './components/VideoPage';

import './App.css';
import './components/ShareButton.css';
import './components/LoadingError.css';
import './components/WelcomeBanner.css';
import './components/PaginationTest.css';

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
      setLoading(true);
      setError(null);
      const result = await getAllVideosForHomepage(pages);

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

  useEffect(() => {
    pageview(window.location.pathname, window.location.href, document.title);
    const envCheck = checkEnvironmentVariables();
    console.log('Environment variables check:', envCheck);
  }, []);

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
        <div className="page-numbers">
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
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

  const getColumnTitle = (position) => {
    switch (position) {
      case 'left': return 'BREAKING NEWS';
      case 'center': return 'TRENDING NOW';
      case 'right': return 'ENTERTAINMENT';
      default: return '';
    }
  };

  const allVideos = [videos.featured, ...Object.values(videos.columns).flatMap(col => Object.values(col).flat())].filter(Boolean);

  const Homepage = () => {
    if (loading) {
      return (
        <>
          <SEO currentUrl={window.location.href} />
          <div className="loading-message">Loading headlines...</div>
        </>
      );
    }

    if (error) {
      return (
        <>
          <SEO currentUrl={window.location.href} />
          <div className="error-message">
            {error}
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </>
      );
    }

    return (
      <>
        <SEO 
          currentUrl={window.location.href}
          videos={allVideos}
          videoData={videos.featured}
        />
        <WelcomeBanner />
        <header>
          <h1>TUBE HEADLINES</h1>
          <div className="updated">Updated {new Date().toLocaleString()}</div>
        </header>

        <HomepageDescription />

        {videos.featured && (
          <div className="featured-video">
            <Link to={`/video/${videos.featured.id}`} className="video-link">
              <img src={videos.featured.thumbnailURL} alt={videos.featured.customHeadline} />
              <h2>{videos.featured.customHeadline}</h2>
            </Link>
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
                    {categoryVideos.map((video) => (
                      <div key={video.id} className="video-item">
                        <Link to={`/video/${video.id}`} className="video-link">
                          <img src={video.thumbnailURL} alt={video.customHeadline} />
                          <p>{video.customHeadline}</p>
                        </Link>
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
    );
  };

  return (
    <div className="app">
               <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog/why-i-built-tubeheadlines" element={<BlogPost />} />
          <Route path="/video/:id" element={<VideoPage />} />
        </Routes>
            
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
