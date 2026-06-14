const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');
const appDir = path.join(__dirname, '../app');

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);

    // favicon-32x32.png
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));

    // favicon-16x16.png
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));

    // apple-touch-icon.png
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    // android-chrome-192x192.png
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'android-chrome-192x192.png'));

    // android-chrome-512x512.png
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'android-chrome-512x512.png'));

    // favicon.ico
    // Sharp can't directly output .ico, but we can just use 32x32 PNG and rename it, 
    // modern browsers support PNG in .ico extension or we can just rely on the PNGs.
    // However, to be safe, we will just copy 32x32.png as favicon.ico
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(appDir, 'favicon.ico'));

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
