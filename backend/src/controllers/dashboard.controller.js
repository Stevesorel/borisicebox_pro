const { Commande, Produit, Client, Categorie, sequelize } = require('../models');
const { Op } = require('sequelize');
const fail = require('../utils/errorResponse');

exports.stats = async (req, res) => {
  try {
    const aujourd_hui = new Date();
    const debut_mois  = new Date(aujourd_hui.getFullYear(), aujourd_hui.getMonth(), 1);

    const [
      total_commandes,
      commandes_en_attente,
      commandes_confirmees,
      commandes_livrees,
      commandes_annulees,
      total_clients,
      total_produits,
      total_categories,
      ventes_mois,
      ventes_total
    ] = await Promise.all([
      Commande.count(),
      Commande.count({ where: { statut: 'en_attente' } }),
      Commande.count({ where: { statut: 'confirmee' } }),
      Commande.count({ where: { statut: 'livree' } }),
      Commande.count({ where: { statut: 'annulee' } }),
      Client.count(),
      Produit.count({ where: { actif: true } }),
      Categorie.count({ where: { actif: true } }),
      Commande.sum('total', {
        where: {
          statut: { [Op.ne]: 'annulee' },
          createdAt: { [Op.gte]: debut_mois }
        }
      }),
      Commande.sum('total', {
        where: { statut: { [Op.ne]: 'annulee' } }
      })
    ]);

    // 5 dernières commandes
    const dernieres_commandes = await Commande.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'reference', 'nom_client', 'total', 'statut', 'createdAt']
    });

    res.json({
      commandes: {
        total:       total_commandes,
        en_attente:  commandes_en_attente,
        confirmees:  commandes_confirmees,
        livrees:     commandes_livrees,
        annulees:    commandes_annulees
      },
      clients:          total_clients,
      produits:         total_produits,
      categories:       total_categories,
      ventes: {
        ce_mois:  ventes_mois  || 0,
        total:    ventes_total || 0
      },
      dernieres_commandes
    });
  } catch (err) {
    fail(res, err);
  }
};
