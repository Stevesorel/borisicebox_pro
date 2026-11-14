const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token invalide' });
    try {
      const admin = await Admin.findOne({
        where: { id: decoded.id, actif: true },
        attributes: ['id', 'nom', 'email', 'role', 'actif']
      });
      if (!admin) return res.status(401).json({ message: 'Compte admin inactif ou introuvable' });
      req.admin = admin.toJSON();
      next();
    } catch {
      res.status(401).json({ message: 'Token invalide' });
    }
  });
};
