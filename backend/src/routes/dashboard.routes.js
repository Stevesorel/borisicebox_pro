const router = require('express').Router();
const auth = require('../middlewares/auth');
const { requireRoles, ALLOWED_FOR_DASHBOARD } = require('../middlewares/authorize');
const { stats } = require('../controllers/dashboard.controller');
router.get('/stats', auth, requireRoles(...ALLOWED_FOR_DASHBOARD), stats);
module.exports = router;
