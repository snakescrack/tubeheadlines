import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import SEO from './SEO';
import NotFound from './NotFound';
import ServerError from './ServerError';
import { pageview } from '../utils/analytics';
import { getYouTubeId } from '../utils/youtubeUtils';

// Helper to safely parse dates from various formats (Firestore, string, Date)
const parseDate = (date) => {
  if (!date) return new Date();
  if (date.toDate) return date.toDate();
  if (date.seconds) return new Date(date.seconds * 1000);
  if (typeof date === 'string') return new Date(date);
  if (date instanceof Date) return date;
  return new Date();
};

const VideoPage = () => {
  const { id } = useParams(); // Use 'id' directly from the URL
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) {
        setLoading(false);
        setError('Video not found');
        return;
      }

      try {
        setLoading(true);
        const videoDocRef = doc(db, 'videos', id);
        const videoDoc = await getDoc(videoDocRef);

        if (videoDoc.exists()) {
          const videoData = { id: videoDoc.id, ...videoDoc.data() };
          // Ensure dates are parsed correctly
          videoData.publishedAt = parseDate(videoData.publishedAt);
          videoData.createdAt = parseDate(videoData.createdAt);
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
        // Tell Prerender it's safe to take the snapshot
        setTimeout(() => { window.prerenderReady = true; }, 500);
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

  if (error === 'Video not found') {
    return <NotFound />;
  }

  if (error) {
    return <ServerError />;
  }

  if (!video) {
    return <NotFound />;
  }

  // Create SEO-optimized title and description
  const pageTitle = `${video.customHeadline} | TubeHeadlines`;
  const pageDescription = video.description ||
    `Watch "${video.customHeadline}" - Latest video news and updates from top creators. Get breaking news, analysis, and trending stories delivered daily on TubeHeadlines.`;

  const formattedDate = video.publishedAt instanceof Date ? video.publishedAt.toLocaleDateString() : 'Unknown date';

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        path={`/video/${id}`}
        videoData={video}
      />

      <main style={{
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

        <div className="video-embed-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%', background: '#000', marginBottom: '1rem' }}>
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(video.youtubeURL)}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.customHeadline}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          ></iframe>
        </div>


        <div className="video-stats" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.5rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
          <span style={{ fontSize: '0.9rem', color: '#555' }}>Published on {formattedDate}</span>
          <span style={{ fontSize: '0.9rem', color: '#555' }}>{video.viewCount ? `${parseInt(video.viewCount).toLocaleString()} views` : ''}</span>
        </div>

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

        {video.editorsTake && (
          <div className="editor-summary" style={{
            backgroundColor: '#e8f4fd',
            borderLeft: '4px solid #0066cc',
            padding: '1.5rem',
            borderRadius: '4px 8px 8px 4px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginTop: 0, color: '#0066cc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>📝</span> Editor's Take
            </h3>
            <p
              style={{ lineHeight: '1.6', color: '#333', fontSize: '1.05rem', margin: 0 }}
              dangerouslySetInnerHTML={{ __html: video.editorsTake }}
            />
          </div>
        )}

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
      </main>
    </>
  );
};

export default VideoPage;
