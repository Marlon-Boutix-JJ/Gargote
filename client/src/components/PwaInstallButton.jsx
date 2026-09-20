import React, { useState, useEffect } from 'react';
import { Download, Sparkles, Check, MonitorDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PwaInstallButton = () => {
  const { showToast } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Empêcher l'affichage de l'invite par défaut du navigateur
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      showToast('GargotePOS a été installé sur votre appareil avec son icône !');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Installation acceptée ! L\'icône a été créée.');
      }
      setDeferredPrompt(null);
    } else {
      // Pour iOS / Navigateurs sans prompt automatique
      showToast('Pour installer : Cliquez sur Partager (ou Menu ⁝) puis "Ajouter à l\'écran d\'accueil".', 'info');
    }
  };

  if (isInstalled) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      animation: 'fadeIn 0.4s ease'
    }}>
      <button
        onClick={handleInstallClick}
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--accent-orange))',
          color: '#0f1117',
          border: 'none',
          borderRadius: '30px',
          padding: '0.85rem 1.4rem',
          fontSize: '0.95rem',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 14px 35px rgba(245, 158, 11, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.4)';
        }}
        title="Installer l'application sur votre appareil (Raccourci & Icône)"
      >
        <MonitorDown size={20} />
        <span>Installer l'App (Icône & Raccourci)</span>
      </button>
    </div>
  );
};
