const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const path       = require('path');
const jwt        = require('jsonwebtoken');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const db         = require('./models');
const ogMiddleware = require('./middlewares/og');

// ─── Garde de configuration ──────────────────────────────────
// On refuse de démarrer sans secret JWT : éviter un fallback exploitable.
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET manquant. Définissez-le dans .env avant de démarrer.')
  process.exit(1)
}

const app    = express();
const server = http.createServer(app);

// ─── Sécurité ────────────────────────────────────────────────
// 1. Helmet EN PREMIER
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// 2. CORS restreint
const allowedOrigins = [
  'https://borisicebox.com',
  'https://www.borisicebox.com',
  'https://admin.borisicebox.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
]
const isAllowedDevOrigin = (origin) =>
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '')
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== 'production' && isAllowedDevOrigin(origin))
    ) {
      callback(null, true)
    } else {
      callback(new Error('Non autorisé par CORS'))
    }
  },
  credentials: true
}))

// 3. Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Trop de requêtes, réessayez plus tard.'
})

app.use('/api/', limiter)

// 4. Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 5. Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
  etag: true,
}))

// 6. OG middleware
app.use(ogMiddleware)

// ─── Socket.IO ───────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== 'production' && isAllowedDevOrigin(origin))
      ) {
        callback(null, true)
      } else {
        callback(new Error('Non autorisé par CORS'))
      }
    },
    methods: ['GET', 'POST']
  }
})
app.set('io', io)

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',                require('./routes/auth.routes'))
app.use('/api/admins',              require('./routes/admin.routes'))
app.use('/api/admin-audit',         require('./routes/adminAudit.routes'))
app.use('/api/categories',          require('./routes/categorie.routes'))
app.use('/api/produits',            require('./routes/produit.routes'))
app.use('/api/commandes',           require('./routes/commande.routes'))
app.use('/api/zones',               require('./routes/zone.routes'))
app.use('/api/tracking',            require('./routes/tracking.routes'))
app.use('/api/dashboard',           require('./routes/dashboard.routes'))
app.use('/api/chat',                require('./routes/chat.routes'))
app.use('/api/whatsapp-commandes',  require('./routes/whatsapp.routes'))
app.use('/api/page-accueil',        require('./routes/pageAccueil.routes'))
app.use('/api/og',                  require('./routes/og.routes'))
app.use('/api/marketing',           require('./routes/marketing.routes'))
app.use('/api/shop-settings',       require('./routes/shopSettings.routes'))

// ─── Socket.IO events ────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connecté : ${socket.id}`)
  socket.on('join', (room, payload = {}) => {
    if (room === 'admin') {
      const token = payload?.token;
      if (!token) {
        console.warn(`⛔ Join admin refusé (token manquant) : ${socket.id}`)
        return;
      }
      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        console.warn(`⛔ Join admin refusé (token invalide) : ${socket.id}`)
        return;
      }
    }
    socket.join(room)
    console.log(`📥 ${socket.id} → room "${room}"`)
  })
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client déconnecté : ${socket.id} (${reason})`)
  })
})

// ─── Démarrage ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`✅ Serveur + Socket.IO sur le port ${PORT}`)
  const syncOptions = process.env.NODE_ENV === 'production'
    ? {}
    : { alter: true }
  db.sequelize.sync(syncOptions).then(() => {
    console.log('✅ Base de données synchronisée')
  })
})