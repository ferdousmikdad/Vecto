/**
 * ui-manager.js
 * Manages UI interactions and updates
 */

const UIManager = (function() {
    // DOM element references
    const DOM = {
      loadingIndicator: document.getElementById('loading-indicator'),
      toastContainer: document.getElementById('toast-container')
    };
    
    // Toast configuration
    const TOAST_DURATION = 3000; // Duration in ms
    
    /**
     * Load a component HTML file into a container
     * @param {string} containerId - ID of the container element
     * @param {string} filePath - Path to the HTML file
     * @return {Promise} Promise that resolves when the component is loaded
     */
    function loadComponent(containerId, filePath) {
      return new Promise((resolve, reject) => {
        const container = document.getElementById(containerId);
        if (!container) {
          const error = new Error(`Container #${containerId} not found`);
          console.error(error);
          reject(error);
          return;
        }
        
        fetch(filePath)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            return response.text();
          })
          .then(html => {
            container.innerHTML = html;
            
            // Special handling for categories container
            if (containerId === 'categories-container') {
              const categories = AppState.get('svgData.categories');
              if (categories && categories.length > 0) {
                const categoryNav = container.querySelector('.category-nav');
                if (categoryNav) {
                  Components.renderCategories(categories, categoryNav);
                }
              }
            }
            
            // Dispatch a custom event when component is loaded
            const event = new CustomEvent('componentLoaded', {
              detail: { id: containerId, path: filePath }
            });
            document.dispatchEvent(event);
            
            resolve(container);
          })
          .catch(error => {
            console.error(`Error loading component ${filePath}:`, error);
            container.innerHTML = `
              <div class="p-4 text-center text-danger component-error">
                <div class="mb-2">
                  <svg class="h-10 w-10 mx-auto text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium">Failed to load component</h3>
                <p class="text-sm mt-2">${error.message}</p>
              </div>
            `;
            reject(error);
          });
      });
    }

    /**
     * Load all app components
     * @return {Promise} Promise that resolves when all components are loaded
     */
    function loadAllComponents() {
      const componentPromises = [
        loadComponent('header-container', 'sections/header.html'),
        loadComponent('hero-container', 'sections/hero.html'),
        loadComponent('categories-container', 'sections/categories.html'),
        loadComponent('featured-container', 'sections/featured.html'),
        loadComponent('footer-container', 'sections/footer.html')
      ];
      
      return Promise.all(componentPromises);
    }
    
    /**
     * Show a notification toast
     * @param {string} message - Message to show
     * @param {string} type - Notification type (success, error, info)
     * @param {number} [duration] - Duration in ms (defaults to TOAST_DURATION)
     */
    function showNotification(message, type = 'info', duration = TOAST_DURATION) {
      const toast = document.createElement('div');
      toast.className = `notification ${type} animate-fadeIn`;
      toast.setAttribute('role', 'alert');
      toast.innerHTML = `
        <div class="flex items-center">
          ${getToastIcon(type)}
          <span>${message}</span>
        </div>
      `;
      
      // Add to DOM
      DOM.toastContainer.appendChild(toast);
      
      // Set timeout to remove
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
          if (toast.parentNode) {
            DOM.toastContainer.removeChild(toast);
          }
        }, 300);
      }, duration);
    }
    
    /**
     * Get icon for notification toast
     * @param {string} type - Notification type
     * @return {string} Icon HTML
     */
    function getToastIcon(type) {
      switch(type) {
        case 'success':
          return `<svg class="w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>`;
        case 'error':
          return `<svg class="w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>`;
        default:
          return `<svg class="w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>`;
      }
    }
    
    /**
     * Show loading indicator
     */
    function showLoading() {
      DOM.loadingIndicator.classList.remove('hidden');
    }
    
    /**
     * Hide loading indicator
     */
    function hideLoading() {
      DOM.loadingIndicator.classList.add('hidden');
    }
    
    /**
     * Create an SVG preview element
     * @param {Object} item - SVG item data
     * @return {HTMLElement} SVG preview element
     */
    function createSvgPreview(item) {
      const previewContainer = document.createElement('div');
      previewContainer.className = 'p-6 bg-gray-100 flex items-center justify-center h-48 svg-preview';
      
      // Start with loading placeholder
      previewContainer.innerHTML = `
        <div class="animate-pulse">
          <div class="rounded-full bg-gray-300 h-24 w-24"></div>
        </div>
      `;
      
      // Load the SVG
      DataLoader.loadSvgContent(item.filePath)
        .then(svgContent => {
          // Parse SVG for customization
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
          const svgElement = svgDoc.documentElement;
          
          // Add classes for styling (based on preview color)
          svgElement.classList.add('h-24', 'w-24', `text-${item.previewColor || 'primary'}`);
          
          // Replace the placeholder with the actual SVG
          previewContainer.innerHTML = '';
          previewContainer.appendChild(svgElement);
        })
        .catch(error => {
          console.error('Error loading SVG preview:', error);
          previewContainer.innerHTML = `
            <div class="text-center">
              <svg class="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="text-xs text-gray-500 mt-2">Failed to load SVG</p>
            </div>
          `;
        });
      
      return previewContainer;
    }
    
    /**
     * Create pagination UI
     * @param {Object} paginationState - Current pagination state
     * @param {Function} onPageChange - Callback for page change
     * @return {HTMLElement} Pagination element
     */
    function createPagination(paginationState, onPageChange) {
      const { currentPage, totalPages } = paginationState;
      
      const paginationContainer = document.createElement('div');
      paginationContainer.className = 'mt-8 flex justify-center pagination-container';
      
      // Don't show pagination if only one page
      if (totalPages <= 1) {
        paginationContainer.classList.add('hidden');
        return paginationContainer;
      }
      
      const paginationInner = document.createElement('div');
      paginationInner.className = 'inline-flex shadow-sm';
      paginationContainer.appendChild(paginationInner);
      
      // Previous button
      const prevButton = document.createElement('button');
      prevButton.className = 'pagination-prev bg-white text-dark py-2 px-4 border border-gray-300 rounded-l-lg hover:bg-gray-100';
      prevButton.disabled = currentPage === 1;
      prevButton.innerHTML = `
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      `;
      prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
          onPageChange(currentPage - 1);
        }
      });
      paginationInner.appendChild(prevButton);
      
      // Page buttons
      const pagesContainer = document.createElement('div');
      pagesContainer.className = 'pagination-pages flex';
      paginationInner.appendChild(pagesContainer);
      
      // Generate page buttons
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + 4);
      
      if (endPage - startPage < 4 && startPage > 1) {
        startPage = Math.max(1, endPage - 4);
      }
      
      // First page button if not in range
      if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.className = 'pagination-page bg-white py-2 px-4 border-t border-b border-l border-gray-300 text-dark hover:bg-gray-100';
        firstPageButton.textContent = '1';
        firstPageButton.addEventListener('click', () => onPageChange(1));
        pagesContainer.appendChild(firstPageButton);
        
        // Ellipsis if needed
        if (startPage > 2) {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'pagination-ellipsis bg-white py-2 px-4 border-t border-b border-l border-gray-300 text-dark';
          ellipsis.textContent = '...';
          pagesContainer.appendChild(ellipsis);
        }
      }
      
      // Page buttons
      for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-page bg-white py-2 px-4 border-t border-b border-l border-gray-300 ${
          i === currentPage
            ? 'bg-primary text-white'
            : 'text-dark hover:bg-gray-100'
        }`;
        pageButton.textContent = i.toString();
        pageButton.addEventListener('click', () => onPageChange(i));
        pagesContainer.appendChild(pageButton);
      }
      
      // Last page button if not in range
      if (endPage < totalPages) {
        // Ellipsis if needed
        if (endPage < totalPages - 1) {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'pagination-ellipsis bg-white py-2 px-4 border-t border-b border-l border-gray-300 text-dark';
          ellipsis.textContent = '...';
          pagesContainer.appendChild(ellipsis);
        }
        
        const lastPageButton = document.createElement('button');
        lastPageButton.className = 'pagination-page bg-white py-2 px-4 border-t border-b border-l border-gray-300 text-dark hover:bg-gray-100';
        lastPageButton.textContent = totalPages.toString();
        lastPageButton.addEventListener('click', () => onPageChange(totalPages));
        pagesContainer.appendChild(lastPageButton);
      }
      
      // Next button
      const nextButton = document.createElement('button');
      nextButton.className = 'pagination-next bg-white text-dark py-2 px-4 border border-gray-300 rounded-r-lg hover:bg-gray-100';
      nextButton.disabled = currentPage === totalPages;
      nextButton.innerHTML = `
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      `;
      nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
          onPageChange(currentPage + 1);
        }
      });
      paginationInner.appendChild(nextButton);
      
      return paginationContainer;
    }
    
    /**
     * Create empty state UI for when no SVGs are found
     * @param {Function} onClearFilters - Callback for clearing filters
     * @return {HTMLElement} Empty state element
     */
    function createEmptyState(onClearFilters) {
      const emptyState = document.createElement('div');
      emptyState.className = 'text-center py-16 empty-state';
      
      emptyState.innerHTML = `
        <svg class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-xl font-medium text-gray-500 mb-1">No SVGs Found</h3>
        <p class="text-gray-400">Try adjusting your search or filter criteria</p>
        <button class="mt-4 bg-primary hover:bg-opacity-80 text-white font-medium py-2 px-4 rounded-lg transition-colors clear-filters-btn">
          Clear Filters
        </button>
      `;
      
      // Add event listener to clear filters button
      emptyState.querySelector('.clear-filters-btn').addEventListener('click', onClearFilters);
      
      return emptyState;
    }
    
    // Public API
    return {
      loadComponent,
      loadAllComponents,
      showNotification,
      showLoading,
      hideLoading,
      createSvgPreview,
      createPagination,
      createEmptyState
    };
  })();
  
  // Make UIManager available globally
  window.UIManager = UIManager;