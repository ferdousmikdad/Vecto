/**
 * events.js
 * Handles application event listeners and event delegation
 */

const Events = (function() {
    /**
     * Initialize all event listeners for the application
     */
    function initEventListeners() {
      // Document-level click event delegation
      document.addEventListener('click', handleDocumentClick);
      
      // Component loaded events
      document.addEventListener('componentLoaded', handleComponentLoaded);
      
      // State change subscriptions
      setupStateSubscriptions();
      
      // Mobile menu toggle
      initMobileMenu();
    }
    
    /**
     * Handle document click event delegation
     * @param {Event} event - Click event
     */
    function handleDocumentClick(event) {
      // SVG action buttons
      const copyButton = event.target.closest('.copy-svg');
      if (copyButton) {
        const svgId = copyButton.dataset.id;
        SvgActions.copySvgToClipboard(svgId);
        event.preventDefault();
        return;
      }
      
      const downloadButton = event.target.closest('.download-svg');
      if (downloadButton) {
        const svgId = downloadButton.dataset.id;
        SvgActions.downloadSvg(svgId);
        event.preventDefault();
        return;
      }
      
      const favoriteButton = event.target.closest('.favorite-btn');
      if (favoriteButton) {
        const svgId = favoriteButton.dataset.id;
        const isFavorite = AppState.toggleFavorite(svgId);
        
        // Update button appearance
        favoriteButton.classList.toggle('text-warning', isFavorite);
        favoriteButton.classList.toggle('text-gray-400', !isFavorite);
        favoriteButton.classList.add('favorite-btn-active');
        
        // Remove animation class after animation completes
        setTimeout(() => {
          favoriteButton.classList.remove('favorite-btn-active');
        }, 300);
        
        // Show notification
        UIManager.showNotification(
          isFavorite ? 'Added to favorites' : 'Removed from favorites',
          isFavorite ? 'success' : 'info'
        );
        
        event.preventDefault();
        return;
      }
      
      // Category selection
      const categoryItem = event.target.closest('.category-item');
      if (categoryItem) {
        const category = categoryItem.dataset.category;
        
        // Update state
        AppState.set('currentCategory', category);
        AppState.set('pagination.currentPage', 1); // Reset to first page
        
        // Scroll to featured section
        const featuredSection = document.getElementById('featured-container');
        if (featuredSection) {
          featuredSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        event.preventDefault();
        return;
      }
      
      // Clear filters button
      const clearFiltersBtn = event.target.closest('.clear-filters-btn');
      if (clearFiltersBtn) {
        AppState.resetFilters();
        
        // Update search input if it exists
        const searchInput = document.querySelector('.search-bar');
        if (searchInput) {
          searchInput.value = '';
        }
        
        event.preventDefault();
        return;
      }
      
      // Quick category links in hero section
      const categoryLink = event.target.closest('.category-link');
      if (categoryLink) {
        const category = categoryLink.dataset.category;
        
        // Update state
        AppState.set('currentCategory', category);
        AppState.set('pagination.currentPage', 1);
        
        // Scroll to categories section first
        const categoriesSection = document.getElementById('categories-container');
        if (categoriesSection) {
          categoriesSection.scrollIntoView({ behavior: 'smooth' });
          
          // Then scroll to featured section after a delay
          setTimeout(() => {
            const featuredSection = document.getElementById('featured-container');
            if (featuredSection) {
              featuredSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
        
        event.preventDefault();
        return;
      }
    }
    
    /**
     * Handle component loaded events
     * @param {CustomEvent} event - Component loaded event
     */
    function handleComponentLoaded(event) {
      const { id } = event.detail;
      
      // Initialize specific components
      switch (id) {
        case 'hero-container':
          Components.initSearch();
          break;
          
        case 'categories-container':
          // Update categories when they're loaded
          const categories = AppState.get('svgData.categories');
          if (categories && categories.length > 0) {
            const container = document.querySelector('.categories-section') || document.getElementById('categories-container');
            if (container) {
              Components.renderCategories(categories, container);
            }
          }
          break;
          
        case 'featured-container':
          Components.initFeaturedSection();
          break;
      }
    }
    
    /**
     * Set up subscriptions to state changes
     */
    function setupStateSubscriptions() {
      // Listen for category changes
      AppState.subscribe('currentCategory', () => {
        // Update active category in UI
        updateActiveCategoryUI();
        
        // Update featured section
        Components.updateFeaturedSection();
      });
      
      // Listen for search query changes
      AppState.subscribe('searchQuery', () => {
        Components.updateFeaturedSection();
      });
      
      // Listen for pagination changes
      AppState.subscribe('pagination.currentPage', () => {
        Components.updateFeaturedSection();
      });
      
      // Listen for SVG data loaded
      AppState.subscribe('svgData.isLoaded', (isLoaded) => {
        if (isLoaded) {
          // Update categories UI
          const categories = AppState.get('svgData.categories');
          const container = document.querySelector('.category-nav') || 
                           document.querySelector('.categories-section') || 
                           document.getElementById('categories-container');
          
          if (container && categories) {
            Components.renderCategories(categories, container);
          }
          
          // Update featured section
          Components.updateFeaturedSection();
        }
      });
    }
    
    /**
     * Update the active category UI
     */
    function updateActiveCategoryUI() {
      const activeCategory = AppState.get('currentCategory');
      const categoryItems = document.querySelectorAll('.category-item');
      
      categoryItems.forEach(item => {
        const categoryCard = item.querySelector('div');
        if (item.dataset.category === activeCategory) {
          categoryCard.classList.add('category-active');
        } else {
          categoryCard.classList.remove('category-active');
        }
      });
    }
    
    /**
     * Initialize mobile menu functionality
     */
    function initMobileMenu() {
      document.addEventListener('componentLoaded', function(e) {
        if (e.detail.id === 'header-container') {
          const mobileMenuButton = document.getElementById('mobile-menu-button');
          const mobileMenu = document.getElementById('mobile-menu');
          
          if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
              mobileMenu.classList.toggle('hidden');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(event) {
              if (
                mobileMenu &&
                !mobileMenu.classList.contains('hidden') &&
                !mobileMenu.contains(event.target) &&
                !mobileMenuButton.contains(event.target)
              ) {
                mobileMenu.classList.add('hidden');
              }
            });
          }
        }
      });
    }
    
    // Public API
    return {
      initEventListeners
    };
  })();
  
  // Make Events available globally
  window.Events = Events;