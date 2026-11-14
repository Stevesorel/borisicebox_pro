const router = require('express').Router();
const auth = require('../middlewares/auth');
const { requireRoles, ROLES } = require('../middlewares/authorize');
const c = require('../controllers/adminAudit.controller');

router.get('/', auth, requireRoles(ROLES.SUPERADMIN), c.getAll);
router.get('/export/product-creations/excel', auth, requireRoles(ROLES.SUPERADMIN), c.exportProductCreationsExcel);
router.get('/export/product-creations/pdf', auth, requireRoles(ROLES.SUPERADMIN), c.exportProductCreationsPdf);
router.get('/export/commande-status-changes/excel', auth, requireRoles(ROLES.SUPERADMIN), c.exportCommandeStatusChangesExcel);
router.get('/export/commande-status-changes/pdf', auth, requireRoles(ROLES.SUPERADMIN), c.exportCommandeStatusChangesPdf);
router.get('/export/commande-cancellations/excel', auth, requireRoles(ROLES.SUPERADMIN), c.exportCommandeCancellationsExcel);
router.get('/export/commande-cancellations/pdf', auth, requireRoles(ROLES.SUPERADMIN), c.exportCommandeCancellationsPdf);

module.exports = router;
