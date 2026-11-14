module.exports = (sequelize, DataTypes) => {
  const CommandeDetail = sequelize.define('CommandeDetail', {
    commande_id:            { type: DataTypes.INTEGER,       allowNull: false },
    produit_id:             { type: DataTypes.INTEGER,       allowNull: false },
    nom_produit:            { type: DataTypes.STRING(200),   allowNull: false },
    prix_unitaire:          { type: DataTypes.DECIMAL(10,2), allowNull: false },
    quantite:               { type: DataTypes.INTEGER,       allowNull: false, defaultValue: 1 },
    prix_total:             { type: DataTypes.DECIMAL(10,2), allowNull: false },
    image_produit:          { type: DataTypes.STRING(500),   allowNull: true },
    couleur:                { type: DataTypes.STRING(50),    allowNull: true },
    personnalisation:       { type: DataTypes.TEXT,          allowNull: true },
    frais_personnalisation: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
  }, { tableName: 'commande_details', timestamps: false });

  CommandeDetail.associate = (db) => {
    CommandeDetail.belongsTo(db.Commande, { foreignKey: 'commande_id' });
    CommandeDetail.belongsTo(db.Produit,  { foreignKey: 'produit_id' });
  };

  return CommandeDetail;
};