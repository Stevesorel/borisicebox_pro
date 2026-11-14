module.exports = (sequelize, DataTypes) => {
  const ProduitImage = sequelize.define('ProduitImage', {
    produit_id:  { type: DataTypes.INTEGER,    allowNull: false },
    url:         { type: DataTypes.STRING(500), allowNull: false },
    url_large:   { type: DataTypes.STRING(500), allowNull: true },
    ordre:       { type: DataTypes.INTEGER,    defaultValue: 0 },
    couleur:     { type: DataTypes.STRING(50),  allowNull: true, defaultValue: null },
    couleur_hex: { type: DataTypes.STRING(7),   allowNull: true, defaultValue: null }
  }, { tableName: 'produit_images', timestamps: false });
  ProduitImage.associate = (db) => {
    ProduitImage.belongsTo(db.Produit, { foreignKey: 'produit_id' });
  };
  return ProduitImage;
};
