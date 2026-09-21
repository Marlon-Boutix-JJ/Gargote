import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDeviceId, getDeviceFingerprint } from '../utils/deviceFingerprint';
import { isStaticHost } from '../utils/licenseUtils';

const AppContext = createContext();

// Données initiales par défaut si hébergement statique sans API backend
const DEFAULT_PRODUCTS = [
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
];

const DEFAULT_TABLES = [
  { _id: 'tbl_1', number: 1, name: 'Table 01', zone: 'Terrasse', capacity: 2, status: 'free', currentOrderId: null },
  { _id: 'tbl_2', number: 2, name: 'Table 02', zone: 'Terrasse', capacity: 4, status: 'free', currentOrderId: null },
  { _id: 'tbl_3', number: 3, name: 'Table 03', zone: 'Salle', capacity: 4, status: 'free', currentOrderId: null },
  { _id: 'tbl_4', number: 4, name: 'Table 04', zone: 'Salle', capacity: 6, status: 'free', currentOrderId: null },
  { _id: 'tbl_5', number: 5, name: 'Table 05', zone: 'Salle', capacity: 2, status: 'free', currentOrderId: null },
  { _id: 'tbl_6', number: 6, name: 'Mange-Debout Bar 1', zone: 'Bar', capacity: 2, status: 'free', currentOrderId: null }
];

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [editingProduct, setEditingProduct] = useState(null);

  // État d'activation de la licence de l'appareil
  const [isDeviceActivated, setIsDeviceActivated] = useState(null);
  const [deviceChallengeCode, setDeviceChallengeCode] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [salesFilters, setSalesFilters] = useState({
    startDate: '',
    endDate: '',
    search: '',
    preset: 'today'
  });

  const [salesReportData, setSalesReportData] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    paidOrderCount: 0,
    averageCart: 0,
    marginPercent: 0,
    orders: []
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper local storage
  const getLocalData = (key, fallback) => {
    const raw = localStorage.getItem(`gargote_pos_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  };

  const setLocalData = (key, data) => {
    localStorage.setItem(`gargote_pos_${key}`, JSON.stringify(data));
  };

  // 1. Vérifier la licence et l'activation de l'appareil
  const checkDeviceLicense = async () => {
    if (!isStaticHost()) {
      try {
        const deviceId = getDeviceId();
        const fingerprint = getDeviceFingerprint();

        const res = await fetch('/api/device/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId, fingerprint })
        });

        if (res.ok) {
          const data = await res.json();
          setDeviceChallengeCode(data.challengeCode || '');
          setIsDeviceActivated(data.isActivated);
          return;
        }
      } catch (err) {
        // Fallback local storage pour hébergement statique autonome (GitHub Pages)
      }
    }

    // Algorithme local à 6 chiffres pour le mode hors-serveur
    const deviceId = getDeviceId();
    const storedActivationKey = localStorage.getItem('gargote_activation_key');
    
    // Generer un code défi à 6 chiffres local
    let num = 0;
    for (let i = 0; i < deviceId.length; i++) num += deviceId.charCodeAt(i);
    const localChallenge = String((num * 492815) % 1000000).padStart(6, '0');
    setDeviceChallengeCode(localChallenge);

    if (storedActivationKey && storedActivationKey.length === 6) {
      setIsDeviceActivated(true);
    } else {
      setIsDeviceActivated(false);
    }
  };

  // Charger les produits
  const fetchProducts = async () => {
    if (!isStaticHost()) {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          setLocalData('products', data);
          return;
        }
      } catch (err) {
        // Fallback autonome
      }
    }
    const localProds = getLocalData('products', DEFAULT_PRODUCTS);
    setProducts(localProds);
  };

  // Charger les tables
  const fetchTables = async () => {
    if (!isStaticHost()) {
      try {
        const res = await fetch('/api/tables');
        if (res.ok) {
          const data = await res.json();
          setTables(data);
          setLocalData('tables', data);
          if (selectedTable) {
            const updated = data.find(t => String(t._id) === String(selectedTable._id));
            if (updated) setSelectedTable(updated);
          }
          return;
        }
      } catch (err) {
        // Fallback autonome
      }
    }
    const localTables = getLocalData('tables', DEFAULT_TABLES);
    setTables(localTables);
    if (selectedTable) {
      const updated = localTables.find(t => String(t._id) === String(selectedTable._id));
      if (updated) setSelectedTable(updated);
    }
  };

  // Charger l'historique des ventes & bénéfices
  const fetchSalesHistory = async (overrideFilters = null) => {
    const f = overrideFilters || salesFilters;
    if (!isStaticHost()) {
      try {
        let url = '/api/orders/history?';
        const params = new URLSearchParams();
        if (f.startDate) params.append('startDate', f.startDate);
        if (f.endDate) params.append('endDate', f.endDate);
        if (f.search) params.append('search', f.search);

        const res = await fetch(url + params.toString());
        if (res.ok) {
          const data = await res.json();
          setSalesReportData(data);
          return;
        }
      } catch (err) {
        // Fallback autonome
      }
    }

    // Filtrage autonome local
    let allOrders = getLocalData('paid_orders', []);

    if (f.startDate) {
      const start = new Date(f.startDate);
      start.setHours(0, 0, 0, 0);
      allOrders = allOrders.filter(o => new Date(o.paidAt || o.createdAt) >= start);
    }
    if (f.endDate) {
      const end = new Date(f.endDate);
      end.setHours(23, 59, 59, 999);
      allOrders = allOrders.filter(o => new Date(o.paidAt || o.createdAt) <= end);
    }
    if (f.search && f.search.trim() !== '') {
      const q = f.search.trim().toLowerCase();
      allOrders = allOrders.filter(o => {
        const matchReceipt = o.receiptNumber.toLowerCase().includes(q);
        const matchTable = o.tableName.toLowerCase().includes(q);
        const matchItems = o.items.some(i => i.name.toLowerCase().includes(q));
        return matchReceipt || matchTable || matchItems;
      });
    }

    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalCost = allOrders.reduce((sum, o) => sum + (o.totalCost || 0), 0);
    const totalProfit = allOrders.reduce((sum, o) => sum + (o.totalProfit || (o.totalAmount - (o.totalCost || 0))), 0);
    const count = allOrders.length;
    const averageCart = count > 0 ? Math.round(totalRevenue / count) : 0;
    const marginPercent = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    setSalesReportData({
      totalRevenue,
      totalCost,
      totalProfit,
      paidOrderCount: count,
      averageCart,
      marginPercent,
      orders: allOrders
    });
  };

  // Charger la commande active d'une table
  const fetchActiveOrder = async (tableId) => {
    if (!tableId) return;
    if (!isStaticHost()) {
      try {
        const res = await fetch(`/api/orders/active/${tableId}`);
        if (res.ok) {
          const data = await res.json();
          setActiveOrder(data);
          return;
        }
      } catch (err) {
        // Fallback autonome
      }
    }
    const localActiveOrders = getLocalData('active_orders', {});
    setActiveOrder(localActiveOrders[tableId] || null);
  };

  useEffect(() => {
    checkDeviceLicense();
    fetchProducts();
    fetchTables();
  }, []);

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesHistory();
    }
  }, [activeTab]);

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setCartItems([]);
    fetchActiveOrder(table._id);
  };

  const addToCart = (product) => {
    if (!selectedTable) {
      showToast('Veuillez d\'abord sélectionner une table !', 'error');
      return;
    }

    if (product.stock !== undefined && product.stock <= 0) {
      showToast(`Rupture de stock pour ${product.name} !`, 'error');
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => String(item.productId) === String(product._id));
      const currentQtyInCart = existing ? existing.quantity : 0;

      if (product.stock !== undefined && currentQtyInCart + 1 > product.stock) {
        showToast(`Stock insuffisant (${product.stock} disponibles)`, 'error');
        return prev;
      }

      if (existing) {
        return prev.map(item =>
          String(item.productId) === String(product._id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, {
        productId: String(product._id),
        name: product.name,
        unitPrice: product.price,
        costPrice: product.costPrice || 0,
        quantity: 1,
        note: ''
      }];
    });

    showToast(`${product.name} ajouté !`);
  };

  const updateQuantity = (productId, delta) => {
    const product = products.find(p => String(p._id) === String(productId));
    setCartItems(prev => {
      return prev.map(item => {
        if (String(item.productId) === String(productId)) {
          const newQty = item.quantity + delta;
          if (delta > 0 && product && product.stock !== undefined && newQty > product.stock) {
            showToast(`Limite de stock atteinte (${product.stock} disponibles)`, 'error');
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const updateNote = (productId, note) => {
    setCartItems(prev => prev.map(item => 
      String(item.productId) === String(productId) ? { ...item, note } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => String(item.productId) !== String(productId)));
  };

  const clearCart = () => setCartItems([]);

  // Mettre à jour un produit
  const updateProduct = async (id, updatedFields) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        await fetchProducts();
        showToast('Fiche produit & stock mis à jour avec succès !');
        setActiveModal(null);
        setEditingProduct(null);
        setLoading(false);
        return;
      }
    } catch (err) {
      // Fallback autonome
    }

    const updatedProds = products.map(p => 
      String(p._id) === String(id) ? { ...p, ...updatedFields } : p
    );
    setProducts(updatedProds);
    setLocalData('products', updatedProds);
    showToast('Fiche produit & stock mis à jour avec succès !');
    setActiveModal(null);
    setEditingProduct(null);
    setLoading(false);
  };

  // 1. Envoyer la commande (POST /api/orders)
  const submitNewOrder = async () => {
    if (!selectedTable) return;
    if (cartItems.length === 0) {
      showToast('Le panier est vide', 'error');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTable._id,
          tableName: selectedTable.name,
          items: cartItems
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveOrder(data);
        setCartItems([]);
        await fetchTables();
        showToast('Commande créée avec succès !');
        setActiveModal('receipt');
        setLoading(false);
        return;
      }
    } catch (err) {
      // Fallback autonome
    }

    // Fallback local
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `REC-${dateStr}-${randNum}`;

    const formattedItems = cartItems.map(item => {
      const unitPrice = Number(item.unitPrice);
      const costPrice = Number(item.costPrice || 0);
      const quantity = Number(item.quantity);
      return {
        productId: item.productId,
        name: item.name,
        unitPrice,
        costPrice,
        quantity,
        totalPrice: unitPrice * quantity,
        profit: (unitPrice - costPrice) * quantity,
        note: item.note || ''
      };
    });

    const totalAmount = formattedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalCost = formattedItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

    const newOrder = {
      _id: 'ord_' + Date.now(),
      receiptNumber,
      tableId: selectedTable._id,
      tableName: selectedTable.name,
      items: formattedItems,
      totalAmount,
      totalCost,
      totalProfit: totalAmount - totalCost,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const activeOrders = getLocalData('active_orders', {});
    activeOrders[selectedTable._id] = newOrder;
    setLocalData('active_orders', activeOrders);

    const localTables = tables.map(t => 
      String(t._id) === String(selectedTable._id) ? { ...t, status: 'occupied', currentOrderId: newOrder._id } : t
    );
    setTables(localTables);
    setLocalData('tables', localTables);

    setActiveOrder(newOrder);
    setCartItems([]);
    showToast('Commande créée avec succès !');
    setActiveModal('receipt');
    setLoading(false);
  };

  // 2. Rajouter des produits à la commande ouverte
  const addItemsToReceipt = async () => {
    if (!activeOrder) return;
    if (cartItems.length === 0) {
      showToast('Aucun nouveau produit sélectionné', 'error');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${activeOrder._id}/add-items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveOrder(data);
        setCartItems([]);
        showToast('Nouveaux produits ajoutés au reçu !');
        setActiveModal('receipt');
        setLoading(false);
        return;
      }
    } catch (err) {
      // Fallback autonome
    }

    // Fallback local
    const updatedItems = [...activeOrder.items];
    cartItems.forEach(newItem => {
      const existingIdx = updatedItems.findIndex(i => String(i.productId) === String(newItem.productId) && i.note === (newItem.note || ''));
      const unitPrice = Number(newItem.unitPrice);
      const costPrice = Number(newItem.costPrice || 0);
      const quantity = Number(newItem.quantity);
      if (existingIdx > -1) {
        updatedItems[existingIdx].quantity += quantity;
        updatedItems[existingIdx].totalPrice = updatedItems[existingIdx].quantity * unitPrice;
        updatedItems[existingIdx].profit = (unitPrice - costPrice) * updatedItems[existingIdx].quantity;
      } else {
        updatedItems.push({
          productId: newItem.productId,
          name: newItem.name,
          unitPrice,
          costPrice,
          quantity,
          totalPrice: unitPrice * quantity,
          profit: (unitPrice - costPrice) * quantity,
          note: newItem.note || ''
        });
      }
    });

    const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalCost = updatedItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

    const updatedOrder = {
      ...activeOrder,
      items: updatedItems,
      totalAmount,
      totalCost,
      totalProfit: totalAmount - totalCost
    };

    const activeOrders = getLocalData('active_orders', {});
    activeOrders[selectedTable._id] = updatedOrder;
    setLocalData('active_orders', activeOrders);

    setActiveOrder(updatedOrder);
    setCartItems([]);
    showToast('Nouveaux produits ajoutés au reçu !');
    setActiveModal('receipt');
    setLoading(false);
  };

  // 3. Valider la commande
  const validateReceipt = async () => {
    if (!activeOrder) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${activeOrder._id}/validate`, { method: 'PUT' });
      if (res.ok) {
        const data = await res.json();
        setActiveOrder(data);
        showToast('Commande validée ! Envoyée en cuisine.');
        setLoading(false);
        return;
      }
    } catch (err) {
      // Fallback autonome
    }

    const updatedOrder = { ...activeOrder, status: 'validated', validatedAt: new Date().toISOString() };
    const activeOrders = getLocalData('active_orders', {});
    activeOrders[selectedTable._id] = updatedOrder;
    setLocalData('active_orders', activeOrders);

    setActiveOrder(updatedOrder);
    showToast('Commande validée ! Envoyée en cuisine.');
    setLoading(false);
  };

  // 4. Bouton Payer (Paiement & Décrémentation du stock)
  const payReceipt = async (paymentMethod, amountReceived, changeGiven) => {
    if (!activeOrder) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${activeOrder._id}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod, amountReceived, changeGiven })
      });
      if (res.ok) {
        setActiveOrder(null);
        setActiveModal(null);
        setCartItems([]);
        await fetchTables();
        await fetchProducts();
        showToast('Paiement enregistré ! Stock mis à jour & Table libérée.', 'success');
        setLoading(false);
        return;
      }
    } catch (err) {
      // Fallback autonome
    }

    // Fallback local
    const paidOrder = {
      ...activeOrder,
      status: 'paid',
      paymentMethod,
      amountReceived: Number(amountReceived) || activeOrder.totalAmount,
      changeGiven: Number(changeGiven) || 0,
      paidAt: new Date().toISOString()
    };

    // Stocker dans l'historique payé
    const paidOrders = getLocalData('paid_orders', []);
    paidOrders.unshift(paidOrder);
    setLocalData('paid_orders', paidOrders);

    // Supprimer de la commande active
    const activeOrders = getLocalData('active_orders', {});
    delete activeOrders[selectedTable._id];
    setLocalData('active_orders', activeOrders);

    // Décrémenter le stock localement
    const updatedProds = products.map(p => {
      const soldItem = activeOrder.items.find(i => String(i.productId) === String(p._id));
      if (soldItem) {
        return { ...p, stock: Math.max(0, (p.stock || 0) - soldItem.quantity) };
      }
      return p;
    });
    setProducts(updatedProds);
    setLocalData('products', updatedProds);

    // Libérer la table
    const localTables = tables.map(t => 
      String(t._id) === String(selectedTable._id) ? { ...t, status: 'free', currentOrderId: null } : t
    );
    setTables(localTables);
    setLocalData('tables', localTables);

    setActiveOrder(null);
    setActiveModal(null);
    setCartItems([]);
    showToast('Paiement enregistré ! Stock mis à jour & Table libérée.', 'success');
    setLoading(false);
  };

  return (
    <AppContext.Provider value={{
      products,
      tables,
      selectedTable,
      cartItems,
      activeOrder,
      activeModal,
      activeTab,
      editingProduct,
      selectedCategory,
      searchTerm,
      loading,
      notification,
      salesFilters,
      salesReportData,
      isDeviceActivated,
      deviceChallengeCode,
      setIsDeviceActivated,
      setActiveTab,
      setEditingProduct,
      setSelectedTable: handleSelectTable,
      setSelectedCategory,
      setSearchTerm,
      setActiveModal,
      setSalesFilters,
      addToCart,
      updateQuantity,
      updateNote,
      removeFromCart,
      clearCart,
      updateProduct,
      submitNewOrder,
      addItemsToReceipt,
      validateReceipt,
      payReceipt,
      fetchTables,
      fetchProducts,
      fetchSalesHistory,
      checkDeviceLicense,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
