// scripts/generate-sitemap.js
import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to extract YouTube ID
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

/**
 * Robustly replaces or injects meta tags in HTML
 */
function updateMetaTag(html, propertyName, propertyValue, isNameAttribute = false) {
  const attr = isNameAttribute ? 'name' : 'property';
  const regex = new RegExp(`<meta\\s+[^>]*?${attr}=["']${propertyName}["'][^>]*?>`, 'i');
  const newTag = `<meta ${attr}="${propertyName}" content="${escapeXml(propertyValue)}">`;
  
  if (regex.test(html)) {
    return html.replace(regex, newTag);
  } else {
    // Inject before </head> if not found
    return html.replace('</head>', `  ${newTag}\n</head>`);
  }
}

/**
 * Robustly strips all script tags from HTML and standardizes domains
 */
function cleanupHtml(html, siteUrl) {
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Final safety: Replace all www instances with the naked domain
  const wwwUrl = siteUrl.replace('://', '://www.');
  return cleaned.split(wwwUrl).join(siteUrl);
}

const generateSitemap = async () => {
  console.log('Initializing Firebase for sitemap generation...');
  if (!firebaseConfig.apiKey) {
    console.error('Firebase API Key is missing. Make sure environment variables are set in Netlify.');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const videos = await loadAllVideos(db);
  const today = new Date().toISOString().split('T')[0];
  const SITE_URL = 'https://tubeheadlines.com';
  const DIST_DIR = path.resolve(__dirname, '..', 'dist');

  if (!existsSync(DIST_DIR)) {
    console.error('Error: dist directory not found. Run vite build first.');
    process.exit(1);
  }

  // 1. Generate Static Pages Sitemap
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
</urlset>`;
  writeFileSync(staticSitemapPath, staticSitemapContent.trim());
  console.log('Generated: sitemap-main.xml');

  // 2. Load base index.html
  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  const baseHtml = readFileSync(indexHtmlPath, 'utf8');

  // 3. Prerender Static Routes (Homepage, About, Privacy, etc.)
  const recentVideos = videos.slice(0, 100);
  
  // Distribute videos by position to match the 3-column layout
  const organized = { left: [], center: [], right: [] };
  recentVideos.forEach(v => {
    const pos = v.position_type === 'top' ? 'center' : (v.position_type || 'center');
    if (organized[pos]) organized[pos].push(v);
  });

  const getColumnTitle = (pos) => {
    if (pos === 'left') return 'BREAKING NEWS';
    if (pos === 'center') return 'TRENDING NOW';
    return 'ENTERTAINMENT';
  };

  const homeVideoList = `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 2rem; text-align: left; max-width: 1200px; margin-left: auto; margin-right: auto;" class="columns-prerender">
      ${['left', 'center', 'right'].map(pos => `
        <div class="column-prerender">
          <div style="background: #000; color: #fff; padding: 10px; margin-bottom: 20px; text-align: center;">
            <h3 style="margin: 0; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">${getColumnTitle(pos)}</h3>
          </div>
          ${(organized[pos] || []).slice(0, 4).map(v => `
            <div style="margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
              <a href="/video/${v.id}" style="text-decoration: none; color: inherit;">
                <img src="${v.thumbnailURL || getOptimizedThumbnailUrl(getYouTubeId(v.youtubeURL))}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h4 style="margin: 12px 0 5px; font-size: 0.95rem; line-height: 1.4; font-weight: 600;">${escapeXml(v.customHeadline || v.title)}</h4>
              </a>
            </div>
          `).join('')}
          <div style="text-align: center; margin-top: 10px;">
            <a href="/category/${pos}" style="color: #4da6ff; text-decoration: none; font-size: 0.8rem;">View All</a>
          </div>
        </div>
      `).join('')}
    </div>`;

  const staticRoutes = [
    { 
      path: '/', 
      title: 'TubeHeadlines | Discover Trending YouTube Videos & News', 
      desc: 'TubeHeadlines delivers trending YouTube video headlines in real-time. Discover breaking news, politics, entertainment and more.',
      content: homeVideoList
    },
    { path: '/about', title: 'About TubeHeadlines', desc: 'Discover how TubeHeadlines curates the best YouTube news and viral videos.' },
    { path: '/privacy', title: 'Privacy Policy', desc: 'Your privacy matters to us at TubeHeadlines.' },
    { path: '/terms', title: 'Terms of Service', desc: 'Rules and guidelines for using the TubeHeadlines platform.' },
    { path: '/faq', title: 'Frequently Asked Questions', desc: 'Get quick answers to common questions about TubeHeadlines.' },
    { path: '/blog', title: 'TubeHeadlines Blog', desc: 'Latest resources and strategies for YouTube growth.' }
  ];

  staticRoutes.forEach(route => {
    try {
      let routeHtml = baseHtml;
      const fullUrl = `${SITE_URL}${route.path}`;
      
      routeHtml = routeHtml.replace(/<title>.*?<\/title>/i, `<title>${route.title} | TubeHeadlines</title>`);
      routeHtml = updateMetaTag(routeHtml, 'description', route.desc, true);
      routeHtml = updateMetaTag(routeHtml, 'og:title', route.title);
      routeHtml = updateMetaTag(routeHtml, 'og:description', route.desc);
      routeHtml = updateMetaTag(routeHtml, 'og:url', fullUrl);
      routeHtml = updateMetaTag(routeHtml, 'twitter:title', route.title);
      routeHtml = updateMetaTag(routeHtml, 'twitter:description', route.desc);
      
      // Fix canonical
      routeHtml = routeHtml.replace(/<link rel=["']canonical["'][^>]*?>/i, `<link rel="canonical" href="${fullUrl}">`);
      
      // Inject content if available
      if (route.content) {
        routeHtml = routeHtml.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${route.content}</div>`);
      }

      // Strip scripts and standardize domain
      routeHtml = cleanupHtml(routeHtml, SITE_URL);
      
      let destPath;
      if (route.path === '/') {
        destPath = indexHtmlPath;
      } else {
        const routeDir = path.join(DIST_DIR, route.path.slice(1));
        mkdirSync(routeDir, { recursive: true });
        destPath = path.join(routeDir, 'index.html');
      }
      writeFileSync(destPath, routeHtml);
    } catch (e) {
      console.error(`Failed to prerender static route ${route.path}:`, e);
    }
  });

  // 4. Generate Video Pages & Sitemap
  const URLS_PER_SITEMAP = 5000;
  const videoChunks = [];
  for (let i = 0; i < videos.length; i += URLS_PER_SITEMAP) {
    videoChunks.push(videos.slice(i, i + URLS_PER_SITEMAP));
  }

  const generatedVideoSitemaps = [];

  videoChunks.forEach((chunk, chunkIdx) => {
    const sitemapFilename = `sitemap-videos-${chunkIdx + 1}.xml`;
    const sitemapPath = path.join(DIST_DIR, sitemapFilename);
    const lastMod = new Date(chunk[0].createdAt).toISOString().split('T')[0];

    let chunkContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

    chunk.forEach(video => {
      const videoId = getYouTubeId(video.youtubeURL);
      const thumbnailUrl = video.thumbnailURL || getOptimizedThumbnailUrl(videoId, 'high');
      const title = escapeXml(video.customHeadline || video.title || 'TubeHeadlines Video');
      const editorsTake = video.editorsTake ? escapeXml(video.editorsTake) : '';
      const description = editorsTake || escapeXml(video.description || 'Watch this video on TubeHeadlines');
      const shortDesc = description.substring(0, 155) + (description.length > 155 ? '...' : '');
      const pubDate = new Date(video.createdAt).toISOString();
      const videoPageUrl = `${SITE_URL}/video/${video.id}`;

      // XML Sitemap Entry
      chunkContent += `
  <url>
    <loc>${videoPageUrl}</loc>
    <lastmod>${new Date(video.createdAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${title}</video:title>
      <video:description>${escapeXml(shortDesc)}</video:description>
      <video:player_loc>https://www.youtube.com/embed/${videoId}</video:player_loc>
      <video:publication_date>${pubDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`;

      // Prerender HTML
      try {
        let videoHtml = baseHtml;
        
        videoHtml = videoHtml.replace(/<title>.*?<\/title>/i, `<title>${title} | TubeHeadlines</title>`);
        videoHtml = updateMetaTag(videoHtml, 'description', shortDesc, true);
        videoHtml = updateMetaTag(videoHtml, 'og:title', title);
        videoHtml = updateMetaTag(videoHtml, 'og:description', shortDesc);
        videoHtml = updateMetaTag(videoHtml, 'og:url', videoPageUrl);
        videoHtml = updateMetaTag(videoHtml, 'og:image', thumbnailUrl);
        videoHtml = updateMetaTag(videoHtml, 'twitter:card', 'summary_large_image', true);
        videoHtml = updateMetaTag(videoHtml, 'twitter:title', title);
        videoHtml = updateMetaTag(videoHtml, 'twitter:description', shortDesc);
        videoHtml = updateMetaTag(videoHtml, 'twitter:image', thumbnailUrl);
        
        // Canonical Fix
        videoHtml = videoHtml.replace(/<link rel=["']canonical["'][^>]*?>/i, `<link rel="canonical" href="${videoPageUrl}">`);

        // Inject Static Content
        const contentSection = editorsTake
          ? `<div style="background: #e8f4fd; border-left: 4px solid #cc0000; padding: 1.5rem; margin: 1.5rem 0; text-align: left;">
              <h2 style="margin-top: 0; color: #cc0000;">📝 Editor's Take</h2>
              <p style="line-height: 1.6; color: #333; font-size: 1.1rem; margin: 0;">${editorsTake}</p>
            </div>`
          : '';

        const staticContent = `
          <main style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
            <h1 style="font-size: 2rem; margin-bottom: 2rem;">${title}</h1>
            <div style="background: #000; position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
              <iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen></iframe>
            </div>
            ${contentSection}
            <nav style="margin-top: 3rem; border-top: 1px solid #eee; padding-top: 1rem;">
              <a href="/" style="color: #cc0000; font-weight: bold; text-decoration: none;">← Back to Trending Videos</a>
            </nav>
          </main>`;

        videoHtml = videoHtml.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${staticContent}</div>`);
        
        // Strip scripts and standardize domain
        videoHtml = cleanupHtml(videoHtml, SITE_URL);

        const videoDir = path.join(DIST_DIR, 'video', video.id);
        mkdirSync(videoDir, { recursive: true });
        writeFileSync(path.join(videoDir, 'index.html'), videoHtml);
        
        // Case-insensitive alias
        const lowerId = video.id.toLowerCase();
        if (lowerId !== video.id) {
          const lowerDir = path.join(DIST_DIR, 'video', lowerId);
          mkdirSync(lowerDir, { recursive: true });
          writeFileSync(path.join(lowerDir, 'index.html'), videoHtml);
        }
      } catch (e) {
        console.error(`Error prerendering video ${video.id}:`, e);
      }
    });

    chunkContent += `</urlset>`;
    writeFileSync(sitemapPath, chunkContent.trim());
    console.log(`Generated: ${sitemapFilename}`);
    generatedVideoSitemaps.push({ filename: sitemapFilename, lastmod: lastMod });
  });

  // 5. Generate Sitemap Index
  const sitemapIndexPath = path.join(DIST_DIR, 'sitemap.xml');
  let indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE_URL}/sitemap-main.xml</loc><lastmod>${today}</lastmod></sitemap>`;

  generatedVideoSitemaps.forEach(map => {
    indexContent += `<sitemap><loc>${SITE_URL}/${map.filename}</loc><lastmod>${map.lastmod}</lastmod></sitemap>`;
  });
  indexContent += `</sitemapindex>`;
  writeFileSync(sitemapIndexPath, indexContent.trim());
  console.log('Generated: sitemap.xml');
};

generateSitemap().catch(err => {
  console.error('Critical error:', err);
  process.exit(1);
});
