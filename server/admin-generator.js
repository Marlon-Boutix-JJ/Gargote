const { generateActivationKey } = require('./utils/cryptoLicense');

const challengeCode = process.argv[2];

console.log('\n======================================================');
console.log('🔑 GARGOTE POS - GÉNÉRATEUR DE CLÉ A 6 CHIFFRES');
console.log('======================================================\n');

if (!challengeCode) {
  console.log('⚠️ Usage: node admin-generator.js <CODE_DEFI_6_CHIFFRES>');
  console.log('Exemple: node admin-generator.js 492815\n');
  process.exit(1);
}

const cleanChallenge = String(challengeCode).trim().replace(/\D/g, '');
const activationKey = generateActivationKey(cleanChallenge);

console.log(`📌 Code Défi à 6 Chiffres du Client : ${cleanChallenge}`);
console.log(`✅ CLÉ D'ACTIVATION À 6 CHIFFRES    : ${activationKey}`);
console.log('\n--> Transmettez ce code à 6 chiffres au client pour débloquer l\'application.\n');
