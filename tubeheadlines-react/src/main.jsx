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
import BlogPost from './components/BlogPost'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
                    <Route path="/banner-test" element={<BannerTest />} />
          <Route path="/blog/why-i-built-tubeheadlines" element={<BlogPost />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)
