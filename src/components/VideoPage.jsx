import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
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
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

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

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!video) return;
      
      try {
        setLoadingRecommendations(true);
        const { getAllVideos } = await import('../utils/dbOperations');
        const allVideos = await getAllVideos();
        
        const now = new Date();
        const visibleVideos = allVideos.filter(v => {
          if (v.id === id) return false;
          if (!v.scheduledAt) return true;
          
          let scheduledDate;
          if (v.scheduledAt.toDate && typeof v.scheduledAt.toDate === 'function') {
            scheduledDate = v.scheduledAt.toDate();
          } else if (v.scheduledAt.seconds) {
            scheduledDate = new Date(v.scheduledAt.seconds * 1000);
          } else {
            scheduledDate = new Date(v.scheduledAt);
          }
          return scheduledDate <= now;
        });

        visibleVideos.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        
        setRecommendedVideos(visibleVideos.slice(0, 4));
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [video, id]);

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

        <div className="tools-cta-banner" style={{
          backgroundColor: '#fffcfc',
          borderLeft: '4px solid #ff0000',
          padding: '1.5rem',
          borderRadius: '4px 8px 8px 4px',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginTop: 0, color: '#333', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Want to make videos like this? 🚀
          </h3>
          <p style={{ margin: 0, color: '#555', lineHeight: '1.6', fontSize: '1.05rem' }}>
            Use our <a href="https://tubeheadlines.com/viral-idea-generator" style={{ color: '#ff0000', fontWeight: 'bold', textDecoration: 'none' }}>Free YouTube Viral Idea Generator</a> or check your titles with our <a href="https://tubeheadlines.com/advertiser-friendly-title-checker" style={{ color: '#ff0000', fontWeight: 'bold', textDecoration: 'none' }}>Advertiser-Friendly Title Checker</a>.
          </p>
        </div>

        {/* Recommended Videos Section */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>
            Up Next: Recommended For You
          </h2>
          
          {loadingRecommendations ? (
            <p style={{ color: '#666' }}>Loading recommendations...</p>
          ) : recommendedVideos.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem'
            }}>
              {recommendedVideos.map((rec) => (
                <Link to={`/video/${rec.id}`} key={rec.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
                      <img 
                        src={`https://img.youtube.com/vi/${getYouTubeId(rec.youtubeURL)}/mqdefault.jpg`} 
                        alt={rec.customHeadline}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    </div>
                    <div style={{ padding: '1rem', flexGrow: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#111', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rec.customHeadline}
                      </h4>
                      {rec.channelName && (
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>{rec.channelName}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

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
