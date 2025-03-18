/**
 * utils.js
 * Utility functions for the SVG Marketplace
 */

const Utils = (function() {
    /**
     * Debounce function to limit how often a function is called
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @return {Function} Debounced function
     */
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
    
    /**
     * Throttle function to limit call frequency
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in ms
     * @return {Function} Throttled function
     */
    function throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
    
    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @return {string} Formatted number
     */
    function formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    /**
     * Format date to readable string
     * @param {string|Date} dateString - Date to format
     * @return {string} Formatted date
     */
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    /**
     * Generate random ID
     * @param {number} length - Length of ID
     * @return {string} Random ID
     */
    function generateId(length = 8) {
      return Math.random().toString(36).substring(2, length + 2);
    }
    
    /**
     * Check if device is mobile
     * @return {boolean} Is mobile device
     */
    function isMobile() {
      return window.innerWidth <= 768;
    }
    
    /**
     * Create a sanitized filename
     * @param {string} name - Original name
     * @return {string} Sanitized filename
     */
    function sanitizeFilename(name) {
      return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .trim();
    }
    
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @return {boolean} Is valid email
     */
    function isValidEmail(email) {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }
    
    /**
     * Parse URL parameters
     * @return {Object} URL parameters
     */
    function getUrlParams() {
      const params = {};
      
      window.location.search
        .substring(1)
        .split('&')
        .forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            params[decodeURIComponent(key)] = decodeURIComponent(value);
          }
        });
      
      return params;
    }
    
    /**
     * Create URL with parameters
     * @param {string} baseUrl - Base URL
     * @param {Object} params - Parameters
     * @return {string} URL with parameters
     */
    function createUrlWithParams(baseUrl, params) {
      const url = new URL(baseUrl, window.location.origin);
      
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
      
      return url.toString();
    }
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @return {Promise<boolean>} Success status
     */
    function copyToClipboard(text) {
      return new Promise((resolve, reject) => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text)
            .then(() => resolve(true))
            .catch(err => {
              console.error('Clipboard API error:', err);
              fallbackCopyToClipboard(text) ? resolve(true) : reject(err);
            });
        } else {
          fallbackCopyToClipboard(text) ? resolve(true) : reject(new Error('Copy failed'));
        }
      });
    }
    
    /**
     * Fallback method for copying to clipboard
     * @param {string} text - Text to copy
     * @return {boolean} Success status
     */
    function fallbackCopyToClipboard(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        console.error('fallbackCopyToClipboard failed', err);
        document.body.removeChild(textArea);
        return false;
      }
    }
    
    /**
     * Check if file exists
     * @param {string} filePath - Path to file
     * @return {Promise<boolean>} File exists
     */
    async function checkFileExists(filePath) {
      try {
        const response = await fetch(filePath, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        console.error(`Error checking if ${filePath} exists:`, error);
        return false;
      }
    }
    
    /**
     * Detect browser type
     * @return {string} Browser name
     */
    function detectBrowser() {
      const userAgent = navigator.userAgent;
      let browserName;
      
      if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = "chrome";
      } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "firefox";
      } else if (userAgent.match(/safari/i)) {
        browserName = "safari";
      } else if (userAgent.match(/opr\//i)) {
        browserName = "opera";
      } else if (userAgent.match(/edg/i)) {
        browserName = "edge";
      } else {
        browserName = "unknown";
      }
      
      return browserName;
    }
    
    /**
     * Log error with context for better debugging
     * @param {string} context - Error context
     * @param {Error} error - Error object
     */
    function logError(context, error) {
      console.group(`Error in ${context}`);
      console.error(error);
      console.trace();
      console.groupEnd();
    }
    
    /**
     * Get file extension from path
     * @param {string} filePath - File path
     * @return {string} File extension
     */
    function getFileExtension(filePath) {
      return filePath.split('.').pop().toLowerCase();
    }
    
    // Public API
    return {
      debounce,
      throttle,
      formatNumber,
      formatDate,
      generateId,
      isMobile,
      sanitizeFilename,
      isValidEmail,
      getUrlParams,
      createUrlWithParams,
      copyToClipboard,
      checkFileExists,
      detectBrowser,
      logError,
      getFileExtension
    };
  })();
  
  // Make Utils available globally
  window.Utils = Utils;