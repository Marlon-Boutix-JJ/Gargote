import React, { useState } from 'react';
import { Lock, Copy, Check, KeyRound, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PwaInstallButton } from './PwaInstallButton';
import { verifyClientActivationKey, isStaticHost } from '../utils/licenseUtils';

export const DeviceActivationModal = ({ challengeCode, onActivated }) => {
  const { showToast } = useApp();
  const [activationKey, setActivationKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(challengeCode);
    setCopied(true);
    showToast('Code Défi copié !');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    const cleanKey = activationKey.trim().replace(/\D/g, '');
    if (cleanKey.length !== 6) {
      setErrorMsg('Le code d\'activation doit comporter exactement 6 chiffres.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    // 1. Essai via le serveur backend s'il est actif (non-statique)
    if (!isStaticHost()) {
      try {
        const deviceId = localStorage.getItem('gargote_device_id');
        const res = await fetch('/api/device/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId,
            challengeCode,
            activationKey: cleanKey
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('gargote_activation_key', cleanKey);
            showToast('Appareil activé avec succès !');
            onActivated();
            setSubmitting(false);
            return;
          } else {
            setErrorMsg(data.error || 'Code à 6 chiffres incorrect.');
            setSubmitting(false);
            return;
          }
        }
      } catch (err) {
        // Mode hors-ligne ou hébergement statique GitHub Pages sans serveur backend
      }
    }

    // 2. Fallback d'activation locale autonome (Mode GitHub Pages / Offline)
    if (verifyClientActivationKey(challengeCode, cleanKey)) {
      localStorage.setItem('gargote_activation_key', cleanKey);
      showToast('Appareil activé avec succès !');
      onActivated();
    } else {
      setErrorMsg('Code d\'activation à 6 chiffres incorrect pour ce Code Défi.');
    }
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" style={{ background: '#0b0d14', backdropFilter: 'blur(20px)', zIndex: 99999 }}>
      <div className="modal-content" style={{ maxWidth: '460px', padding: '2rem', border: '1px solid rgba(245, 158, 11, 0.4)', boxShadow: '0 25px 60px rgba(0,0,0,0.95)', textAlign: 'center', position: 'relative' }}>
        
        <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--primary), var(--accent-orange))', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)' }}>
          <Lock size={32} />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Activation de l'Appareil</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem', lineHeight: 1.4 }}>
          Envoyez ce **code à 6 chiffres** à l'administrateur pour recevoir votre code d'activation.
        </p>

        {/* Affichage du Code Défi à 6 Chiffres */}
        <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px dashed rgba(245, 158, 11, 0.5)', padding: '1.25rem', borderRadius: '16px', margin: '1.25rem 0' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            VOTRE CODE DÉFI (6 CHIFFRES) :
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.8rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '8px', margin: '0.4rem 0' }}>
            {challengeCode}
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopy}
            style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {copied ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
            <span>{copied ? 'Code Copié !' : 'Copier les 6 chiffres'}</span>
          </button>
        </div>

        {/* Formulaire de Saisie du Code d'Activation à 6 Chiffres */}
        <form onSubmit={handleActivate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <KeyRound size={16} color="var(--primary)" />
              <span>Entrez le code à 6 chiffres reçu :</span>
            </label>
            <input
              type="text"
              maxLength={6}
              className="form-input"
              placeholder="000000"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-green)', textAlign: 'center', letterSpacing: '8px' }}
              value={activationKey}
              onChange={(e) => setActivationKey(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--accent-red)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="action-btn btn-primary"
            style={{ padding: '1rem', fontSize: '1rem' }}
            disabled={submitting || activationKey.length !== 6}
          >
            <Sparkles size={20} />
            <span>Débloquer l'Appareil</span>
          </button>
        </form>
      </div>

      {/* Bouton Flottant d'Installation en Bas à Droite dès l'écran d'activation */}
      <PwaInstallButton />
    </div>
  );
};
