import { UAParser } from 'ua-parser-js';

/**
 * Parse user agent string to extract browser, OS, device, and other information
 * Uses ua-parser-js library for accurate parsing following standard practices
 * Used for backward compatibility with old clicks that don't have parsed data
 * 
 * @param {string} userAgent - The user agent string to parse
 * @returns {Object} Parsed user agent information
 * @returns {string} returns.browser - Browser name (e.g., "Chrome", "Firefox")
 * @returns {string} returns.os - Operating system name (e.g., "Windows", "macOS")
 * @returns {string} returns.device - Device type ("Desktop", "Mobile", "Tablet")
 * @returns {string} returns.browserVersion - Browser version (optional)
 * @returns {string} returns.osVersion - OS version (optional)
 * @returns {string} returns.deviceModel - Device model (optional)
 */
export const parseUserAgent = (userAgent) => {
  // Handle empty or invalid user agent
  if (!userAgent || userAgent === 'unknown' || typeof userAgent !== 'string') {
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown',
      browserVersion: null,
      osVersion: null,
      deviceModel: null,
    };
  }

  try {
    // Initialize parser with the user agent string
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Extract browser information
    const browserName = result.browser.name || 'Unknown';
    const browserVersion = result.browser.version || null;
    
    // Extract OS information
    const osName = result.os.name || 'Unknown';
    const osVersion = result.os.version || null;
    
    // Extract device information
    const deviceType = result.device.type || null;
    const deviceModel = result.device.model || null;
    const deviceVendor = result.device.vendor || null;

    // Normalize device type to our standard format
    let normalizedDevice = 'Desktop'; // Default to Desktop
    if (deviceType) {
      const lowerType = deviceType.toLowerCase();
      if (lowerType === 'mobile' || lowerType === 'mobilephone') {
        normalizedDevice = 'Mobile';
      } else if (lowerType === 'tablet') {
        normalizedDevice = 'Tablet';
      } else if (lowerType === 'desktop') {
        normalizedDevice = 'Desktop';
      } else {
        // Fallback: check if it's mobile based on OS or other indicators
        if (osName.toLowerCase().includes('android') || 
            osName.toLowerCase().includes('ios') ||
            userAgent.toLowerCase().includes('mobile')) {
          normalizedDevice = 'Mobile';
        }
      }
    } else {
      // Fallback detection if device type is not available
      const uaLower = userAgent.toLowerCase();
      if (uaLower.includes('mobile') || 
          uaLower.includes('android') || 
          uaLower.includes('iphone') ||
          uaLower.includes('ipod')) {
        normalizedDevice = 'Mobile';
      } else if (uaLower.includes('tablet') || uaLower.includes('ipad')) {
        normalizedDevice = 'Tablet';
      }
    }

    // Build device model string if available
    let fullDeviceModel = null;
    if (deviceModel) {
      if (deviceVendor) {
        fullDeviceModel = `${deviceVendor} ${deviceModel}`.trim();
      } else {
        fullDeviceModel = deviceModel;
      }
    }

    return {
      browser: browserName,
      os: osName,
      device: normalizedDevice,
      browserVersion: browserVersion,
      osVersion: osVersion,
      deviceModel: fullDeviceModel,
    };
  } catch (error) {
    // Fallback in case of parsing errors
    console.error('Error parsing user agent:', error);
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown',
      browserVersion: null,
      osVersion: null,
      deviceModel: null,
    };
  }
};
