#!/usr/bin/env node
/**
 * Script de nettoyage des images orphelines
 * 
 * Usage:
 *   node cleanOrphans.js          → affiche les orphelins sans rien supprimer (dry run)
 *   node cleanOrphans.js --delete → supprime réellement les fichiers orphelins
 * 
 * Un fichier est "orphelin" si :
 *   - Il existe dans le dossier uploads/
 *   - Son nom n'apparaît dans AUCUNE url/url_large de produit_images NI dans carousel_images
 */

'use strict';

const path = require('path');
const fs   = require('fs');

// ─── Config ──────────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const DRY_RUN     = !process.argv.includes('--delete');

// ─── Bootstrap Sequelize (réutilise la config du projet) ─────────────────────
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { sequelize, ProduitImage, CarouselImage } = require('../models');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extrait le basename d'une URL stockée en base  ex: "/uploads/abc.webp" → "abc.webp" */
const basename = (url) => (url ? path.basename(url) : null);

/** Formate une taille en octets en Ko lisible */
const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('🧹 Boris IceBox — Nettoyage des images orphelines');
  console.log('─'.repeat(52));
  console.log(`Mode : ${DRY_RUN ? '🔍 DRY RUN (aucune suppression)' : '🗑️  SUPPRESSION RÉELLE'}`);
  console.log(`Dossier : ${UPLOADS_DIR}`);
  console.log('');

  // 1. Lire tous les fichiers présents sur le disque
  let diskFiles;
  try {
    diskFiles = await fs.promises.readdir(UPLOADS_DIR);
  } catch (err) {
    console.error(`❌ Impossible de lire le dossier uploads : ${err.message}`);
    process.exit(1);
  }

  // Ne garder que les images (sécurité : on ne touche pas aux autres fichiers)
  const imageFiles = diskFiles.filter(f => /\.(webp|jpg|jpeg|png|gif)$/i.test(f));
  console.log(`📁 Fichiers images sur le disque : ${imageFiles.length}`);

  // 2. Récupérer tous les noms de fichiers référencés en base de données
  await sequelize.authenticate();

  const [produitImages, carouselImages] = await Promise.all([
    ProduitImage.findAll({ attributes: ['url', 'url_large'] }),
    CarouselImage.findAll({ attributes: ['url'] }),
  ]);

  // Construire un Set de tous les basenames connus en BDD
  const knownFiles = new Set();

  for (const img of produitImages) {
    const thumb = basename(img.url);
    const large = basename(img.url_large);
    if (thumb) knownFiles.add(thumb);
    if (large) knownFiles.add(large);
  }

  for (const img of carouselImages) {
    const name = basename(img.url);
    if (name) knownFiles.add(name);
  }

  console.log(`🗄️  Fichiers référencés en base     : ${knownFiles.size}`);
  console.log('');

  // 3. Identifier les orphelins = présents sur disque mais absents de la BDD
  const orphans = imageFiles.filter(f => !knownFiles.has(f));

  if (orphans.length === 0) {
    console.log('✅ Aucun fichier orphelin trouvé. Tout est propre !');
    await sequelize.close();
    return;
  }

  // 4. Calculer la taille totale des orphelins
  let totalSize = 0;
  const orphanDetails = await Promise.all(
    orphans.map(async (filename) => {
      const filePath = path.join(UPLOADS_DIR, filename);
      try {
        const stat = await fs.promises.stat(filePath);
        totalSize += stat.size;
        return { filename, size: stat.size, filePath };
      } catch {
        return { filename, size: 0, filePath };
      }
    })
  );

  console.log(`⚠️  Fichiers orphelins trouvés : ${orphans.length}`);
  console.log(`💾 Espace récupérable         : ${formatKb(totalSize)}`);
  console.log('');
  console.log('Liste des orphelins :');
  orphanDetails.forEach(({ filename, size }) => {
    console.log(`  • ${filename.padEnd(55)} ${formatKb(size)}`);
  });
  console.log('');

  // 5. Suppression (seulement si --delete)
  if (DRY_RUN) {
    console.log('ℹ️  Mode DRY RUN : aucun fichier supprimé.');
    console.log('   Pour supprimer, relancez avec : node cleanOrphans.js --delete');
  } else {
    console.log('🗑️  Suppression en cours...');
    let deleted = 0;
    let errors  = 0;

    await Promise.all(
      orphanDetails.map(async ({ filename, filePath }) => {
        try {
          await fs.promises.unlink(filePath);
          console.log(`  ✅ Supprimé : ${filename}`);
          deleted++;
        } catch (err) {
          console.error(`  ❌ Erreur   : ${filename} → ${err.message}`);
          errors++;
        }
      })
    );

    console.log('');
    console.log(`Résultat : ${deleted} supprimé(s), ${errors} erreur(s)`);
    console.log(`Espace libéré : ${formatKb(totalSize)}`);
  }

  console.log('');
  await sequelize.close();
}

main().catch(async (err) => {
  console.error('❌ Erreur fatale :', err.message);
  try { await sequelize.close(); } catch {}
  process.exit(1);
});