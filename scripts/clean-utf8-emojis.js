import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Ensure UTF-8 meta is present right after <head> if not exists
  if (!content.includes('<meta charset="UTF-8">')) {
     if (content.includes('<head>')) {
        content = content.replace('<head>', '<head>\n    <meta charset="UTF-8">');
     }
  }

  // Safe UI Replacements using Regex
  // 1. Tag start: >?? Text
  content = content.replace(/>\?+\s+/g, '>'); 
  
  // 2. Tag end: Text ??<
  content = content.replace(/\s+\?+</g, '<');
  
  // 3. Exact tag: >??<
  content = content.replace(/>\?+</g, '><');

  // 4. JavaScript innerHTML strings: '?? Text' or "?? Text"
  content = content.replace(/'\?+\s+/g, "'");
  content = content.replace(/"\?+\s+/g, '"');
  content = content.replace(/`\?+\s+/g, '`');

  // 5. Hardcoded cleanup for specific mis-spaced elements caught in grep
  content = content.replace(/>\?+Copied/g, '>Copied');
  content = content.replace(/'\?+Copied/g, "'Copied");
  content = content.replace(/\?\?\? Thumbnail Visualizer/g, "Thumbnail Visualizer");
  content = content.replace(/\?\?\? Thumbnail Downloader/g, "Thumbnail Downloader");

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[CLEANED] ${file}`);
  }
});

console.log('UTF-8 UI Cleanup Complete!');
