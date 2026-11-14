const bcrypt = require('bcryptjs');
const { Admin, sequelize } = require('../models');

const seed = async () => {
  await sequelize.sync();
  const existing = await Admin.findOne({ where: { email: 'boris@ibox.cm' } });
  if (existing) {
    console.log('✅ Admin déjà existant');
    process.exit(0);
  }
  const password_hash = await bcrypt.hash('boris2025', 10);
  await Admin.create({
    nom: 'Boris',
    email: 'boris@ibox.cm',
    password_hash,
    role: 'superadmin',
    actif: true
  });
  console.log('✅ Admin créé : boris@ibox.cm / boris2025');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Erreur seed :', err.message);
  process.exit(1);
});
