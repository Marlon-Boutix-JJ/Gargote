// Utilities for 6-digit cryptographic activation keys (Offline & Online capable)

const MASTER_SECRET = 'GARGOTE_POS_SECURE_MASTER_KEY_2026_6DIGIT_ACTIVATION_SALT_6DIGIT';

export const generate6DigitActivationKey = (challengeCode) => {
  if (!challengeCode) return '000000';
  const clean = String(challengeCode).trim().replace(/\D/g, '').padStart(6, '0');
  const combined = MASTER_SECRET + '_' + clean;
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

export const verifyClientActivationKey = (challengeCode, inputKey) => {
  if (!challengeCode || !inputKey) return false;
  const cleanInput = String(inputKey).trim().replace(/\D/g, '').padStart(6, '0');
  const expectedKey = generate6DigitActivationKey(challengeCode);
  return cleanInput === expectedKey;
};
