module.exports = (sequelize, DataTypes) => {
  const ZoneLivraison = sequelize.define('ZoneLivraison', {
    nom:   { type: DataTypes.STRING(100),   allowNull: false },
    frais: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'zones_livraison', timestamps: true });
  ZoneLivraison.associate = (db) => {
    ZoneLivraison.hasMany(db.Commande, { foreignKey: 'zone_id' });
  };
  return ZoneLivraison;
};
