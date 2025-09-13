import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '../styles/GetFeatured.css'; // Re-use existing styles for consistency

const ThankYou = () => {
  return (
    <>
      <Helmet>
        <title>Thank You! | TubeHeadlines</title>
      </Helmet>
      <div className="get-featured-container">
        <div className="get-featured-card">
          <h2>Thank You!</h2>
          <p>Your submission has been received. We'll be in touch if your channel is a good fit.</p>
          <Link to="/" className="submit-button" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
            Back to Homepage
          </Link>
        </div>
      </div>
    </>
  );
};

export default ThankYou;
