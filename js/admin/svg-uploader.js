/**
 * svg-uploader.js
 * SVG upload functionality for the admin panel
 */

const SVGUploader = (function() {
    // DOM references
    let uploaderContainer;
    
    /**
     * Initialize SVG uploader
     */
    function init() {
      console.log('Initializing SVG uploader...');
      
      // Get container
      uploaderContainer = document.getElementById('admin-svg-uploader');
      if (!uploaderContainer) {
        console.error('SVG uploader container not found');
        return;
      }
      
      // Create uploader UI
      createUploaderUI();
      
      console.log('SVG uploader initialized');
    }
    
    /**
     * Create uploader UI
     */
    function createUploaderUI() {
      // Clear loading placeholder
      uploaderContainer.innerHTML = '';
      
      // Create form container
      const formContainer = document.createElement('div');
      formContainer.className = 'bg-white rounded-lg shadow-md p-6 mb-6';
      
      // Create upload form
      formContainer.innerHTML = `
        <h3 class="text-lg font-medium mb-4">Upload New SVG</h3>
        <form id="svg-upload-form" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <!-- SVG File Input -->
              <div class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                <svg class="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                <p class="text-gray-500 mb-2">Drag and drop your SVG file here, or click to browse</p>
                <p class="text-gray-400 text-sm">Maximum file size: 500KB</p>
                <input type="file" id="svg-file" accept=".svg" class="hidden" required>
                <div id="file-preview" class="mt-4"></div>
              </div>
              
              <!-- SVG Preview -->
              <div class="svg-preview-container bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
                <div id="svg-preview" class="text-center">
                  <p class="text-gray-500">SVG preview will appear here</p>
                </div>
              </div>
            </div>
            
            <div class="space-y-4">
              <!-- SVG Metadata -->
              <div class="form-group">
                <label for="svg-name" class="block text-sm font-medium text-gray-700 mb-1">SVG Name*</label>
                <input type="text" id="svg-name" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
              </div>
              
              <div class="form-group">
                <label for="svg-description" class="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea id="svg-description" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required></textarea>
              </div>
              
              <div class="form-group">
                <label for="svg-category" class="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select id="svg-category" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
                  <option value="">Select a category</option>
                  <!-- Will be populated dynamically -->
                </select>
              </div>
              
              <div class="form-group">
                <label for="svg-tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input type="text" id="svg-tags" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. icon, ui, minimal">
              </div>
              
              <div class="form-group">
                <label for="svg-price" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input type="number" id="svg-price" min="0" step="0.01" value="0" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                <p class="text-gray-400 text-xs mt-1">Enter 0 for free SVGs</p>
              </div>
              
              <div class="form-group">
                <label for="svg-color" class="block text-sm font-medium text-gray-700 mb-1">Preview Color</label>
                <select id="svg-color" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="accent">Accent</option>
                  <option value="dark">Dark</option>
                  <option value="info">Info</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" id="reset-form" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              Reset
            </button>
            <button type="submit" id="submit-form" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
              Upload SVG
            </button>
          </div>
        </form>
      `;
      
      uploaderContainer.appendChild(formContainer);
      
      // Create results container
      const resultsContainer = document.createElement('div');
      resultsContainer.id = 'upload-results';
      resultsContainer.className = 'bg-white rounded-lg shadow-md p-6 hidden';
      resultsContainer.innerHTML = `
        <h3 class="text-lg font-medium mb-4">Upload Results</h3>
        <div id="results-content"></div>
      `;
      
      uploaderContainer.appendChild(resultsContainer);
      
      // Initialize form handlers
      initializeFormHandlers();
      populateCategories();
    }
    
    /**
     * Initialize form event handlers
     */
    function initializeFormHandlers() {
      const uploadForm = document.getElementById('svg-upload-form');
      const fileInput = document.getElementById('svg-file');
      const uploadArea = uploaderContainer.querySelector('.upload-area');
      const previewContainer = document.getElementById('svg-preview');
      const resetButton = document.getElementById('reset-form');
      
      // File drag and drop
      uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('border-primary');
      });
      
      uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('border-primary');
      });
      
      uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('border-primary');
        
        if (e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          handleFileSelect(e.dataTransfer.files[0]);
        }
      });
      
      // File input click
      uploadArea.addEventListener('click', function() {
        fileInput.click();
      });
      
      // File input change
      fileInput.addEventListener('change', function() {
        if (this.files.length) {
          handleFileSelect(this.files[0]);
        }
      });
      
      // Form submission
      uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitForm();
      });
      
      // Reset form
      resetButton.addEventListener('click', function() {
        resetForm();
      });
    }
    
    /**
     * Handle file selection
     * @param {File} file - Selected file
     */
    function handleFileSelect(file) {
      const filePreview = document.getElementById('file-preview');
      const svgPreview = document.getElementById('svg-preview');
      
      // Check if file is SVG
      if (file.type !== 'image/svg+xml') {
        UIManager.showNotification('Please select an SVG file', 'error');
        return;
      }
      
      // Check file size
      if (file.size > 500 * 1024) { // 500KB
        UIManager.showNotification('File size exceeds 500KB limit', 'error');
        return;
      }
      
      // Update file preview
      filePreview.innerHTML = `
        <div class="bg-gray-100 rounded-lg p-2 text-left">
          <div class="flex items-center">
            <svg class="h-6 w-6 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div class="flex-1 truncate">
              <p class="text-sm font-medium text-gray-800">${file.name}</p>
              <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button type="button" class="text-gray-400 hover:text-gray-600" id="remove-file">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      `;
      
      // Add remove file handler
      document.getElementById('remove-file').addEventListener('click', function(e) {
        e.stopPropagation();
        resetFileInput();
      });
      
      // Read and preview SVG
      const reader = new FileReader();
      reader.onload = function(e) {
        const svgContent = e.target.result;
        svgPreview.innerHTML = svgContent;
        
        // Set max dimensions
        const svgElement = svgPreview.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.maxHeight = '100%';
          svgElement.style.height = 'auto';
          
          // Set color from selected preview color
          const colorSelect = document.getElementById('svg-color');
          svgElement.classList.add(`text-${colorSelect.value}`);
          
          // Add color change handler
          colorSelect.addEventListener('change', function() {
            svgElement.className = '';
            svgElement.classList.add(`text-${this.value}`);
          });
        }
      };
      reader.readAsText(file);
      
      // Auto-populate name from filename
      const nameInput = document.getElementById('svg-name');
      if (!nameInput.value) {
        nameInput.value = file.name.replace(/\.svg$/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase()); // Title case
      }
    }
    
    /**
     * Populate categories dropdown
     */
    function populateCategories() {
      const categorySelect = document.getElementById('svg-category');
      const categories = AppState.get('svgData.categories') || [];
      
      // Add all categories
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
    
    /**
     * Reset file input
     */
    function resetFileInput() {
      const fileInput = document.getElementById('svg-file');
      const filePreview = document.getElementById('file-preview');
      const svgPreview = document.getElementById('svg-preview');
      
      fileInput.value = '';
      filePreview.innerHTML = '';
      svgPreview.innerHTML = '<p class="text-gray-500">SVG preview will appear here</p>';
    }
    
    /**
     * Reset form
     */
    function resetForm() {
      const uploadForm = document.getElementById('svg-upload-form');
      uploadForm.reset();
      resetFileInput();
      
      // Hide results
      const resultsContainer = document.getElementById('upload-results');
      resultsContainer.classList.add('hidden');
    }
    
    /**
     * Submit form
     */
    function submitForm() {
      const fileInput = document.getElementById('svg-file');
      const nameInput = document.getElementById('svg-name');
      const descriptionInput = document.getElementById('svg-description');
      const categoryInput = document.getElementById('svg-category');
      const tagsInput = document.getElementById('svg-tags');
      const priceInput = document.getElementById('svg-price');
      const colorInput = document.getElementById('svg-color');
      
      // Validate inputs
      if (!fileInput.files.length) {
        UIManager.showNotification('Please select an SVG file', 'error');
        return;
      }
      
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
      
      if (!categoryInput.value) {
        UIManager.showNotification('Please select a category', 'error');
        categoryInput.focus();
        return;
      }
      
      // Show loading state
      UIManager.showLoading();
      
      // Read SVG file
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = function(e) {
        // SVG content
        const svgContent = e.target.result;
        
        // Generate SVG info
        const svgId = `svg-${Date.now()}`;
        const tags = tagsInput.value.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        
        const price = parseFloat(priceInput.value) || 0;
        
        // Create filename
        const filename = Utils.sanitizeFilename(nameInput.value) + '.svg';
        const filePath = `assets/svg/${categoryInput.value}/${filename}`;
        
        // Create SVG metadata
        const svgData = {
          id: svgId,
          name: nameInput.value.trim(),
          description: descriptionInput.value.trim(),
          category: categoryInput.value,
          price: price,
          filePath: filePath,
          previewColor: colorInput.value,
          tags: tags
        };
        
        // In a real app, you would upload the file to the server here
        // For demo purposes, show a success message with the data
        
        // Hide loading
        UIManager.hideLoading();
        
        // Show results
        showResults(svgData, svgContent);
        
        // Show notification
        UIManager.showNotification('SVG prepared successfully!', 'success');
      };
      
      reader.readAsText(file);
    }
    
    /**
     * Show upload results
     * @param {Object} svgData - SVG metadata
     * @param {string} svgContent - SVG content
     */
    function showResults(svgData, svgContent) {
      const resultsContainer = document.getElementById('upload-results');
      const resultsContent = document.getElementById('results-content');
      
      // Format tags
      const formattedTags = svgData.tags.map(tag => 
        `<span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">${tag}</span>`
      ).join('');
      
      // Create JSON string
      const jsonString = JSON.stringify(svgData, null, 2);
      
      // Show results
      resultsContent.innerHTML = `
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 class="font-medium text-dark mb-2">SVG Preview</h4>
          <div class="flex justify-center p-4 bg-white rounded border">
            ${svgContent}
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 class="font-medium text-dark mb-2">SVG Metadata</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Name</p>
              <p class="font-medium">${svgData.name}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Category</p>
              <p class="font-medium">${svgData.category}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Price</p>
              <p class="font-medium">${svgData.price === 0 ? 'Free' : '$' + svgData.price.toFixed(2)}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">File Path</p>
              <p class="font-medium">${svgData.filePath}</p>
            </div>
            <div class="col-span-2">
              <p class="text-sm text-gray-500">Description</p>
              <p>${svgData.description}</p>
            </div>
            <div class="col-span-2">
              <p class="text-sm text-gray-500">Tags</p>
              <div class="mt-1">${formattedTags || '<p class="text-gray-400">No tags</p>'}</div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 class="font-medium text-dark mb-2">JSON Data</h4>
          <div class="relative">
            <pre class="bg-gray-800 text-white p-4 rounded-lg text-sm overflow-auto max-h-64"><code>${jsonString}</code></pre>
            <button class="absolute top-2 right-2 bg-white text-gray-800 p-1 rounded hover:bg-gray-200 copy-json-btn">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium text-dark mb-2">SVG Content</h4>
          <div class="relative">
            <pre class="bg-gray-800 text-white p-4 rounded-lg text-sm overflow-auto max-h-64"><code>${svgContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
            <button class="absolute top-2 right-2 bg-white text-gray-800 p-1 rounded hover:bg-gray-200 copy-svg-btn">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="flex justify-end mt-6 space-x-4">
          <button type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors" id="back-to-form">
            Back to Form
          </button>
          <button type="button" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors" id="add-to-library">
            Add to Library
          </button>
        </div>
      `;
      
      // Show results container
      resultsContainer.classList.remove('hidden');
      
      // Add event listeners
      resultsContainer.querySelector('.copy-json-btn').addEventListener('click', function() {
        Utils.copyToClipboard(jsonString)
          .then(() => UIManager.showNotification('JSON copied to clipboard', 'success'))
          .catch(() => UIManager.showNotification('Failed to copy JSON', 'error'));
      });
      
      resultsContainer.querySelector('.copy-svg-btn').addEventListener('click', function() {
        Utils.copyToClipboard(svgContent)
          .then(() => UIManager.showNotification('SVG copied to clipboard', 'success'))
          .catch(() => UIManager.showNotification('Failed to copy SVG', 'error'));
      });
      
      resultsContainer.querySelector('#back-to-form').addEventListener('click', function() {
        resultsContainer.classList.add('hidden');
      });
      
      resultsContainer.querySelector('#add-to-library').addEventListener('click', function() {
        addToLibrary(svgData, svgContent);
      });
    }
    
    /**
     * Add SVG to library
     * @param {Object} svgData - SVG metadata
     * @param {string} svgContent - SVG content
     */
    function addToLibrary(svgData, svgContent) {
      // In a real app, you would send this to the server
      // For demo purposes, add to state and show a notification
      
      // Get current items
      const items = [...AppState.get('svgData.items')];
      
      // Add new item
      items.push(svgData);
      
      // Update state
      AppState.set('svgData.items', items);
      
      // Update category count
      const categories = AppState.get('svgData.categories');
      const categoryIndex = categories.findIndex(c => c.id === svgData.category);
      
      if (categoryIndex !== -1) {
        categories[categoryIndex].count++;
        AppState.set('svgData.categories', categories);
      }
      
      // Update admin dashboard
      if (window.Admin && typeof window.Admin.updateStats === 'function') {
        window.Admin.updateStats();
      }
      
      // Show notification
      UIManager.showNotification('SVG added to library!', 'success');
      
      // Reset form
      resetForm();
    }
    
    // Public API
    return {
      init
    };
  })();
  
  // Make SVGUploader available globally
  window.SVGUploader = SVGUploader;