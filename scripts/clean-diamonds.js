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

  // 1. Remove the specific red box question mark requested by the user
  content = content.replace(/Check if Your Title is Advertiser-Friendly \?/g, 'Check if Your Title is Advertiser-Friendly');

  // 2. Fix the Diamond Question Marks (Unicode Replacement Character U+FFFD)
  // Replace the diamond with a clean hyphen and safe spacing so words don't mash together
  // But also handle cases where there is already spacing
  content = content.replace(/ ?\uFFFD ?/g, ' - ');
  
  // Clean up any double spaces created by the replacement
  content = content.replace(/  -  /g, ' - ');

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[FIXED] Diamonds / Red Box in ${file}`);
  }
});

console.log('Cleanup Complete!');
