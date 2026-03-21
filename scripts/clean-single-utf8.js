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

  content = content.replace(/'\?\s+Copied/g, "'Copied");
  content = content.replace(/"\?\s+PLAY"/g, '"PLAY"');
  content = content.replace(/\n\s+\?\s+START TELEPROMPTER/g, '\n                    START TELEPROMPTER');
  content = content.replace(/\n\s+\?\s+Invalid YouTube Link/g, '\n                    Invalid YouTube Link');
  content = content.replace(/\?\s+Magic/g, 'Magic');
  content = content.replace(/\?\s+Auto-Generate/g, 'Auto-Generate');

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});
console.log('Final UI single ? cleanup complete.');
