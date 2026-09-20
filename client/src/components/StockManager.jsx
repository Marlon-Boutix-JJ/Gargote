import React, { useState } from 'react';
import { Package, Search, Edit3, AlertTriangle, Plus, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StockManager = () => {
  const { products, setEditingProduct, setSelectedCategory, selectedCategory } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const CATEGORIES = ['Tous', 'Entrées', 'Plats', 'Grillades', 'Boissons', 'Desserts'];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStockBadge = (stock, minAlert = 5) => {
    if (stock <= 0) {
      return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Épuisé</span>;
    }
    if (stock <= minAlert) {
      return <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: 'var(--accent-orange)', border: '1px solid rgba(249, 115, 22, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Stock Bas ({stock})</span>;
    }
    return <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-green)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>En Stock ({stock})</span>;
  };

  return (
    <div className="glass-card" style={{ flex: 1 }}>
      <div className="tables-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="section-title">
            <Package size={22} color="var(--primary)" />
            <span>Gestion des Stocks, Prix & Bénéfices</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Cliquez sur un produit pour modifier son Prix de Vente, son Prix d'Achat et réapprovisionner son Stock.
          </p>
        </div>
      </div>

      {/* Barre de contrôle */}
      <div className="catalog-controls" style={{ marginBottom: '1.5rem' }}>
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un produit dans le stock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="categories-scroll">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau du Stock */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix Vente (Ar)</th>
              <th>Prix Achat / Coût (Ar)</th>
              <th>Bénéfice Unitaire</th>
              <th>Stock Actuel</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => {
              const price = p.price || 0;
              const costPrice = p.costPrice || 0;
              const profit = price - costPrice;
              const margin = price > 0 ? Math.round((profit / price) * 100) : 0;

              return (
                <tr key={p._id} style={{ cursor: 'pointer' }} onClick={() => setEditingProduct(p)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', background: '#222' }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'; }}
                      />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="table-zone">{p.category}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                    {price.toLocaleString()} Ar
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {costPrice.toLocaleString()} Ar
                  </td>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-green)' }}>
                      +{profit.toLocaleString()} Ar
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Marge: {margin}%
                    </div>
                  </td>
                  <td>
                    {getStockBadge(p.stock !== undefined ? p.stock : 0, p.minStockAlert)}
                  </td>
                  <td>
                    <button 
                      className="add-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProduct(p);
                      }}
                    >
                      <Edit3 size={14} />
                      <span>Modifier</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
