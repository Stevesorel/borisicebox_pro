module.exports = (sequelize, DataTypes) => {
  const AdminAuditLog = sequelize.define('AdminAuditLog', {
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    entity_type: {
      type: DataTypes.ENUM(
        'commande',
        'whatsapp_commande',
        'admin',
        'produit',
        'categorie',
        'zone',
        'page_accueil',
        'marketing',
        'shop_settings'
      ),
      allowNull: false
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, { tableName: 'admin_audit_logs', timestamps: true });

  AdminAuditLog.associate = (db) => {
    AdminAuditLog.belongsTo(db.Admin, { foreignKey: 'admin_id' });
  };

  return AdminAuditLog;
};
