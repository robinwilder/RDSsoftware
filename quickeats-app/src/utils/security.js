/**
 * Security utility functions for input validation and sanitization
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - Raw HTML content
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                   'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (US format)
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {{valid: boolean, message: string}}
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: 'Password is strong' };
};

/**
 * Mask credit card number (show only last 4 digits)
 * @param {string} cardNumber
 * @returns {string}
 */
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 4) return '****';
  return '**** **** **** ' + cleaned.slice(-4);
};

/**
 * Validate credit card number using Luhn algorithm
 * @param {string} cardNumber
 * @returns {boolean}
 */
export const isValidCardNumber = (cardNumber) => {
  if (!cardNumber) return false;
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned)) return false;
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Sanitize user input (remove special characters, scripts)
 * @param {string} input
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  // Remove HTML tags and script content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * Validate ZIP code (US format)
 * @param {string} zip
 * @returns {boolean}
 */
export const isValidZip = (zip) => {
  if (!zip) return false;
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
};

/**
 * Check if user has required role
 * @param {object} user
 * @param {string} requiredRole - 'admin', 'restaurant_owner', 'customer'
 * @returns {boolean}
 */
export const hasRole = (user, requiredRole) => {
  if (!user) return false;

  switch (requiredRole) {
    case 'admin':
      return user.isAdmin === true;
    case 'restaurant_owner':
      return user.isRestaurantOwner === true;
    case 'customer':
      return user.id !== undefined;
    default:
      return false;
  }
};

/**
 * Rate limiting helper (simple client-side implementation)
 */
class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    // Clean old attempts
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key) {
    this.attempts.delete(key);
  }
}

export const loginRateLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes