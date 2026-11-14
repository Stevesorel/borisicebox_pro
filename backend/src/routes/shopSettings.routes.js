const router = require('express').Router();
const ctrl = require('../controllers/shopSettings.controller');
const auth = require('../middlewares/auth');
const { requireRoles, ALLOWED_FOR_ADMIN_CORE } = require('../middlewares/authorize');
const { upload } = require('../middlewares/upload');
const cachePublic = require('../middlewares/cachePublic');

router.get('/public', cachePublic(10), ctrl.getPublic);
router.get('/', auth, requireRoles(...ALLOWED_FOR_ADMIN_CORE), ctrl.getAdmin);
router.put('/', auth, requireRoles(...ALLOWED_FOR_ADMIN_CORE), ctrl.update);
router.post('/asset/:type', auth, requireRoles(...ALLOWED_FOR_ADMIN_CORE), upload.single('image'), ctrl.uploadAsset);

module.exports = router;
