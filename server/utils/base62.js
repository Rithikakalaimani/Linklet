/**
 * Base62 encoding/decoding for URL short codes
 * Characters: 0-9, a-z, A-Z (62 characters total)
 */

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = 62;

/**
 * Encode a number to base62 string
 * @param {number} num - The number to encode
 * @returns {string} - Base62 encoded string
 */
const encode = (num) => {
  if (num === 0) return BASE62_CHARS[0];
  
  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % BASE] + result;
    num = Math.floor(num / BASE);
  }
  return result;
};

/**
 * Decode a base62 string to number
 * @param {string} str - The base62 string to decode
 * @returns {number} - Decoded number
 */
const decode = (str) => {
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const charIndex = BASE62_CHARS.indexOf(char);
    if (charIndex === -1) {
      throw new Error(`Invalid base62 character: ${char}`);
    }
    num = num * BASE + charIndex;
  }
  return num;
};

/**
 * Generate a random short code of specified length
 * @param {number} length - Length of the code (default: 6)
 * @returns {string} - Random base62 string
 */
const generateRandomCode = (length = 6) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS[Math.floor(Math.random() * BASE)];
  }
  return result;
};

module.exports = {
  encode,
  decode,
  generateRandomCode,
};
