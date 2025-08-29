import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from '@/App.jsx'
import Privacy from '@/components/Privacy.jsx'
import Terms from '@/components/Terms.jsx'
import FAQ from '@/components/FAQ.jsx'
import BannerTest from '@/components/BannerTest.jsx'
import VideoPage from '@/components/VideoPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/video/:videoId" element={<VideoPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/banner-test" element={<BannerTest />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)
