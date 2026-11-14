module.exports = (sequelize, DataTypes) => {
  const Categorie = sequelize.define('Categorie', {
    nom:         { type: DataTypes.STRING(100), allowNull: false },
    slug:        { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    ordre:       { type: DataTypes.INTEGER, defaultValue: 0 },
    actif:       { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'categories', timestamps: true });
  Categorie.associate = (db) => {
    Categorie.hasMany(db.Produit, { foreignKey: 'categorie_id' });
  };
  return Categorie;
};
