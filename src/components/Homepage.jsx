import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllVideosForHomepage } from '../utils/videoLoader';
import { event } from '../utils/analytics';
import SEO from './SEO';
import ShareButton from './ShareButton';
import WelcomeBanner from './WelcomeBanner';
import HomepageDescription from './HomepageDescription';

const Homepage = () => {
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

  const allVideos = [videos.featured, ...Object.values(videos.columns).flatMap(col => Object.values(col).flat())].filter(Boolean);

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

export default Homepage;
