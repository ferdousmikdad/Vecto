/**
 * svg-editor.js
 * SVG editing functionality for the admin panel
 */

const SVGEditor = (function() {
    // DOM references
    let editorContainer;
    let currentSvgId = null;
    
    /**
     * Initialize SVG editor
     */
    function init() {
      console.log('Initializing SVG editor...');
      
      // Get container
      editorContainer = document.getElementById('admin-svg-editor');
      if (!editorContainer) {
        console.error('SVG editor container not found');
        return;
      }
      
      // Create editor UI
      createEditorUI();
      
      console.log('SVG editor initialized');
    }
    
    /**
     * Create editor UI
     */
    function createEditorUI() {
      // Clear loading placeholder
      editorContainer.innerHTML = '';
      
      // Create editor layout
      editorContainer.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Left sidebar: SVG selector -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-md p-4">
              <h3 class="text-lg font-medium mb-4">Select SVG</h3>
              <div class="mb-4">
                <input type="text" id="svg-search" 
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                  placeholder="Search SVGs...">
              </div>
              <div class="svg-list-container h-96 overflow-y-auto">
                <ul id="svg-list" class="space-y-2"></ul>
              </div>
            </div>
          </div>
          
          <!-- Main editor area -->
          <div class="lg:col-span-3">
            <!-- SVG Preview & Code Editor -->
            <div class="bg-white rounded-lg shadow-md p-4 mb-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- SVG Preview -->
                <div class="svg-preview-container">
                  <h3 class="text-lg font-medium mb-4">Preview</h3>
                  <div class="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                    <div id="svg-preview-container" class="text-center">
                      <p class="text-gray-500">Select an SVG to edit</p>
                    </div>
                  </div>
                </div>
                
                <!-- SVG Code Editor -->
                <div class="svg-code-container">
                  <h3 class="text-lg font-medium mb-4">SVG Code</h3>
                  <div class="relative">
                    <textarea id="svg-code-editor" 
                      class="w-full h-64 bg-gray-800 text-white p-4 rounded-lg text-sm font-mono" 
                      disabled 
                      placeholder="SVG code will appear here"></textarea>
                    <button id="copy-svg-code" 
                      class="absolute top-2 right-2 bg-white text-gray-800 p-1 rounded hover:bg-gray-200 disabled:opacity-50" 
                      disabled>
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Metadata Editor -->
            <div class="bg-white rounded-lg shadow-md p-4">
              <h3 class="text-lg font-medium mb-4">SVG Metadata</h3>
              <form id="svg-metadata-form" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="form-group">
                    <label for="svg-name" class="block text-sm font-medium text-gray-700 mb-1">SVG Name*</label>
                    <input type="text" id="svg-name" 
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                      disabled
                      required>
                  </div>
                  
                  <div class="form-group">
                    <label for="svg-category" class="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                    <select id="svg-category" 
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled
                      required>
                      <option value="">Select a category</option>
                      <!-- Will be populated dynamically -->
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label for="svg-description" class="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                    <textarea id="svg-description" rows="2" 
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled
                      required></textarea>
                  </div>
                  
                  <div class="form-group">
                    <label for="svg-tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                    <input type="text" id="svg-tags" 
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled
                      placeholder="e.g. icon, ui, minimal">
                  </div>
                  
                  <div class="form-group">
                    <label for="svg-price" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input type="number" id="svg-price" min="0" step="0.01" 
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled>
                    <p class="text-gray-400 text-xs mt-1">Enter 0 for free SVGs</p>
                  </div>
                  
                  <div class="form-group">
                    <label for="svg-color" class="block text-sm font-medium text-gray-700 mb-1">Preview Color</label>
                    <select id="svg-color" 
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled>
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="accent">Accent</option>
                      <option value="dark">Dark</option>
                      <option value="info">Info</option>
                    </select>
                  </div>
                </div>
                
                <div class="flex justify-end space-x-4 pt-4 border-t">
                  <button type="button" id="reset-metadata-btn" 
                    class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled>
                    Reset
                  </button>
                  <button type="submit" id="save-metadata-btn" 
                    class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    disabled>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;
      
      // Initialize components
      populateSvgList();
      populateCategories();
      setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    function setupEventListeners() {
      // SVG search
      const searchInput = document.getElementById('svg-search');
      if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(function() {
          populateSvgList(this.value);
        }, 300));
      }
      
      // SVG code editor
      const codeEditor = document.getElementById('svg-code-editor');
      if (codeEditor) {
        codeEditor.addEventListener('input', function() {
          updatePreview(this.value);
        });
      }
      
      // Copy SVG code button
      const copyButton = document.getElementById('copy-svg-code');
      if (copyButton) {
        copyButton.addEventListener('click', function() {
          const codeEditor = document.getElementById('svg-code-editor');
          Utils.copyToClipboard(codeEditor.value)
            .then(() => UIManager.showNotification('SVG code copied to clipboard', 'success'))
            .catch(() => UIManager.showNotification('Failed to copy SVG code', 'error'));
        });
      }
      
      // Color select
      const colorSelect = document.getElementById('svg-color');
      if (colorSelect) {
        colorSelect.addEventListener('change', function() {
          const svgPreview = document.getElementById('svg-preview-container');
          const svgElement = svgPreview.querySelector('svg');
          
          if (svgElement) {
            // Remove existing color classes
            ['text-primary', 'text-secondary', 'text-accent', 'text-dark', 'text-info'].forEach(cls => {
              svgElement.classList.remove(cls);
            });
            
            // Add selected color class
            svgElement.classList.add(`text-${this.value}`);
          }
        });
      }
      
      // Reset metadata button
      const resetButton = document.getElementById('reset-metadata-btn');
      if (resetButton) {
        resetButton.addEventListener('click', function() {
          loadSvgMetadata(currentSvgId);
        });
      }
      
      // Save metadata form
      const metadataForm = document.getElementById('svg-metadata-form');
      if (metadataForm) {
        metadataForm.addEventListener('submit', function(e) {
          e.preventDefault();
          saveSvgChanges();
        });
      }
    }
    
    /**
     * Populate the SVG list
     * @param {string} [searchQuery] - Optional search query
     */
    function populateSvgList(searchQuery = '') {
      const svgList = document.getElementById('svg-list');
      const svgItems = AppState.get('svgData.items') || [];
      
      // Clear list
      svgList.innerHTML = '';
      
      // Filter items if search query provided
      let filteredItems = svgItems;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredItems = svgItems.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }
      
      // Check if there are items
      if (filteredItems.length === 0) {
        svgList.innerHTML = `
          <li class="text-center p-4 text-gray-500">
            ${searchQuery ? 'No SVGs match your search' : 'No SVGs available'}
          </li>
        `;
        return;
      }
      
      // Add items to list
      filteredItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'svg-list-item bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg overflow-hidden cursor-pointer';
        listItem.dataset.id = item.id;
        
        listItem.innerHTML = `
          <div class="p-2 flex items-center">
            <div class="p-2 bg-white border border-gray-200 rounded mr-3 svg-item-thumb text-${item.previewColor || 'primary'}">
              <!-- SVG preview will be loaded here -->
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-dark truncate">${item.name}</h4>
              <p class="text-xs text-gray-500 truncate">${item.category} 
                ${item.price > 0 ? `• $${item.price.toFixed(2)}` : '• Free'}</p>
            </div>
          </div>
        `;
        
        // Add click event
        listItem.addEventListener('click', function() {
          selectSvg(item.id);
        });
        
        // Add to list
        svgList.appendChild(listItem);
        
        // Load SVG preview
        const thumbContainer = listItem.querySelector('.svg-item-thumb');
        loadSvgThumb(item.filePath, thumbContainer);
      });
    }
    
    /**
     * Load SVG thumbnail
     * @param {string} svgPath - Path to SVG file
     * @param {HTMLElement} container - Container to load into
     */
    function loadSvgThumb(svgPath, container) {
      DataLoader.loadSvgContent(svgPath)
        .then(svgContent => {
          container.innerHTML = svgContent;
          
          // Set max dimensions for thumbnail
          const svgElement = container.querySelector('svg');
          if (svgElement) {
            svgElement.style.width = '24px';
            svgElement.style.height = '24px';
          }
        })
        .catch(error => {
          console.error('Error loading SVG thumbnail:', error);
          container.innerHTML = '<svg class="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
        });
    }
    
    /**
     * Populate categories dropdown
     */
    function populateCategories() {
      const categorySelect = document.getElementById('svg-category');
      const categories = AppState.get('svgData.categories') || [];
      
      // Clear select
      categorySelect.innerHTML = '<option value="">Select a category</option>';
      
      // Add all categories
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
    
    /**
     * Select an SVG for editing
     * @param {string} svgId - SVG ID
     */
    function selectSvg(svgId) {
      // Store current SVG ID
      currentSvgId = svgId;
      
      // Highlight selected item
      const items = document.querySelectorAll('.svg-list-item');
      items.forEach(item => {
        if (item.dataset.id === svgId) {
          item.classList.add('bg-primary', 'bg-opacity-10');
        } else {
          item.classList.remove('bg-primary', 'bg-opacity-10');
        }
      });
      
      // Load SVG data
      loadSvgData(svgId);
    }
    
    /**
     * Load SVG data
     * @param {string} svgId - SVG ID
     */
    function loadSvgData(svgId) {
      const svgItem = AppState.get('svgData.items').find(item => item.id === svgId);
      if (!svgItem) {
        UIManager.showNotification('SVG not found', 'error');
        return;
      }
      
      // Show loading state
      UIManager.showLoading();
      
      // Load SVG content
      DataLoader.loadSvgContent(svgItem.filePath)
        .then(svgContent => {
          // Update code editor
          const codeEditor = document.getElementById('svg-code-editor');
          codeEditor.value = svgContent;
          codeEditor.disabled = false;
          
          // Update preview
          updatePreview(svgContent, svgItem.previewColor);
          
          // Update metadata form
          loadSvgMetadata(svgId);
          
          // Enable code copy button
          document.getElementById('copy-svg-code').disabled = false;
          
          // Hide loading
          UIManager.hideLoading();
        })
        .catch(error => {
          console.error('Error loading SVG data:', error);
          UIManager.showNotification('Failed to load SVG data', 'error');
          UIManager.hideLoading();
        });
    }
    
    /**
     * Update SVG preview
     * @param {string} svgContent - SVG content
     * @param {string} [colorClass] - Color class to apply
     */
    function updatePreview(svgContent, colorClass) {
      const previewContainer = document.getElementById('svg-preview-container');
      
      // Set container content
      previewContainer.innerHTML = svgContent;
      
      // Style SVG
      const svgElement = previewContainer.querySelector('svg');
      if (svgElement) {
        svgElement.style.maxWidth = '100%';
        svgElement.style.maxHeight = '100%';
        svgElement.style.height = 'auto';
        
        // Add color class if provided or use the one from the color select
        const colorSelect = document.getElementById('svg-color');
        const colorToApply = colorClass || colorSelect.value;
        
        // Remove existing color classes
        ['text-primary', 'text-secondary', 'text-accent', 'text-dark', 'text-info'].forEach(cls => {
          svgElement.classList.remove(cls);
        });
        
        // Add color class
        svgElement.classList.add(`text-${colorToApply}`);
      }
    }
    
    /**
     * Load SVG metadata into form
     * @param {string} svgId - SVG ID
     */
    function loadSvgMetadata(svgId) {
      const svgItem = AppState.get('svgData.items').find(item => item.id === svgId);
      if (!svgItem) return;
      
      // Get form fields
      const nameInput = document.getElementById('svg-name');
      const descriptionInput = document.getElementById('svg-description');
      const categorySelect = document.getElementById('svg-category');
      const tagsInput = document.getElementById('svg-tags');
      const priceInput = document.getElementById('svg-price');
      const colorSelect = document.getElementById('svg-color');
      
      // Set values
      nameInput.value = svgItem.name || '';
      descriptionInput.value = svgItem.description || '';
      categorySelect.value = svgItem.category || '';
      tagsInput.value = svgItem.tags ? svgItem.tags.join(', ') : '';
      priceInput.value = svgItem.price || 0;
      colorSelect.value = svgItem.previewColor || 'primary';
      
      // Enable form elements
      nameInput.disabled = false;
      descriptionInput.disabled = false;
      categorySelect.disabled = false;
      tagsInput.disabled = false;
      priceInput.disabled = false;
      colorSelect.disabled = false;
      
      // Enable buttons
      document.getElementById('reset-metadata-btn').disabled = false;
      document.getElementById('save-metadata-btn').disabled = false;
    }
    
    /**
     * Save SVG changes
     */
    function saveSvgChanges() {
      // Check if an SVG is selected
      if (!currentSvgId) {
        UIManager.showNotification('No SVG selected', 'error');
        return;
      }
      
      // Get form values
      const nameInput = document.getElementById('svg-name');
      const descriptionInput = document.getElementById('svg-description');
      const categorySelect = document.getElementById('svg-category');
      const tagsInput = document.getElementById('svg-tags');
      const priceInput = document.getElementById('svg-price');
      const colorSelect = document.getElementById('svg-color');
      const codeEditor = document.getElementById('svg-code-editor');
      
      // Validate inputs
      if (!nameInput.value.trim()) {
        UIManager.showNotification('Please enter a name for the SVG', 'error');
        nameInput.focus();
        return;
      }
      
      if (!descriptionInput.value.trim()) {
        UIManager.showNotification('Please enter a description', 'error');
        descriptionInput.focus();
        return;
      }
      
      if (!categorySelect.value) {
        UIManager.showNotification('Please select a category', 'error');
        categorySelect.focus();
        return;
      }
      
      // Process tags
      const tags = tagsInput.value.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Process price
      const price = parseFloat(priceInput.value) || 0;
      
      // Show loading state
      UIManager.showLoading();
      
      // Get current items
      const items = [...AppState.get('svgData.items')];
      const itemIndex = items.findIndex(item => item.id === currentSvgId);
      
      if (itemIndex === -1) {
        UIManager.showNotification('SVG not found', 'error');
        UIManager.hideLoading();
        return;
      }
      
      // Check if category has changed (for updating category counts)
      const oldCategory = items[itemIndex].category;
      const newCategory = categorySelect.value;
      
      // Update SVG metadata
      items[itemIndex] = {
        ...items[itemIndex],
        name: nameInput.value.trim(),
        description: descriptionInput.value.trim(),
        category: newCategory,
        tags: tags,
        price: price,
        previewColor: colorSelect.value
      };
      
      // Update SVG content
      // In a real application, this would be sent to the server
      // For this demo, we'll just update the state and show a success message
      
      // Update state
      AppState.set('svgData.items', items);
      
      // Update category counts if category changed
      if (oldCategory !== newCategory) {
        const categories = [...AppState.get('svgData.categories')];
        
        // Decrement old category count
        const oldCategoryIndex = categories.findIndex(c => c.id === oldCategory);
        if (oldCategoryIndex !== -1 && categories[oldCategoryIndex].count > 0) {
          categories[oldCategoryIndex].count--;
        }
        
        // Increment new category count
        const newCategoryIndex = categories.findIndex(c => c.id === newCategory);
        if (newCategoryIndex !== -1) {
          categories[newCategoryIndex].count++;
        }
        
        // Update categories
        AppState.set('svgData.categories', categories);
      }
      
      // Update admin dashboard
      if (window.Admin && typeof window.Admin.updateStats === 'function') {
        window.Admin.updateStats();
      }
      
      // Show success notification
      UIManager.showNotification('SVG updated successfully', 'success');
      
      // Hide loading
      UIManager.hideLoading();
      
      // Refresh SVG list to reflect changes
      populateSvgList();
    }
    
    // Public API
    return {
      init
    };
  })();
  
  // Make SVGEditor available globally
  window.SVGEditor = SVGEditor;