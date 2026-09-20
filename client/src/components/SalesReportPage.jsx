import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Calendar, Search, Filter, ShoppingBag, ArrowUpRight, Clock, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SalesReportPage = () => {
  const { salesReportData, salesFilters, setSalesFilters, fetchSalesHistory } = useApp();

  const [dateRange, setDateRange] = useState('today'); // 'today', '7days', 'month', 'all', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  // Gérer le changement de période prédéfinie
  const handleRangePreset = (preset) => {
    setDateRange(preset);
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0];

    if (preset === 'today') {
      start = end;
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split('T')[0];
    } else if (preset === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      start = d.toISOString().split('T')[0];
    } else if (preset === 'all') {
      start = '';
      end = '';
    }

    setStartDate(start);
    setEndDate(end);

    const newFilters = { ...salesFilters, startDate: start, endDate: end, search };
    setSalesFilters(newFilters);
    fetchSalesHistory(newFilters);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    const newFilters = { ...salesFilters, startDate, endDate, search: val };
    setSalesFilters(newFilters);
    fetchSalesHistory(newFilters);
  };

  const handleCustomDateChange = (startVal, endVal) => {
    setStartDate(startVal);
    setEndDate(endVal);
    setDateRange('custom');
    const newFilters = { ...salesFilters, startDate: startVal, endDate: endVal, search };
    setSalesFilters(newFilters);
    fetchSalesHistory(newFilters);
  };

  useEffect(() => {
    handleRangePreset('today');
  }, []);

  return (
    <div className="glass-card full-layout">
      {/* En-tête de la page */}
      <div className="tables-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="section-title">
            <TrendingUp size={24} color="var(--accent-green)" />
            <span>Rapport des Ventes & Bénéfices Nets</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Consultez le chiffre d'affaires, vos bénéfices nets et l'historique complet des commandes filtrable par dates.
          </p>
        </div>
      </div>

      {/* Cartes d'indicateurs financiers */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>
              {salesReportData.totalRevenue.toLocaleString()} Ar
            </div>
            <div className="stat-label">Chiffre d'Affaires Encaissé</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-green)' }}>
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
              +{salesReportData.totalProfit.toLocaleString()} Ar
            </div>
            <div className="stat-label">Bénéfice Net Réalisé</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{salesReportData.marginPercent}%</div>
            <div className="stat-label">Taux de Marge Moyenne</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="stat-value">{salesReportData.paidOrderCount}</div>
            <div className="stat-label">Nombre de Ventes Réglées</div>
          </div>
        </div>
      </div>

      {/* Barre de Filtres par Période & Recherche */}
      <div className="catalog-controls" style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Presets temporels */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`category-chip ${dateRange === 'today' ? 'active' : ''}`}
              onClick={() => handleRangePreset('today')}
            >
              Aujourd'hui
            </button>
            <button
              className={`category-chip ${dateRange === '7days' ? 'active' : ''}`}
              onClick={() => handleRangePreset('7days')}
            >
              7 Derniers Jours
            </button>
            <button
              className={`category-chip ${dateRange === 'month' ? 'active' : ''}`}
              onClick={() => handleRangePreset('month')}
            >
              Ce Mois-ci
            </button>
            <button
              className={`category-chip ${dateRange === 'all' ? 'active' : ''}`}
              onClick={() => handleRangePreset('all')}
            >
              Toutes les Dates
            </button>
          </div>

          {/* Recherche textuelle */}
          <div className="search-box" style={{ maxWidth: '300px' }}>
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Reçu #, table, produit..."
              value={search}
              onChange={handleSearchChange}
              style={{ padding: '0.55rem 0.75rem 0.55rem 2.4rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Sélection de dates personnalisées */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={15} />
            <span>Filtrer par plage de dates :</span>
          </span>

          <input
            type="date"
            className="form-input"
            style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
            value={startDate}
            onChange={(e) => handleCustomDateChange(e.target.value, endDate)}
          />
          <span style={{ color: 'var(--text-muted)' }}>à</span>
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
            value={endDate}
            onChange={(e) => handleCustomDateChange(startDate, e.target.value)}
          />
        </div>
      </div>

      {/* Tableau détaillé de l'historique des transactions */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
          Historique Chronologique des Ventes ({salesReportData.orders.length} tickets)
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Reçu #</th>
                <th>Table</th>
                <th>Détail des Articles</th>
                <th>Mode Paiement</th>
                <th>Total Vente (Ar)</th>
                <th>Bénéfice Net (Ar)</th>
              </tr>
            </thead>
            <tbody>
              {salesReportData.orders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    Aucune vente enregistrée pour les filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                salesReportData.orders.map(order => {
                  const profit = order.totalProfit !== undefined ? order.totalProfit : (order.totalAmount - (order.totalCost || 0));
                  return (
                    <tr key={order._id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(order.paidAt || order.createdAt).toLocaleString('fr-FR')}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {order.receiptNumber}
                      </td>
                      <td>
                        <span className="table-zone">{order.tableName}</span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {order.paymentMethod === 'cash' ? 'Espèces' : order.paymentMethod === 'card' ? 'Carte CB' : 'Mobile Money'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {order.totalAmount.toLocaleString()} Ar
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-green)' }}>
                        +{profit.toLocaleString()} Ar
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
