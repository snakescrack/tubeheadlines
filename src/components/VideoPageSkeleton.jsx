import React from 'react';
import '../styles/Skeleton.css';

const VideoPageSkeleton = () => {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div className="skeleton skeleton-title"></div>
      
      <div className="skeleton skeleton-thumbnail"></div>
      
      <div className="skeleton skeleton-button"></div>
      
      <div className="video-description-container" style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <div className="skeleton skeleton-text-header"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
      </div>
    </div>
  );
};

export default VideoPageSkeleton;
