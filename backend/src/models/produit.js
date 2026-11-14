module.exports = (sequelize, DataTypes) => {
  const Produit = sequelize.define('Produit', {
    categorie_id:             { type: DataTypes.INTEGER,      allowNull: false },
    nom:                      { type: DataTypes.STRING(200),   allowNull: false },
    slug:                     { type: DataTypes.STRING(200),   allowNull: false, unique: true },
    marque:                   { type: DataTypes.STRING(100) },
    description:              { type: DataTypes.TEXT },
    prix_base:                { type: DataTypes.DECIMAL(10,2), allowNull: false },
    prix_promo:               { type: DataTypes.DECIMAL(10,2) },
    promo_label:              { type: DataTypes.STRING(80) },
    promo_debut:              { type: DataTypes.DATE },
    promo_fin:                { type: DataTypes.DATE },
    prix_gros_actif:          { type: DataTypes.BOOLEAN, defaultValue: false },
    prix_gros_min_quantite:   { type: DataTypes.INTEGER },
    prix_gros:                { type: DataTypes.DECIMAL(10,2) },
    image_principale:         { type: DataTypes.STRING(500) },
    image_principale_large:   { type: DataTypes.STRING(500) },
    actif:                    { type: DataTypes.BOOLEAN, defaultValue: true },
    personnalisable:          { type: DataTypes.BOOLEAN, defaultValue: false },
    frais_personnalisation:   { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
  }, { tableName: 'produits', timestamps: true });

  Produit.associate = (db) => {
    Produit.belongsTo(db.Categorie,    { foreignKey: 'categorie_id' });
    Produit.hasMany(db.ProduitImage,   { foreignKey: 'produit_id', as: 'images' });
    Produit.hasMany(db.CommandeDetail, { foreignKey: 'produit_id' });
  };

  return Produit;
};