const router = require('express').Router();
const auth = require('../middlewares/auth');
const { requireRoles, ALLOWED_FOR_COMMANDES } = require('../middlewares/authorize');
const { validateCommande } = require('../middlewares/validate');
const c = require('../controllers/commande.controller');
router.get('/',                auth, requireRoles(...ALLOWED_FOR_COMMANDES), c.getAll);
router.get('/:id',             auth, requireRoles(...ALLOWED_FOR_COMMANDES), c.getOne);
router.post('/',      validateCommande,  c.create);
router.patch('/:id/statut', auth, requireRoles(...ALLOWED_FOR_COMMANDES), c.updateStatut);
router.delete('/:id', auth, requireRoles(...ALLOWED_FOR_COMMANDES), c.remove);
// Dans commande.routes.js
router.get('/export/excel', auth, requireRoles(...ALLOWED_FOR_COMMANDES), c.exportExcel);
router.get('/export/pdf', auth, requireRoles(...ALLOWED_FOR_COMMANDES), c.exportPdf);
module.exports = router;
