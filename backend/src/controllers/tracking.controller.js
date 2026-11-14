const { Commande, CommandeDetail, Produit, ZoneLivraison } = require('../models');
const fail = require('../utils/errorResponse');

exports.track = async (req, res) => {
  try {
    const { reference } = req.params;
    const commande = await Commande.findOne({
      where: { reference },
      include: [
        { model: ZoneLivraison, attributes: ['nom', 'frais'] },
        {
          model: CommandeDetail,
          include: [{ model: Produit, attributes: ['id', 'nom', 'image_principale'] }]
        }
      ],
      attributes: ['id', 'reference', 'nom_client', 'adresse', 'telephone', 'total', 'statut', 'createdAt']
    });
    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });
    res.json(commande);
  } catch (err) {
    fail(res, err);
  }
};

exports.trackByPhone = async (req, res) => {
  try {
    const { telephone } = req.params
    const commandes = await Commande.findAll({
      where: { telephone },
      include: [
        { model: ZoneLivraison, attributes: ['nom', 'frais'] },
        {
          model: CommandeDetail,
          include: [{ model: Produit, attributes: ['id', 'nom', 'image_principale'] }]
        }
      ],
      attributes: ['id', 'reference', 'nom_client', 'adresse', 'telephone', 'total', 'statut', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })
    if (!commandes.length) return res.status(404).json({ message: 'Aucune commande trouvée pour ce numéro' })
    res.json(commandes)
  } catch (err) {
    fail(res, err)
  }
}
