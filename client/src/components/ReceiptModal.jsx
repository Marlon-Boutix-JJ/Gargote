import React from 'react';
import { X, CheckCircle, PlusCircle, CreditCard, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReceiptModal = () => {
  const { 
    activeOrder, 
    setActiveModal, 
    validateReceipt, 
    payReceipt, 
    loading 
  } = useApp();

  if (!activeOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            <span>Reçu & Ticket de Caisse</span>
          </h3>
          <button className="close-btn" onClick={() => setActiveModal(null)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Ticket de caisse imprimable */}
          <div className="receipt-paper">
            <div className="receipt-header">
              <div className="receipt-brand">Gargote Gourmande</div>
              <div className="receipt-info">Cuisine Traditionnelle & Grillades</div>
              <div className="receipt-info">Tél: 034 12 345 67 — Antananarivo</div>
              <div className="receipt-table-tag">{activeOrder.tableName}</div>
              <div className="receipt-info" style={{ marginTop: '0.4rem' }}>
                Reçu #: {activeOrder.receiptNumber}<br />
                Date: {new Date(activeOrder.createdAt).toLocaleString('fr-FR')}
              </div>
            </div>

            <table className="receipt-items">
              <thead>
                <tr>
                  <th>Qté</th>
                  <th>Article</th>
                  <th className="num">P.U</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {activeOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.quantity}x</td>
                    <td>
                      {item.name}
                      {item.note && <div style={{ fontSize: '0.7rem', color: '#666', italic: true }}>({item.note})</div>}
                    </td>
                    <td className="num">{item.unitPrice.toLocaleString()}</td>
                    <td className="num">{item.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="receipt-totals">
              <div className="row">
                <span>Nombre d'articles :</span>
                <span>{activeOrder.items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="row">
                <span>Statut commande :</span>
                <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {activeOrder.status === 'validated' ? 'Validée (En Cuisine)' : 'En Attente'}
                </span>
              </div>
              <div className="row grand-total">
                <span>TOTAL A PAYER :</span>
                <span>{activeOrder.totalAmount.toLocaleString()} Ar</span>
              </div>
            </div>

            <div className="receipt-footer-msg">
              *** Merci de votre visite et bon appétit ! ***
            </div>
          </div>

          {/* Actions requis dans les spécifications utilisateur */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {/* Bouton Valider la commande */}
              <button 
                className={`action-btn ${activeOrder.status === 'validated' ? 'btn-secondary' : 'btn-success'}`}
                onClick={validateReceipt}
                disabled={loading || activeOrder.status === 'validated'}
              >
                <CheckCircle size={18} />
                <span>{activeOrder.status === 'validated' ? 'Commande Validée' : 'Valider la commande'}</span>
              </button>

              {/* Bouton Rajouter des produits */}
              <button 
                className="action-btn btn-purple"
                onClick={() => setActiveModal(null)}
              >
                <PlusCircle size={18} />
                <span>Rajouter des produits</span>
              </button>
            </div>

            {/* Bouton Payer principal */}
            <button 
              className="action-btn btn-primary"
              style={{ fontSize: '1.1rem', padding: '1rem' }}
              onClick={() => setActiveModal('payment')}
            >
              <CreditCard size={22} />
              <span>BOUTON PAYER ({activeOrder.totalAmount.toLocaleString()} Ar)</span>
            </button>

            {/* Bouton Impression Ticket */}
            <button 
              className="btn-secondary"
              style={{ width: '100%', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={handlePrint}
            >
              <Printer size={16} />
              <span>Imprimer le ticket thermographique</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
