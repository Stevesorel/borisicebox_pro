module.exports = (sequelize, DataTypes) => {
  const PageAccueil = sequelize.define('PageAccueil', {
    cle:   { type: DataTypes.STRING(100), allowNull: false, unique: true },
    valeur: { type: DataTypes.TEXT, allowNull: true }
  }, { tableName: 'page_accueil', timestamps: false });
  return PageAccueil;
};
