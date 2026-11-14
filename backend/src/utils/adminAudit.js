const db = require('../models');

exports.writeAdminAudit = async ({
  adminId = null,
  entityType,
  entityId,
  action,
  meta = null
}) => {
  try {
    if (!entityType || !entityId || !action) return;
    await db.AdminAuditLog.create({
      admin_id: adminId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      meta
    });
  } catch (err) {
    // Never break business flow if audit logging fails.
    console.error('Audit log error:', err.message);
  }
};
