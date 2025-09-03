import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { pageview, event } from './utils/analytics';
import { checkEnvironmentVariables } from './utils/envTest';
import Stats from './components/Stats';
import CookieNotice from './components/CookieNotice';
import ShareButton from './components/ShareButton';

// Lazy-loaded components
const Privacy = React.lazy(() => import('./components/Privacy'));
const Terms = React.lazy(() => import('./components/Terms'));
const FAQ = React.lazy(() => import('./components/FAQ'));
const BlogPost = React.lazy(() => import('./components/BlogPost'));
const VideoPage = React.lazy(() => import('./components/VideoPage'));
const Homepage = React.lazy(() => import('./components/Homepage'));

import './App.css';
import './components/ShareButton.css';
import './components/LoadingError.css';
import './components/WelcomeBanner.css';
import './components/PaginationTest.css';

function App() {
  useEffect(() => {
    pageview(window.location.pathname, window.location.href, document.title);
    const envCheck = checkEnvironmentVariables();
    console.log('Environment variables check:', envCheck);
  }, []);

  return (
    <div className="app">
      <React.Suspense fallback={<div className="loading-message">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog/why-i-built-tubeheadlines" element={<BlogPost />} />
          <Route path="/video/:id" element={<VideoPage />} />
        </Routes>
      </React.Suspense>
      
      <div className="fixed-links">
        <Link to="/privacy">PRIVACY</Link>
        <span className="link-separator">|</span>
        <Link to="/terms">TERMS</Link>
        <span className="link-separator">|</span>
        <Link to="/faq">FAQ</Link>
        <span className="link-separator">|</span>
        <Link to="/blog/why-i-built-tubeheadlines">BLOG</Link>
        <span className="link-separator">|</span>
        <ShareButton />
      </div>
      <Stats />
      <CookieNotice />
    </div>
  );
}

export default App;
