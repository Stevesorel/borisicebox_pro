const router = require('express').Router()
const { track, trackByPhone } = require('../controllers/tracking.controller')

router.get('/telephone/:telephone', trackByPhone)
router.get('/:reference', track)

module.exports = router
