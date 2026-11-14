const { PageAccueil, CarouselImage } = require('../models');
const fail = require('../utils/errorResponse');
const path = require('path');
const fs   = require('fs');
const { writeAdminAudit } = require('../utils/adminAudit');

const DEFAULTS = {
  hero_badge:        '🚚 Livraison rapide à Yaoundé',
  hero_titre_1:      'Bienvenue chez',
  hero_titre_2:      'Boris IceBox',
  hero_titre_em:     'Yaoundé',
  hero_desc:         'Découvrez notre collection exclusive de bijoux et accessoires.',
  hero_promo:        '🎉 Livraison gratuite dès 50000 FCFA',
  nouveautes_titre:  'Fraîchement arrivés,',
  nouveautes_em:     'rien que pour vous',
  nouveautes_desc:   'Découvrez nos dernières pépites sélectionnées avec soin.',
  avantage_1_icon:   '🚚',
  avantage_1_titre:  'Livraison rapide',
  avantage_1_desc:   'Livraison en 24h à Yaoundé et environs.',
  avantage_2_icon:   '✅',
  avantage_2_titre:  'Qualité vérifiée',
  avantage_2_desc:   'Tous nos produits sont soigneusement sélectionnés.',
  avantage_3_icon:   '🔒',
  avantage_3_titre:  'Paiement sécurisé',
  avantage_3_desc:   'MTN Money, Orange Money et paiement à la livraison.',
  avantage_4_icon:   '💬',
  avantage_4_titre:  'Support 7j/7',
  avantage_4_desc:   'Notre équipe est disponible pour vous aider.',
};

const DEFAULTS_EN = {
  hero_badge_en:        '🚚 Fast delivery in Yaounde',
  hero_titre_1_en:      'Welcome to',
  hero_titre_2_en:      'Boris IceBox',
  hero_titre_em_en:     'Yaounde',
  hero_desc_en:         'Discover our exclusive collection of jewelry and accessories.',
  hero_promo_en:        '🎉 Free delivery from 50,000 FCFA',
  nouveautes_titre_en:  'Freshly arrived,',
  nouveautes_em_en:     'just for you',
  nouveautes_desc_en:   'Discover our latest carefully selected gems.',
  avantage_1_icon_en:   '🚚',
  avantage_1_titre_en:  'Fast delivery',
  avantage_1_desc_en:   '24h delivery in Yaounde and nearby areas.',
  avantage_2_icon_en:   '✅',
  avantage_2_titre_en:  'Verified quality',
  avantage_2_desc_en:   'All our products are carefully selected.',
  avantage_3_icon_en:   '🔒',
  avantage_3_titre_en:  'Secure payment',
  avantage_3_desc_en:   'MTN Money, Orange Money and cash on delivery.',
  avantage_4_icon_en:   '💬',
  avantage_4_titre_en:  '7/7 support',
  avantage_4_desc_en:   'Our team is available to help you.',
};

const ALLOWED_CONFIG_KEYS = new Set([
  ...Object.keys(DEFAULTS),
  ...Object.keys(DEFAULTS_EN)
]);

const MAX_VALUE_LENGTH = 500;

const normalizeConfigPayload = (config) => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    const err = new Error('Configuration invalide');
    err.statusCode = 400;
    throw err;
  }

  const normalized = {};
  for (const [cle, valeur] of Object.entries(config)) {
    if (!ALLOWED_CONFIG_KEYS.has(cle)) {
      const err = new Error(`Clé de configuration non autorisée: ${cle}`);
      err.statusCode = 400;
      throw err;
    }
    const safeValue = valeur === null || valeur === undefined ? '' : String(valeur).trim();
    if (safeValue.length > MAX_VALUE_LENGTH) {
      const err = new Error(`Valeur trop longue pour ${cle}`);
      err.statusCode = 400;
      throw err;
    }
    normalized[cle] = safeValue;
  }
  return normalized;
};

const normalizeCarouselOrder = async (transaction = null) => {
  const images = await CarouselImage.findAll({
    order: [['ordre', 'ASC'], ['id', 'ASC']],
    transaction
  });
  for (let i = 0; i < images.length; i++) {
    if (images[i].ordre !== i) {
      await images[i].update({ ordre: i }, { transaction });
    }
  }
  return images;
};

// ✅ Suppression async du fichier carousel
const unlinkCarousel = async (url) => {
  if (!url) return;
  const filePath = path.join(__dirname, '../uploads', path.basename(url));
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Erreur suppression carousel ${filePath}:`, err.message);
    }
  }
};

exports.getConfig = async (req, res) => {
  try {
    const rows = await PageAccueil.findAll();
    const config = { ...DEFAULTS, ...DEFAULTS_EN };
    rows.forEach(r => { config[r.cle] = r.valeur; });
    const carousel = await CarouselImage.findAll({ order: [['ordre', 'ASC']] });
    res.json({ config, carousel });
  } catch (err) {
    fail(res, err);
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const config = normalizeConfigPayload(req.body?.config);
    for (const [cle, valeur] of Object.entries(config)) {
      await PageAccueil.upsert({ cle, valeur });
    }

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'page_accueil',
      entityId: 1,
      action: 'page_accueil_updated',
      meta: { changed_keys: Object.keys(config || {}) }
    });

    res.json({ message: 'Configuration sauvegardée', config });
  } catch (err) {
    fail(res, err, err.message || 'Erreur serveur', err.statusCode || 500);
  }
};

exports.uploadCarousel = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'Aucune image envoyée' });

    const maxOrder = await CarouselImage.max('ordre');
    const startOrder = Number.isFinite(Number(maxOrder)) ? Number(maxOrder) + 1 : 0;
    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      const url = `/uploads/${req.files[i].filename}`;
      const img = await CarouselImage.create({ url, ordre: startOrder + i });
      images.push(img);
    }

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'page_accueil',
      entityId: 1,
      action: 'carousel_images_uploaded',
      meta: { count: images.length, image_ids: images.map(i => i.id), image_urls: images.map(i => i.url) }
    });

    res.status(201).json(images);
  } catch (err) {
    fail(res, err);
  }
};

exports.deleteCarousel = async (req, res) => {
  try {
    const img = await CarouselImage.findByPk(req.params.id);
    if (!img) return res.status(404).json({ message: 'Image non trouvée' });

    const deletedMeta = { image_id: img.id, image_url: img.url, ordre: img.ordre };

    // ✅ Suppression async — ne bloque plus le thread Node.js
    await unlinkCarousel(img.url);
    await img.destroy();
    await normalizeCarouselOrder();

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'page_accueil',
      entityId: 1,
      action: 'carousel_image_deleted',
      meta: deletedMeta
    });

    res.json({ message: 'Image supprimée' });
  } catch (err) {
    fail(res, err);
  }
};

exports.reorderCarousel = async (req, res) => {
  try {
    const { ordre } = req.body;
    if (!Array.isArray(ordre) || ordre.length === 0) {
      return res.status(400).json({ message: 'Ordre invalide' });
    }

    const ids = ordre.map(item => Number(item?.id));
    if (ids.some(id => !Number.isInteger(id) || id <= 0) || new Set(ids).size !== ids.length) {
      return res.status(400).json({ message: 'Images invalides' });
    }

    const existing = await CarouselImage.findAll({ where: { id: ids } });
    if (existing.length !== ids.length) {
      return res.status(400).json({ message: 'Certaines images sont introuvables' });
    }

    const byId = new Map(existing.map(img => [img.id, img]));
    for (let index = 0; index < ids.length; index++) {
      await byId.get(ids[index]).update({ ordre: index });
    }

    await normalizeCarouselOrder();

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'page_accueil',
      entityId: 1,
      action: 'carousel_reordered',
      meta: { items: Array.isArray(ordre) ? ordre.slice(0, 100) : [] }
    });

    res.json({ message: 'Ordre mis à jour' });
  } catch (err) {
    fail(res, err);
  }
};