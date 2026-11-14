module.exports = (sequelize, DataTypes) => {
  const ShopSetting = sequelize.define('ShopSetting', {
    cle: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    valeur: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, { tableName: 'shop_settings', timestamps: false });

  return ShopSetting;
};
