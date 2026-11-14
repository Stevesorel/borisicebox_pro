const path = require('path');
const fs   = require('fs');
const { Op } = require('sequelize');
const { Produit, Categorie, ProduitImage } = require('../models');
const { loadProductsFromDB } = require('./chat.controller');
const fail = require('../utils/errorResponse');
const { writeAdminAudit } = require('../utils/adminAudit');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const IMAGE_ATTRS = ['id', 'url', 'url_large', 'ordre', 'couleur', 'couleur_hex'];

// ✅ Suppression async — ne bloque plus le thread Node.js
const unlinkUpload = async (url) => {
  if (!url) return;
  const filePath = path.join(__dirname, '../uploads', path.basename(url));
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    // ENOENT = fichier déjà absent → pas une erreur critique
    if (err.code !== 'ENOENT') {
      console.error(`Erreur suppression fichier ${filePath}:`, err.message);
    }
  }
};

// ✅ Suppression async des deux fichiers (thumb + large) en parallèle
const unlinkProductImage = async (image) => {
  await Promise.all([
    unlinkUpload(image?.url),
    unlinkUpload(image?.url_large),
  ]);
};

const mainImagePayload = (image) => ({
  image_principale: image?.url || null,
  image_principale_large: image?.url_large || image?.url || null,
});

const parseIds = (raw) => {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map(v => parseInt(v, 10))
    .filter(v => Number.isFinite(v) && v > 0);
};

exports.getAll = async (req, res) => {
  try {
    const pageRaw  = parseInt(req.query.page, 10);
    const limitRaw = parseInt(req.query.limit, 10);
    const page     = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit    = Math.min(
      100,
      Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 24
    );
    const offset   = (page - 1) * limit;

    const q = (req.query.q || '').toString().trim();
    const categorie = parseInt(req.query.categorie, 10);
    const actif = req.query.actif;
    const exclude = parseInt(req.query.exclude, 10);
    const prixMax = parseFloat(req.query.prix_max);

    const baseWhere = {};
    if (q) baseWhere.nom = { [Op.iLike]: `%${q}%` };
    if (Number.isFinite(categorie) && categorie > 0) baseWhere.categorie_id = categorie;
    if (actif === '1' || actif === 'true') baseWhere.actif = true;
    if (actif === '0' || actif === 'false') baseWhere.actif = false;
    if (Number.isFinite(exclude) && exclude > 0) baseWhere.id = { [Op.ne]: exclude };

    const where = { ...baseWhere };
    if (Number.isFinite(prixMax) && prixMax >= 0) {
      where.prix_base = { [Op.lte]: prixMax };
    }

    const { count, rows } = await Produit.findAndCountAll({
      where,
      include: [
        { model: Categorie, attributes: ['id', 'nom'] },
      ],
      order:  [['createdAt', 'DESC']],
      limit,
      offset
    });

    const maxPrix = await Produit.max('prix_base', { where: baseWhere });

    res.json({
      produits: rows,
      total:    count,
      page,
      pages:    Math.ceil(count / limit),
      limit,
      max_prix: Number(maxPrix || 0)
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.getOne = async (req, res) => {
  try {
    const produit = await Produit.findByPk(req.params.id, {
      include: [
        { model: Categorie,    attributes: ['id', 'nom'] },
        { model: ProduitImage, as: 'images', attributes: IMAGE_ATTRS }
      ]
    });
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(produit);
  } catch (err) {
    fail(res, err);
  }
};

exports.create = async (req, res) => {
  try {
    const {
      categorie_id, nom, slug, marque, description, prix_base,
      prix_promo, promo_label, promo_debut, promo_fin,
      prix_gros_actif, prix_gros_min_quantite, prix_gros,
      actif, personnalisable, frais_personnalisation
    } = req.body;
    const produit = await Produit.create({
      categorie_id, nom, slug, marque, description, prix_base,
      prix_promo: prix_promo || null,
      promo_label: promo_label || null,
      promo_debut: promo_debut || null,
      promo_fin: promo_fin || null,
      prix_gros_actif,
      prix_gros_min_quantite: prix_gros_min_quantite || null,
      prix_gros: prix_gros || null,
      actif, personnalisable, frais_personnalisation
    });

    if (req.files && req.files.length > 0) {
      let couleurs = [], couleurHexs = [];
      try { couleurs    = JSON.parse(req.body.couleurs    || '[]'); } catch { couleurs    = []; }
      try { couleurHexs = JSON.parse(req.body.couleur_hexs || '[]'); } catch { couleurHexs = []; }

      const images = [];
      for (let i = 0; i < req.files.length; i++) {
        const url = `/uploads/${req.files[i].filename}`;
        const url_large = req.files[i].largeFilename
          ? `/uploads/${req.files[i].largeFilename}`
          : url;
        const img = await ProduitImage.create({
          produit_id:  produit.id,
          url,
          url_large,
          ordre:       i,
          couleur:     couleurs[i]    || null,
          couleur_hex: couleurHexs[i] || null,
        });
        images.push(img);
      }
      const mainImageIndex = Math.max(0, Math.floor(Number(req.body.main_image_index) || 0));
      const mainImage = images[mainImageIndex] || images[0];
      if (mainImage) await produit.update(mainImagePayload(mainImage));
    }

    const result = await Produit.findByPk(produit.id, {
      include: [
        { model: Categorie,    attributes: ['id', 'nom'] },
        { model: ProduitImage, as: 'images', attributes: IMAGE_ATTRS }
      ]
    });

    const io = req.app.get('io');
    io.to('shop').emit('produit:added', result);
    io.to('admin').emit('produit:added', result);

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'produit',
      entityId: result.id,
      action: 'produit_created',
      meta: { nom: result.nom, slug: result.slug, categorie_id: result.categorie_id, prix_base: result.prix_base, actif: result.actif }
    });

    loadProductsFromDB();
    res.status(201).json(result);
  } catch (err) {
    fail(res, err);
  }
};

const UPDATABLE_FIELDS = [
  'categorie_id', 'nom', 'slug', 'marque', 'description',
  'prix_base', 'prix_promo', 'promo_label', 'promo_debut', 'promo_fin',
  'prix_gros_actif', 'prix_gros_min_quantite', 'prix_gros',
  'actif', 'personnalisable', 'frais_personnalisation', 'image_principale'
];

exports.update = async (req, res) => {
  try {
    const produit = await Produit.findByPk(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

    const data = {};
    for (const f of UPDATABLE_FIELDS) {
      if (req.body[f] !== undefined) data[f] = req.body[f];
    }
    ['prix_promo', 'promo_label', 'promo_debut', 'promo_fin', 'prix_gros_min_quantite', 'prix_gros'].forEach((f) => {
      if (data[f] === '') data[f] = null;
    });
    if (data.image_principale) {
      const image = await ProduitImage.findOne({
        where: { produit_id: produit.id, url: data.image_principale }
      });
      if (!image) return res.status(400).json({ message: 'Image principale invalide pour ce produit' });
      data.image_principale_large = image.url_large || image.url;
    }
    await produit.update(data);

    const result = await Produit.findByPk(produit.id, {
      include: [
        { model: Categorie,    attributes: ['id', 'nom'] },
        { model: ProduitImage, as: 'images', attributes: IMAGE_ATTRS }
      ]
    });

    const io = req.app.get('io');
    io.to('shop').emit('produit:updated', result);
    io.to('admin').emit('produit:updated', result);

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'produit',
      entityId: result.id,
      action: 'produit_updated',
      meta: { updated_fields: Object.keys(data), nom: result.nom, slug: result.slug, categorie_id: result.categorie_id, prix_base: result.prix_base, actif: result.actif }
    });

    loadProductsFromDB();
    res.json(result);
  } catch (err) {
    fail(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    const produit = await Produit.findByPk(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

    const images = await ProduitImage.findAll({ where: { produit_id: produit.id } });

    // ✅ Suppression de toutes les images en parallèle (thumb + large pour chaque)
    await Promise.all(images.map(img => unlinkProductImage(img)));
    await Promise.all(images.map(img => img.destroy()));

    const produitId = produit.id;
    const deletedMeta = {
      nom: produit.nom,
      slug: produit.slug,
      categorie_id: produit.categorie_id,
      image_principale: produit.image_principale || null
    };
    await produit.destroy();

    const io = req.app.get('io');
    io.to('shop').emit('produit:removed', { id: produitId });
    io.to('admin').emit('produit:removed', { id: produitId });

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'produit',
      entityId: produitId,
      action: 'produit_deleted',
      meta: deletedMeta
    });

    loadProductsFromDB();
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    fail(res, err);
  }
};

exports.addImages = async (req, res) => {
  try {
    const produit = await Produit.findByPk(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ message: 'Aucune image envoyée' });

    let couleurs = [], couleurHexs = [];
    try { couleurs    = JSON.parse(req.body.couleurs    || '[]'); } catch { couleurs    = []; }
    try { couleurHexs = JSON.parse(req.body.couleur_hexs || '[]'); } catch { couleurHexs = []; }

    const existingCount = await ProduitImage.count({ where: { produit_id: produit.id } });
    const images = [];
    for (let i = 0; i < files.length; i++) {
      const url = `/uploads/${files[i].filename}`;
      const url_large = files[i].largeFilename
        ? `/uploads/${files[i].largeFilename}`
        : url;
      const img = await ProduitImage.create({
        produit_id:  produit.id,
        url,
        url_large,
        ordre:       existingCount + i,
        couleur:     couleurs[i]    || null,
        couleur_hex: couleurHexs[i] || null,
      });
      images.push(img);
    }

    const mainImageIndex = Number(req.body.main_image_index);
    const selectedMainImage = Number.isInteger(mainImageIndex) && mainImageIndex >= 0
      ? images[mainImageIndex]
      : null;
    const nextMain = selectedMainImage || (!produit.image_principale ? images[0] : null);
    if (nextMain) await produit.update(mainImagePayload(nextMain));

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'produit',
      entityId: produit.id,
      action: 'produit_images_added',
      meta: { count: images.length, image_ids: images.map(i => i.id), image_urls: images.map(i => i.url) }
    });

    res.status(201).json(images);
  } catch (err) {
    fail(res, err);
  }
};

exports.removeImage = async (req, res) => {
  try {
    const produit = await Produit.findByPk(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

    const image = await ProduitImage.findOne({
      where: { id: req.params.imageId, produit_id: produit.id }
    });
    if (!image) return res.status(404).json({ message: 'Image non trouvée' });

    const wasMain = produit.image_principale === image.url;
    const removedImageMeta = {
      image_id: image.id,
      image_url: image.url,
      was_main: wasMain
    };

    // ✅ Suppression async (thumb + large en parallèle)
    await unlinkProductImage(image);
    await image.destroy();

    if (wasMain) {
      const next = await ProduitImage.findOne({
        where: { produit_id: produit.id },
        order: [['ordre', 'ASC'], ['id', 'ASC']]
      });
      await produit.update(next ? mainImagePayload(next) : { image_principale: null, image_principale_large: null });
      removedImageMeta.new_main_image = next ? next.url : null;
    }

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'produit',
      entityId: produit.id,
      action: 'produit_image_deleted',
      meta: removedImageMeta
    });

    res.json({ message: 'Image supprimée' });
  } catch (err) {
    fail(res, err);
  }
};

exports.updateImage = async (req, res) => {
  try {
    const produit = await Produit.findByPk(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

    const image = await ProduitImage.findOne({
      where: { id: req.params.imageId, produit_id: produit.id }
    });
    if (!image) return res.status(404).json({ message: 'Image non trouvée' });

    const payload = {};
    if (req.body.couleur !== undefined) {
      payload.couleur = req.body.couleur ? String(req.body.couleur).trim().substring(0, 50) : null;
    }
    if (req.body.couleur_hex !== undefined) {
      const hex = req.body.couleur_hex ? String(req.body.couleur_hex).trim() : '';
      payload.couleur_hex = /^#([0-9a-fA-F]{6})$/.test(hex) ? hex : null;
    }

    const changedFields = Object.keys(payload).filter((field) => {
      const prev = image[field] ?? null;
      const next = payload[field] ?? null;
      return prev !== next;
    });
    if (!changedFields.length) return res.json(image);

    const effectivePayload = {};
    changedFields.forEach((field) => { effectivePayload[field] = payload[field]; });

    await image.update(effectivePayload);

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'produit',
      entityId: produit.id,
      action: 'produit_image_updated',
      meta: { image_id: image.id, image_url: image.url, updated_fields: changedFields, couleur: image.couleur || null, couleur_hex: image.couleur_hex || null }
    });

    res.json(image);
  } catch (err) {
    fail(res, err);
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const ids = parseIds(req.query.ids);
    const where = ids.length ? { id: { [Op.in]: ids } } : {};

    const produits = await Produit.findAll({
      where,
      include: [{ model: Categorie, attributes: ['id', 'nom'] }],
      order: [['createdAt', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Produits');

    sheet.columns = [
      { header: 'ID',        key: 'id',        width: 8  },
      { header: 'Nom',       key: 'nom',        width: 30 },
      { header: 'Slug',      key: 'slug',       width: 28 },
      { header: 'Catégorie', key: 'categorie',  width: 20 },
      { header: 'Marque',    key: 'marque',     width: 20 },
      { header: 'Prix',      key: 'prix',       width: 14 },
      { header: 'Actif',     key: 'actif',      width: 10 },
      { header: 'Date',      key: 'date',       width: 14 }
    ];

    produits.forEach(p => {
      sheet.addRow({
        id:        p.id,
        nom:       p.nom,
        slug:      p.slug,
        categorie: p.Categorie?.nom || '-',
        marque:    p.marque || '-',
        prix:      `${Number(p.prix_base).toLocaleString('fr-FR')} FCFA`,
        actif:     p.actif ? 'Oui' : 'Non',
        date:      new Date(p.createdAt).toLocaleDateString('fr-FR')
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=produits.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    fail(res, err, 'Erreur export produits');
  }
};

exports.exportPdf = async (req, res) => {
  try {
    const ids = parseIds(req.query.ids);
    const where = ids.length ? { id: { [Op.in]: ids } } : {};

    const produits = await Produit.findAll({
      where,
      include: [{ model: Categorie, attributes: ['id', 'nom'] }],
      order: [['createdAt', 'DESC']]
    });

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=produits.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Boris IceBox - Produits', { align: 'center' });
    doc.moveDown();

    const startX = 20;
    let y = doc.y;
    const cols = [
      { label: 'ID',        w: 40  },
      { label: 'Nom',       w: 160 },
      { label: 'Catégorie', w: 110 },
      { label: 'Marque',    w: 100 },
      { label: 'Prix',      w: 90  },
      { label: 'Actif',     w: 60  },
      { label: 'Date',      w: 90  }
    ];

    doc.fontSize(9).font('Helvetica-Bold');
    let x = startX;
    cols.forEach(col => {
      doc.text(col.label, x, y, { width: col.w, align: 'left' });
      x += col.w;
    });
    doc.moveDown(0.5);
    y = doc.y;
    doc.moveTo(startX, y).lineTo(startX + cols.reduce((a, c) => a + c.w, 0), y).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(8);
    produits.forEach(p => {
      y = doc.y;
      x = startX;
      if (y > 520) { doc.addPage(); y = 30; }

      const row = [
        String(p.id),
        (p.nom || '-').substring(0, 28),
        p.Categorie?.nom || '-',
        (p.marque || '-').substring(0, 18),
        `${Number(p.prix_base).toLocaleString('fr-FR')} F`,
        p.actif ? 'Oui' : 'Non',
        new Date(p.createdAt).toLocaleDateString('fr-FR')
      ];

      row.forEach((val, i) => {
        doc.text(val, x, y, { width: cols[i].w, align: 'left' });
        x += cols[i].w;
      });
      doc.moveDown(0.3);
    });

    doc.end();
  } catch (err) {
    fail(res, err, 'Erreur export PDF produits');
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const produit = await Produit.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: Categorie,    attributes: ['id', 'nom'] },
        { model: ProduitImage, as: 'images', attributes: IMAGE_ATTRS }
      ]
    });
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(produit);
  } catch (err) {
    fail(res, err);
  }
};