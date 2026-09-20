import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDeviceId, getDeviceFingerprint } from '../utils/deviceFingerprint';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'receipt', 'payment', 'productEdit'
  const [activeTab, setActiveTab] = useState('pos'); // 'pos', 'stock', 'sales'
  const [editingProduct, setEditingProduct] = useState(null);

  // État d'activation de la licence de l'appareil
  const [isDeviceActivated, setIsDeviceActivated] = useState(null); // null = vérification en cours, true/false
  const [deviceChallengeCode, setDeviceChallengeCode] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filtres pour la page des ventes et bénéfices
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

  // Toast Notifications
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Vérifier la licence et l'activation de l'appareil
  const checkDeviceLicense = async () => {
    try {
      const deviceId = getDeviceId();
      const fingerprint = getDeviceFingerprint();

      const res = await fetch('/api/device/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, fingerprint })
      });
      const data = await res.json();

      setDeviceChallengeCode(data.challengeCode || '');
      setIsDeviceActivated(data.isActivated);
    } catch (err) {
      console.error('Erreur vérification licence appareil:', err);
      // Fallback si serveur hors ligne
      setIsDeviceActivated(true);
    }
  };

  // Charger les produits
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    }
  };

  // Charger les tables
  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      setTables(data);
      if (selectedTable) {
        const updated = data.find(t => String(t._id) === String(selectedTable._id));
        if (updated) setSelectedTable(updated);
      }
    } catch (err) {
      console.error('Erreur chargement tables:', err);
    }
  };

  // Charger l'historique des ventes & bénéfices
  const fetchSalesHistory = async (overrideFilters = null) => {
    const f = overrideFilters || salesFilters;
    let url = '/api/orders/history?';
    const params = new URLSearchParams();

    if (f.startDate) params.append('startDate', f.startDate);
    if (f.endDate) params.append('endDate', f.endDate);
    if (f.search) params.append('search', f.search);

    try {
      const res = await fetch(url + params.toString());
      const data = await res.json();
      setSalesReportData(data);
    } catch (err) {
      console.error('Erreur rapport ventes:', err);
    }
  };

  // Charger la commande active d'une table
  const fetchActiveOrder = async (tableId) => {
    if (!tableId) return;
    try {
      const res = await fetch(`/api/orders/active/${tableId}`);
      const data = await res.json();
      setActiveOrder(data);
    } catch (err) {
      console.error('Erreur commande active:', err);
      setActiveOrder(null);
    }
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

  // Changement de table
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setCartItems([]);
    fetchActiveOrder(table._id);
  };

  // Ajouter au panier local avec contrôle du stock
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

  // Modifier quantité dans le panier
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
      const data = await res.json();
      if (res.ok) {
        await fetchProducts();
        showToast('Fiche produit & stock mis à jour avec succès !');
        setActiveModal(null);
        setEditingProduct(null);
      } else {
        showToast(data.error || 'Erreur mise à jour produit', 'error');
      }
    } catch (err) {
      showToast('Erreur serveur lors de la mise à jour', 'error');
    } finally {
      setLoading(false);
    }
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
      const data = await res.json();
      if (res.ok) {
        setActiveOrder(data);
        setCartItems([]);
        await fetchTables();
        showToast('Commande créée avec succès !');
        setActiveModal('receipt');
      } else {
        showToast(data.error || 'Erreur lors de la commande', 'error');
      }
    } catch (err) {
      showToast('Erreur réseau', 'error');
    } finally {
      setLoading(false);
    }
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
      const data = await res.json();
      if (res.ok) {
        setActiveOrder(data);
        setCartItems([]);
        showToast('Nouveaux produits ajoutés au reçu !');
        setActiveModal('receipt');
      } else {
        showToast(data.error || 'Erreur ajout articles', 'error');
      }
    } catch (err) {
      showToast('Erreur serveur', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Valider la commande
  const validateReceipt = async () => {
    if (!activeOrder) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${activeOrder._id}/validate`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (res.ok) {
        setActiveOrder(data);
        showToast('Commande validée ! Envoyée en cuisine.');
      }
    } catch (err) {
      showToast('Erreur validation', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Bouton Payer
  const payReceipt = async (paymentMethod, amountReceived, changeGiven) => {
    if (!activeOrder) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${activeOrder._id}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod, amountReceived, changeGiven })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveOrder(null);
        setActiveModal(null);
        setCartItems([]);
        await fetchTables();
        await fetchProducts();
        showToast('Paiement enregistré ! Stock mis à jour & Table libérée.', 'success');
      } else {
        showToast(data.error || 'Erreur lors du paiement', 'error');
      }
    } catch (err) {
      showToast('Erreur serveur lors du règlement', 'error');
    } finally {
      setLoading(false);
    }
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
