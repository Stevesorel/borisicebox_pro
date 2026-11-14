const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const fail = require('../utils/errorResponse');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email, actif: true } });
    if (!admin) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    res.json({ token, admin: { id: admin.id, nom: admin.nom, email: admin.email, role: admin.role } });
  } catch (err) {
    fail(res, err);
  }
};

exports.me = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { id: req.admin.id, actif: true },
      attributes: ['id', 'nom', 'email', 'role']
    });
    if (!admin) return res.status(404).json({ message: 'Admin non trouvé' });
    res.json({ admin });
  } catch (err) {
    fail(res, err);
  }
};
