const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) return cb(null, true);
    cb(new Error('Seules les images sont autorisées'));
  }
});

const MAX_SIZE = 150 * 1024; // 150 KB pour toutes les images

/**
 * Helper générique : essaie plusieurs configs (résolution + qualité)
 * du meilleur au moins bon, retourne la première qui passe sous MAX_SIZE.
 * Si aucune ne passe, retourne la dernière config (la plus compressée).
 */
const compressUnder = async (buffer, configs, maxSize = MAX_SIZE) => {
  let result;
  for (const { width, height, quality } of configs) {
    result = await sharp(buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    if (result.length <= maxSize) return result;
  }
  return result; // dernière config si rien n'a passé le seuil
};

/**
 * Vignette : 150 KB max, qualité aussi haute que possible en dessous.
 */
const compressThumb = async (buffer) => {
  return compressUnder(buffer, [
    { width: 800, height: 800, quality: 85 },
    { width: 700, height: 700, quality: 78 },
    { width: 600, height: 600, quality: 70 },
    { width: 500, height: 500, quality: 60 },
  ]);
};

/**
 * Grande image (fiche produit) : 150 KB max.
 * Résolution plus haute que la vignette, qualité ajustée pour tenir le seuil.
 */
const compressLarge = async (buffer) => {
  return compressUnder(buffer, [
    { width: 1600, height: 1600, quality: 80 },
    { width: 1400, height: 1400, quality: 70 },
    { width: 1200, height: 1200, quality: 62 },
    { width: 1000, height: 1000, quality: 55 },
  ]);
};

// Compression produits : vignette + grande image, 150 KB max chacune
const compressImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  const uploadDir = path.join(__dirname, '..', 'uploads');
  await fs.promises.mkdir(uploadDir, { recursive: true });

  try {
    await Promise.all(req.files.map(async (file) => {
      const base = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const thumbName = `${base}.webp`;
      const largeName = `${base}-large.webp`;
      const thumbPath = path.join(uploadDir, thumbName);
      const largePath = path.join(uploadDir, largeName);

      const [thumbBuffer, largeBuffer] = await Promise.all([
        compressThumb(file.buffer),
        compressLarge(file.buffer),
      ]);

      await Promise.all([
        fs.promises.writeFile(thumbPath, thumbBuffer),
        fs.promises.writeFile(largePath, largeBuffer),
      ]);

      const thumbKb = (thumbBuffer.length / 1024).toFixed(1);
      const largeKb = (largeBuffer.length / 1024).toFixed(1);
      console.log(`📸 ${file.originalname} → thumb ${thumbKb} KB, large ${largeKb} KB`);

      file.filename = thumbName;
      file.largeFilename = largeName;
      file.path = thumbPath;
      file.destination = uploadDir;
      file.size = thumbBuffer.length;
      file.mimetype = 'image/webp';
    }));

    next();
  } catch (error) {
    console.error('Erreur compression:', error);
    next(error);
  }
};

// Compression pour le carrousel : 150 KB max
const compressCarousel = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  const uploadDir = path.join(__dirname, '..', 'uploads');
  await fs.promises.mkdir(uploadDir, { recursive: true });

  try {
    await Promise.all(req.files.map(async (file) => {
      const uniqueName = 'carousel-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + '.webp';
      const outputPath = path.join(uploadDir, uniqueName);

      const result = await compressUnder(file.buffer, [
        { width: 1920, height: 1080, quality: 80 },
        { width: 1600, height: 900,  quality: 70 },
        { width: 1280, height: 720,  quality: 60 },
        { width: 1024, height: 576,  quality: 50 },
      ]);

      await fs.promises.writeFile(outputPath, result);

      const finalKb = (result.length / 1024).toFixed(1);
      console.log(`🎠 Carrousel: ${file.originalname} → ${finalKb} KB`);

      file.filename = uniqueName;
      file.path = outputPath;
      file.destination = uploadDir;
      file.size = result.length;
      file.mimetype = 'image/webp';
    }));

    next();
  } catch (error) {
    console.error('Erreur compression carrousel:', error);
    next(error);
  }
};

module.exports = { upload, compressImages, compressCarousel };