module.exports = (sequelize, DataTypes) => {
  const MarketingContent = sequelize.define('MarketingContent', {
    type:       { type: DataTypes.ENUM('annonce', 'evenement'), allowNull: false },
    titre_fr:   { type: DataTypes.STRING(160), allowNull: false },
    titre_en:   { type: DataTypes.STRING(160) },
    contenu_fr: { type: DataTypes.TEXT },
    contenu_en: { type: DataTypes.TEXT },
    badge_fr:   { type: DataTypes.STRING(60) },
    badge_en:   { type: DataTypes.STRING(60) },
    lien:       { type: DataTypes.STRING(500) },
    date_debut: { type: DataTypes.DATE },
    date_fin:   { type: DataTypes.DATE },
    ordre:      { type: DataTypes.INTEGER, defaultValue: 0 },
    actif:      { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'marketing_contents', timestamps: true });

  return MarketingContent;
};
