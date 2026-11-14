const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'boris_ibox',
  process.env.DB_USER || 'steve',
  process.env.DB_PASS || 'success',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Admin          = require('./admin')(sequelize, DataTypes);
db.AdminAuditLog  = require('./adminAuditLog')(sequelize, DataTypes);
db.Client         = require('./client')(sequelize, DataTypes);
db.Categorie      = require('./categorie')(sequelize, DataTypes);
db.Produit        = require('./produit')(sequelize, DataTypes);
db.ProduitImage   = require('./produitImage')(sequelize, DataTypes);
db.ZoneLivraison  = require('./zoneLivraison')(sequelize, DataTypes);
db.Commande       = require('./commande')(sequelize, DataTypes);
db.CommandeDetail = require('./commandeDetail')(sequelize, DataTypes);
db.WhatsappCommande = require('./whatsappCommande')(sequelize, DataTypes);
db.PageAccueil   = require('./pageAccueil')(sequelize, DataTypes);
db.CarouselImage = require('./carouselImage')(sequelize, DataTypes);
db.MarketingContent = require('./marketingContent')(sequelize, DataTypes);
db.ShopSetting = require('./shopSetting')(sequelize, DataTypes);

Object.keys(db).forEach(m => {
  if (db[m].associate) db[m].associate(db);
});

module.exports = db;
