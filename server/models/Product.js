const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['Entrées', 'Plats', 'Grillades', 'Boissons', 'Desserts', 'Divers'] },
  price: { type: Number, required: true }, // Prix de vente
  costPrice: { type: Number, default: 0 }, // Prix d'achat (pour calcul des bénéfices)
  stock: { type: Number, default: 50 }, // Quantité disponible en stock
  minStockAlert: { type: Number, default: 5 }, // Seuil d'alerte stock bas
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
