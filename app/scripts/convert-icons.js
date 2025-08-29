// This script converts SVG icons to PNG for better PWA compatibility
// Add it to package.json scripts if needed

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function convertSvgToPng(svgPath, size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Create a white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  // Load and draw the SVG
  const img = await loadImage(svgPath);
  ctx.drawImage(img, 0, 0, size, size);
  
  return canvas.toBuffer('image/png');
}

async function main() {
  const iconsDir = path.join(__dirname, 'public', 'icons');
  
  // Ensure the directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  try {
    // Convert SVG to PNG for various sizes
    const svg192Path = path.join(iconsDir, 'icon-192.svg');
    const svg512Path = path.join(iconsDir, 'icon-512.svg');
    
    if (fs.existsSync(svg192Path)) {
      const png192 = await convertSvgToPng(svg192Path, 192);
      fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);
      console.log('Created icon-192.png');
    } else {
      console.warn('icon-192.svg not found');
    }
    
    if (fs.existsSync(svg512Path)) {
      const png512 = await convertSvgToPng(svg512Path, 512);
      fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);
      console.log('Created icon-512.png');
    } else {
      console.warn('icon-512.svg not found');
    }
    
    console.log('Icon conversion complete');
  } catch (error) {
    console.error('Error converting icons:', error);
  }
}

main().catch(console.error);
