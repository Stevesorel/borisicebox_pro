const router = require('express').Router();
const auth = require('../middlewares/auth');
const { requireRoles, ROLES } = require('../middlewares/authorize');
const c = require('../controllers/admin.controller');

router.get('/', auth, requireRoles(ROLES.SUPERADMIN), c.getAll);
router.post('/', auth, requireRoles(ROLES.SUPERADMIN), c.create);
router.put('/:id', auth, requireRoles(ROLES.SUPERADMIN), c.update);
router.delete('/:id', auth, requireRoles(ROLES.SUPERADMIN), c.remove);

module.exports = router;
