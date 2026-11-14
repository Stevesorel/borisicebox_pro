module.exports = (sequelize, DataTypes) => {
  const WhatsappCommande = sequelize.define('WhatsappCommande', {
    // Client
    nom_client:      { type: DataTypes.STRING(100), allowNull: false },
    telephone:       { type: DataTypes.STRING(20),  allowNull: false },
    
    // Commande
    reference:       { type: DataTypes.STRING(30),  allowNull: false, unique: true },
    nombre_articles: { type: DataTypes.INTEGER,     allowNull: false },
    sous_total:      { type: DataTypes.DECIMAL(10,2), allowNull: false },
    total:           { type: DataTypes.DECIMAL(10,2), allowNull: false },
    
    // Statut
    statut:          { type: DataTypes.ENUM('en_attente', 'contacte', 'confirmee', 'annulee'), defaultValue: 'en_attente' },
    traite:          { type: DataTypes.BOOLEAN, defaultValue: false },
    note_admin:      { type: DataTypes.TEXT },
    
    // Liens
    lien_whatsapp:   { type: DataTypes.STRING(500) },
    
    // Produits (JSON détaillé)
    produits:        { type: DataTypes.JSON, allowNull: false },
    
    // Dates
    date_contact:    { type: DataTypes.DATE },
    date_confirmation: { type: DataTypes.DATE }
    
  }, { tableName: 'whatsapp_commandes', timestamps: true });

  return WhatsappCommande;
};