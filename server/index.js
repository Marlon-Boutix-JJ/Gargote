const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const { connectDB } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const tableRoutes = require('./routes/tableRoutes');
const orderRoutes = require('./routes/orderRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

const app = express();
const PORT = process.env.PORT || 5800;

// 1. En-têtes HTTP de sécurité (Helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Désactivé si intégration d'images distantes unsplash
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. Limitation stricte de l'origine CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser requêtes sans origin (ex: mobile apps, curl local)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée par la politique CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. Limitation de la taille du Body (Prévention DoS)
app.use(express.json({ limit: '10kb' }));

// 4. Assainissement contre les Injections NoSQL
app.use(mongoSanitize({
  replaceWith: '_'
}));

// 5. Rate Limiting Général (Max 200 requêtes par 15 min par IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer dans 15 minutes.' }
});
app.use('/api', apiLimiter);

// 6. Rate Limiting Stricte pour Création & Paiement de Commande (Max 40 requêtes par minute)
const orderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 40,
  message: { error: 'Fréquence de transactions trop élevée. Veuillez patienter un instant.' }
});
app.use('/api/orders', orderLimiter);

// Se connecter à la base de données
connectDB();

// Routes API
app.use('/api/products', productRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/device', deviceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Gargote POS Secured API', timestamp: new Date() });
});

// Middleware Global de Gestion d'Erreurs Sécurisé (Masquage des Stack Traces)
app.use((err, req, res, next) => {
  console.error('❌ Erreur Serveur Interne :', err.stack || err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Une erreur interne est survenue sur le serveur.' 
      : (err.message || 'Erreur interne du serveur')
  });
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🔒 Serveur Sécurisé Gargote POS démarré sur le port ${PORT}`);
  console.log(`📡 URL API: http://localhost:${PORT}/api`);
});
