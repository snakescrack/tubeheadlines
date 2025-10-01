import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import Privacy from './components/Privacy'
import Terms from './components/Terms'
import FAQ from './components/FAQ'
import BannerTest from './components/BannerTest'
import VideoPage from './components/VideoPage'
import SubmitChannel from './components/SubmitChannel'
import NotFound from './components/NotFound'
import { useLocation, Navigate } from 'react-router-dom';

// Component to remove trailing slashes from URLs
const RemoveTrailingSlash = ({ children }) => {
  const location = useLocation();

  if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
    return <Navigate to={location.pathname.slice(0, -1)} replace />;
  }

  return children;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <RemoveTrailingSlash>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/banner-test" element={<BannerTest />} />
            <Route path="/video/:videoId" element={<VideoPage />} />
            <Route path="/submit" element={<SubmitChannel />} />
            {/* Catch-all route for 404 Not Found pages */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RemoveTrailingSlash>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)
