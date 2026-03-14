/**
 * Authentication utilities for the admin panel.
 * 
 * NOTE: This implementation uses localStorage for demonstration purposes only.
 * In production, all authentication should be handled server-side with:
 * - Proper password hashing (bcrypt, scrypt)
 * - Secure session management
 * - HTTPS-only cookies
 * - Rate limiting
 */

/**
 * Simple hash function for client-side password obfuscation.
 * WARNING: This is NOT cryptographically secure and is for demo purposes only.
 * In production, use server-side password hashing with bcrypt/scrypt.
 */
export const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

/**
 * Generate a cryptographically secure 6-digit OTP.
 * Uses crypto.getRandomValues for better security than Math.random.
 */
export const generateSecureOtp = () => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  // Generate a 6-digit number between 100000 and 999999
  return String(100000 + (array[0] % 900000));
};

/**
 * Safely parse JSON from localStorage with error handling.
 */
export const safeParseJson = (jsonString, defaultValue = []) => {
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Validate password strength.
 * Returns an object with isValid and message properties.
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  const checks = [hasUpperCase, hasLowerCase, hasNumber];
  const passedChecks = checks.filter(Boolean).length;
  
  if (passedChecks < 2) {
    return { 
      isValid: false, 
      message: 'Password should include at least 2 of: uppercase letter, lowercase letter, number' 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Check if a phone number is already registered.
 */
export const isPhoneRegistered = (phoneNumber) => {
  const registeredAccounts = safeParseJson(localStorage.getItem('registeredAccounts') || '[]');
  return registeredAccounts.some(account => account.phoneNumber === phoneNumber);
};

/**
 * Get registered accounts safely from localStorage.
 */
export const getRegisteredAccounts = () => {
  return safeParseJson(localStorage.getItem('registeredAccounts') || '[]');
};

/**
 * Save registered accounts to localStorage.
 */
export const saveRegisteredAccounts = (accounts) => {
  localStorage.setItem('registeredAccounts', JSON.stringify(accounts));
};
