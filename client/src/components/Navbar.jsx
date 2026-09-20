import React from 'react';
import { UtensilsCrossed, LayoutGrid, Package, TrendingUp, Receipt } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const { activeTab, setActiveTab, activeOrder, setActiveModal } = useApp();

  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">
          <UtensilsCrossed size={22} />
        </div>
        <div>
          <span>Gargote<span style={{ color: 'var(--primary)' }}>POS</span></span>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Gestion, Stock & Bénéfices
          </div>
        </div>
      </div>

      <nav className="nav-actions">
        <button 
          className={`nav-tab ${activeTab === 'pos' ? 'active' : ''}`}
          onClick={() => setActiveTab('pos')}
        >
          <LayoutGrid size={18} />
          <span>Caisse & Salle</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          <Package size={18} />
          <span>Gestion du Stock & Prix</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <TrendingUp size={18} />
          <span>Bénéfices & Ventes</span>
        </button>

        {activeOrder && (
          <button 
            className="nav-tab"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            onClick={() => {
              setActiveTab('pos');
              setActiveModal('receipt');
            }}
          >
            <Receipt size={18} />
            <span>Reçu Active (#{activeOrder.receiptNumber})</span>
          </button>
        )}
      </nav>
    </header>
  );
};
