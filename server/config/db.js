const mongoose = require('mongoose');

let isMongoConnected = false;

// Memory Store Fallback avec prix d'achat et stock
const memoryStore = {
  products: [
    {
      _id: 'prod_1',
      name: 'Rougail Saucisse',
      category: 'Plats',
      price: 2500,
      costPrice: 1400,
      stock: 35,
      minStockAlert: 5,
      description: 'Saucisses fumées mijotées à la tomate, oignons, ail et piment doux.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
      available: true
    },
    {
      _id: 'prod_2',
      name: 'Brochettes Zébu & Frites',
      category: 'Grillades',
      price: 3000,
      costPrice: 1700,
      stock: 25,
      minStockAlert: 5,
      description: 'Brochettes de zébu marinées aux épices douces, servies avec frites maison.',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
      available: true
    },
    {
      _id: 'prod_3',
      name: 'Poulet au Coco & Riz',
      category: 'Plats',
      price: 2800,
      costPrice: 1500,
      stock: 40,
      minStockAlert: 5,
      description: 'Morceaux de poulet tendres réduits dans du lait de coco infusé au gingembre.',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
      available: true
    },
    {
      _id: 'prod_4',
      name: 'Sambos au Bœuf (x5)',
      category: 'Entrées',
      price: 1200,
      costPrice: 600,
      stock: 50,
      minStockAlert: 10,
      description: 'Beignets croustillants farcis à la viande hachée assaisonnée.',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
      available: true
    },
    {
      _id: 'prod_5',
      name: 'Salade de Mangue & Crevettes',
      category: 'Entrées',
      price: 1800,
      costPrice: 950,
      stock: 20,
      minStockAlert: 5,
      description: 'Mangue fraîche, crevettes sautées, coriandre et vinaigrette citronnée.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
      available: true
    },
    {
      _id: 'prod_6',
      name: 'Jus de Tamarin Frais (50cl)',
      category: 'Boissons',
      price: 800,
      costPrice: 350,
      stock: 60,
      minStockAlert: 10,
      description: 'Jus naturel artisanal rafraîchissant.',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80',
      available: true
    },
    {
      _id: 'prod_7',
      name: 'Bière Locale Glacée (65cl)',
      category: 'Boissons',
      price: 1200,
      costPrice: 750,
      stock: 45,
      minStockAlert: 10,
      description: 'Bière blonde locale très fraîche.',
      image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&q=80',
      available: true
    },
    {
      _id: 'prod_8',
      name: 'Flan Coco Vanille',
      category: 'Desserts',
      price: 1000,
      costPrice: 450,
      stock: 30,
      minStockAlert: 5,
      description: 'Dessert onctueux au lait de coco et gousse de vanille.',
      image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=500&q=80',
      available: true
    }
  ],
  tables: [
    { _id: 'tbl_1', number: 1, name: 'Table 01', zone: 'Terrasse', capacity: 2, status: 'free', currentOrderId: null },
    { _id: 'tbl_2', number: 2, name: 'Table 02', zone: 'Terrasse', capacity: 4, status: 'free', currentOrderId: null },
    { _id: 'tbl_3', number: 3, name: 'Table 03', zone: 'Salle', capacity: 4, status: 'free', currentOrderId: null },
    { _id: 'tbl_4', number: 4, name: 'Table 04', zone: 'Salle', capacity: 6, status: 'free', currentOrderId: null },
    { _id: 'tbl_5', number: 5, name: 'Table 05', zone: 'Salle', capacity: 2, status: 'free', currentOrderId: null },
    { _id: 'tbl_6', number: 6, name: 'Mange-Debout Bar 1', zone: 'Bar', capacity: 2, status: 'free', currentOrderId: null }
  ],
  orders: []
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gargote_db';
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500
    });
    isMongoConnected = true;
    console.log('✅ Connecté à MongoDB avec succès.');
  } catch (err) {
    isMongoConnected = false;
    console.log('⚠️ MongoDB non détecté. Passage automatique en mode STOCKAGE EN MÉMOIRE (Hybride).');
    console.log('   L\'application fonctionne à 100% sans interruption !');
  }
};

const isDBConnected = () => isMongoConnected;
const getMemoryStore = () => memoryStore;

module.exports = { connectDB, isDBConnected, getMemoryStore };
