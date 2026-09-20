import React, { useState, useEffect } from 'react';
import { X, DollarSign, ShoppingBag, TrendingUp, Award, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StatsDashboard = () => {
  const { setActiveModal } = useApp();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetch('/api/orders/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoadingStats(false);
      })
      .catch(err => {
        console.error('Erreur stats:', err);
        setLoadingStats(false);
      });
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <h3 className="modal-title">
            <TrendingUp size={20} color="var(--primary)" />
            <span>Statistiques des Ventes & Chiffre d'Affaires</span>
          </h3>
          <button className="close-btn" onClick={() => setActiveModal(null)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loadingStats ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Chargement du rapport financier...
            </div>
          ) : !stats ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Aucune donnée disponible pour le moment.
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>
                      {stats.totalRevenue.toLocaleString()} Ar
                    </div>
                    <div className="stat-label">Chiffre d'Affaires Encaissé</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)' }}>
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.paidOrderCount}</div>
                    <div className="stat-label">Commandes Réglées</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.averageCart.toLocaleString()} Ar</div>
                    <div className="stat-label">Panier Moyen</div>
                  </div>
                </div>
              </div>

              {/* Plats les plus vendus */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="var(--primary)" />
                  <span>Top 5 des Produits les Plus Vendus</span>
                </h4>

                {stats.topProducts.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aucun produit vendu pour l'instant.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {stats.topProducts.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.9rem' }}>
                        <div>
                          <strong style={{ marginRight: '0.5rem', color: 'var(--primary)' }}>#{i + 1}</strong>
                          <span>{p.name}</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{p.quantity} vendus</span> — {p.revenue.toLocaleString()} Ar
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
