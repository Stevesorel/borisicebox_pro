module.exports = (sequelize, DataTypes) => {
  const CarouselImage = sequelize.define('CarouselImage', {
    url:   { type: DataTypes.STRING(500), allowNull: false },
    ordre: { type: DataTypes.INTEGER,     defaultValue: 0 }
  }, { tableName: 'carousel_images', timestamps: true });
  return CarouselImage;
};