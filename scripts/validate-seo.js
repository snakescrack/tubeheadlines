// scripts/validate-seo.js
import { readFileSync, readdirSync, lstatSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

/**
 * Validation checks for a single HTML file
 */
function validateFile(filePath, isVideoPage = false) {
  const html = readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];

  // 1. Check for canonical tag
  if (!html.includes('<link rel="canonical"')) {
    errors.push('Missing <link rel="canonical">');
  }

  // 2. Check for root domain consistency (no www)
  if (html.includes('www.tubeheadlines.com')) {
    errors.push('Found "www.tubeheadlines.com" - should use naked domain "tubeheadlines.com"');
  }

  // 3. Script tags are allowed for React hydration
  // (Removed check that banned module scripts)

  // 4. Check for unique content in #root
  if (isVideoPage) {
    if (html.includes('TubeHeadlines - Trending YouTube Videos & News') && html.includes('Discover the most important YouTube video headlines')) {
      errors.push('Found homepage boilerplate in #root instead of video content');
    }
    if (!html.includes('<iframe')) {
      errors.push('Missing YouTube iframe in video page #root');
    }
  }

  return { errors, warnings };
}

console.log('--- SEO Validation Start ---');

try {
  // Check main index.html
  const mainIndex = path.join(DIST_DIR, 'index.html');
  console.log(`Checking ${mainIndex}...`);
  const mainResult = validateFile(mainIndex, false);
  if (mainResult.errors.length > 0) {
    console.error('❌ Errors in dist/index.html:');
    mainResult.errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  // Check random sample of video pages
  const videoDir = path.join(DIST_DIR, 'video');
  if (!readdirSync(videoDir)) {
    console.error('❌ dist/video directory not found!');
    process.exit(1);
  }

  const ids = readdirSync(videoDir).filter(f => lstatSync(path.join(videoDir, f)).isDirectory());
  console.log(`Found ${ids.length} video pages. Sampling 20 for validation...`);

  // Shuffle and pick 20
  const sample = ids.sort(() => 0.5 - Math.random()).slice(0, 20);

  let errorCount = 0;
  sample.forEach(id => {
    const videoFile = path.join(videoDir, id, 'index.html');
    const result = validateFile(videoFile, true);
    if (result.errors.length > 0) {
      console.error(`❌ Errors in /video/${id}/index.html:`);
      result.errors.forEach(e => console.error(`  - ${e}`));
      errorCount++;
    }
  });

  if (errorCount > 0) {
    console.error(`\n--- SEO Validation FAILED with ${errorCount} errors ---`);
    process.exit(1);
  }

  console.log('\n✅ SEO Validation PASSED for all samples!');
  console.log('--- SEO Validation End ---');

} catch (err) {
  console.error('Critical error during validation:', err);
  process.exit(1);
}
