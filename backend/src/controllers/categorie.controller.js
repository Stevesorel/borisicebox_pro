const { Categorie } = require('../models');
const fail = require('../utils/errorResponse');
const { writeAdminAudit } = require('../utils/adminAudit');

exports.getAll = async (req, res) => {
  try {
    const categories = await Categorie.findAll({ order: [['ordre', 'ASC']] });
    res.json(categories);
  } catch (err) {
    fail(res, err);
  }
};
exports.create = async (req, res) => {
  try {
    const categorie = await Categorie.create(req.body);
    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'categorie',
      entityId: categorie.id,
      action: 'categorie_created',
      meta: {
        nom: categorie.nom,
        slug: categorie.slug,
        ordre: categorie.ordre,
        actif: categorie.actif
      }
    });
    res.status(201).json(categorie);
  } catch (err) {
    fail(res, err);
  }
};
exports.update = async (req, res) => {
  try {
    const categorie = await Categorie.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Catégorie non trouvée' });
    await categorie.update(req.body);
    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'categorie',
      entityId: categorie.id,
      action: 'categorie_updated',
      meta: {
        nom: categorie.nom,
        slug: categorie.slug,
        ordre: categorie.ordre,
        actif: categorie.actif
      }
    });
    res.json(categorie);
  } catch (err) {
    fail(res, err);
  }
};
exports.remove = async (req, res) => {
  try {
    const categorie = await Categorie.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Catégorie non trouvée' });
    const deletedMeta = {
      nom: categorie.nom,
      slug: categorie.slug,
      ordre: categorie.ordre,
      actif: categorie.actif
    };
    await categorie.destroy();
    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'categorie',
      entityId: parseInt(req.params.id, 10) || categorie.id,
      action: 'categorie_deleted',
      meta: deletedMeta
    });
    res.json({ message: 'Catégorie supprimée' });
  } catch (err) {
    fail(res, err);
  }
};
