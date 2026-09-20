const { generateChallengeCode, generateActivationKey, verifyActivationKey } = require('../utils/cryptoLicense');
const mongoose = require('mongoose');
const { isDBConnected, getMemoryStore } = require('../config/db');

// Schema Mongoose optionnel pour persister la liste des appareils autorisés
const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  challengeCode: { type: String, required: true },
  activationKey: { type: String, required: true },
  activatedAt: { type: Date, default: Date.now }
});

let DeviceModel = null;
try {
  DeviceModel = mongoose.model('ActivatedDevice');
} catch (e) {
  DeviceModel = mongoose.model('ActivatedDevice', deviceSchema);
}

// Memory Fallback pour les appareils activés
const activeDevicesMemory = new Set();

// 1. Vérifier si un appareil est déjà activé
exports.checkActivationStatus = async (req, res) => {
  try {
    const { deviceId, fingerprint } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'Identifiant appareil manquant' });

    // Générer le code défi unique pour cet appareil
    const challengeCode = generateChallengeCode(deviceId, fingerprint || {});

    if (isDBConnected()) {
      const activeDev = await DeviceModel.findOne({ deviceId });
      if (activeDev) {
        return res.json({ isActivated: true, challengeCode: activeDev.challengeCode });
      }
    } else {
      if (activeDevicesMemory.has(deviceId)) {
        return res.json({ isActivated: true, challengeCode });
      }
    }

    return res.json({ isActivated: false, challengeCode });
  } catch (err) {
    res.status(500).json({ error: 'Erreur vérification licence appareil' });
  }
};

// 2. Activer un nouvel appareil avec la Clé d'Activation
exports.activateDevice = async (req, res) => {
  try {
    const { deviceId, challengeCode, activationKey } = req.body;

    if (!deviceId || !challengeCode || !activationKey) {
      return res.status(400).json({ error: 'Paramètres d\'activation incomplets' });
    }

    // Vérification Cryptographique de la clé d'activation
    const isValid = verifyActivationKey(challengeCode, activationKey);

    if (!isValid) {
      return res.status(400).json({ error: 'Clé d\'activation invalide ! Veuillez vérifier le code fourni par l\'administrateur.' });
    }

    // Enregistrer l'activation de l'appareil
    if (isDBConnected()) {
      await DeviceModel.findOneAndUpdate(
        { deviceId },
        { deviceId, challengeCode, activationKey, activatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    activeDevicesMemory.add(deviceId);

    return res.json({
      success: true,
      message: 'Appareil activé avec succès ! GargotePOS est désormais débloqué sur cet appareil.',
      deviceId
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'activation de l\'appareil' });
  }
};
