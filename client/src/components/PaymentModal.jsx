import React, { useState } from 'react';
import { X, Banknote, CreditCard, Smartphone, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PaymentModal = () => {
  const { activeOrder, setActiveModal, payReceipt, loading } = useApp();
  const [method, setMethod] = useState('cash'); // 'cash', 'card', 'mobile_money'
  const [givenAmount, setGivenAmount] = useState('');

  if (!activeOrder) return null;

  const total = activeOrder.totalAmount;
  const numGiven = Number(givenAmount) || total;
  const change = Math.max(0, numGiven - total);

  const handleConfirmPay = () => {
    payReceipt(method, numGiven, change);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <h3 className="modal-title">
            <CreditCard size={20} color="var(--primary)" />
            <span>Règlement de la Commande</span>
          </h3>
          <button className="close-btn" onClick={() => setActiveModal('receipt')}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Montant Total du Reçu #{activeOrder.receiptNumber}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
              {total.toLocaleString()} Ar
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Table : <strong>{activeOrder.tableName}</strong>
            </div>
          </div>

          <div>
            <label className="cash-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Choisir le mode de paiement :</label>
            <div className="payment-methods">
              <button 
                className={`method-card ${method === 'cash' ? 'active' : ''}`}
                onClick={() => setMethod('cash')}
              >
                <Banknote size={24} />
                <span>Espèces</span>
              </button>

              <button 
                className={`method-card ${method === 'card' ? 'active' : ''}`}
                onClick={() => setMethod('card')}
              >
                <CreditCard size={24} />
                <span>Carte Bancaire</span>
              </button>

              <button 
                className={`method-card ${method === 'mobile_money' ? 'active' : ''}`}
                onClick={() => setMethod('mobile_money')}
              >
                <Smartphone size={24} />
                <span>Mobile Money</span>
              </button>
            </div>
          </div>

          {method === 'cash' && (
            <div className="cash-calculator">
              <div className="cash-field">
                <label className="cash-label">Montant reçu du client (Ar) :</label>
                <input
                  type="number"
                  className="cash-input"
                  placeholder={total.toString()}
                  value={givenAmount}
                  onChange={(e) => setGivenAmount(e.target.value)}
                />
              </div>

              <div className="change-display">
                <span>Monnaie à rendre au client :</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}>
                  {change.toLocaleString()} Ar
                </span>
              </div>
            </div>
          )}

          <button 
            className="action-btn btn-success"
            style={{ fontSize: '1.05rem', padding: '1rem', marginTop: '0.5rem' }}
            onClick={handleConfirmPay}
            disabled={loading}
          >
            <Check size={20} />
            <span>Confirmer le Règlement ({total.toLocaleString()} Ar)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
