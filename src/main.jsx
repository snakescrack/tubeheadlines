import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { viteSSG } from 'vite-ssg'
import { Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import Privacy from './components/Privacy'
import Terms from './components/Terms'
import FAQ from './components/FAQ'
import BannerTest from './components/BannerTest'
import BlogPost from './components/BlogPost'
import VideoPage from './components/VideoPage'

const routes = [
  { path: '/', element: <App /> },
  { path: '/privacy', element: <Privacy /> },
  { path: '/terms', element: <Terms /> },
  { path: '/faq', element: <FAQ /> },
  { path: '/banner-test', element: <BannerTest /> },
  { path: '/blog/why-i-built-tubeheadlines', element: <BlogPost /> },
  { path: '/video/:videoId', element: <VideoPage /> },
];

const AppWithRoutes = () => (
  <Routes>
    {routes.map(route => <Route key={route.path} {...route} />)}
  </Routes>
);

export const createApp = viteSSG(
  AppWithRoutes,
  { routes: routes.map(r => ({...r, path: r.path, element: r.element})) }, // Pass routes to vite-ssg
  ({ app, router, routes, isClient, initialState }) => {
    if (isClient) {
      const root = document.getElementById('root');
      if (root.hasChildNodes()) {
        ReactDOM.hydrateRoot(root, app);
      } else {
        ReactDOM.createRoot(root).render(app);
      }
    }
  }
);
