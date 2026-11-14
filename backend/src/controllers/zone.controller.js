const { ZoneLivraison } = require('../models');
const fail = require('../utils/errorResponse');
const { writeAdminAudit } = require('../utils/adminAudit');

exports.getAll = async (req, res) => {
  try {
    res.json(await ZoneLivraison.findAll());
  } catch (err) {
    fail(res, err);
  }
};
exports.create = async (req, res) => {
  try {
    const zone = await ZoneLivraison.create(req.body);
    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'zone',
      entityId: zone.id,
      action: 'zone_created',
      meta: {
        nom: zone.nom,
        frais: zone.frais,
        actif: zone.actif
      }
    });
    res.status(201).json(zone);
  } catch (err) {
    fail(res, err);
  }
};
exports.update = async (req, res) => {
  try {
    const zone = await ZoneLivraison.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Zone non trouvée' });
    await zone.update(req.body);
    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'zone',
      entityId: zone.id,
      action: 'zone_updated',
      meta: {
        nom: zone.nom,
        frais: zone.frais,
        actif: zone.actif
      }
    });
    res.json(zone);
  } catch (err) {
    fail(res, err);
  }
};
exports.remove = async (req, res) => {
  try {
    const zone = await ZoneLivraison.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Zone non trouvée' });
    const deletedMeta = {
      nom: zone.nom,
      frais: zone.frais,
      actif: zone.actif
    };
    await zone.destroy();
    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'zone',
      entityId: parseInt(req.params.id, 10) || zone.id,
      action: 'zone_deleted',
      meta: deletedMeta
    });
    res.json({ message: 'Zone supprimée' });
  } catch (err) {
    fail(res, err);
  }
};
