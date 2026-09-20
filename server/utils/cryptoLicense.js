const crypto = require('crypto');

// Clé maîtresse de sécurité pour le chiffrement des licences
const MASTER_SECRET = process.env.LICENSE_MASTER_SECRET || 'GARGOTE_POS_SECURE_MASTER_KEY_2026_6DIGIT';

// Helper pour convertir un HMAC hexadécimal en un code numérique à 6 chiffres (ex: 492815)
const toSixDigitCode = (hexStr) => {
  // Convertir le premier sous-ensemble hex en nombre entier positif
  const num = parseInt(hexStr.slice(0, 8), 16);
  // Modulo 1 000 000 pour garantir exactement 6 chiffres
  const codeInt = Math.abs(num) % 1000000;
  // Compléter avec des zéros à gauche pour garantir 6 chiffres fixes (ex: 042819)
  return String(codeInt).padStart(6, '0');
};

// 1. Générer le Code Défi à 6 chiffres pour l'appareil (ex: 492815)
const generateChallengeCode = (deviceId, fingerprint = {}) => {
  const payload = `${deviceId}_${fingerprint.platform || 'web'}_${MASTER_SECRET}`;
  const hmac = crypto.createHmac('sha256', MASTER_SECRET).update(payload).digest('hex');
  return toSixDigitCode(hmac);
};

// 2. Générer la Clé d'Activation à 6 chiffres correspondante (ex: 831042)
const generateActivationKey = (challengeCode) => {
  if (!challengeCode) return null;
  const cleanChallenge = String(challengeCode).trim().replace(/\D/g, '').padStart(6, '0');

  const hmac = crypto
    .createHmac('sha256', MASTER_SECRET + '_ACTIVATION_SALT_6DIGIT')
    .update(cleanChallenge)
    .digest('hex');

  return toSixDigitCode(hmac);
};

// 3. Vérifier la validité de la Clé d'Activation à 6 chiffres
const verifyActivationKey = (challengeCode, activationKey) => {
  if (!challengeCode || !activationKey) return false;
  const cleanInputKey = String(activationKey).trim().replace(/\D/g, '').padStart(6, '0');
  const expectedKey = generateActivationKey(challengeCode);
  return expectedKey === cleanInputKey;
};

module.exports = {
  generateChallengeCode,
  generateActivationKey,
  verifyActivationKey
};
