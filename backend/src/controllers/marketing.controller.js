const { MarketingContent } = require('../models');
const fail = require('../utils/errorResponse');
const { writeAdminAudit } = require('../utils/adminAudit');

const ALLOWED_TYPES = new Set(['annonce', 'evenement']);
const UPDATABLE_FIELDS = [
  'type', 'titre_fr', 'titre_en', 'contenu_fr', 'contenu_en',
  'badge_fr', 'badge_en', 'lien', 'date_debut', 'date_fin', 'ordre', 'actif'
];

const cleanString = (value, max = 500) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return String(value).trim().slice(0, max);
};

const normalizePayload = (body = {}) => {
  const data = {};
  for (const field of UPDATABLE_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }

  if (data.type !== undefined && !ALLOWED_TYPES.has(data.type)) {
    const err = new Error('Type marketing invalide');
    err.statusCode = 400;
    throw err;
  }

  if (data.titre_fr !== undefined) data.titre_fr = cleanString(data.titre_fr, 160);
  if (data.titre_en !== undefined) data.titre_en = cleanString(data.titre_en, 160);
  if (data.contenu_fr !== undefined) data.contenu_fr = cleanString(data.contenu_fr, 1000);
  if (data.contenu_en !== undefined) data.contenu_en = cleanString(data.contenu_en, 1000);
  if (data.badge_fr !== undefined) data.badge_fr = cleanString(data.badge_fr, 60);
  if (data.badge_en !== undefined) data.badge_en = cleanString(data.badge_en, 60);
  if (data.lien !== undefined) data.lien = cleanString(data.lien, 500);
  if (data.ordre !== undefined) data.ordre = Number.isFinite(Number(data.ordre)) ? Number(data.ordre) : 0;
  if (data.actif !== undefined) data.actif = data.actif === true || data.actif === 'true' || data.actif === '1';
  if (data.date_debut === '') data.date_debut = null;
  if (data.date_fin === '') data.date_fin = null;

  return data;
};

const isInActiveWindow = (item) => {
  const now = Date.now();
  const start = item.date_debut ? new Date(item.date_debut).getTime() : null;
  const end = item.date_fin ? new Date(item.date_fin).getTime() : null;

  // Une date invalide ne doit pas masquer une annonce active.
  const startsOk = !start || Number.isNaN(start) || start <= now;
  const endsOk = !end || Number.isNaN(end) || end >= now;
  return startsOk && endsOk;
};

exports.getPublic = async (req, res) => {
  try {
    const type = req.query.type;
    const where = { actif: true };
    if (ALLOWED_TYPES.has(type)) where.type = type;

    const rows = await MarketingContent.findAll({
      where,
      order: [['ordre', 'ASC'], ['createdAt', 'DESC']],
      limit: 20
    });
    res.json(rows.filter(isInActiveWindow));
  } catch (err) {
    fail(res, err);
  }
};

exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (ALLOWED_TYPES.has(req.query.type)) where.type = req.query.type;
    const rows = await MarketingContent.findAll({
      where,
      order: [['ordre', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(rows);
  } catch (err) {
    fail(res, err);
  }
};

exports.create = async (req, res) => {
  try {
    const data = normalizePayload(req.body);
    if (!data.type || !data.titre_fr) {
      return res.status(400).json({ message: 'Type et titre FR sont requis' });
    }

    const item = await MarketingContent.create(data);
    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'marketing',
      entityId: item.id,
      action: 'marketing_created',
      meta: { type: item.type, titre_fr: item.titre_fr }
    });
    req.app.get('io')?.to('shop').emit('marketing:updated', item);
    res.status(201).json(item);
  } catch (err) {
    fail(res, err, err.message || 'Erreur serveur', err.statusCode || 500);
  }
};

exports.update = async (req, res) => {
  try {
    const item = await MarketingContent.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Contenu introuvable' });

    const data = normalizePayload(req.body);
    await item.update(data);
    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'marketing',
      entityId: item.id,
      action: 'marketing_updated',
      meta: { updated_fields: Object.keys(data), type: item.type }
    });
    req.app.get('io')?.to('shop').emit('marketing:updated', item);
    res.json(item);
  } catch (err) {
    fail(res, err, err.message || 'Erreur serveur', err.statusCode || 500);
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await MarketingContent.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Contenu introuvable' });
    const meta = { type: item.type, titre_fr: item.titre_fr };
    await item.destroy();
    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'marketing',
      entityId: Number(req.params.id),
      action: 'marketing_deleted',
      meta
    });
    req.app.get('io')?.to('shop').emit('marketing:updated', { deleted: true, id: Number(req.params.id) });
    res.json({ message: 'Contenu supprimé' });
  } catch (err) {
    fail(res, err);
  }
};
