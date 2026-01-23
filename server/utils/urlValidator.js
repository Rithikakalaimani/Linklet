const validator = require('validator');
const dns = require('dns').promises;

/**
 * Validate URL format and basic security checks
 */
const validateUrl = async (url) => {
  // Basic format validation
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  // Check if URL is properly formatted
  if (!validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  })) {
    return { valid: false, error: 'Invalid URL format. Must include http:// or https://' };
  }

  // Check for malicious patterns (basic protection)
  const maliciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(url)) {
      return { valid: false, error: 'URL contains potentially malicious content' };
    }
  }

  // Check for localhost/internal IPs (optional - can be configured)
  const localhostPatterns = [
    /^https?:\/\/localhost/i,
    /^https?:\/\/127\.0\.0\.1/i,
    /^https?:\/\/127\.0\.0\.1/i,
    /^https?:\/\/0\.0\.0\.0/i,
    /^https?:\/\/192\.168\./i,
    /^https?:\/\/10\./i,
    /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./i,
  ];

  // Allow localhost in development
  if (process.env.NODE_ENV === 'production') {
    for (const pattern of localhostPatterns) {
      if (pattern.test(url)) {
        return { valid: false, error: 'Local/internal URLs are not allowed in production' };
      }
    }
  }

  // Optional: DNS resolution check (can be slow, use with caution)
  // Uncomment if you want to verify domain exists
  /*
  try {
    const urlObj = new URL(url);
    await dns.resolve(urlObj.hostname);
  } catch (error) {
    return { valid: false, error: 'Domain does not exist or is unreachable' };
  }
  */

  return { valid: true };
};

/**
 * Validate custom alias
 */
const validateAlias = (alias) => {
  if (!alias || typeof alias !== 'string') {
    return { valid: false, error: 'Alias is required' };
  }

  // Length check
  if (alias.length < 3 || alias.length > 20) {
    return { valid: false, error: 'Alias must be between 3 and 20 characters' };
  }

  // Character check - only alphanumeric and hyphens
  if (!/^[a-zA-Z0-9-]+$/.test(alias)) {
    return { valid: false, error: 'Alias can only contain letters, numbers, and hyphens' };
  }

  // Reserved words check
  const reservedWords = ['api', 'admin', 'analytics', 'health', 'shorten', 'redirect'];
  if (reservedWords.includes(alias.toLowerCase())) {
    return { valid: false, error: 'This alias is reserved' };
  }

  return { valid: true };
};

module.exports = {
  validateUrl,
  validateAlias,
};
