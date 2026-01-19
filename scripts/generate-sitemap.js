// scripts/generate-sitemap.js
import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to extract YouTube ID (replicated from youtubeUtils.js to avoid ESM import issues)
// Helper to extract YouTube ID (replicated from youtubeUtils.js to avoid ESM import issues)
function getYouTubeId(url) {
  if (!url) return '';
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)|(?:\?v=))([^#\&?]*).*/;
  const match = url.match(regExp);
  return (match && match[1].length === 11) ? match[1] : '';
}

// Helper to get optimized thumbnail URL
function getOptimizedThumbnailUrl(videoId, quality = 'high') {
  if (!videoId) return '';
  switch (quality) {
    case 'high': return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    case 'medium': return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
    default: return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
  }
}

// Escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const parseDate = (date) => {
  if (!date) return new Date();
  if (date.toDate) return date.toDate();
  if (date.seconds) return new Date(date.seconds * 1000);
  if (typeof date === 'string') return new Date(date);
  if (date instanceof Date) return date;
  return new Date();
};

const loadAllVideos = async (db) => {
  try {
    const videosRef = collection(db, 'videos');
    const querySnapshot = await getDocs(videosRef);
    const videos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: parseDate(doc.data().createdAt),
    }));
    console.log(`Loaded ${videos.length} videos from Firestore`);
    return videos;
  } catch (error) {
    console.error('Error loading videos directly:', error);
    return [];
  }
};

const generateSitemap = async () => {
  console.log('Initializing Firebase for sitemap generation...');
  if (!firebaseConfig.apiKey) {
    console.error('Firebase API Key is missing. Make sure environment variables are set in Netlify.');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log('Generating sitemap...');

  const videos = await loadAllVideos(db);
  const today = new Date().toISOString().split('T')[0];
  const SITE_URL = 'https://tubeheadlines.com';

  const sitemapPath = path.resolve(__dirname, '..', 'dist', 'sitemap.xml');

  // Header now includes the video namespace
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/faq</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog/why-i-built-tubeheadlines</loc>
    <lastmod>2025-05-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/category/left</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/category/center</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/category/right</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/youtube-resources</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/youtube-resources/getting-started/how-to-start-channel</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/youtube-resources/getting-started/essential-equipment</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

  // Add video URLs with rich metadata
  videos.forEach(video => {
    const videoId = getYouTubeId(video.youtubeURL);
    const thumbnailUrl = video.thumbnailURL || getOptimizedThumbnailUrl(videoId, 'high');
    const title = escapeXml(video.customHeadline || video.title || 'TubeHeadlines Video');
    const description = escapeXml(video.description || 'Watch this video on TubeHeadlines');
    const pubDate = new Date(video.createdAt).toISOString(); // ISO 8601 required
    const videoPageUrl = `${SITE_URL}/video/${video.id}`;

    // Only add if we have a valid thumbnail and ID
    if (videoId && thumbnailUrl) {
      sitemapContent += `
  <url>
    <loc>${videoPageUrl}</loc>
    <lastmod>${new Date(video.createdAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${title}</video:title>
      <video:description>${description}</video:description>
      <video:player_loc>https://www.youtube.com/embed/${videoId}</video:player_loc>
      <video:publication_date>${pubDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:requires_subscription>no</video:requires_subscription>
      <video:live>no</video:live>
    </video:video>
  </url>`;
    }
  });

  sitemapContent += `
</urlset>`;

  writeFileSync(sitemapPath, sitemapContent.trim());
  console.log(`Sitemap generated successfully at ${sitemapPath}`);
};

generateSitemap().catch(error => {
  console.error('Critical error in sitemap generation:', error);
  process.exit(1);
});
