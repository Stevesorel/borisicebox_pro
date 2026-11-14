const router = require('express').Router();
const { getProductOg } = require('../controllers/og.controller');

router.get('/produit/:slug', getProductOg);

module.exports = router;
