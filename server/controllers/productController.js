const Product = require('../models/Product');
const mongoose = require('mongoose');
const { isDBConnected, getMemoryStore } = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    if (isDBConnected()) {
      const products = await Product.find().sort({ category: 1, name: 1 });
      return res.json(products);
    }
    const memory = getMemoryStore();
    return res.json(memory.products);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des produits', details: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, costPrice, stock, minStockAlert, description, image } = req.body;
    if (isDBConnected()) {
      const newProd = new Product({ 
        name, 
        category, 
        price: Number(price), 
        costPrice: Number(costPrice) || 0,
        stock: Number(stock) || 0,
        minStockAlert: Number(minStockAlert) || 5,
        description, 
        image 
      });
      await newProd.save();
      return res.status(201).json(newProd);
    }
    const memory = getMemoryStore();
    const newProd = {
      _id: 'prod_' + Date.now(),
      name,
      category,
      price: Number(price),
      costPrice: Number(costPrice) || 0,
      stock: Number(stock) || 0,
      minStockAlert: Number(minStockAlert) || 5,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
      available: true
    };
    memory.products.push(newProd);
    return res.status(201).json(newProd);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création du produit', details: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, costPrice, stock, minStockAlert, description, image, available } = req.body;

    if (isDBConnected()) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id);
      }
      if (!product) {
        product = await Product.findOne({ _id: id });
      }
      if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

      if (name !== undefined) product.name = name;
      if (category !== undefined) product.category = category;
      if (price !== undefined) product.price = Number(price);
      if (costPrice !== undefined) product.costPrice = Number(costPrice);
      if (stock !== undefined) product.stock = Number(stock);
      if (minStockAlert !== undefined) product.minStockAlert = Number(minStockAlert);
      if (description !== undefined) product.description = description;
      if (image !== undefined) product.image = image;
      if (available !== undefined) product.available = available;

      await product.save();
      return res.json(product);
    }

    // Version Mémoire
    const memory = getMemoryStore();
    const product = memory.products.find(p => String(p._id) === String(id));
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (costPrice !== undefined) product.costPrice = Number(costPrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (minStockAlert !== undefined) product.minStockAlert = Number(minStockAlert);
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;
    if (available !== undefined) product.available = available;

    return res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit', details: err.message });
  }
};
