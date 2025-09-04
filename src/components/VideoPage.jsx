import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
import SEO from './SEO';
import { pageview } from '../utils/analytics';

const VideoPage = () => {
  const { id } = useParams(); // Use 'id' directly from the URL
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) {
        setLoading(false);
        setError('No video ID provided');
        return;
      }

      try {
        setLoading(true);
        const videoDocRef = doc(db, 'videos', id);
        const videoDoc = await getDoc(videoDocRef);

        if (videoDoc.exists()) {
          const videoData = { id: videoDoc.id, ...videoDoc.data() };
          setVideo(videoData);
          
          pageview(
            `${videoData.customHeadline} | TubeHeadlines`,
            window.location.href,
            window.location.pathname
          );
        } else {
          setError('Video not found');
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Error loading video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

    if (error || !video) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <SEO title="Video Not Found | TubeHeadlines" path={`/video/${id}`} />
        <h2>Video Not Found</h2>
        <p>Sorry, the video you are looking for does not exist or has been moved.</p>
        <a href="/">← Back to TubeHeadlines</a>
      </div>
    );
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
        path={`/video/${id}`}
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
