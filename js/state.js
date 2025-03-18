/**
 * state.js
 * Centralized state management for the SVG Marketplace
 * Implements a simple pub/sub pattern for state updates
 */

const AppState = (function() {
    /**
     * Private state object - stores all application data
     */
    const _state = {
      // UI state
      isLoading: false,
      currentCategory: 'all',
      searchQuery: '',
      pagination: {
        currentPage: 1,
        itemsPerPage: 8,
        totalPages: 1
      },
      
      // Data state
      svgData: {
        items: [],
        categories: [],
        isLoaded: false
      },
      
      // User preferences
      favorites: [],
      
      // Cache for SVG contents to prevent repeated fetches
      svgCache: {}
    };
    
    /**
     * Subscribers to state changes
     * Each key is a state path, and the value is an array of callback functions
     */
    const _subscribers = {};
    
    /**
     * Subscribe to state changes on a specific path
     * @param {string} path - Dot notation path to the state property
     * @param {function} callback - Function to call when state changes
     * @return {function} Unsubscribe function
     */
    function subscribe(path, callback) {
      if (!_subscribers[path]) {
        _subscribers[path] = [];
      }
      
      _subscribers[path].push(callback);
      
      // Return unsubscribe function
      return function unsubscribe() {
        _subscribers[path] = _subscribers[path].filter(cb => cb !== callback);
      };
    }
    
    /**
     * Get a value from state using a dot notation path
     * @param {string} path - Dot notation path to get (e.g., 'svgData.items')
     * @return {*} Value at the specified path
     */
    function get(path) {
      return path.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : undefined;
      }, _state);
    }
    
    /**
     * Set a value in the state and notify subscribers
     * @param {string} path - Dot notation path to set
     * @param {*} value - Value to set at path
     */
    function set(path, value) {
      const parts = path.split('.');
      const lastKey = parts.pop();
      const target = parts.reduce((obj, key) => {
        if (!(key in obj)) obj[key] = {};
        return obj[key];
      }, _state);
      
      // Set the value
      target[lastKey] = value;
      
      // Notify subscribers
      notifySubscribers(path, value);
    }
    
    /**
     * Update an object in the state (merge properties)
     * @param {string} path - Dot notation path to the object
     * @param {object} updates - Object with properties to update
     */
    function update(path, updates) {
      const current = get(path);
      if (typeof current === 'object' && !Array.isArray(current)) {
        set(path, { ...current, ...updates });
      } else {
        set(path, updates);
      }
    }
    
    /**
     * Notify subscribers about a state change
     * @param {string} path - Path that changed
     * @param {*} value - New value
     */
    function notifySubscribers(path, value) {
      // Notify subscribers to this exact path
      if (_subscribers[path]) {
        _subscribers[path].forEach(callback => callback(value));
      }
      
      // Also notify subscribers to parent paths
      const parts = path.split('.');
      while (parts.length > 1) {
        parts.pop();
        const parentPath = parts.join('.');
        
        if (_subscribers[parentPath]) {
          const parentValue = get(parentPath);
          _subscribers[parentPath].forEach(callback => callback(parentValue));
        }
      }
      
      // Notify global subscribers
      if (_subscribers['*']) {
        _subscribers['*'].forEach(callback => callback(_state));
      }
    }
    
    /**
     * Initialize state with default values or load from localStorage
     */
    function init() {
      // Load favorites from localStorage
      try {
        const storedFavorites = localStorage.getItem('svg_marketplace_favorites');
        if (storedFavorites) {
          _state.favorites = JSON.parse(storedFavorites);
        }
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
      }
      
      // Initialize other state properties if needed
    }
    
    /**
     * Save user preferences to localStorage
     */
    function savePreferences() {
      try {
        localStorage.setItem('svg_marketplace_favorites', JSON.stringify(_state.favorites));
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
      }
    }
    
    /**
     * Filter SVG items based on current category and search query
     * @return {Array} Filtered array of SVG items
     */
    function getFilteredItems() {
      let items = _state.svgData.items;
      
      // Filter by category
      if (_state.currentCategory && _state.currentCategory !== 'all') {
        items = items.filter(item => item.category === _state.currentCategory);
      }
      
      // Filter by search query
      if (_state.searchQuery) {
        const query = _state.searchQuery.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query) || 
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }
      
      return items;
    }
    
    /**
     * Get paginated items based on current filters and pagination state
     * @return {Array} Array of items for the current page
     */
    function getPaginatedItems() {
      const filteredItems = getFilteredItems();
      const { currentPage, itemsPerPage } = _state.pagination;
      
      // Calculate total pages
      const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
      if (_state.pagination.totalPages !== totalPages) {
        _state.pagination.totalPages = totalPages;
        notifySubscribers('pagination', _state.pagination);
      }
      
      // Get items for current page
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      
      return filteredItems.slice(startIndex, endIndex);
    }
    
    /**
     * Toggle favorite status for an SVG
     * @param {string} svgId - ID of the SVG to toggle
     * @return {boolean} New favorite status
     */
    function toggleFavorite(svgId) {
      const index = _state.favorites.indexOf(svgId);
      let isFavorite;
      
      if (index === -1) {
        // Add to favorites
        _state.favorites.push(svgId);
        isFavorite = true;
      } else {
        // Remove from favorites
        _state.favorites.splice(index, 1);
        isFavorite = false;
      }
      
      // Notify subscribers
      notifySubscribers('favorites', _state.favorites);
      
      // Save to localStorage
      savePreferences();
      
      return isFavorite;
    }
    
    /**
     * Check if an SVG is favorited
     * @param {string} svgId - ID of the SVG to check
     * @return {boolean} Is favorited
     */
    function isFavorite(svgId) {
      return _state.favorites.includes(svgId);
    }
    
    /**
     * Reset filters to default values
     */
    function resetFilters() {
      set('searchQuery', '');
      set('currentCategory', 'all');
      set('pagination.currentPage', 1);
    }
    
    // Initialize state
    init();
    
    // Public API
    return {
      // State access
      get,
      set,
      update,
      
      // Subscriptions
      subscribe,
      
      // Derived state
      getFilteredItems,
      getPaginatedItems,
      
      // Actions
      toggleFavorite,
      isFavorite,
      resetFilters,
      
      // For debugging
      getState: () => ({ ..._state })
    };
  })();
  
  // Make state available globally
  window.AppState = AppState;