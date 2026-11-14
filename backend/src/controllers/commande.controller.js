const db = require('../models');
const { Commande, CommandeDetail, Client, ZoneLivraison, Produit, AdminAuditLog, Admin } = db;
const fail = require('../utils/errorResponse');
const { writeAdminAudit } = require('../utils/adminAudit');
const { Op } = require('sequelize');

const ExcelJS = require('exceljs');

const PDFDocument = require('pdfkit');

const parseIds = (raw) => {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map(v => parseInt(v, 10))
    .filter(v => Number.isFinite(v) && v > 0);
};

const STATUTS = ['en_attente', 'confirmee', 'livree', 'annulee'];
const STATUT_TRANSITIONS = {
  en_attente: ['confirmee', 'annulee'],
  confirmee: ['livree', 'annulee'],
  livree: [],
  annulee: []
};

const canTransition = (from, to) => from === to || (STATUT_TRANSITIONS[from] || []).includes(to);

const hasActivePromotion = (produit) => {
  const prixPromo = Number(produit.prix_promo);
  const prixBase = Number(produit.prix_base);
  if (!prixPromo || !prixBase || prixPromo >= prixBase) return false;
  const now = Date.now();
  const debut = produit.promo_debut ? new Date(produit.promo_debut).getTime() : null;
  const fin = produit.promo_fin ? new Date(produit.promo_fin).getTime() : null;
  return (!debut || debut <= now) && (!fin || fin >= now);
};

const hasWholesalePrice = (produit, quantite) => {
  const min = Number(produit.prix_gros_min_quantite);
  const prixGros = Number(produit.prix_gros);
  const prixStandard = hasActivePromotion(produit) ? Number(produit.prix_promo) : Number(produit.prix_base);
  return Boolean(produit.prix_gros_actif)
    && Number.isInteger(min)
    && min > 1
    && Number(quantite) >= min
    && prixGros > 0
    && prixGros < prixStandard;
};

const getPrixActif = (produit, quantite = 1) =>
  hasWholesalePrice(produit, quantite)
    ? Number(produit.prix_gros)
    : (hasActivePromotion(produit) ? Number(produit.prix_promo) : Number(produit.prix_base));

const serializeAudit = (entry) => ({
  id: entry.id,
  action: entry.action,
  meta: entry.meta || null,
  createdAt: entry.createdAt,
  admin: entry.Admin ? {
    id: entry.Admin.id,
    nom: entry.Admin.nom,
    email: entry.Admin.email
  } : null
});

const fetchCommandeAudits = async (commandeId) => {
  const logs = await AdminAuditLog.findAll({
    where: { entity_type: 'commande', entity_id: commandeId },
    include: [{ model: Admin, attributes: ['id', 'nom', 'email'] }],
    order: [['createdAt', 'DESC']]
  });
  return logs.map(serializeAudit);
};


exports.getAll = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)   || 1;
    const limit  = parseInt(req.query.limit)  || 10;
    const statut = req.query.statut           || null;
    const offset = (page - 1) * limit;

    const where = statut ? { statut } : {};

    const { count, rows } = await Commande.findAndCountAll({
      where,
      include: [
        { model: Client },
        { model: ZoneLivraison },
        { model: CommandeDetail, include: [{ model: Produit, attributes: ['id', 'nom', 'image_principale'] }] }
      ],
      order:  [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      commandes: rows,
      total:     count,
      page,
      pages:     Math.ceil(count / limit),
      limit
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.getOne = async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id, {
      include: [
        { model: Client },
        { model: ZoneLivraison },
        { model: CommandeDetail, include: [{ model: Produit }] }
      ]
    });
    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });
    const audit_logs = await fetchCommandeAudits(commande.id);
    res.json({
      ...commande.toJSON(),
      allowed_next_statuts: STATUT_TRANSITIONS[commande.statut] || [],
      audit_logs
    });
  } catch (err) {
    fail(res, err);
  }
};


exports.create = async (req, res) => {
  try {
    const { nom_client, telephone, email, adresse, zone_id, produits } = req.body;

    const zone = await ZoneLivraison.findByPk(zone_id);
    if (!zone) return res.status(404).json({ message: 'Zone non trouvée' });

    let total = parseFloat(zone.frais);
    const details = [];
    const quantitesParProduit = produits.reduce((acc, item) => {
      const produitId = Number(item.produit_id);
      const quantite = Math.max(1, Math.floor(Number(item.quantite) || 1));
      acc[produitId] = (acc[produitId] || 0) + quantite;
      return acc;
    }, {});

    for (const item of produits) {
      const produit = await Produit.findByPk(item.produit_id);
      if (!produit) return res.status(404).json({ message: `Produit ${item.produit_id} non trouvé` });

      // Calcul frais personnalisation
      const veut_personnalisation = produit.personnalisable && item.personnalisation?.trim();
      const frais_perso = veut_personnalisation ? parseFloat(produit.frais_personnalisation) : 0;

      const quantite = Math.max(1, Math.floor(Number(item.quantite) || 1));
      const prix_unitaire = getPrixActif(produit, quantitesParProduit[produit.id] || quantite) + frais_perso;
      const prix_total    = prix_unitaire * quantite;
      total += prix_total;

      details.push({
        produit_id:             produit.id,
        nom_produit:            produit.nom,
        image_produit:          item.image_produit ? String(item.image_produit).trim().substring(0, 500) : (produit.image_principale || null),
        prix_unitaire:          prix_unitaire,
        quantite,
        prix_total,
        couleur:                item.couleur ? item.couleur.trim().substring(0, 50) : null,
        personnalisation:       veut_personnalisation ? item.personnalisation.trim() : null,
        frais_personnalisation: frais_perso
      });
    }

    // Tout dans une transaction : client + commande + détails sont atomiques.
    const commande = await db.sequelize.transaction(async (t) => {
      let client = await Client.findOne({ where: { telephone }, transaction: t });
      if (!client) client = await Client.create({ nom: nom_client, telephone, email }, { transaction: t });

      // Référence provisoire puis basée sur l'id auto-incrémenté → unicité garantie, sans collision.
      const cmd = await Commande.create({
        reference: `TMP-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        client_id: client.id, zone_id,
        nom_client, telephone, email, adresse, total
      }, { transaction: t });

      await cmd.update({ reference: `BOX${new Date().getFullYear()}${cmd.id}` }, { transaction: t });

      for (const d of details) {
        await CommandeDetail.create({ ...d, commande_id: cmd.id }, { transaction: t });
      }

      return cmd;
    });

    // Notification temps réel pour l'admin (cohérent avec les commandes WhatsApp).
    const io = req.app.get('io');
    io.to('admin').emit('commande:new', { ...commande.toJSON(), details });

    await writeAdminAudit({
      adminId: null,
      entityType: 'commande',
      entityId: commande.id,
      action: 'created',
      meta: { statut: 'en_attente', source: 'shop' }
    });

    res.status(201).json({ ...commande.toJSON(), details });
  } catch (err) {
    fail(res, err);
  }
};






exports.updateStatut = async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });

    const nextStatut = String(req.body.statut || '').trim();
    if (!STATUTS.includes(nextStatut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const noteAdmin = req.body.note_admin !== undefined
      ? String(req.body.note_admin || '').trim().substring(0, 500)
      : '';

    const fromStatut = commande.statut;
    if (!canTransition(fromStatut, nextStatut)) {
      return res.status(400).json({
        message: `Transition interdite: ${fromStatut} -> ${nextStatut}`,
        allowed_next_statuts: STATUT_TRANSITIONS[fromStatut] || []
      });
    }

    if (fromStatut !== 'annulee' && nextStatut === 'annulee' && !noteAdmin) {
      return res.status(400).json({ message: "Le motif d'annulation est obligatoire" });
    }

    if (fromStatut !== nextStatut) {
      await commande.update({ statut: nextStatut });
      await writeAdminAudit({
        adminId: req.admin?.id || null,
        entityType: 'commande',
        entityId: commande.id,
        action: 'status_changed',
        meta: { from: fromStatut, to: nextStatut, note_admin: noteAdmin || null }
      });
    } else if (noteAdmin) {
      await writeAdminAudit({
        adminId: req.admin?.id || null,
        entityType: 'commande',
        entityId: commande.id,
        action: 'note_added',
        meta: { note_admin: noteAdmin }
      });
    }

    res.json({
      ...commande.toJSON(),
      allowed_next_statuts: STATUT_TRANSITIONS[commande.statut] || []
    });
  } catch (err) {
    fail(res, err);
  }
};


exports.remove = async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'commande',
      entityId: commande.id,
      action: 'deleted',
      meta: { reference: commande.reference, statut: commande.statut }
    });

    // Supprimer d'abord les détails
    await CommandeDetail.destroy({ where: { commande_id: commande.id } });
    // Puis la commande
    await commande.destroy();
    
    res.json({ message: 'Commande supprimée' });
  } catch (err) {
    fail(res, err);
  }
};


exports.exportExcel = async (req, res) => {
  try {
    const ids = parseIds(req.query.ids);
    const where = ids.length ? { id: { [Op.in]: ids } } : {};

    const commandes = await Commande.findAll({
      where,
      include: [
        { model: Client },
        { model: ZoneLivraison },
        { model: CommandeDetail }
      ],
      order: [['createdAt', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Commandes');

    sheet.columns = [
      { header: 'Référence', key: 'reference', width: 15 },
      { header: 'Client', key: 'client', width: 20 },
      { header: 'Téléphone', key: 'telephone', width: 15 },
      { header: 'Adresse', key: 'adresse', width: 25 },
      { header: 'Zone', key: 'zone', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Statut', key: 'statut', width: 15 },
      { header: 'Date', key: 'date', width: 20 }
    ];

    commandes.forEach(c => {
      sheet.addRow({
        reference: c.reference,
        client: c.nom_client,
        telephone: c.telephone,
        adresse: c.adresse,
        zone: c.ZoneLivraison?.nom || '-',
        total: `${Number(c.total).toLocaleString('fr-FR')} FCFA`,
        statut: c.statut,
        date: new Date(c.createdAt).toLocaleDateString('fr-FR')
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=commandes.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    fail(res, err, 'Erreur export');
  }
};

exports.exportPdf = async (req, res) => {
  try {
    const ids = parseIds(req.query.ids);
    const where = ids.length ? { id: { [Op.in]: ids } } : {};

    const commandes = await Commande.findAll({
      where,
      include: [
        { model: Client },
        { model: ZoneLivraison },
        { model: CommandeDetail }
      ],
      order: [['createdAt', 'DESC']]
    });

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=commandes.pdf');
    doc.pipe(res);

    // Titre
    doc.fontSize(18).text('Boris IceBox - Commandes', { align: 'center' });
    doc.moveDown();

    // En-têtes
    const startX = 20;
    let y = doc.y;
    const cols = [
      { label: 'Référence', w: 80 },
      { label: 'Client', w: 100 },
      { label: 'Téléphone', w: 90 },
      { label: 'Adresse', w: 120 },
      { label: 'Zone', w: 80 },
      { label: 'Total', w: 80 },
      { label: 'Statut', w: 80 },
      { label: 'Date', w: 90 }
    ];

    doc.fontSize(9).font('Helvetica-Bold');
    let x = startX;
    cols.forEach(col => {
      doc.text(col.label, x, y, { width: col.w, align: 'left' });
      x += col.w;
    });
    doc.moveDown(0.5);
    
    // Ligne
    y = doc.y;
    doc.moveTo(startX, y).lineTo(startX + cols.reduce((a, c) => a + c.w, 0), y).stroke();
    doc.moveDown(0.5);

    // Données
    doc.font('Helvetica').fontSize(8);
    commandes.forEach(c => {
      y = doc.y;
      x = startX;
      
      // Vérifier si on change de page
      if (y > 520) {
        doc.addPage();
        y = 30;
      }

      const row = [
        c.reference,
        c.nom_client?.substring(0, 15) || '-',
        c.telephone,
        c.adresse?.substring(0, 20) || '-',
        c.ZoneLivraison?.nom || '-',
        `${Number(c.total).toLocaleString('fr-FR')} F`,
        c.statut,
        new Date(c.createdAt).toLocaleDateString('fr-FR')
      ];

      row.forEach((val, i) => {
        doc.text(val, x, y, { width: cols[i].w, align: 'left' });
        x += cols[i].w;
      });
      doc.moveDown(0.3);
    });

    doc.end();
  } catch (err) {
    fail(res, err, 'Erreur export PDF');
  }
};