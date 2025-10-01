import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming you have a firebase.js export for db
import SEO from './SEO';
import NotFound from './NotFound';

const VideoPage = () => {
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        if (!videoId) {
          throw new Error('Video ID is missing.');
        }
        const docRef = doc(db, 'videos', videoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setVideoData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Video not found.');
        }
      } catch (err) {
        setError('Failed to load video data.');
        console.error('Error fetching video:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  if (loading) {
    return <div>Loading video...</div>;
  }

  if (error) {
    // If there's an error (e.g., video not found), render the NotFound component
    return <NotFound />;
  }

  if (!videoData) {
    return null; // Should be handled by error state
  }

  return (
    <>
      <SEO 
        title={`${videoData.customHeadline} - TubeHeadlines`}
        description={videoData.description || `Watch the video: ${videoData.customHeadline}`}
        path={`/video/${videoData.id}`}
        videoData={videoData}
        currentUrl={`https://tubeheadlines.com/video/${videoData.id}`}
      />
      <div className="video-page-container" style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
        <h1>{videoData.customHeadline}</h1>
        <div className="video-embed-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe 
            src={`https://www.youtube.com/embed/${videoData.youtubeId}`}
            title={videoData.customHeadline}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          ></iframe>
        </div>
        <p style={{ marginTop: '20px' }}>{videoData.description}</p>
      </div>
    </>
  );
};

export default VideoPage;
