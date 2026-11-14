const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { Admin } = require('../models');
const fail = require('../utils/errorResponse');
const { writeAdminAudit } = require('../utils/adminAudit');

const ALLOWED_ROLES = new Set(['superadmin', 'gestionnaire', 'catalogue', 'commandes']);

const sanitizeEmail = (value) => String(value || '').trim().toLowerCase();
const sanitizeNom = (value) => String(value || '').trim().substring(0, 100);
const sanitizeRole = (value) => String(value || '').trim();

const ensureAnotherActiveSuperadmin = async (excludeId = null) => {
  const where = {
    role: 'superadmin',
    actif: true
  };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const count = await Admin.count({ where });
  return count > 0;
};

exports.getAll = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['id', 'nom', 'email', 'role', 'actif', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(admins);
  } catch (err) {
    fail(res, err);
  }
};

exports.create = async (req, res) => {
  try {
    const nom = sanitizeNom(req.body.nom);
    const email = sanitizeEmail(req.body.email);
    const role = sanitizeRole(req.body.role || 'gestionnaire');
    const actif = req.body.actif !== false;
    const password = String(req.body.password || '');

    if (!nom) return res.status(400).json({ message: 'Le nom est requis' });
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Email invalide' });
    if (!ALLOWED_ROLES.has(role)) return res.status(400).json({ message: 'Rôle invalide' });
    if (password.length < 8) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });

    const exists = await Admin.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Cet email est déjà utilisé' });

    const password_hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ nom, email, role, actif, password_hash });

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'admin',
      entityId: admin.id,
      action: 'admin_created',
      meta: { nom: admin.nom, email: admin.email, role: admin.role, actif: admin.actif }
    });

    res.status(201).json({
      id: admin.id,
      nom: admin.nom,
      email: admin.email,
      role: admin.role,
      actif: admin.actif,
      createdAt: admin.createdAt
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (!Number.isFinite(targetId) || targetId <= 0) {
      return res.status(400).json({ message: 'ID invalide' });
    }

    const admin = await Admin.findByPk(targetId);
    if (!admin) return res.status(404).json({ message: 'Admin non trouvé' });

    const nextNom = req.body.nom !== undefined ? sanitizeNom(req.body.nom) : admin.nom;
    const nextEmail = req.body.email !== undefined ? sanitizeEmail(req.body.email) : admin.email;
    const nextRole = req.body.role !== undefined ? sanitizeRole(req.body.role) : admin.role;
    const nextActif = req.body.actif !== undefined ? !!req.body.actif : admin.actif;
    const nextPassword = req.body.password !== undefined ? String(req.body.password || '') : null;

    if (!nextNom) return res.status(400).json({ message: 'Le nom est requis' });
    if (!nextEmail || !/^\S+@\S+\.\S+$/.test(nextEmail)) return res.status(400).json({ message: 'Email invalide' });
    if (!ALLOWED_ROLES.has(nextRole)) return res.status(400).json({ message: 'Rôle invalide' });
    if (nextPassword !== null && nextPassword.length > 0 && nextPassword.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const emailExists = await Admin.findOne({
      where: { email: nextEmail, id: { [Op.ne]: targetId } }
    });
    if (emailExists) return res.status(409).json({ message: 'Cet email est déjà utilisé' });

    const isSelf = req.admin.id === targetId;
    if (isSelf && nextActif === false) {
      return res.status(400).json({ message: 'Vous ne pouvez pas désactiver votre propre compte' });
    }
    if (isSelf && nextRole !== admin.role) {
      return res.status(400).json({ message: 'Vous ne pouvez pas modifier votre propre rôle' });
    }

    const losesSuperadmin = admin.role === 'superadmin' && (nextRole !== 'superadmin' || nextActif === false);
    if (losesSuperadmin) {
      const hasAnother = await ensureAnotherActiveSuperadmin(targetId);
      if (!hasAnother) {
        return res.status(400).json({ message: 'Impossible de retirer le dernier superadmin actif' });
      }
    }

    const payload = {
      nom: nextNom,
      email: nextEmail,
      role: nextRole,
      actif: nextActif
    };
    if (nextPassword && nextPassword.length >= 8) {
      payload.password_hash = await bcrypt.hash(nextPassword, 10);
    }

    await admin.update(payload);

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'admin',
      entityId: admin.id,
      action: 'admin_updated',
      meta: {
        nom: admin.nom,
        email: admin.email,
        role: admin.role,
        actif: admin.actif
      }
    });

    res.json({
      id: admin.id,
      nom: admin.nom,
      email: admin.email,
      role: admin.role,
      actif: admin.actif,
      createdAt: admin.createdAt
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (!Number.isFinite(targetId) || targetId <= 0) {
      return res.status(400).json({ message: 'ID invalide' });
    }

    const admin = await Admin.findByPk(targetId);
    if (!admin) return res.status(404).json({ message: 'Admin non trouvé' });

    if (req.admin.id === targetId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    if (admin.role === 'superadmin' && admin.actif) {
      const hasAnother = await ensureAnotherActiveSuperadmin(targetId);
      if (!hasAnother) {
        return res.status(400).json({ message: 'Impossible de supprimer le dernier superadmin actif' });
      }
    }

    const deletedPayload = {
      nom: admin.nom,
      email: admin.email,
      role: admin.role,
      actif: admin.actif
    };

    await admin.destroy();

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'admin',
      entityId: targetId,
      action: 'admin_deleted',
      meta: deletedPayload
    });

    res.json({ message: 'Admin supprimé' });
  } catch (err) {
    fail(res, err);
  }
};
