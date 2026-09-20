import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TableGrid } from './components/TableGrid';
import { MenuCatalog } from './components/MenuCatalog';
import { OrderPad } from './components/OrderPad';
import { ReceiptModal } from './components/ReceiptModal';
import { PaymentModal } from './components/PaymentModal';
import { StockManager } from './components/StockManager';
import { ProductEditModal } from './components/ProductEditModal';
import { SalesReportPage } from './components/SalesReportPage';
import { DeviceActivationModal } from './components/DeviceActivationModal';

const MainContent = () => {
  const { 
    activeModal, 
    activeTab, 
    notification, 
    editingProduct, 
    isDeviceActivated, 
    deviceChallengeCode,
    setIsDeviceActivated
  } = useApp();

  // Si l'appareil n'est pas encore activé, afficher l'écran d'activation plein écran
  if (isDeviceActivated === false) {
    return (
      <DeviceActivationModal 
        challengeCode={deviceChallengeCode}
        onActivated={() => setIsDeviceActivated(true)}
      />
    );
  }

  return (
    <div className="app-container">
      <Navbar />

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          background: notification.type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)',
          color: '#fff',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '0.9rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          {notification.message}
        </div>
      )}

      {/* Rendu dynamique selon l'onglet actif */}
      {activeTab === 'pos' && (
        <main className="main-layout">
          <div>
            <TableGrid />
            <MenuCatalog />
          </div>

          <div>
            <OrderPad />
          </div>
        </main>
      )}

      {activeTab === 'stock' && (
        <main className="full-layout">
          <StockManager />
        </main>
      )}

      {activeTab === 'sales' && (
        <main className="full-layout">
          <SalesReportPage />
        </main>
      )}

      {/* Modales */}
      {activeModal === 'receipt' && <ReceiptModal />}
      {activeModal === 'payment' && <PaymentModal />}
      {editingProduct && <ProductEditModal />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
