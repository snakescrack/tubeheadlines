import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getVideosForPosition } from '../utils/videoLoader';
import { getYouTubeId, getOptimizedThumbnailUrl } from '../utils/youtubeUtils';
import SEO from './SEO';
import './CategoryPage.css';

const CategoryPage = () => {
  const { position } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchCategoryVideos = async () => {
      try {
        setLoading(true);
        const result = await getVideosForPosition(position, currentPage, 30);
        setVideos(result.videos);
        setPagination({ currentPage: result.currentPage, totalPages: result.totalPages });
      } catch (err) {
        setError('Failed to load videos for this category.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryVideos();
  }, [position, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setSearchParams({ page: newPage });
      window.scrollTo(0, 0);
    }
  };

  const getColumnTitle = (pos) => {
    switch (pos) {
      case 'left': return 'Breaking News';
      case 'center': return 'Trending Now';
      case 'right': return 'Entertainment';
      default: return '';
    }
  };

  const formattedCategoryName = getColumnTitle(position);

  if (loading) {
    return <div className="loading-message">Loading {formattedCategoryName} videos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <SEO 
        title={`${formattedCategoryName} Videos - Page ${pagination.currentPage} | TubeHeadlines`}
        description={`Browse all ${formattedCategoryName} videos on TubeHeadlines. Page ${pagination.currentPage} of the latest content.`}
        path={`/category/${position}`}
      />
      <div className="category-page-container">
        <div className="category-page-header">
          <Link to="/" className="back-to-main-link">← Back to Main Page</Link>
          <h1>{formattedCategoryName} Videos</h1>
          <p className="page-info">Page {pagination.currentPage} of {pagination.totalPages}</p>
        </div>

        <div className="category-video-grid">
          {videos.map(video => (
            <div key={video.id} className="category-video-item">
              <Link to={`/video/${video.id}`} className="video-link">
                <img 
                  src={getOptimizedThumbnailUrl(getYouTubeId(video.youtubeURL), 'medium')}
                  alt={video.customHeadline}
                  width="320"
                  height="180"
                  loading="lazy"
                  decoding="async"
                />
                <p>{video.customHeadline}</p>
              </Link>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button 
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="page-button"
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {[...Array(pagination.totalPages)].map((_, index) => {
              const pageNum = index + 1;
              
              if (
                pageNum === 1 || 
                pageNum === pagination.totalPages || 
                (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
              ) {
                return (
                  <button 
                    key={pageNum} 
                    onClick={() => handlePageChange(pageNum)}
                    className={`page-number ${pagination.currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              }
              
              if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                return <span key={pageNum} className="ellipsis">...</span>;
              }
              
              return null;
            })}
          </div>
          
          <button 
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="page-button"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
