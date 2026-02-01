import React, { useEffect } from 'react';
import { pageview, event } from './utils/analytics';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { checkEnvironmentVariables } from './utils/envTest';
import Stats from './components/Stats.jsx';
import CookieNotice from './components/CookieNotice.jsx';
import ShareButton from './components/ShareButton.jsx';
import Privacy from './components/Privacy.jsx';
import Terms from './components/Terms.jsx';
import FAQ from './components/FAQ.jsx';
import BlogPost from './components/BlogPost.jsx';
import BlogIndex from './components/BlogIndex.jsx';
import TenFreeToolsPost from './components/TenFreeToolsPost.jsx';
import ViralStrategyPost from './components/ViralStrategyPost.jsx';
import VideoPage from './components/VideoPage.jsx';
import NotFound from './components/NotFound.jsx';
import SubmitChannel from './components/SubmitChannel.jsx';
import CategoryPage from './components/CategoryPage.jsx';
import Home from './components/Home.jsx';
import './App.css';
import './components/ShareButton.css';
import './components/LoadingError.css';
import './components/WelcomeBanner.css';
import './components/PaginationTest.css';

// Component to remove trailing slashes from URLs
const RemoveTrailingSlash = ({ children }) => {
  const location = useLocation();

  if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
    return <Navigate to={location.pathname.slice(0, -1)} replace />;
  }

  return children;
};

function App() {
  useEffect(() => {
    // Track page view
    pageview(
      'TubeHeadlines - Home',
      window.location.href,
      window.location.pathname
    );

    // Send test event to verify analytics is working
    event({
      action: 'page_loaded',
      category: 'user_engagement',
      label: 'home_page',
      value: 1
    });

    // Log analytics status for debugging
    console.log('Analytics initialized:', !!window.gtag);

    // Check environment variables
    const envCheck = checkEnvironmentVariables();
    console.log('Environment variables check:', envCheck);
  }, []);

  return (
    <div className="app">
      <RemoveTrailingSlash>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/10-free-tools-for-youtubers" element={<TenFreeToolsPost />} />
          <Route path="/blog/viral-youtube-strategy" element={<ViralStrategyPost />} />
          <Route path="/blog/why-i-built-tubeheadlines" element={<BlogPost />} />
          <Route path="/video/:id" element={<VideoPage />} />
          <Route path="/submit" element={<SubmitChannel />} />
          <Route path="/category/:position" element={<CategoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RemoveTrailingSlash>

      <div className="fixed-links">
        <Link to="/privacy">PRIVACY</Link>
        <span className="link-separator">|</span>
        <Link to="/terms">TERMS</Link>
        <span className="link-separator">|</span>
        <Link to="/faq">FAQ</Link>
        <span className="link-separator">|</span>
        <Link to="/blog">BLOG</Link>
        <span className="link-separator">|</span>
        <Link to="/submit">SUBMIT YOUR CHANNEL</Link>
        <span className="link-separator">|</span>
        <a href="/viral-idea-generator.html" target="_blank" rel="noopener noreferrer">IDEA GENERATOR</a>
        <span className="link-separator">|</span>
        <a href="/youtube-income-calculator.html" target="_blank" rel="noopener noreferrer">INCOME CALCULATOR</a>
        <span className="link-separator">|</span>
        <ShareButton />
      </div>
      <Stats />
      <CookieNotice />
    </div>
  );
}

export default App;
