import React, { useState, useEffect } from 'react';
import './WelcomeBanner.css';

const WelcomeBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('th_visited');
    if (!hasVisited) {
      setShowBanner(true);
      // Set visited flag
      localStorage.setItem('th_visited', 'true');
    }
  }, []);
  
  const closeBanner = () => {
    setShowBanner(false);
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="welcome-banner">
      <div className="welcome-content">
        <h3>Welcome to TubeHeadlines</h3>
        <p>Your daily source for trending videos from across the web. Click any thumbnail to watch the original video on its platform.</p>
        <button className="welcome-button" onClick={closeBanner}>Got it!</button>
      </div>
    </div>
  );
};

export default WelcomeBanner;
