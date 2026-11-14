module.exports = (sequelize, DataTypes) => {
  const Commande = sequelize.define('Commande', {
    reference:  { type: DataTypes.STRING(30),    allowNull: false, unique: true },
    client_id:  { type: DataTypes.INTEGER },
    zone_id:    { type: DataTypes.INTEGER,        allowNull: false },
    nom_client: { type: DataTypes.STRING(100),    allowNull: false },
    telephone:  { type: DataTypes.STRING(20),     allowNull: false },
    email:      { type: DataTypes.STRING(100) },
    adresse:    { type: DataTypes.TEXT,           allowNull: false },
    total:      { type: DataTypes.DECIMAL(10,2),  allowNull: false },
    statut:     { type: DataTypes.ENUM('en_attente','confirmee','livree','annulee'), defaultValue: 'en_attente' }
  }, { tableName: 'commandes', timestamps: true });
  Commande.associate = (db) => {
    Commande.belongsTo(db.Client,        { foreignKey: 'client_id' });
    Commande.belongsTo(db.ZoneLivraison, { foreignKey: 'zone_id' });
    Commande.hasMany(db.CommandeDetail,  { foreignKey: 'commande_id' });
  };
  return Commande;
};
