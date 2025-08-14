import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

export default function NotFound() {
  return (
    <>
      <SEO 
        title="Page Not Found - TubeHeadlines"
        description="The page you're looking for cannot be found. Return to TubeHeadlines for the latest videos and news."
      />
      <div className="not-found-container">
        <h1>404 - Page Not Found</h1>
        <p>Sorry, we couldn't find what you're looking for.</p>
        <p>The page might have been removed or the link might be broken.</p>
        <Link to="/" className="home-button">
          Return to Homepage
        </Link>
      </div>
    </>
  );
}
