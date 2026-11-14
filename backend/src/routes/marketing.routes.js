const router = require('express').Router();
const ctrl = require('../controllers/marketing.controller');
const auth = require('../middlewares/auth');
const { requireRoles, ALLOWED_FOR_CATALOGUE } = require('../middlewares/authorize');
const cachePublic = require('../middlewares/cachePublic');

router.get('/public', cachePublic(10), ctrl.getPublic);
router.get('/', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), ctrl.getAll);
router.post('/', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), ctrl.create);
router.put('/:id', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), ctrl.update);
router.delete('/:id', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), ctrl.remove);

module.exports = router;
