const router     = require('express').Router();
const ctrl       = require('../controllers/pageAccueil.controller');
const auth       = require('../middlewares/auth');
const { requireRoles, ALLOWED_FOR_ADMIN_CORE } = require('../middlewares/authorize');
const { upload, compressCarousel } = require('../middlewares/upload');
const cachePublic = require('../middlewares/cachePublic');

router.get('/', cachePublic(10), ctrl.getConfig);
router.put('/',         auth, requireRoles(...ALLOWED_FOR_ADMIN_CORE),     ctrl.updateConfig);
router.post('/carousel',    auth, requireRoles(...ALLOWED_FOR_ADMIN_CORE), upload.array('images', 50), compressCarousel, ctrl.uploadCarousel);
router.delete('/carousel/:id', auth, requireRoles(...ALLOWED_FOR_ADMIN_CORE), ctrl.deleteCarousel);
router.put('/carousel/ordre',  auth, requireRoles(...ALLOWED_FOR_ADMIN_CORE), ctrl.reorderCarousel);

module.exports = router;
