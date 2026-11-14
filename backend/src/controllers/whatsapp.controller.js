const db = require('../models');
const { WhatsappCommande, AdminAuditLog, Admin } = db;
const fail = require('../utils/errorResponse');
const { writeAdminAudit } = require('../utils/adminAudit');

const STATUTS = ['en_attente', 'contacte', 'confirmee', 'annulee'];
const STATUT_TRANSITIONS = {
  en_attente: ['contacte', 'confirmee', 'annulee'],
  contacte: ['confirmee', 'annulee'],
  confirmee: ['annulee'],
  annulee: []
};

const canTransition = (from, to) => from === to || (STATUT_TRANSITIONS[from] || []).includes(to);

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

const fetchWhatsappAudits = async (commandeId) => {
  const logs = await AdminAuditLog.findAll({
    where: { entity_type: 'whatsapp_commande', entity_id: commandeId },
    include: [{ model: Admin, attributes: ['id', 'nom', 'email'] }],
    order: [['createdAt', 'DESC']]
  });
  return logs.map(serializeAudit);
};

const refPrefix = () => {
  const date = new Date();
  return `WA${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

exports.create = async (req, res) => {
  try {
    const { nom_client, telephone, produits, total, lien_whatsapp } = req.body;

    const commande = await WhatsappCommande.create({
      nom_client,
      telephone,
      reference: `TMP-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      nombre_articles: produits.length,
      sous_total: total,
      total: total, // Sera mis à jour si frais de livraison
      produits: produits.map(p => ({
        nom: p.nom,
        prix_unitaire: p.prix,
        quantite: p.quantite,
        prix_total: p.total,
        image_produit: p.image_produit || null,
        couleur: p.couleur || null,
        personnalisation: p.personnalisation || null
      })),
      lien_whatsapp: lien_whatsapp?.substring(0, 500) || null,
      statut: 'en_attente'
    });

    // Référence définitive basée sur l'id → unique même en cas de suppressions ou concurrence.
    await commande.update({ reference: `${refPrefix()}${commande.id.toString().padStart(4, '0')}` });

    // Notification temps réel
    const io = req.app.get('io');
    io.to('admin').emit('whatsapp:new', commande);

    await writeAdminAudit({
      adminId: null,
      entityType: 'whatsapp_commande',
      entityId: commande.id,
      action: 'created',
      meta: { statut: 'en_attente', source: 'whatsapp' }
    });

    res.status(201).json(commande);
  } catch (err) {
    fail(res, err);
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const statut = req.query.statut || null;
    const offset = (page - 1) * limit;

    const where = {};
    if (statut) where.statut = statut;

    const { count, rows } = await WhatsappCommande.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      commandes: rows,
      total: count,
      page,
      pages: Math.ceil(count / limit)
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.getOne = async (req, res) => {
  try {
    const commande = await WhatsappCommande.findByPk(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Non trouvée' });
    const audit_logs = await fetchWhatsappAudits(commande.id);
    res.json({
      ...commande.toJSON(),
      allowed_next_statuts: STATUT_TRANSITIONS[commande.statut] || [],
      audit_logs
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.updateStatut = async (req, res) => {
  try {
    const commande = await WhatsappCommande.findByPk(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Non trouvée' });

    const requestedStatut = req.body.statut !== undefined
      ? String(req.body.statut || '').trim()
      : commande.statut;
    if (!STATUTS.includes(requestedStatut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const fromStatut = commande.statut;
    if (!canTransition(fromStatut, requestedStatut)) {
      return res.status(400).json({
        message: `Transition interdite: ${fromStatut} -> ${requestedStatut}`,
        allowed_next_statuts: STATUT_TRANSITIONS[fromStatut] || []
      });
    }

    const incomingNote = req.body.note_admin !== undefined
      ? String(req.body.note_admin || '').trim().substring(0, 500)
      : null;
    const effectiveNote = incomingNote !== null
      ? incomingNote
      : String(commande.note_admin || '').trim();

    if (fromStatut !== 'annulee' && requestedStatut === 'annulee' && !effectiveNote) {
      return res.status(400).json({ message: "Le motif d'annulation est obligatoire" });
    }

    const updateData = {};
    if (requestedStatut !== fromStatut) {
      updateData.statut = requestedStatut;
      if (requestedStatut === 'contacte' && !commande.date_contact) updateData.date_contact = new Date();
      if (requestedStatut === 'confirmee' && !commande.date_confirmation) updateData.date_confirmation = new Date();
      if (requestedStatut === 'confirmee') updateData.traite = true;
      if (requestedStatut === 'annulee') updateData.traite = false;
    }

    if (incomingNote !== null) {
      updateData.note_admin = incomingNote || null;
    }

    if (Object.keys(updateData).length) {
      await commande.update(updateData);
    }

    if (requestedStatut !== fromStatut) {
      await writeAdminAudit({
        adminId: req.admin?.id || null,
        entityType: 'whatsapp_commande',
        entityId: commande.id,
        action: 'status_changed',
        meta: {
          from: fromStatut,
          to: requestedStatut,
          note_admin: requestedStatut === 'annulee' ? effectiveNote : null
        }
      });
    }
    if (incomingNote !== null) {
      await writeAdminAudit({
        adminId: req.admin?.id || null,
        entityType: 'whatsapp_commande',
        entityId: commande.id,
        action: 'note_updated',
        meta: { has_note: !!commande.note_admin, note_admin: commande.note_admin || null }
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
    const commande = await WhatsappCommande.findByPk(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Non trouvée' });

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'whatsapp_commande',
      entityId: commande.id,
      action: 'deleted',
      meta: { reference: commande.reference, statut: commande.statut }
    });

    await commande.destroy();
    res.json({ message: 'Supprimée' });
  } catch (err) {
    fail(res, err);
  }
};