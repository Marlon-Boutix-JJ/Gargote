const Table = require('../models/Table');
const { isDBConnected, getMemoryStore } = require('../config/db');

exports.getAllTables = async (req, res) => {
  try {
    if (isDBConnected()) {
      const tables = await Table.find().sort({ number: 1 });
      return res.json(tables);
    }
    const memory = getMemoryStore();
    return res.json(memory.tables);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tables', details: err.message });
  }
};

exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentOrderId } = req.body;

    if (isDBConnected()) {
      const table = await Table.findById(id);
      if (!table) return res.status(404).json({ error: 'Table non trouvée' });
      if (status) table.status = status;
      if (currentOrderId !== undefined) table.currentOrderId = currentOrderId;
      await table.save();
      return res.json(table);
    }

    const memory = getMemoryStore();
    const table = memory.tables.find(t => String(t._id) === String(id));
    if (!table) return res.status(404).json({ error: 'Table non trouvée' });

    if (status) table.status = status;
    if (currentOrderId !== undefined) table.currentOrderId = currentOrderId;
    return res.json(table);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la table', details: err.message });
  }
};
