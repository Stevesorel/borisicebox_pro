module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    nom:       { type: DataTypes.STRING(100), allowNull: false },
    telephone: { type: DataTypes.STRING(20),  allowNull: false, unique: true },
    email:     { type: DataTypes.STRING(100) }
  }, { tableName: 'clients', timestamps: true });
  Client.associate = (db) => {
    Client.hasMany(db.Commande, { foreignKey: 'client_id' });
  };
  return Client;
};
