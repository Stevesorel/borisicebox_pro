module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    nom:           { type: DataTypes.STRING(100), allowNull: false },
    email:         { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role:          { type: DataTypes.ENUM('superadmin', 'gestionnaire', 'catalogue', 'commandes'), defaultValue: 'gestionnaire' },
    actif:         { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'admins', timestamps: true });

  Admin.associate = (db) => {
    Admin.hasMany(db.AdminAuditLog, { foreignKey: 'admin_id' });
  };

  return Admin;
};
