import React from 'react';
import { ShoppingBag, Plus, Minus, Trash2, Send, Receipt, CreditCard, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrderPad = () => {
  const { 
    selectedTable, 
    cartItems, 
    activeOrder,
    updateQuantity, 
    updateNote, 
    removeFromCart, 
    clearCart,
    submitNewOrder,
    addItemsToReceipt,
    setActiveModal,
    loading
  } = useApp();

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  if (!selectedTable) {
    return (
      <div className="glass-card order-pad" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '400px' }}>
        <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Aucune Table Sélectionnée</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', maxWidth: '240px' }}>
          Cliquez sur une table dans le plan de salle pour démarrer une commande ou consulter son reçu.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card order-pad">
      <div className="order-pad-header">
        <div>
          <span className="active-table-badge">{selectedTable.name} ({selectedTable.zone})</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {activeOrder ? `Reçu #${activeOrder.receiptNumber}` : 'Nouvelle Commande'}
          </div>
        </div>

        {cartItems.length > 0 && (
          <button 
            onClick={clearCart}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Trash2 size={14} />
            <span>Vider</span>
          </button>
        )}
      </div>

      {/* Reçu existant (si déjà une commande ouverte) */}
      {activeOrder && activeOrder.items.length > 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.75rem', borderRadius: '10px', marginTop: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--primary)' }}>
            <span>Articles déjà au reçu :</span>
            <span>{activeOrder.totalAmount.toLocaleString()} Ar</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {activeOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
          </div>
          <button 
            className="btn-secondary" 
            style={{ marginTop: '0.6rem', width: '100%', padding: '0.4rem', fontSize: '0.8rem' }}
            onClick={() => setActiveModal('receipt')}
          >
            <Receipt size={14} />
            <span>Voir / Modifier le reçu complet</span>
          </button>
        </div>
      )}

      {/* Liste des nouveaux articles dans le panier */}
      <div className="order-items-list">
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 0', fontSize: '0.85rem' }}>
            Sélectionnez des articles dans la carte ci-contre pour les ajouter à cette table.
          </div>
        ) : (
          cartItems.map(item => (
            <div key={item.productId} className="order-item-row">
              <div className="order-item-main">
                <span className="order-item-name">{item.name}</span>
                <span className="order-item-price">{(item.unitPrice * item.quantity).toLocaleString()} Ar</span>
              </div>

              <div className="order-item-actions">
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(item.productId, -1)}>
                    <Minus size={14} />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.productId, 1)}>
                    <Plus size={14} />
                  </button>
                </div>

                <button 
                  onClick={() => removeFromCart(item.productId)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <input
                type="text"
                className="note-input"
                placeholder="Note spéciale (ex: Sans piment)..."
                value={item.note || ''}
                onChange={(e) => updateNote(item.productId, e.target.value)}
              />
            </div>
          ))
        )}
      </div>

      {/* Résumé du Panneau */}
      <div className="order-pad-summary">
        <div className="summary-row">
          <span>Sous-total nouveautés</span>
          <span>{cartTotal.toLocaleString()} Ar</span>
        </div>
        
        {activeOrder && (
          <div className="summary-row">
            <span>Total cumulé avec le reçu</span>
            <span style={{ fontWeight: 700 }}>{(cartTotal + activeOrder.totalAmount).toLocaleString()} Ar</span>
          </div>
        )}

        <div className="summary-row total">
          <span>Total à régler</span>
          <span className="summary-total-amount">
            {((activeOrder ? activeOrder.totalAmount : 0) + cartTotal).toLocaleString()} Ar
          </span>
        </div>

        {/* Action Buttons */}
        {!activeOrder ? (
          <button 
            className="action-btn btn-primary"
            onClick={submitNewOrder}
            disabled={loading || cartItems.length === 0}
            style={{ opacity: (loading || cartItems.length === 0) ? 0.5 : 1 }}
          >
            <Send size={18} />
            <span>Valider & Générer le Reçu</span>
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {cartItems.length > 0 && (
              <button 
                className="action-btn btn-purple"
                onClick={addItemsToReceipt}
                disabled={loading}
              >
                <PlusCircle size={18} />
                <span>Rajouter ces produits au reçu</span>
              </button>
            )}

            <button 
              className="action-btn btn-success"
              onClick={() => setActiveModal('payment')}
            >
              <CreditCard size={18} />
              <span>Payer la Commande</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
