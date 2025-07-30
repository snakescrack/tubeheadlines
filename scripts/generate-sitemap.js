// scripts/generate-sitemap.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// IMPORTANT: This script runs in a Node.js environment, NOT in the browser.
// It needs Firebase credentials directly. We will use environment variables.
// You must create a .env file in the tubeheadlines-react folder with your keys.
// Example .env file:
// VITE_FIREBASE_API_KEY=AIzaSy...
// VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
// ...and so on for all the keys.

// Environment variables are now loaded by Node.js using the --env-file flag.
// No need for the dotenv package.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Self-contained function to parse dates, copied from videoLoader.js
const parseDate = (date) => {
    if (!date) return new Date();
    if (date.toDate) return date.toDate();
    if (date.seconds) return new Date(date.seconds * 1000);
    if (typeof date === 'string') return new Date(date);
    if (date instanceof Date) return date;
    return new Date();
};

// Self-contained function to load videos, adapted from videoLoader.js
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

const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^-a-zA-Z0-9]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '').replace(/-+$/, '');
};

const generateSitemap = async () => {
    console.log('Initializing Firebase for sitemap generation...');
    if (!firebaseConfig.apiKey) {
        console.error('Firebase API Key is missing. Make sure .env file is set up correctly.');
        process.exit(1);
    }

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('Generating sitemap...');

    const videos = await loadAllVideos(db);
    const today = new Date().toISOString().split('T')[0];
    const SITE_URL = 'https://tubeheadlines.com';
    const sitemapPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');

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
  ${videos.map(video => `
  <url>
    <loc>${SITE_URL}/video/${video.id}/${slugify(video.title)}</loc>
    <lastmod>${new Date(video.createdAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    writeFileSync(sitemapPath, sitemapContent.trim());
    console.log(`Sitemap generated successfully at ${sitemapPath}`);
    process.exit(0); // Force exit to close the DB connection
};

generateSitemap().catch(error => {
    console.error('Critical error in sitemap generation:', error);
    process.exit(1);
});
