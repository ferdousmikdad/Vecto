/**
 * components.js
 * Handles dynamic creation and rendering of UI components
 */

const Components = (function() {
    /**
     * Create SVG card element
     * @param {Object} item - SVG item data
     * @return {HTMLElement} Card element
     */
    function createSvgCard(item) {
      const card = document.createElement('div');
      card.className = 'svg-item bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 card-hover cursor-pointer';
      card.dataset.id = item.id;
      
      // Add SVG preview
      const previewContainer = UIManager.createSvgPreview(item);
      card.appendChild(previewContainer);
      
      // Add card content
      const contentDiv = document.createElement('div');
      contentDiv.className = 'p-4';
      
      const isFavorite = AppState.isFavorite(item.id);
      
      contentDiv.innerHTML = `
        <h3 class="text-lg font-medium text-dark mb-1">${item.name}</h3>
        <p class="text-gray-500 text-sm mb-3">${item.description}</p>
        <div class="flex justify-end items-center">
          <div class="flex space-x-2 svg-actions">
            <button class="favorite-btn ${
              isFavorite ? 'text-warning' : 'text-gray-400'
            } bg-light hover:bg-gray-200 rounded p-2 transition-colors" 
              data-id="${item.id}" 
              aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
            <button class="copy-svg bg-light hover:bg-gray-200 rounded p-2 transition-colors" 
              data-id="${item.id}" 
              aria-label="Copy SVG code">
              <svg class="h-4 w-4 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button class="download-svg bg-primary hover:bg-opacity-80 rounded p-2 transition-colors" 
              data-id="${item.id}" 
              aria-label="Download SVG">
              <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      `;
      
      card.appendChild(contentDiv);
      
      // Add click event to entire card
      card.addEventListener('click', function(e) {
        // Only open popup if not clicking on one of the action buttons
        if (!e.target.closest('.svg-actions') && !e.target.closest('button')) {
          SvgActions.openSvgPopup(item.id);
        }
      });
      
      // Add CSS to make the card feel clickable
      card.style.cursor = 'pointer';
      
      // Add a hover effect to emphasize clickability
      card.addEventListener('mouseenter', function() {
        this.classList.add('transform', 'scale-105');
      });
      
      card.addEventListener('mouseleave', function() {
        this.classList.remove('transform', 'scale-105');
      });
      
      return card;
    }
    
    
    /**
     * Render a grid of SVG cards
     * @param {Array} items - SVG items to render
     * @param {HTMLElement} container - Container element
     */
    function renderSvgGrid(items, container) {
      // Clear container
      container.innerHTML = '';
      
      // Create grid container
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 svg-grid';
      container.appendChild(grid);
      
      // Show empty state if no items
      if (items.length === 0) {
        const emptyState = UIManager.createEmptyState(() => {
          AppState.resetFilters();
        });
        container.appendChild(emptyState);
        return;
      }
      
      // Add each item to the grid
      items.forEach(item => {
        const card = createSvgCard(item);
        grid.appendChild(card);
      });
      
      // Add pagination
      const paginationContainer = UIManager.createPagination(
        AppState.get('pagination'),
        (newPage) => {
          AppState.set('pagination.currentPage', newPage);
        }
      );
      container.appendChild(paginationContainer);
    }
    
    /**
     * Create category card element
     * @param {Object} category - Category data
     * @param {string} activeCategory - Currently active category
     * @return {HTMLElement} Category card element
     */
    function createCategoryCard(category, activeCategory) {
      const isActive = category.id === activeCategory;
      
      const card = document.createElement('a');
      card.href = '#';
      card.className = `category-item flex flex-col items-center ${isActive ? 'active' : ''}`;
      card.dataset.category = category.id;
      
      // Simplified card design to match reference
      card.innerHTML = `
        <div class="category-card py-3 px-5 ${isActive ? 'border border-primary rounded-full' : ''}">
          <div class="flex items-center">
            <svg class="h-5 w-5 mr-2 text-${category.color || 'primary'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              ${getCategoryIcon(category.icon)}
            </svg>
            <span class="font-medium">${category.name}</span>
          </div>
        </div>
      `;
      
      return card;
    }
    
    /**
     * Render category cards
     * @param {Array} categories - Category data
     * @param {HTMLElement} container - Container element
     */
    function renderCategories(categories, container) {
      // Clear container
      container.innerHTML = '';
      
      // Create a horizontal flex container instead of grid
      const flex = document.createElement('div');
      flex.className = 'flex space-x-4 px-4 py-2 overflow-x-auto category-nav';
      container.appendChild(flex);
      
      // Add "All" category
      const allCategory = {
        id: 'all',
        name: 'All SVGs',
        icon: 'collection',
        color: 'primary',
        count: AppState.get('svgData.items').length
      };
      
      const activeCategory = AppState.get('currentCategory');
      
      // Add 'All' category card
      const allCategoryCard = createCategoryCard(allCategory, activeCategory);
      flex.appendChild(allCategoryCard);
      
      // Add each category
      categories.forEach(category => {
        // Update the name to not include count
        const updatedCategory = {
          ...category,
          name: category.name.replace(/\s*\(\d+\)$/, '')  // Remove any count in parentheses
        };
        
        const card = createCategoryCard(updatedCategory, activeCategory);
        flex.appendChild(card);
      });
    }


    /**
     * Get SVG icon markup for category
     * @param {string} icon - Icon name
     * @return {string} SVG path markup
     */
    function getCategoryIcon(icon) {
      // Library of icon paths
      const icons = {
        'home': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`,
        
        'badge-check': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />`,
        
        'image': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />`,
        
        'collection': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />`,
        
        'template': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />`
      };
      
      // Return icon path or default icon if not found
      return icons[icon] || icons['collection'];
    }
    
    /**
     * Initialize and update the featured SVGs section
     */
    function initFeaturedSection() {
      const featuredContainer = document.getElementById('featured-container');
      if (!featuredContainer) return;
      
      // Get the content container inside the section
      let contentDiv = featuredContainer.querySelector('.featured-content');
      if (!contentDiv) {
        contentDiv = document.createElement('div');
        contentDiv.className = 'featured-content py-4';
        featuredContainer.appendChild(contentDiv);
      }
      
      // Create sorting options
      const sortingDiv = document.createElement('div');
      sortingDiv.className = 'flex justify-between items-center mb-10';
      sortingDiv.innerHTML = `
        <h2 class="text-3xl font-bold text-dark">Featured SVGs</h2>
        <div>
          <select id="sort-featured" class="bg-white border border-gray-300 text-dark rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      `;
      contentDiv.appendChild(sortingDiv);
      
      // Create container for SVG grid
      const gridContainer = document.createElement('div');
      gridContainer.className = 'svg-grid-container';
      contentDiv.appendChild(gridContainer);
      
      // Force initial render
      updateFeaturedSection();
      
      // Add event listener for sort change
      const sortSelect = sortingDiv.querySelector('#sort-featured');
      sortSelect.addEventListener('change', function() {
        const sortValue = this.value;
        const items = AppState.getPaginatedItems();
        
        // Sort items based on selected option
        const sortedItems = sortItems(items, sortValue);
        
        // Re-render with sorted items
        renderSvgGrid(sortedItems, gridContainer);
      });
    }
    
    /**
     * Update the featured SVGs section
     */
    function updateFeaturedSection() {
      const featuredContainer = document.getElementById('featured-container');
      if (!featuredContainer) return;
      
      const gridContainer = featuredContainer.querySelector('.svg-grid-container');
      if (!gridContainer) return;
      
      // Get items for current page based on filters
      const items = AppState.getPaginatedItems();
      
      // Get current sort value
      const sortSelect = featuredContainer.querySelector('#sort-featured');
      const sortValue = sortSelect ? sortSelect.value : 'newest';
      
      // Sort items
      const sortedItems = sortItems(items, sortValue);
      
      // Render SVG grid
      renderSvgGrid(sortedItems, gridContainer);
    }
    
    /**
     * Sort items based on sort option
     * @param {Array} items - Items to sort
     * @param {string} sortBy - Sort option
     * @return {Array} Sorted items
     */
    function sortItems(items, sortBy) {
      const sortedItems = [...items]; // Create copy to avoid modifying original
      
      switch(sortBy) {
        case 'popular':
          // In a real app, this would sort by popularity metric
          // For demo, we'll sort by ID as a placeholder
          sortedItems.sort((a, b) => a.id.localeCompare(b.id));
          break;
        case 'price-low':
          sortedItems.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          sortedItems.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
        default:
          // In a real app, sort by creation date
          // For demo, we'll sort in reverse order
          sortedItems.reverse();
          break;
      }
      
      return sortedItems;
    }
    
    /**
     * Initialize and update the search functionality
     */
    function initSearch() {
      const searchForm = document.querySelector('.search-form');
      const searchInput = document.querySelector('.search-bar');
      
      if (!searchForm || !searchInput) return;
      
      // Set initial value from state
      searchInput.value = AppState.get('searchQuery') || '';
      
      // Add input event with debounce
      searchInput.addEventListener('input', Utils.debounce(function() {
        AppState.set('searchQuery', this.value.toLowerCase());
        AppState.set('pagination.currentPage', 1); // Reset to first page on search
      }, 300));
      
      // Add form submit event
      searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        AppState.set('searchQuery', searchInput.value.toLowerCase());
        AppState.set('pagination.currentPage', 1);
      });
    }
    
    // Public API
    return {
      createSvgCard,
      renderSvgGrid,
      renderCategories,
      initFeaturedSection,
      updateFeaturedSection,
      initSearch
    };
  })();
  
  // Make Components available globally
  window.Components = Components;