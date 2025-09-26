import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

async function generateImages() {
  const logoPath = path.join(publicDir, 'logo.png');

  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo not found at', logoPath);
    return;
  }

  try {
    // Generate Open Graph image (1200x630)
    console.log('📸 Generating Open Graph image...');
    await sharp(logoPath)
      .resize(400, 400, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 10, alpha: 1 }
      })
      .extend({
        top: 115,
        bottom: 115,
        left: 400,
        right: 400,
        background: { r: 10, g: 10, b: 10, alpha: 1 }
      })
      .composite([{
        input: Buffer.from(`
          <svg width="1200" height="630">
            <rect width="1200" height="630" fill="#0a0a0a"/>
            <text x="600" y="480" text-anchor="middle" fill="#AA151B" font-size="48" font-weight="bold" font-family="system-ui">
              Ibero Data
            </text>
            <text x="600" y="530" text-anchor="middle" fill="#FFC72C" font-size="24" font-family="system-ui">
              Empowering Data-Driven Solutions
            </text>
          </svg>
        `),
        top: 0,
        left: 0
      }])
      .toFile(path.join(publicDir, 'og-image-generated.png'));

    // For now, let's create a simple OG image with just the logo centered
    await sharp(logoPath)
      .resize(600, 600, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 10, alpha: 1 }
      })
      .extend({
        top: 15,
        bottom: 15,
        left: 300,
        right: 300,
        background: { r: 10, g: 10, b: 10, alpha: 1 }
      })
      .toFile(path.join(publicDir, 'og-image.png'));

    // Generate favicon.ico (32x32)
    console.log('🎨 Generating favicon.ico...');
    await sharp(logoPath)
      .resize(32, 32)
      .toFile(path.join(publicDir, 'favicon-32x32.png'));

    // Generate favicon-16x16.png
    await sharp(logoPath)
      .resize(16, 16)
      .toFile(path.join(publicDir, 'favicon-16x16.png'));

    // Generate Apple Touch Icon (180x180)
    console.log('🍎 Generating Apple Touch Icon...');
    await sharp(logoPath)
      .resize(180, 180)
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    // Generate Android Chrome icons
    console.log('🤖 Generating Android Chrome icons...');
    await sharp(logoPath)
      .resize(192, 192)
      .toFile(path.join(publicDir, 'android-chrome-192x192.png'));

    await sharp(logoPath)
      .resize(512, 512)
      .toFile(path.join(publicDir, 'android-chrome-512x512.png'));

    // Generate Safari Pinned Tab
    console.log('🧭 Generating Safari Pinned Tab...');
    await sharp(logoPath)
      .resize(512, 512)
      .toFile(path.join(publicDir, 'safari-pinned-tab.svg'));

    // Note: For a real favicon.ico, you'd need a tool that can create ICO format
    // For now, we'll copy the 32x32 PNG
    fs.copyFileSync(
      path.join(publicDir, 'favicon-32x32.png'),
      path.join(publicDir, 'favicon.ico')
    );

    console.log('✅ All images generated successfully!');
  } catch (error) {
    console.error('❌ Error generating images:', error);
  }
}

generateImages();