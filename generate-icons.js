// Script to generate simple PNG icons for PWA
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple SVG-based icon as base64 PNG placeholder
// These are minimal valid PNG files for PWA compliance

function createMinimalPNG(size) {
  // This creates a simple orange square PNG using raw bytes
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, size);

  // Orange circle
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Dumbbell symbol (simplified)
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(size * 0.3, size * 0.45, size * 0.4, size * 0.1);
  ctx.beginPath();
  ctx.arc(size * 0.28, size * 0.5, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.72, size * 0.5, size * 0.1, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

try {
  const buf192 = createMinimalPNG(192);
  const buf512 = createMinimalPNG(512);

  fs.writeFileSync(path.join(__dirname, 'public/icons/icon-192.png'), buf192);
  fs.writeFileSync(path.join(__dirname, 'public/icons/icon-512.png'), buf512);
  console.log('Icons generated successfully');
} catch (e) {
  console.log('Canvas not available, creating placeholder icons');
  // Create minimal valid PNG bytes manually (1x1 orange pixel scaled)
  // We'll use a pre-made base64 minimal PNG
  const placeholder = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(path.join(__dirname, 'public/icons/icon-192.png'), placeholder);
  fs.writeFileSync(path.join(__dirname, 'public/icons/icon-512.png'), placeholder);
  console.log('Placeholder icons created');
}
