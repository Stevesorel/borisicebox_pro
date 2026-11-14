const { Op, fn, col } = require('sequelize');
const db = require('../models');
const fail = require('../utils/errorResponse');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const { AdminAuditLog, Admin, Commande, WhatsappCommande, Produit, Categorie, ZoneLivraison } = db;

const ENTITY_TYPES = new Set([
  'commande',
  'whatsapp_commande',
  'admin',
  'produit',
  'categorie',
  'zone',
  'page_accueil',
  'marketing',
  'shop_settings'
]);

const toPositiveInt = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const buildDateRangeFilter = (from, to) => {
  const out = {};
  if (from && !Number.isNaN(from.getTime())) out[Op.gte] = from;
  if (to && !Number.isNaN(to.getTime())) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    out[Op.lte] = end;
  }
  return out;
};

const mapGroupedRowsByAdmin = async (rows) => {
  const adminIds = rows
    .map((row) => Number(row.admin_id))
    .filter((id) => Number.isFinite(id));
  const admins = adminIds.length
    ? await Admin.findAll({
        attributes: ['id', 'nom', 'email'],
        where: { id: { [Op.in]: [...new Set(adminIds)] } }
      })
    : [];
  const adminMap = new Map(admins.map((a) => [a.id, a]));

  return rows
    .map((row) => ({
      admin_id: row.admin_id || null,
      admin_nom: adminMap.get(Number(row.admin_id))?.nom || 'Systeme',
      admin_email: adminMap.get(Number(row.admin_id))?.email || null,
      total: Number(row.total || 0)
    }))
    .sort((a, b) => b.total - a.total);
};

const fetchGroupedAdminStats = async (where) => {
  const rows = await AdminAuditLog.findAll({
    attributes: [
      'admin_id',
      [fn('COUNT', col('AdminAuditLog.id')), 'total']
    ],
    where,
    group: ['admin_id'],
    order: [[fn('COUNT', col('AdminAuditLog.id')), 'DESC']],
    raw: true
  });
  return mapGroupedRowsByAdmin(rows);
};

const fetchProductCreationsByUser = async ({ adminId = null, dateRange = {} }) => {
  return fetchGroupedAdminStats({
    entity_type: 'produit',
    action: 'produit_created',
    ...(adminId ? { admin_id: adminId } : {}),
    ...(Object.keys(dateRange).length ? { createdAt: dateRange } : {})
  });
};

const fetchCommandeStatusChangesByUser = async ({ adminId = null, dateRange = {} }) => {
  return fetchGroupedAdminStats({
    entity_type: { [Op.in]: ['commande', 'whatsapp_commande'] },
    action: 'status_changed',
    ...(adminId ? { admin_id: adminId } : {}),
    ...(Object.keys(dateRange).length ? { createdAt: dateRange } : {})
  });
};

const fetchCommandeCancellationsByUser = async ({ adminId = null, dateRange = {} }) => {
  return fetchGroupedAdminStats({
    entity_type: { [Op.in]: ['commande', 'whatsapp_commande'] },
    action: 'status_changed',
    meta: { [Op.contains]: { to: 'annulee' } },
    ...(adminId ? { admin_id: adminId } : {}),
    ...(Object.keys(dateRange).length ? { createdAt: dateRange } : {})
  });
};

const parseStatsFilters = (query = {}) => {
  const adminId = toPositiveInt(query.admin_id, null);
  const from = query.from ? new Date(query.from) : null;
  const to = query.to ? new Date(query.to) : null;
  const dateRange = buildDateRangeFilter(from, to);
  return { adminId, dateRange };
};

const writeStatsExcel = async ({ res, stats, filename, sheetName }) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = [
    { header: 'Admin ID', key: 'admin_id', width: 12 },
    { header: 'Nom', key: 'admin_nom', width: 28 },
    { header: 'Email', key: 'admin_email', width: 32 },
    { header: 'Total', key: 'total', width: 18 }
  ];
  stats.forEach((row) => {
    sheet.addRow({
      admin_id: row.admin_id || '-',
      admin_nom: row.admin_nom,
      admin_email: row.admin_email || '-',
      total: row.total
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  res.end();
};

const writeStatsPdf = ({ res, stats, filename, title }) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  doc.pipe(res);

  doc.fontSize(16).text(title, { align: 'center' });
  doc.moveDown(0.7);
  doc.fontSize(10).fillColor('#475569').text(`Genere le: ${new Date().toLocaleString('fr-FR')}`, { align: 'left' });
  doc.fillColor('#000000');
  doc.moveDown(0.8);

  const startX = 30;
  const cols = [
    { label: 'Admin ID', w: 70 },
    { label: 'Nom', w: 180 },
    { label: 'Email', w: 190 },
    { label: 'Total', w: 70 }
  ];

  let x = startX;
  let y = doc.y;
  doc.font('Helvetica-Bold').fontSize(10);
  cols.forEach((colDef) => {
    doc.text(colDef.label, x, y, { width: colDef.w, align: 'left' });
    x += colDef.w;
  });
  y += 16;
  doc.moveTo(startX, y).lineTo(startX + cols.reduce((s, c) => s + c.w, 0), y).stroke();
  y += 6;

  doc.font('Helvetica').fontSize(9);
  if (!stats.length) {
    doc.text('Aucune donnee a exporter.', startX, y);
  } else {
    stats.forEach((row) => {
      if (y > 780) {
        doc.addPage();
        y = 30;
      }
      x = startX;
      const values = [
        row.admin_id || '-',
        row.admin_nom || '-',
        row.admin_email || '-',
        String(row.total || 0)
      ];
      values.forEach((value, idx) => {
        doc.text(String(value), x, y, { width: cols[idx].w, align: 'left' });
        x += cols[idx].w;
      });
      y += 16;
    });
  }

  doc.end();
};

exports.getAll = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(100, toPositiveInt(req.query.limit, 20));
    const offset = (page - 1) * limit;

    const filters = [];

    const adminId = toPositiveInt(req.query.admin_id, null);
    if (adminId) filters.push({ admin_id: adminId });

    const entityType = String(req.query.entity_type || '').trim();
    if (entityType && ENTITY_TYPES.has(entityType)) {
      filters.push({ entity_type: entityType });
    }

    const action = String(req.query.action || '').trim();
    if (action) {
      filters.push({ action });
    }

    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;
    if (from && !Number.isNaN(from.getTime())) {
      filters.push({ createdAt: { [Op.gte]: from } });
    }
    if (to && !Number.isNaN(to.getTime())) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filters.push({ createdAt: { [Op.lte]: end } });
    }

    const q = String(req.query.q || '').trim();
    if (q) {
      const or = [{ action: { [Op.iLike]: `%${q}%` } }];
      const asInt = parseInt(q, 10);
      if (Number.isFinite(asInt) && asInt > 0) {
        or.push({ entity_id: asInt });
      }

      const [commandes, whatsapp, produits, categories, zones, targetAdmins] = await Promise.all([
        Commande.findAll({
          attributes: ['id'],
          where: { reference: { [Op.iLike]: `%${q}%` } },
          limit: 100
        }),
        WhatsappCommande.findAll({
          attributes: ['id'],
          where: { reference: { [Op.iLike]: `%${q}%` } },
          limit: 100
        }),
        Produit.findAll({
          attributes: ['id'],
          where: {
            [Op.or]: [
              { nom: { [Op.iLike]: `%${q}%` } },
              { slug: { [Op.iLike]: `%${q}%` } }
            ]
          },
          limit: 100
        }),
        Categorie.findAll({
          attributes: ['id'],
          where: { nom: { [Op.iLike]: `%${q}%` } },
          limit: 100
        }),
        ZoneLivraison.findAll({
          attributes: ['id'],
          where: { nom: { [Op.iLike]: `%${q}%` } },
          limit: 100
        }),
        Admin.findAll({
          attributes: ['id'],
          where: {
            [Op.or]: [
              { nom: { [Op.iLike]: `%${q}%` } },
              { email: { [Op.iLike]: `%${q}%` } }
            ]
          },
          limit: 100
        })
      ]);

      const commandeIds = commandes.map(c => c.id);
      const whatsappIds = whatsapp.map(c => c.id);
      const produitIds = produits.map(p => p.id);
      const categorieIds = categories.map(c => c.id);
      const zoneIds = zones.map(z => z.id);
      const targetAdminIds = targetAdmins.map(a => a.id);
      if (commandeIds.length) {
        or.push({ entity_type: 'commande', entity_id: { [Op.in]: commandeIds } });
      }
      if (whatsappIds.length) {
        or.push({ entity_type: 'whatsapp_commande', entity_id: { [Op.in]: whatsappIds } });
      }
      if (produitIds.length) {
        or.push({ entity_type: 'produit', entity_id: { [Op.in]: produitIds } });
      }
      if (categorieIds.length) {
        or.push({ entity_type: 'categorie', entity_id: { [Op.in]: categorieIds } });
      }
      if (zoneIds.length) {
        or.push({ entity_type: 'zone', entity_id: { [Op.in]: zoneIds } });
      }
      if (targetAdminIds.length) {
        or.push({ entity_type: 'admin', entity_id: { [Op.in]: targetAdminIds } });
      }
      filters.push({ [Op.or]: or });
    }

    const where = filters.length ? { [Op.and]: filters } : {};

    const dateRangeForStats = buildDateRangeFilter(from, to);

    const [
      auditResult,
      availableActionsRows,
      productCreationsByUser,
      commandeStatusChangesByUser,
      commandeCancellationsByUser
    ] = await Promise.all([
      AdminAuditLog.findAndCountAll({
        where,
        include: [{ model: Admin, attributes: ['id', 'nom', 'email'], required: false }],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      }),
      AdminAuditLog.findAll({
        attributes: ['action'],
        group: ['action'],
        order: [['action', 'ASC']],
        raw: true
      }),
      fetchProductCreationsByUser({ adminId, dateRange: dateRangeForStats }),
      fetchCommandeStatusChangesByUser({ adminId, dateRange: dateRangeForStats }),
      fetchCommandeCancellationsByUser({ adminId, dateRange: dateRangeForStats })
    ]);

    const { count, rows } = auditResult;

    const commandeIds = rows.filter(r => r.entity_type === 'commande').map(r => r.entity_id);
    const whatsappIds = rows.filter(r => r.entity_type === 'whatsapp_commande').map(r => r.entity_id);
    const targetAdminIds = rows.filter(r => r.entity_type === 'admin').map(r => r.entity_id);
    const produitIds = rows.filter(r => r.entity_type === 'produit').map(r => r.entity_id);
    const categorieIds = rows.filter(r => r.entity_type === 'categorie').map(r => r.entity_id);
    const zoneIds = rows.filter(r => r.entity_type === 'zone').map(r => r.entity_id);

    const [commandeRefs, whatsappRefs, targetAdmins, produitRefs, categorieRefs, zoneRefs] = await Promise.all([
      commandeIds.length
        ? Commande.findAll({
            attributes: ['id', 'reference'],
            where: { id: { [Op.in]: [...new Set(commandeIds)] } }
          })
        : [],
      whatsappIds.length
        ? WhatsappCommande.findAll({
            attributes: ['id', 'reference'],
            where: { id: { [Op.in]: [...new Set(whatsappIds)] } }
          })
        : [],
      targetAdminIds.length
        ? Admin.findAll({
            attributes: ['id', 'nom', 'email'],
            where: { id: { [Op.in]: [...new Set(targetAdminIds)] } }
          })
        : [],
      produitIds.length
        ? Produit.findAll({
            attributes: ['id', 'nom', 'slug'],
            where: { id: { [Op.in]: [...new Set(produitIds)] } }
          })
        : [],
      categorieIds.length
        ? Categorie.findAll({
            attributes: ['id', 'nom'],
            where: { id: { [Op.in]: [...new Set(categorieIds)] } }
          })
        : [],
      zoneIds.length
        ? ZoneLivraison.findAll({
            attributes: ['id', 'nom'],
            where: { id: { [Op.in]: [...new Set(zoneIds)] } }
          })
        : []
    ]);

    const commandeMap = new Map(commandeRefs.map(r => [r.id, r.reference]));
    const whatsappMap = new Map(whatsappRefs.map(r => [r.id, r.reference]));
    const adminMap = new Map(targetAdmins.map(r => [r.id, `${r.nom} (${r.email})`]));
    const produitMap = new Map(produitRefs.map(r => [r.id, `${r.nom}${r.slug ? ` (${r.slug})` : ''}`]));
    const categorieMap = new Map(categorieRefs.map(r => [r.id, r.nom]));
    const zoneMap = new Map(zoneRefs.map(r => [r.id, r.nom]));

    const logs = rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      entity_reference:
        row.entity_type === 'commande' ? commandeMap.get(row.entity_id) || null
        : row.entity_type === 'whatsapp_commande' ? whatsappMap.get(row.entity_id) || null
        : row.entity_type === 'admin' ? adminMap.get(row.entity_id) || null
        : row.entity_type === 'produit' ? produitMap.get(row.entity_id) || null
        : row.entity_type === 'categorie' ? categorieMap.get(row.entity_id) || null
        : row.entity_type === 'zone' ? zoneMap.get(row.entity_id) || null
        : row.entity_type === 'page_accueil' ? (row.meta?.changed_keys ? 'Configuration page accueil' : 'Page accueil')
        : row.entity_type === 'marketing' ? row.meta?.titre_fr || row.meta?.type || 'Marketing'
        : row.entity_type === 'shop_settings' ? 'Parametres boutique'
        : null,
      actor: row.Admin ? {
        id: row.Admin.id,
        nom: row.Admin.nom,
        email: row.Admin.email
      } : null,
      meta: row.meta || null
    }));

    const availableActions = availableActionsRows
      .map((r) => r.action)
      .filter(Boolean);

    res.json({
      logs,
      total: count,
      page,
      pages: Math.max(1, Math.ceil(count / limit)),
      limit,
      available_actions: availableActions,
      product_creations_by_user: productCreationsByUser,
      commande_status_changes_by_user: commandeStatusChangesByUser,
      commande_cancellations_by_user: commandeCancellationsByUser
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.exportProductCreationsExcel = async (req, res) => {
  try {
    const { adminId, dateRange } = parseStatsFilters(req.query);
    const stats = await fetchProductCreationsByUser({ adminId, dateRange });
    const stamp = new Date().toISOString().slice(0, 10);
    await writeStatsExcel({
      res,
      stats,
      filename: `produits-par-utilisateur-${stamp}.xlsx`,
      sheetName: 'Produits par utilisateur'
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.exportProductCreationsPdf = async (req, res) => {
  try {
    const { adminId, dateRange } = parseStatsFilters(req.query);
    const stats = await fetchProductCreationsByUser({ adminId, dateRange });
    const stamp = new Date().toISOString().slice(0, 10);
    writeStatsPdf({
      res,
      stats,
      filename: `produits-par-utilisateur-${stamp}.pdf`,
      title: 'Produits ajoutes par utilisateur'
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.exportCommandeStatusChangesExcel = async (req, res) => {
  try {
    const { adminId, dateRange } = parseStatsFilters(req.query);
    const stats = await fetchCommandeStatusChangesByUser({ adminId, dateRange });
    const stamp = new Date().toISOString().slice(0, 10);
    await writeStatsExcel({
      res,
      stats,
      filename: `changements-statut-commandes-${stamp}.xlsx`,
      sheetName: 'Statuts commandes'
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.exportCommandeStatusChangesPdf = async (req, res) => {
  try {
    const { adminId, dateRange } = parseStatsFilters(req.query);
    const stats = await fetchCommandeStatusChangesByUser({ adminId, dateRange });
    const stamp = new Date().toISOString().slice(0, 10);
    writeStatsPdf({
      res,
      stats,
      filename: `changements-statut-commandes-${stamp}.pdf`,
      title: 'Changements de statut commandes par utilisateur'
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.exportCommandeCancellationsExcel = async (req, res) => {
  try {
    const { adminId, dateRange } = parseStatsFilters(req.query);
    const stats = await fetchCommandeCancellationsByUser({ adminId, dateRange });
    const stamp = new Date().toISOString().slice(0, 10);
    await writeStatsExcel({
      res,
      stats,
      filename: `annulations-commandes-${stamp}.xlsx`,
      sheetName: 'Annulations commandes'
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.exportCommandeCancellationsPdf = async (req, res) => {
  try {
    const { adminId, dateRange } = parseStatsFilters(req.query);
    const stats = await fetchCommandeCancellationsByUser({ adminId, dateRange });
    const stamp = new Date().toISOString().slice(0, 10);
    writeStatsPdf({
      res,
      stats,
      filename: `annulations-commandes-${stamp}.pdf`,
      title: 'Annulations de commandes par utilisateur'
    });
  } catch (err) {
    fail(res, err);
  }
};
