// scripts/generate-sitemap.js
import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
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
  const DIST_DIR = path.resolve(__dirname, '..', 'dist');

  // Limit per sitemap (Google allows 50,000, but we stay safe with 5,000 for speed)
  const URLS_PER_SITEMAP = 5000;

  // 1. Generate Static Pages Sitemap (sitemap-main.xml)
  const staticSitemapPath = path.join(DIST_DIR, 'sitemap-main.xml');
  let staticSitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE_URL}/about</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/contact</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${SITE_URL}/privacy</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${SITE_URL}/terms</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${SITE_URL}/faq</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${SITE_URL}/blog</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/blog/why-i-built-tubeheadlines</loc><lastmod>2026-02-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/blog/10-free-tools-for-youtubers</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/blog/viral-youtube-strategy</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/category/left</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/category/center</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/category/right</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/youtube-resources</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/youtube-script-pacing-analyzer</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/youtube-title-ctr-grader</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/viral-outlier-concept-calculator</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/viral-idea-generator</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/youtube-income-calculator</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/script-timer</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/description-generator</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
</urlset>`;
  writeFileSync(staticSitemapPath, staticSitemapContent.trim());
  console.log(`Generated: sitemap-main.xml`);

  // 2. Generate Video Sitemaps (sitemap-videos-1.xml, etc.)
  const videoChunks = [];
  for (let i = 0; i < videos.length; i += URLS_PER_SITEMAP) {
    videoChunks.push(videos.slice(i, i + URLS_PER_SITEMAP));
  }

  const generatedVideoSitemaps = [];

  videoChunks.forEach((chunk, index) => {
    const sitemapFilename = `sitemap-videos-${index + 1}.xml`;
    const sitemapPath = path.join(DIST_DIR, sitemapFilename);
    const lastMod = new Date(chunk[0].createdAt).toISOString().split('T')[0]; // Use newest video as lastmod for the file

    // -------------------------------------------------------------
    // PRERENDERING SECTION: Load base index.html
    // -------------------------------------------------------------
    const indexHtmlPath = path.join(DIST_DIR, 'index.html');
    let baseHtml = '';
    if (existsSync(indexHtmlPath)) {
      baseHtml = readFileSync(indexHtmlPath, 'utf8');
      
      // We will also prerender the standard routes here, only once
      if (index === 0) {
        console.log('Prerendering static React routes...');
        const staticRoutes = [
          '/', '/blog', '/blog/10-free-tools-for-youtubers',
          '/blog/viral-youtube-strategy', '/blog/why-i-built-tubeheadlines',
          '/submit', '/category/left', '/category/center', '/category/right', '/tools'
        ];
        staticRoutes.forEach(route => {
          try {
            const canonicalUrl = `${SITE_URL}${route === '/' ? '' : route.replace(/\/$/, '')}`;
            const modifiedHtml = baseHtml.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
            let destPath;
            if (route === '/') {
               // Do not overwrite the main dist/index.html which is the catch-all, but we CAN overwrite it with the root canonical!
               destPath = indexHtmlPath;
            } else {
               const routeDir = path.join(DIST_DIR, ...route.split('/').filter(Boolean));
               mkdirSync(routeDir, { recursive: true });
               destPath = path.join(routeDir, 'index.html');
            }
            writeFileSync(destPath, modifiedHtml);
          } catch (e) {
            console.error(`Failed to prerender static route ${route}:`, e);
          }
        });
      }
    }

    let chunkContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

    chunk.forEach(video => {
      const videoId = getYouTubeId(video.youtubeURL);
      const thumbnailUrl = video.thumbnailURL || getOptimizedThumbnailUrl(videoId, 'high');
      const title = escapeXml(video.customHeadline || video.title || 'TubeHeadlines Video');
      const description = escapeXml(video.description || 'Watch this video on TubeHeadlines');
      const pubDate = new Date(video.createdAt).toISOString();
      const videoPageUrl = `${SITE_URL}/video/${video.id}`;

      if (videoId && thumbnailUrl) {
        chunkContent += `
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

        // PRERENDER EACH VIDEO URL
        if (baseHtml) {
          try {
            // 1. IMPROVED SEO INJECTION (Robust Regex)
            const videoCanonicalUrl = `${SITE_URL}/video/${video.id}`;
            let videoHtml = baseHtml;
            
            // Replace Title
            videoHtml = videoHtml.replace(/<title>.*?<\/title>/i, `<title>${title} | TubeHeadlines</title>`);
            
            // Replace Meta Description (Handles multiple meta tags like description, og:description, etc.)
            const robotsDescription = description.length > 155 ? description.substring(0, 155) + '...' : description;
            
            // Primary Meta tags
            videoHtml = videoHtml.replace(/<meta name="title" content=".*?"/i, `<meta name="title" content="${title} | TubeHeadlines"`);
            videoHtml = videoHtml.replace(/<meta name="description" content=".*?"/i, `<meta name="description" content="${escapeXml(robotsDescription)}"`);
            
            // Open Graph tags
            videoHtml = videoHtml.replace(/<meta property="og:title" content=".*?"/i, `<meta property="og:title" content="${title} | TubeHeadlines"`);
            videoHtml = videoHtml.replace(/<meta property="og:description" content=".*?"/i, `<meta property="og:description" content="${escapeXml(description)}"`);
            videoHtml = videoHtml.replace(/<meta property="og:url" content=".*?"/i, `<meta property="og:url" content="${videoCanonicalUrl}"`);
            
            // Twitter tags
            videoHtml = videoHtml.replace(/<meta property="twitter:title" content=".*?"/i, `<meta property="twitter:title" content="${title} | TubeHeadlines"`);
            videoHtml = videoHtml.replace(/<meta property="twitter:description" content=".*?"/i, `<meta property="twitter:description" content="${escapeXml(description)}"`);
            videoHtml = videoHtml.replace(/<meta property="twitter:url" content=".*?"/i, `<meta property="twitter:url" content="${videoCanonicalUrl}"`);

            // Social Images
            videoHtml = videoHtml.replace(/content="https:\/\/www\.tubeheadlines\.com\/th-social-share\.jpg"/gi, `content="${thumbnailUrl}"`);
            
            // 2. CANONICAL INJECTION
            videoHtml = videoHtml.replace('</head>', `  <link rel="canonical" href="${videoCanonicalUrl}" />\n</head>`);

            // 3. CONTENT INJECTION (Critical for Thin Content fixes)
            // Replace the generic homepage content in #root with video-specific text
            const staticContent = `
    <main style="text-align: center; padding: 2rem; font-family: sans-serif; color: #333; max-width: 800px; margin: 0 auto;">
      <h1>${title}</h1>
      <p style="font-size: 1.2rem; line-height: 1.6;">${description}</p>
      <div style="margin: 2rem 0; background: #000; padding-bottom: 56.25%; position: relative; height: 0;">
        <iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top:0; left:0; width:100%; height:100%;" frameborder="0" allowfullscreen></iframe>
      </div>
      <p><a href="/">← Back to TubeHeadlines</a></p>
    </main>`;
            
            videoHtml = videoHtml.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${staticContent}\n  </div>`);

            const videoDir = path.join(DIST_DIR, 'video', video.id);
            mkdirSync(videoDir, { recursive: true });
            writeFileSync(path.join(videoDir, 'index.html'), videoHtml);
          } catch(e) {
            console.error(`Failed to prerender video ${video.id}:`, e);
          }
        }
      }
    });

    chunkContent += `
</urlset>`;
    writeFileSync(sitemapPath, chunkContent.trim());
    console.log(`Generated: ${sitemapFilename} (${chunk.length} videos)`);
    generatedVideoSitemaps.push({ filename: sitemapFilename, lastmod: lastMod });
  });

  // 3. Generate Sitemap Index (sitemap.xml)
  const sitemapIndexPath = path.join(DIST_DIR, 'sitemap.xml');
  let indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-main.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;

  generatedVideoSitemaps.forEach(map => {
    indexContent += `
  <sitemap>
    <loc>${SITE_URL}/${map.filename}</loc>
    <lastmod>${map.lastmod}</lastmod>
  </sitemap>`;
  });

  indexContent += `
</sitemapindex>`;

  writeFileSync(sitemapIndexPath, indexContent.trim());
  console.log(`Generated: sitemap.xml (Index) -> Points to main + ${generatedVideoSitemaps.length} video sitemaps`);
};

generateSitemap().catch(error => {
  console.error('Critical error in sitemap generation:', error);
  process.exit(1);
});
