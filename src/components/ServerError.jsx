import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const ServerError = () => {
  return (
    <>
      <Helmet>
        <title>Temporary Error - TubeHeadlines</title>
        <meta name="prerender-status-code" content="503" />
      </Helmet>
      <div className="error-container" style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'sans-serif'
      }}>
        <h1 style={{ color: '#d32f2f' }}>Something went wrong</h1>
        <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '2rem' }}>
          We're having trouble loading this content right now. It's likely a temporary issue.
          Please try again in a few moments.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Reload Page
        </button>
        <Link
          to="/"
          style={{
            color: '#0066cc',
            textDecoration: 'underline'
          }}
        >
          Go to Homepage
        </Link>
      </div>
    </>
  );
};

export default ServerError;
