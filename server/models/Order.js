const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  costPrice: { type: Number, default: 0 },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  profit: { type: Number, default: 0 },
  note: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  tableId: { type: String, required: true },
  tableName: { type: String, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true, default: 0 },
  totalCost: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'validated', 'paid'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'mobile_money', null], 
    default: null 
  },
  amountReceived: { type: Number, default: 0 },
  changeGiven: { type: Number, default: 0 },
  validatedAt: { type: Date, default: null },
  paidAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
