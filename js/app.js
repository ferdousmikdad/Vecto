/**
 * app.js
 * Main application initialization and bootstrap
 */

const App = (function() {
    /**
     * Initialize the application
     */
    async function init() {
      try {
        console.log('Initializing SVG Marketplace...');
        
        // Set initial loading state
        AppState.set('isLoading', true);
        UIManager.showLoading();
        
        // Load SVG data first to ensure it's available for components
        await DataLoader.loadAllData();
        console.log('SVG data loaded');
        
        // Load UI components after data is loaded
        await UIManager.loadAllComponents();
        console.log('UI components loaded');
        
        // Initialize event listeners
        Events.initEventListeners();
        console.log('Event listeners initialized');
        
        // Set up admin functionality if enabled
        if (isAdminEnabled()) {
          initAdminPanel();
        }
        
        // Complete initialization
        AppState.set('isLoading', false);
        UIManager.hideLoading();
        
        // Force an update of the featured section
        Components.updateFeaturedSection();
        
        // Force an update of the categories section
        const categoriesContainer = document.querySelector('.category-nav') || 
                                 document.querySelector('.categories-section') || 
                                 document.getElementById('categories-container');
        if (categoriesContainer) {
          const categories = AppState.get('svgData.categories');
          if (categories) {
            Components.renderCategories(categories, categoriesContainer);
          }
        }
        
        console.log('SVG Marketplace initialized successfully');
      } catch (error) {
        // Handle initialization errors
        console.error('Error initializing application:', error);
        UIManager.showNotification('Failed to initialize application. Please refresh the page.', 'error');
        
        // Update UI state
        AppState.set('isLoading', false);
        UIManager.hideLoading();
        
        // Show error in UI
        showInitializationError(error);
      }
    }
    
    /**
     * Check if admin panel is enabled
     * @return {boolean} Is admin enabled
     */
    function isAdminEnabled() {
      // Check for admin URL parameter
      const urlParams = Utils.getUrlParams();
      if (urlParams.admin === 'true') {
        return true;
      }
      
      // Check for localStorage setting
      try {
        return localStorage.getItem('svg_marketplace_admin') === 'enabled';
      } catch (e) {
        return false;
      }
    }
    
    /**
     * Initialize admin panel
     */
    function initAdminPanel() {
      console.log('Admin panel enabled');
      
      // Import admin scripts dynamically
      const scripts = [
        'js/admin/admin.js',
        'js/admin/svg-editor.js',
        'js/admin/svg-uploader.js',
        'js/admin/data-manager.js'
      ];
      
      // Load admin CSS
      const adminCss = document.createElement('link');
      adminCss.rel = 'stylesheet';
      adminCss.href = 'css/admin.css';
      document.head.appendChild(adminCss);
      
      // Load admin scripts
      scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
      });
      
      // Create admin button
      createAdminButton();
    }
    
    /**
     * Create admin panel toggle button
     */
    function createAdminButton() {
      const adminButton = document.createElement('button');
      adminButton.id = 'admin-panel-toggle';
      adminButton.className = 'fixed bottom-4 left-4 z-50 bg-dark text-white p-3 rounded-full shadow-lg hover:bg-opacity-80 transition-colors';
      adminButton.innerHTML = `
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      `;
      
      document.body.appendChild(adminButton);
      
      // When admin is fully loaded, this will be handled
      // by the admin.js script for showing/hiding the panel
    }
    
    /**
     * Show initialization error in UI
     * @param {Error} error - Error object
     */
    function showInitializationError(error) {
      const appElement = document.getElementById('app');
      if (!appElement) return;
      
      // Create error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'p-8 text-center';
      errorDiv.innerHTML = `
        <div class="mb-6">
          <svg class="h-16 w-16 text-danger mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-dark mb-2">Failed to Initialize Application</h2>
        <p class="text-gray-600 mb-4">Sorry, we encountered an error while loading the SVG Marketplace.</p>
        <div class="bg-gray-100 p-4 rounded-lg text-left mb-6 max-w-lg mx-auto">
          <code class="text-sm text-danger">${error.message}</code>
        </div>
        <button id="retry-init" class="bg-primary text-white py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
          Retry
        </button>
      `;
      
      // Add retry button handler
      errorDiv.querySelector('#retry-init').addEventListener('click', () => {
        // Remove error message
        errorDiv.remove();
        
        // Retry initialization
        init();
      });
      
      // Add to page
      appElement.innerHTML = '';
      appElement.appendChild(errorDiv);
    }
    
    // Return public API
    return {
      init
    };
  })();
  
  // Initialize application when DOM is loaded
  document.addEventListener('DOMContentLoaded', App.init);