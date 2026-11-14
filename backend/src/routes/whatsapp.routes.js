const router = require('express').Router();
const auth = require('../middlewares/auth');
const { requireRoles, ALLOWED_FOR_COMMANDES } = require('../middlewares/authorize');
const c = require('../controllers/whatsapp.controller');

router.post('/', c.create);
router.get('/', auth, requireRoles(...ALLOWED_FOR_COMMANDES), c.getAll);
router.get('/:id', auth, requireRoles(...ALLOWED_FOR_COMMANDES), c.getOne);
router.patch('/:id/statut', auth, requireRoles(...ALLOWED_FOR_COMMANDES), c.updateStatut);
router.delete('/:id', auth, requireRoles(...ALLOWED_FOR_COMMANDES), c.remove);

module.exports = router;