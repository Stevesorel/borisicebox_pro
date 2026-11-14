// const router  = require('express').Router();
// const auth    = require('../middlewares/auth');
// const upload  = require('../middlewares/upload');
// const { validateProduit } = require('../middlewares/validate');
// const c       = require('../controllers/produit.controller');
// router.get('/slug/:slug',                                         c.getBySlug);  // ← AJOUTER ICI (avant /:id)
// router.get('/',                                                    c.getAll);
// router.get('/:id',                                                 c.getOne);
// router.post('/',      auth, upload.array('images', 10), validateProduit, c.create);
// router.put('/:id',    auth,                                        c.update);
// router.delete('/:id', auth,                                        c.remove);
// router.post('/:id/images',           auth, upload.array('images', 10), c.addImages);
// router.delete('/:id/images/:imageId', auth,                        c.removeImage);
// module.exports = router;


const router  = require('express').Router();
const auth    = require('../middlewares/auth');
const { requireRoles, ALLOWED_FOR_CATALOGUE } = require('../middlewares/authorize');
const { upload, compressImages } = require('../middlewares/upload');
const { validateProduit } = require('../middlewares/validate');
const c       = require('../controllers/produit.controller');
const cachePublic = require('../middlewares/cachePublic');

router.get('/slug/:slug', cachePublic(10), c.getBySlug);
router.get('/export/excel', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), c.exportExcel);
router.get('/export/pdf', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), c.exportPdf);
router.get('/', cachePublic(10), c.getAll);
router.get('/:id', c.getOne);

// Création avec compression
router.post('/', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), upload.array('images', 10), compressImages, validateProduit, c.create);

router.put('/:id', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), c.update);
router.delete('/:id', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), c.remove);

// Ajout d'images avec compression
router.post('/:id/images', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), upload.array('images', 10), compressImages, c.addImages);

router.patch('/:id/images/:imageId', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), c.updateImage);

router.delete('/:id/images/:imageId', auth, requireRoles(...ALLOWED_FOR_CATALOGUE), c.removeImage);

module.exports = router;