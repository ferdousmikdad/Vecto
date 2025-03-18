/**
 * data-loader.js
 * Handles loading and processing SVG data from JSON files
 */

const DataLoader = (function() {
    // Data sources
    const DATA_SOURCES = [
      { name: 'icons', path: 'data/svg-icons.json' },
      { name: 'logos', path: 'data/svg-logos.json' },
      { name: 'illustrations', path: 'data/svg-illustrations.json' }
    ];
    
    /**
     * Load all SVG data from JSON files
     * @return {Promise} Promise that resolves when all data is loaded
     */
    async function loadAllData() {
      try {
        // Show loading state
        AppState.set('isLoading', true);
        UIManager.showLoading();
        
        // Load all JSON files in parallel
        const dataPromises = DATA_SOURCES.map(source => 
          fetch(source.path)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to load ${source.name} data: ${response.status}`);
              }
              return response.json();
            })
            .catch(error => {
              console.error(`Error loading ${source.name} data:`, error);
              UIManager.showNotification(`Failed to load ${source.name} data`, 'error');
              // Return empty data structure instead of failing completely
              return { items: [], categories: [] };
            })
        );
        
        // Wait for all data to load
        const dataResults = await Promise.all(dataPromises);
        
        // Process and combine the data
        const combinedData = processCombinedData(dataResults);
        
        // Update state with the combined data
        AppState.update('svgData', {
          items: combinedData.items,
          categories: combinedData.categories,
          isLoaded: true
        });
        
        // Update UI state
        AppState.set('isLoading', false);
        UIManager.hideLoading();
        
        console.log('SVG data loaded successfully:', combinedData.items.length, 'items');
        return combinedData;
      } catch (error) {
        console.error('Error loading SVG data:', error);
        UIManager.showNotification('Failed to load SVG data', 'error');
        
        // Update UI state even on error
        AppState.set('isLoading', false);
        UIManager.hideLoading();
        
        // Rethrow for higher-level error handling
        throw error;
      }
    }
    
    /**
     * Process and combine data from multiple sources
     * @param {Array} dataResults - Array of data objects from each source
     * @return {Object} Combined data with items and categories
     */
    function processCombinedData(dataResults) {
      // Combine all items
      const allItems = dataResults.reduce((items, data) => {
        if (data.items && Array.isArray(data.items)) {
          return [...items, ...data.items];
        }
        return items;
      }, []);
      
      // Combine all categories
      let allCategories = dataResults.reduce((categories, data) => {
        if (data.categories && Array.isArray(data.categories)) {
          return [...categories, ...data.categories];
        }
        return categories;
      }, []);
      
      // Remove duplicate categories
      allCategories = allCategories.filter((category, index, self) =>
        index === self.findIndex((c) => c.id === category.id)
      );
      
      // Process and validate items
      const validatedItems = allItems.map(item => {
        // Ensure required properties
        if (!item.id || !item.name || !item.category || !item.filePath) {
          console.warn('Item missing required properties:', item);
        }
        
        // Ensure tags is an array
        if (!item.tags || !Array.isArray(item.tags)) {
          item.tags = [];
        }
        
        return item;
      });
      
      // Update category counts
      updateCategoryCounts(allCategories, validatedItems);
      
      return {
        items: validatedItems,
        categories: allCategories
      };
    }
    
    /**
     * Update category counts based on items
     * @param {Array} categories - Categories array to update
     * @param {Array} items - Items to count
     */
    function updateCategoryCounts(categories, items) {
      // Count items per category
      const counts = {};
      items.forEach(item => {
        if (!item.category) return;
        
        counts[item.category] = (counts[item.category] || 0) + 1;
      });
      
      // Update category objects
      categories.forEach(category => {
        category.count = counts[category.id] || 0;
      });
    }
    
    /**
     * Load content of a specific SVG file
     * @param {string} filePath - Path to the SVG file
     * @return {Promise<string>} Promise resolving to SVG content
     */
    async function loadSvgContent(filePath) {
      // Check if already cached
      const cachedSvg = AppState.get('svgCache')[filePath];
      if (cachedSvg) {
        return cachedSvg;
      }
      
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${filePath} (${response.status})`);
        }
        
        const svgContent = await response.text();
        
        // Cache the SVG content
        const svgCache = AppState.get('svgCache');
        svgCache[filePath] = svgContent;
        AppState.set('svgCache', svgCache);
        
        return svgContent;
      } catch (error) {
        console.error('Error loading SVG content:', error);
        throw error;
      }
    }
    
    /**
     * Get an SVG item by ID
     * @param {string} id - SVG ID
     * @return {Object|null} SVG item or null if not found
     */
    function getSvgById(id) {
      const items = AppState.get('svgData.items');
      return items.find(item => item.id === id) || null;
    }
    
    // Public API
    return {
      loadAllData,
      loadSvgContent,
      getSvgById
    };
  })();
  
  // Make DataLoader available globally
  window.DataLoader = DataLoader;