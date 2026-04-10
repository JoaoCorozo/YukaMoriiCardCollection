import sharp from 'sharp';
import fs from 'fs';

const inputFile = './public/logo.jpeg';

async function processImage() {
  try {
    const defaultIcon = sharp(inputFile);

    await defaultIcon.resize(192, 192).toFile('./public/pwa-192x192.png');
    await defaultIcon.resize(512, 512).toFile('./public/pwa-512x512.png');
    await defaultIcon.resize(180, 180).toFile('./public/apple-touch-icon.png');
    
    // Favicon can be a 32x32 png
    await defaultIcon.resize(32, 32).png().toFile('./public/favicon.ico');

    console.log('Images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
  }
}

processImage();
