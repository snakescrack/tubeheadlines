import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import SEO from './SEO';
import { pageview } from '../utils/analytics';

const VideoPage = () => {
  const { id: videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!videoId) return;

      setLoading(true);
      try {
        const response = await fetch(`/.netlify/functions/youtube-proxy?videoId=${videoId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const snippet = data.items[0].snippet;
          const videoData = {
            id: videoId,
            customHeadline: snippet.title,
            description: snippet.description,
            thumbnailURL: snippet.thumbnails.high.url,
            youtubeURL: `https://www.youtube.com/watch?v=${videoId}`
          };
          setVideo(videoData);
          pageview(
            `${videoData.customHeadline} | TubeHeadlines`,
            window.location.href,
            window.location.pathname
          );
        } else {
          setError('Video not found.');
        }
      } catch (e) {
        console.error('Failed to fetch video details:', e);
        setError('Failed to load video details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error || !video) {
    return <Navigate to="/" replace />;
  }

  // Create SEO-optimized title and description
  const pageTitle = `${video.customHeadline} | TubeHeadlines`;
  const pageDescription = video.description || 
    `Watch "${video.customHeadline}" - Latest video news and updates from top creators. Get breaking news, analysis, and trending stories delivered daily on TubeHeadlines.`;

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        path={`/video/${videoId}`}
        videoData={video}
      />
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '2rem',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '1rem',
          color: '#333'
        }}>
          {video.customHeadline}
        </h1>
        
        {video.thumbnailURL && (
          <img 
            src={video.thumbnailURL} 
            alt={video.customHeadline}
            style={{ 
              width: '100%', 
              maxWidth: '640px', 
              height: 'auto',
              marginBottom: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          />
        )}
        
        <div style={{ marginBottom: '2rem' }}>
          <a 
            href={video.youtubeURL} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: '#ff0000',
              color: 'white',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            ▶ Watch on YouTube
          </a>
        </div>
        
        {video.description && (
          <div className="video-description-container" style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginTop: 0, color: '#555' }}>Description</h3>
            <p style={{ 
              lineHeight: '1.6', 
              color: '#666',
              whiteSpace: 'pre-wrap'
            }}>
              {video.description}
            </p>
          </div>
        )}
        
        <div style={{ 
          textAlign: 'center',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid #eee'
        }}>
          <a 
            href="/"
            style={{
              color: '#0066cc',
              textDecoration: 'none',
              fontSize: '1.1rem'
            }}
          >
            ← Back to TubeHeadlines
          </a>
        </div>
      </div>
    </>
  );
};

export default VideoPage;
