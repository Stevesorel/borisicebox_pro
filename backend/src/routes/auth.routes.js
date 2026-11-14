const router    = require('express').Router()
const rateLimit = require('express-rate-limit')
const auth = require('../middlewares/auth')
const { login, me } = require('../controllers/auth.controller')

// Rate limiter strict pour le login — 5 tentatives par 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/login', loginLimiter, login)
router.get('/me', auth, me)

module.exports = router
