const Order = require('../models/Order');
const Table = require('../models/Table');
const Product = require('../models/Product');
const { isDBConnected, getMemoryStore } = require('../config/db');

// Generateur de numéro de reçu unique (ex: REC-260920-1042)
const generateReceiptNumber = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `REC-${dateStr}-${randNum}`;
};

// Obtenir la commande active d'une table
exports.getActiveOrderForTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    if (isDBConnected()) {
      const order = await Order.findOne({ tableId, status: { $in: ['pending', 'validated'] } });
      return res.json(order || null);
    }
    const memory = getMemoryStore();
    const order = memory.orders.find(o => String(o.tableId) === String(tableId) && o.status !== 'paid');
    return res.json(order || null);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la recherche de la commande active' });
  }
};

// Helper avec Validation Stricte des Entrées & Calcul des Prix d'Achat/Bénéfices
const processOrderItems = async (items) => {
  let allProducts = [];
  if (isDBConnected()) {
    allProducts = await Product.find();
  } else {
    allProducts = getMemoryStore().products;
  }

  return items.map(item => {
    const matchedProduct = allProducts.find(p => String(p._id) === String(item.productId));
    const costPrice = Math.max(0, Number(item.costPrice !== undefined ? item.costPrice : (matchedProduct ? matchedProduct.costPrice || 0 : 0)));
    const unitPrice = Math.max(0, Number(item.unitPrice || (matchedProduct ? matchedProduct.price : 0)));
    const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)));
    const totalPrice = unitPrice * quantity;
    const itemProfit = (unitPrice - costPrice) * quantity;
    
    // Nettoyage de la note (Max 100 caractères, suppression de balises HTML)
    const cleanNote = String(item.note || '').replace(/<[^>]*>?/gm, '').slice(0, 100);

    return {
      productId: String(item.productId),
      name: String(item.name || (matchedProduct ? matchedProduct.name : 'Article')).slice(0, 80),
      unitPrice,
      costPrice,
      quantity,
      totalPrice,
      profit: itemProfit,
      note: cleanNote
    };
  });
};

// Créer une nouvelle commande
exports.createOrder = async (req, res) => {
  try {
    const { tableId, tableName, items } = req.body;

    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Une commande doit comporter une table valide et au moins un article' });
    }

    const formattedItems = await processOrderItems(items);

    const totalAmount = formattedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalCost = formattedItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const totalProfit = totalAmount - totalCost;
    const receiptNumber = generateReceiptNumber();

    if (isDBConnected()) {
      const newOrder = new Order({
        receiptNumber,
        tableId: String(tableId),
        tableName: String(tableName || 'Table').slice(0, 50),
        items: formattedItems,
        totalAmount,
        totalCost,
        totalProfit,
        status: 'pending'
      });
      await newOrder.save();

      await Table.findByIdAndUpdate(tableId, {
        status: 'occupied',
        currentOrderId: newOrder._id
      });

      return res.status(201).json(newOrder);
    }

    // Version Mémoire
    const memory = getMemoryStore();
    const newOrder = {
      _id: 'ord_' + Date.now(),
      receiptNumber,
      tableId: String(tableId),
      tableName: String(tableName || 'Table').slice(0, 50),
      items: formattedItems,
      totalAmount,
      totalCost,
      totalProfit,
      status: 'pending',
      paymentMethod: null,
      amountReceived: 0,
      changeGiven: 0,
      createdAt: new Date().toISOString(),
      validatedAt: null,
      paidAt: null
    };

    memory.orders.push(newOrder);

    const table = memory.tables.find(t => String(t._id) === String(tableId));
    if (table) {
      table.status = 'occupied';
      table.currentOrderId = newOrder._id;
    }

    return res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
};

// Rajouter des produits à un reçu
exports.addItemsToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Aucun article valide à ajouter' });
    }

    const processedNewItems = await processOrderItems(items);

    if (isDBConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
      if (order.status === 'paid') return res.status(400).json({ error: 'Impossible de modifier une commande déjà réglée' });

      processedNewItems.forEach(newItem => {
        const existingIdx = order.items.findIndex(i => String(i.productId) === String(newItem.productId) && i.note === newItem.note);
        if (existingIdx > -1) {
          order.items[existingIdx].quantity += newItem.quantity;
          order.items[existingIdx].totalPrice = order.items[existingIdx].quantity * order.items[existingIdx].unitPrice;
          order.items[existingIdx].profit = (order.items[existingIdx].unitPrice - order.items[existingIdx].costPrice) * order.items[existingIdx].quantity;
        } else {
          order.items.push(newItem);
        }
      });

      order.totalAmount = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
      order.totalCost = order.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
      order.totalProfit = order.totalAmount - order.totalCost;
      await order.save();
      return res.json(order);
    }

    // Version Mémoire
    const memory = getMemoryStore();
    const order = memory.orders.find(o => String(o._id) === String(id));
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    if (order.status === 'paid') return res.status(400).json({ error: 'Impossible de modifier une commande déjà réglée' });

    processedNewItems.forEach(newItem => {
      const existingIdx = order.items.findIndex(i => String(i.productId) === String(newItem.productId) && i.note === newItem.note);
      if (existingIdx > -1) {
        order.items[existingIdx].quantity += newItem.quantity;
        order.items[existingIdx].totalPrice = order.items[existingIdx].quantity * order.items[existingIdx].unitPrice;
        order.items[existingIdx].profit = (order.items[existingIdx].unitPrice - order.items[existingIdx].costPrice) * order.items[existingIdx].quantity;
      } else {
        order.items.push(newItem);
      }
    });

    order.totalAmount = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
    order.totalCost = order.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    order.totalProfit = order.totalAmount - order.totalCost;
    return res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout des produits' });
  }
};

// Valider la commande
exports.validateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
      
      order.status = 'validated';
      order.validatedAt = new Date();
      await order.save();
      return res.json(order);
    }

    const memory = getMemoryStore();
    const order = memory.orders.find(o => String(o._id) === String(id));
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

    order.status = 'validated';
    order.validatedAt = new Date().toISOString();
    return res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la validation' });
  }
};

// Régler la commande (Bouton Payer) & Décrémentation automatique du Stock
exports.payOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, amountReceived, changeGiven } = req.body;

    const allowedMethods = ['cash', 'card', 'mobile_money'];
    if (!paymentMethod || !allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Mode de paiement invalide' });
    }

    if (isDBConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
      if (order.status === 'paid') return res.status(400).json({ error: 'Commande déjà réglée' });

      order.status = 'paid';
      order.paymentMethod = paymentMethod;
      order.amountReceived = Math.max(0, Number(amountReceived) || order.totalAmount);
      order.changeGiven = Math.max(0, Number(changeGiven) || 0);
      order.paidAt = new Date();
      await order.save();

      // Décrémenter le stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }

      // Libérer la table
      await Table.findByIdAndUpdate(order.tableId, {
        status: 'free',
        currentOrderId: null
      });

      return res.json(order);
    }

    // Version Mémoire
    const memory = getMemoryStore();
    const order = memory.orders.find(o => String(o._id) === String(id));
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    if (order.status === 'paid') return res.status(400).json({ error: 'Commande déjà réglée' });

    order.status = 'paid';
    order.paymentMethod = paymentMethod;
    order.amountReceived = Math.max(0, Number(amountReceived) || order.totalAmount);
    order.changeGiven = Math.max(0, Number(changeGiven) || 0);
    order.paidAt = new Date().toISOString();

    // Décrémenter le stock dans memory
    order.items.forEach(item => {
      const product = memory.products.find(p => String(p._id) === String(item.productId));
      if (product) {
        product.stock = Math.max(0, (product.stock || 0) - item.quantity);
      }
    });

    const table = memory.tables.find(t => String(t._id) === String(order.tableId));
    if (table) {
      table.status = 'free';
      table.currentOrderId = null;
    }

    return res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du paiement' });
  }
};

// Historique complet des ventes et bénéfices filtrable par dates & recherche
exports.getSalesHistory = async (req, res) => {
  try {
    const { startDate, endDate, search } = req.query;

    let paidOrders = [];
    if (isDBConnected()) {
      paidOrders = await Order.find({ status: 'paid' }).sort({ paidAt: -1, createdAt: -1 });
    } else {
      const memory = getMemoryStore();
      paidOrders = memory.orders
        .filter(o => o.status === 'paid')
        .sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt));
    }

    // Filtrage par Date (startDate & endDate)
    if (startDate && !isNaN(Date.parse(startDate))) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      paidOrders = paidOrders.filter(o => new Date(o.paidAt || o.createdAt) >= start);
    }

    if (endDate && !isNaN(Date.parse(endDate))) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      paidOrders = paidOrders.filter(o => new Date(o.paidAt || o.createdAt) <= end);
    }

    // Filtrage par Recherche textuelle avec sanitization
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase().slice(0, 50);
      paidOrders = paidOrders.filter(o => {
        const matchReceipt = o.receiptNumber.toLowerCase().includes(q);
        const matchTable = o.tableName.toLowerCase().includes(q);
        const matchItems = o.items.some(i => i.name.toLowerCase().includes(q));
        return matchReceipt || matchTable || matchItems;
      });
    }

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalCost = paidOrders.reduce((sum, o) => sum + (o.totalCost || 0), 0);
    const totalProfit = paidOrders.reduce((sum, o) => sum + (o.totalProfit || (o.totalAmount - (o.totalCost || 0))), 0);
    const paidOrderCount = paidOrders.length;
    const averageCart = paidOrderCount > 0 ? Math.round(totalRevenue / paidOrderCount) : 0;
    const marginPercent = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    return res.json({
      totalRevenue,
      totalCost,
      totalProfit,
      paidOrderCount,
      averageCart,
      marginPercent,
      orders: paidOrders
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du chargement de l\'historique des ventes' });
  }
};

exports.getOrderStats = async (req, res) => {
  return exports.getSalesHistory(req, res);
};
