/**
 * Compresse hero.png et og-image.jpg → WebP légers dans frontend-shop-nuxt/public/
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '../../frontend-shop-nuxt/public');

async function optimize(inputName, outputName, width, height, quality) {
  const input = path.join(publicDir, inputName);
  const output = path.join(publicDir, outputName);
  if (!fs.existsSync(input)) {
    console.log(`⏭️  ${inputName} introuvable, ignoré`);
    return;
  }
  const buffer = await sharp(input)
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
  fs.writeFileSync(output, buffer);
  const inKb = (fs.statSync(input).size / 1024).toFixed(1);
  const outKb = (buffer.length / 1024).toFixed(1);
  console.log(`✅ ${inputName} (${inKb} KB) → ${outputName} (${outKb} KB)`);
}

async function main() {
  await optimize('hero.png', 'hero.webp', 1920, 1080, 78);
  await optimize('og-image.jpg', 'og-image.webp', 1200, 630, 82);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
