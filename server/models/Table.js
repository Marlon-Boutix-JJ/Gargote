const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  zone: { type: String, default: 'Salle' },
  capacity: { type: Number, default: 4 },
  status: { 
    type: String, 
    enum: ['free', 'occupied', 'payment_pending'], 
    default: 'free' 
  },
  currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
