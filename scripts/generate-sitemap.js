// scripts/generate-sitemap.js
import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This script now runs from within the tubeheadlines-react directory,
// so it can access the project's node_modules.

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
    
    // Correct path: from /scripts up to project root, then to /dist/sitemap.xml
    const sitemapPath = path.resolve(__dirname, '..', 'tubeheadlines-react', 'dist', 'sitemap.xml');

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy</loc>
    <lastmod>2025-05-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/faq</loc>
    <lastmod>2025-05-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog/why-i-built-tubeheadlines</loc>
    <lastmod>2025-05-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  ${videos.map(video => `
  <url>
    <loc>${SITE_URL}/video/${video.id}</loc>
    <lastmod>${new Date(video.createdAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    writeFileSync(sitemapPath, sitemapContent.trim());
    console.log(`Sitemap generated successfully at ${sitemapPath}`);
    // process.exit(0) is removed to allow the build process to continue
};

generateSitemap().catch(error => {
    console.error('Critical error in sitemap generation:', error);
    process.exit(1);
});
