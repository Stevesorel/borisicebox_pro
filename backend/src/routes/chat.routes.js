const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/chat.controller');

// Limite stricte : l'endpoint appelle l'API Groq (payante) → on borne les abus.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { reply: '⏳ Trop de messages d\'affilée. Patientez un instant puis réessayez.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', chatLimiter, c.chat);

module.exports = router;
