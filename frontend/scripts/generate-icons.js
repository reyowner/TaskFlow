const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceIcon = path.join(__dirname, '../public/task.png');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate 192x192 icon
sharp(sourceIcon)
  .resize(192, 192)
  .toFile(path.join(outputDir, 'icon-192x192.png'))
  .then(() => console.log('Generated 192x192 icon'))
  .catch(err => console.error('Error generating 192x192 icon:', err));

// Generate 512x512 icon
sharp(sourceIcon)
  .resize(512, 512)
  .toFile(path.join(outputDir, 'icon-512x512.png'))
  .then(() => console.log('Generated 512x512 icon'))
  .catch(err => console.error('Error generating 512x512 icon:', err)); 