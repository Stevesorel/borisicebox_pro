const ROLES = Object.freeze({
  SUPERADMIN: 'superadmin',
  GESTIONNAIRE: 'gestionnaire', // Legacy role kept for backward compatibility
  CATALOGUE: 'catalogue',
  COMMANDES: 'commandes'
});

const UNIQUE = (arr) => [...new Set(arr)];

const ALLOWED_FOR_CATALOGUE = UNIQUE([
  ROLES.SUPERADMIN,
  ROLES.GESTIONNAIRE,
  ROLES.CATALOGUE
]);

const ALLOWED_FOR_COMMANDES = UNIQUE([
  ROLES.SUPERADMIN,
  ROLES.GESTIONNAIRE,
  ROLES.COMMANDES
]);

const ALLOWED_FOR_ADMIN_CORE = UNIQUE([
  ROLES.SUPERADMIN,
  ROLES.GESTIONNAIRE
]);

const ALLOWED_FOR_DASHBOARD = ALLOWED_FOR_ADMIN_CORE;

const requireRoles = (...roles) => {
  const allowed = UNIQUE(roles);
  return (req, res, next) => {
    const role = req.admin?.role;
    if (!role) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    // Le superadmin garde toujours un accès global à la plateforme.
    if (role === ROLES.SUPERADMIN) {
      return next();
    }
    if (!allowed.includes(role)) {
      return res.status(403).json({ message: 'Accès refusé pour ce rôle' });
    }
    next();
  };
};

module.exports = {
  ROLES,
  ALLOWED_FOR_CATALOGUE,
  ALLOWED_FOR_COMMANDES,
  ALLOWED_FOR_ADMIN_CORE,
  ALLOWED_FOR_DASHBOARD,
  requireRoles
};
