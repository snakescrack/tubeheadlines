import React from 'react';

const HomepageDescription = () => {
  return (
    <div 
      className="homepage-description"
      style={{
        maxWidth: '800px',
        margin: '1rem auto 2rem auto',
        padding: '1rem',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
        Discover Amazing YouTube Videos from Emerging and Established Creators
      </h2>
      <p style={{ color: '#555', lineHeight: '1.6', margin: '0.5rem 0' }}>
        TubeHeadlines curates the best YouTube videos from emerging and established creators. 
        Find trending content, breaking news, educational videos, and viral content with a focus on quality over popularity.
      </p>
      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>
        Quality content curation • Fresh videos daily • Free forever
      </p>
    </div>
  );
};

export default HomepageDescription;
