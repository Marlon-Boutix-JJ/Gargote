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

// 2b. Générer la Clé d'Activation à 6 chiffres déterministe (compatible 100% navigateur autonome)
const generateDeterministic6DigitKey = (challengeCode) => {
  if (!challengeCode) return '000000';
  const clean = String(challengeCode).trim().replace(/\D/g, '').padStart(6, '0');
  const secret = MASTER_SECRET + '_ACTIVATION_SALT_6DIGIT';
  const combined = secret + '_' + clean;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const num = Math.abs(h1 ^ h2);
  const codeInt = num % 1000000;
  return String(codeInt).padStart(6, '0');
};

// 3. Vérifier la validité de la Clé d'Activation à 6 chiffres
const verifyActivationKey = (challengeCode, activationKey) => {
  if (!challengeCode || !activationKey) return false;
  const cleanInputKey = String(activationKey).trim().replace(/\D/g, '').padStart(6, '0');
  const expectedKey1 = generateActivationKey(challengeCode);
  const expectedKey2 = generateDeterministic6DigitKey(challengeCode);
  return cleanInputKey === expectedKey1 || cleanInputKey === expectedKey2;
};

module.exports = {
  generateChallengeCode,
  generateActivationKey,
  generateDeterministic6DigitKey,
  verifyActivationKey
};
