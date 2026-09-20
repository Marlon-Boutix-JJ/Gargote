import React, { useState } from 'react';
import { X, Save, DollarSign, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProductEditModal = () => {
  const { editingProduct, setEditingProduct, updateProduct, loading } = useApp();

  if (!editingProduct) return null;

  const [formData, setFormData] = useState({
    name: editingProduct.name || '',
    category: editingProduct.category || 'Plats',
    price: editingProduct.price !== undefined ? editingProduct.price : 0,
    costPrice: editingProduct.costPrice !== undefined ? editingProduct.costPrice : 0,
    stock: editingProduct.stock !== undefined ? editingProduct.stock : 0,
    minStockAlert: editingProduct.minStockAlert !== undefined ? editingProduct.minStockAlert : 5,
    description: editingProduct.description || '',
    image: editingProduct.image || ''
  });

  const sellingPrice = Number(formData.price) || 0;
  const costPrice = Number(formData.costPrice) || 0;
  const unitProfit = sellingPrice - costPrice;
  const marginPercent = sellingPrice > 0 ? Math.round((unitProfit / sellingPrice) * 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProduct(editingProduct._id, formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Package size={20} color="var(--primary)" />
            <span>Modifier Produit & Stock</span>
          </h3>
          <button className="close-btn" onClick={() => setEditingProduct(null)}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Nom du Produit :</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Catégorie :</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Entrées">Entrées</option>
                <option value="Plats">Plats</option>
                <option value="Grillades">Grillades</option>
                <option value="Boissons">Boissons</option>
                <option value="Desserts">Desserts</option>
                <option value="Divers">Divers</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantité en Stock :</label>
              <input
                type="number"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Tarification & Calculateur de Bénéfice */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={16} />
              <span>Fixation des Prix & Marge Bénéficiaire</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Prix de Vente (Ar) :</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 'bold' }}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prix d'Achat / Coût (Ar) :</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--text-muted)' }}
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                />
              </div>
            </div>

            {/* Afficheur en direct de la marge bénéficiaire */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bénéfice Unitaire estimé :</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                  +{unitProfit.toLocaleString()} Ar / unité
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Marge Nette :</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                  {marginPercent}%
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Alerte Stock Bas (Seuil) :</label>
              <input
                type="number"
                className="form-input"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL Image (Optionnel) :</label>
              <input
                type="text"
                className="form-input"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description :</label>
            <input
              type="text"
              className="form-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button 
            type="submit" 
            className="action-btn btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            <Save size={18} />
            <span>Enregistrer les Modifications</span>
          </button>
        </form>
      </div>
    </div>
  );
};
