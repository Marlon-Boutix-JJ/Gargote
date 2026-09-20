import React from 'react';
import { Users, CheckCircle2, Clock, Receipt, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TableGrid = () => {
  const { tables, selectedTable, setSelectedTable, fetchTables } = useApp();

  const getStatusText = (status) => {
    switch (status) {
      case 'occupied': return 'Occupée';
      case 'payment_pending': return 'Addition demandée';
      default: return 'Libre';
    }
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div className="tables-header">
        <h2 className="section-title">
          <span>Plan des Tables</span>
          <button 
            onClick={fetchTables}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            title="Rafraîchir les tables"
          >
            <RefreshCw size={16} />
          </button>
        </h2>
        
        <div className="table-status-legend">
          <div className="legend-item">
            <span className="dot free"></span>
            <span>Libre</span>
          </div>
          <div className="legend-item">
            <span className="dot occupied"></span>
            <span>Occupée</span>
          </div>
          <div className="legend-item">
            <span className="dot payment_pending"></span>
            <span>À régler</span>
          </div>
        </div>
      </div>

      <div className="grid-tables">
        {tables.map(table => {
          const isSelected = selectedTable && String(selectedTable._id) === String(table._id);
          return (
            <div
              key={table._id}
              className={`table-card ${table.status} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedTable(table)}
            >
              <div className="table-card-header">
                <span className="table-name">{table.name}</span>
                <span className="table-zone">{table.zone}</span>
              </div>

              <div className="table-card-body">
                <span className="table-capacity">
                  <Users size={14} />
                  {table.capacity} p.
                </span>
                
                <span className="table-total">
                  {getStatusText(table.status)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
