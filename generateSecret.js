const crypto = require('crypto');

// Generate a 256-bit (32 bytes) secret key for JWT
const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Example usage
const secretKey = generateSecretKey();
console.log('JWT Secret Key:', secretKey);
