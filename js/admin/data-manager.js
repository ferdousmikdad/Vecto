/**
 * data-manager.js
 * Manages data import and export for the SVG marketplace
 */

const DataManager = (function() {
  // DOM references
  let managerContainer;
  let importedData = null;
  
  /**
   * Initialize data manager
   */
  function init() {
    console.log('Initializing data manager...');
    
    // Get container
    managerContainer = document.getElementById('admin-data-manager');
    if (!managerContainer) {
      console.error('Data manager container not found');
      return;
    }
    
    // Create UI
    createManagerUI();
    
    console.log('Data manager initialized');
  }
  
  /**
   * Create data manager UI
   */
  function createManagerUI() {
    // Clear loading placeholder
    managerContainer.innerHTML = '';
    
    // Create layout
    managerContainer.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Export Data -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-medium mb-4">Export Data</h3>
          <p class="text-gray-500 mb-6">Export your SVG data for backup or transfer to another instance.</p>
          
          <div class="space-y-4">
            <div class="form-group">
              <label class="flex items-center mb-2">
                <input type="checkbox" id="export-all" checked class="rounded text-primary focus:ring-primary mr-2">
                <span class="text-sm font-medium text-gray-700">Export all data</span>
              </label>
            </div>
            
            <div class="space-y-2" id="export-options">
              <div class="form-group">
                <label class="flex items-center">
                  <input type="checkbox" id="export-svgs" checked class="rounded text-primary focus:ring-primary mr-2">
                  <span class="text-sm font-medium text-gray-700">SVG Items</span>
                </label>
              </div>
              
              <div class="form-group">
                <label class="flex items-center">
                  <input type="checkbox" id="export-categories" checked class="rounded text-primary focus:ring-primary mr-2">
                  <span class="text-sm font-medium text-gray-700">Categories</span>
                </label>
              </div>
              
              <div class="form-group">
                <label class="flex items-center">
                  <input type="checkbox" id="export-settings" checked class="rounded text-primary focus:ring-primary mr-2">
                  <span class="text-sm font-medium text-gray-700">Settings</span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label class="flex items-center mb-2">
                <input type="checkbox" id="export-include-svg-content" class="rounded text-primary focus:ring-primary mr-2">
                <span class="text-sm font-medium text-gray-700">Include SVG content (larger file size)</span>
              </label>
            </div>
            
            <div class="flex justify-end">
              <button id="export-button" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
                Export JSON
              </button>
            </div>
          </div>
        </div>
        
        <!-- Import Data -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-medium mb-4">Import Data</h3>
          <p class="text-gray-500 mb-6">Import SVG data from a previously exported file.</p>
          
          <div class="space-y-4">
            <div class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <svg class="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              <p class="text-gray-500 mb-2">Drag and drop JSON file here, or click to browse</p>
              <input type="file" id="import-file" accept=".json" class="hidden">
              <div id="file-preview" class="mt-4"></div>
            </div>
            
            <div class="space-y-2">
              <div class="form-group">
                <label class="flex items-center">
                  <input type="checkbox" id="import-merge" checked class="rounded text-primary focus:ring-primary mr-2">
                  <span class="text-sm font-medium text-gray-700">Merge with existing data</span>
                </label>
                <p class="text-xs text-gray-500 ml-6">When unchecked, imported data will replace existing data</p>
              </div>
            </div>
            
            <div class="flex justify-end">
              <button id="import-button" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-not-allowed" disabled>
                Import Data
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Data Summary -->
      <div class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 class="text-lg font-medium mb-4">Data Summary</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center mb-2">
              <svg class="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h4 class="font-medium text-dark">SVG Items</h4>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Total Items</span>
              <span id="svg-count" class="font-medium text-lg">0</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Free Items</span>
              <span id="free-svg-count" class="font-medium text-lg">0</span>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center mb-2">
              <svg class="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h4 class="font-medium text-dark">Categories</h4>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Total Categories</span>
              <span id="category-count" class="font-medium text-lg">0</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Empty Categories</span>
              <span id="empty-category-count" class="font-medium text-lg">0</span>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center mb-2">
              <svg class="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h4 class="font-medium text-dark">File Sizes</h4>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Estimated Export Size</span>
              <span id="export-size" class="font-medium text-lg">0 KB</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">SVG Content Size</span>
              <span id="svg-content-size" class="font-medium text-lg">0 KB</span>
            </div>
          </div>
        </div>
        
        <!-- Last modified -->
        <div class="mt-4 text-right text-sm text-gray-500">
          Last modified: <span id="last-modified">-</span>
        </div>
      </div>
      
      <!-- Import Preview Modal (hidden by default) -->
      <div id="import-preview-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-hidden">
          <div class="flex justify-between items-center p-6 border-b">
            <h3 class="text-lg font-medium">Import Preview</h3>
            <button id="close-preview-modal" class="text-gray-500 hover:text-gray-700">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
            <div class="space-y-4" id="import-preview-content">
              <!-- Content will be populated dynamically -->
            </div>
          </div>
          
          <div class="p-6 border-t bg-gray-50 flex justify-end space-x-4">
            <button id="cancel-import" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button id="confirm-import" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
              Confirm Import
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Initialize UI
    initializeEventListeners();
    updateDataSummary();
  }
  
  /**
   * Initialize event listeners
   */
  function initializeEventListeners() {
    // Export all checkbox
    const exportAllCheckbox = document.getElementById('export-all');
    const exportOptions = document.getElementById('export-options');
    
    if (exportAllCheckbox && exportOptions) {
      exportAllCheckbox.addEventListener('change', function() {
        const checkboxes = exportOptions.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
          checkbox.checked = this.checked;
          checkbox.disabled = this.checked;
        });
      });
      
      // Initial state
      const checkboxes = exportOptions.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.disabled = exportAllCheckbox.checked;
      });
    }
    
    // Export button
    const exportButton = document.getElementById('export-button');
    if (exportButton) {
      exportButton.addEventListener('click', exportData);
    }
    
    // File upload area
    const uploadArea = managerContainer.querySelector('.upload-area');
    const fileInput = document.getElementById('import-file');
    
    if (uploadArea && fileInput) {
      // Drag and drop
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
      
      // Click to upload
      uploadArea.addEventListener('click', function() {
        fileInput.click();
      });
      
      // File selected
      fileInput.addEventListener('change', function() {
        if (this.files.length) {
          handleFileSelect(this.files[0]);
        }
      });
    }
    
    // Import button
    const importButton = document.getElementById('import-button');
    if (importButton) {
      importButton.addEventListener('click', function() {
        showImportPreview();
      });
    }
    
    // Modal close button
    const closeModalButton = document.getElementById('close-preview-modal');
    if (closeModalButton) {
      closeModalButton.addEventListener('click', function() {
        hideImportPreview();
      });
    }
    
    // Cancel import button
    const cancelImportButton = document.getElementById('cancel-import');
    if (cancelImportButton) {
      cancelImportButton.addEventListener('click', function() {
        hideImportPreview();
      });
    }
    
    // Confirm import button
    const confirmImportButton = document.getElementById('confirm-import');
    if (confirmImportButton) {
      confirmImportButton.addEventListener('click', function() {
        importData();
        hideImportPreview();
      });
    }
  }
  
  /**
   * Update data summary
   */
  function updateDataSummary() {
    const svgItems = AppState.get('svgData.items') || [];
    const categories = AppState.get('svgData.categories') || [];
    
    // Update counts
    document.getElementById('svg-count').textContent = svgItems.length;
    document.getElementById('free-svg-count').textContent = svgItems.filter(item => item.price === 0).length;
    document.getElementById('category-count').textContent = categories.length;
    
    // Count empty categories
    const emptyCategoryCount = categories.filter(category => category.count === 0).length;
    document.getElementById('empty-category-count').textContent = emptyCategoryCount;
    
    // Estimate export size
    const dataString = JSON.stringify({
      items: svgItems,
      categories: categories
    });
    const exportSize = Math.round(dataString.length / 1024);
    document.getElementById('export-size').textContent = `${exportSize} KB`;
    
    // Estimate SVG content size (would require loading all SVGs, simplified for demo)
    document.getElementById('svg-content-size').textContent = 'N/A';
    
    // Last modified
    document.getElementById('last-modified').textContent = new Date().toLocaleString();
  }
  
  /**
   * Handle file selection
   * @param {File} file - Selected file
   */
  function handleFileSelect(file) {
    const filePreview = document.getElementById('file-preview');
    const importButton = document.getElementById('import-button');
    
    // Check file type
    if (!file.name.endsWith('.json')) {
      UIManager.showNotification('Please select a JSON file', 'error');
      filePreview.innerHTML = '';
      importButton.disabled = true;
      importButton.classList.add('cursor-not-allowed', 'bg-gray-300', 'text-gray-700');
      importButton.classList.remove('bg-primary', 'text-white');
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
      document.getElementById('import-file').value = '';
      filePreview.innerHTML = '';
      importButton.disabled = true;
      importButton.classList.add('cursor-not-allowed', 'bg-gray-300', 'text-gray-700');
      importButton.classList.remove('bg-primary', 'text-white');
      importedData = null;
    });
    
    // Show loading
    UIManager.showLoading();
    
    // Read file
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        // Parse JSON
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!validateImportData(data)) {
          throw new Error('Invalid data structure');
        }
        
        // Store imported data
        importedData = data;
        
        // Enable import button
        importButton.disabled = false;
        importButton.classList.remove('cursor-not-allowed', 'bg-gray-300', 'text-gray-700');
        importButton.classList.add('bg-primary', 'text-white');
        
        // Hide loading
        UIManager.hideLoading();
        
        // Show notification
        UIManager.showNotification('File loaded successfully', 'success');
      } catch (error) {
        console.error('Error parsing import file:', error);
        UIManager.showNotification('Invalid JSON file', 'error');
        
        // Clear file input
        document.getElementById('import-file').value = '';
        filePreview.innerHTML = '';
        
        // Disable import button
        importButton.disabled = true;
        importButton.classList.add('cursor-not-allowed', 'bg-gray-300', 'text-gray-700');
        importButton.classList.remove('bg-primary', 'text-white');
        
        // Clear imported data
        importedData = null;
        
        // Hide loading
        UIManager.hideLoading();
      }
    };
    
    reader.readAsText(file);
  }
  
  /**
   * Validate import data structure
   * @param {Object} data - Data to validate
   * @return {boolean} Is valid
   */
  function validateImportData(data) {
    // Check if object
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    
    // Check for required properties
    if (!data.items || !Array.isArray(data.items)) {
      return false;
    }
    
    if (!data.categories || !Array.isArray(data.categories)) {
      return false;
    }
    
    // Basic validation passed
    return true;
  }
  
  /**
   * Show import preview
   */
  function showImportPreview() {
    if (!importedData) {
      UIManager.showNotification('No data to import', 'error');
      return;
    }
    
    const modal = document.getElementById('import-preview-modal');
    const contentContainer = document.getElementById('import-preview-content');
    
    // Create preview content
    const isMerge = document.getElementById('import-merge').checked;
    const currentItems = AppState.get('svgData.items') || [];
    const currentCategories = AppState.get('svgData.categories') || [];
    
    // Calculate changes
    const newItems = importedData.items.filter(item => !currentItems.some(i => i.id === item.id));
    const updatedItems = importedData.items.filter(item => currentItems.some(i => i.id === item.id));
    const newCategories = importedData.categories.filter(cat => !currentCategories.some(c => c.id === cat.id));
    
    contentContainer.innerHTML = `
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 class="font-medium text-blue-800 mb-2">Import Summary</h4>
        <p class="text-blue-600 text-sm">
          You are about to ${isMerge ? 'merge' : 'replace'} your current data with the imported data.
          ${isMerge ? 'This will keep your existing data and add new items.' : 'This will replace all existing data.'}
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-dark mb-3">Current Data</h4>
          <div class="space-y-2">
            <div class="flex justify-between py-1 border-b">
              <span class="text-sm text-gray-600">SVG Items</span>
              <span class="font-medium">${currentItems.length}</span>
            </div>
            <div class="flex justify-between py-1 border-b">
              <span class="text-sm text-gray-600">Categories</span>
              <span class="font-medium">${currentCategories.length}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="font-medium text-dark mb-3">Imported Data</h4>
          <div class="space-y-2">
            <div class="flex justify-between py-1 border-b">
              <span class="text-sm text-gray-600">SVG Items</span>
              <span class="font-medium">${importedData.items.length}</span>
            </div>
            <div class="flex justify-between py-1 border-b">
              <span class="text-sm text-gray-600">Categories</span>
              <span class="font-medium">${importedData.categories.length}</span>
            </div>
          </div>
        </div>
      </div>
      
      <h4 class="font-medium text-dark mt-6 mb-3">Changes</h4>
      <div class="space-y-3">
        <div class="bg-green-50 p-3 rounded-lg border border-green-200">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="text-green-800 font-medium">New Items: ${newItems.length}</span>
          </div>
        </div>
        
        ${isMerge ? `
        <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="text-yellow-800 font-medium">Updated Items: ${updatedItems.length}</span>
          </div>
        </div>
        ` : ''}
        
        <div class="bg-green-50 p-3 rounded-lg border border-green-200">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="text-green-800 font-medium">New Categories: ${newCategories.length}</span>
          </div>
        </div>
        
        ${!isMerge ? `
        <div class="bg-red-50 p-3 rounded-lg border border-red-200">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span class="text-red-800 font-medium">Existing data will be removed: ${currentItems.length} items, ${currentCategories.length} categories</span>
          </div>
        </div>
        ` : ''}
      </div>
    `;
    
    // Show modal
    modal.classList.remove('hidden');
  }
  
  /**
   * Hide import preview
   */
  function hideImportPreview() {
    const modal = document.getElementById('import-preview-modal');
    modal.classList.add('hidden');
  }
  
  /**
   * Export data
   */
  function exportData() {
    // Get export options
    const exportAll = document.getElementById('export-all').checked;
    const exportSvgs = exportAll || document.getElementById('export-svgs').checked;
    const exportCategories = exportAll || document.getElementById('export-categories').checked;
    const exportSettings = exportAll || document.getElementById('export-settings').checked;
    const includeSvgContent = document.getElementById('export-include-svg-content').checked;
    
    // Create export data
    const exportData = {};
    
    // Add items
    if (exportSvgs) {
      exportData.items = AppState.get('svgData.items') || [];
    }
    
    // Add categories
    if (exportCategories) {
      exportData.categories = AppState.get('svgData.categories') || [];
    }
    
    // Add settings
    if (exportSettings) {
      exportData.settings = {
        appVersion: '1.0.0',
        exportDate: new Date().toISOString(),
        exportOptions: {
          includedSvgs: exportSvgs,
          includedCategories: exportCategories,
          includedSettings: exportSettings,
          includedSvgContent: includeSvgContent
        }
      };
    }
    
    // Show loading if including SVG content
    if (includeSvgContent) {
      UIManager.showLoading();
    }
    
    // If including SVG content, load all SVGs
    const loadSvgContent = async () => {
      if (includeSvgContent && exportData.items) {
        const items = exportData.items;
        const itemsWithContent = [];
        
        for (const item of items) {
          try {
            const svgContent = await DataLoader.loadSvgContent(item.filePath);
            itemsWithContent.push({
              ...item,
              svgContent
            });
          } catch (error) {
            console.error(`Error loading SVG content for ${item.id}:`, error);
            itemsWithContent.push(item); // Include item without content
          }
        }
        
        exportData.items = itemsWithContent;
      }
      
      // Create and download the file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `svg-marketplace-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        UIManager.hideLoading();
      }, 100);
    };
    
    // Execute export
    loadSvgContent()
      .then(() => {
        UIManager.showNotification('Data exported successfully', 'success');
      })
      .catch(error => {
        console.error('Error exporting data:', error);
        UIManager.showNotification('Error exporting data', 'error');
        UIManager.hideLoading();
      });
  }
  
  /**
   * Import data
   */
  function importData() {
    if (!importedData) {
      UIManager.showNotification('No data to import', 'error');
      return;
    }
    
    // Get import options
    const isMerge = document.getElementById('import-merge').checked;
    
    // Show loading
    UIManager.showLoading();
    
    try {
      // Process import
      if (isMerge) {
        // Merge with existing data
        mergeData(importedData);
      } else {
        // Replace existing data
        replaceData(importedData);
      }
      
      // Update data summary
      updateDataSummary();
      
      // Reset file input
      document.getElementById('import-file').value = '';
      document.getElementById('file-preview').innerHTML = '';
      
      // Disable import button
      const importButton = document.getElementById('import-button');
      importButton.disabled = true;
      importButton.classList.add('cursor-not-allowed', 'bg-gray-300', 'text-gray-700');
      importButton.classList.remove('bg-primary', 'text-white');
      
      // Clear imported data
      importedData = null;
      
      // Hide loading
      UIManager.hideLoading();
      
      // Show success notification
      UIManager.showNotification('Data imported successfully', 'success');
      
      // Update admin dashboard
      if (window.Admin && typeof window.Admin.updateStats === 'function') {
        window.Admin.updateStats();
      }
    } catch (error) {
      console.error('Error importing data:', error);
      UIManager.showNotification('Error importing data', 'error');
      UIManager.hideLoading();
    }
  }
  
  /**
   * Merge imported data with existing data
   * @param {Object} data - Imported data
   */
  function mergeData(data) {
    // Get current data
    const currentItems = [...(AppState.get('svgData.items') || [])];
    const currentCategories = [...(AppState.get('svgData.categories') || [])];
    
    // Process items
    if (data.items && Array.isArray(data.items)) {
      // Create ID map for faster lookup
      const itemIdMap = new Map();
      currentItems.forEach((item, index) => {
        itemIdMap.set(item.id, index);
      });
      
      // Process each imported item
      data.items.forEach(importedItem => {
        const existingIndex = itemIdMap.get(importedItem.id);
        
        if (existingIndex !== undefined) {
          // Update existing item
          currentItems[existingIndex] = {
            ...currentItems[existingIndex],
            ...importedItem,
            // If item has SVG content, store it in cache
            ...(importedItem.svgContent ? {} : {})
          };
          
          // If item has SVG content, store it in cache
          if (importedItem.svgContent) {
            const svgCache = AppState.get('svgCache') || {};
            svgCache[importedItem.filePath] = importedItem.svgContent;
            AppState.set('svgCache', svgCache);
            
            // Remove content from item to avoid bloating state
            delete currentItems[existingIndex].svgContent;
          }
        } else {
          // Add new item
          const newItem = { ...importedItem };
          
          // If item has SVG content, store it in cache and remove from item
          if (newItem.svgContent) {
            const svgCache = AppState.get('svgCache') || {};
            svgCache[newItem.filePath] = newItem.svgContent;
            AppState.set('svgCache', svgCache);
            
            delete newItem.svgContent;
          }
          
          currentItems.push(newItem);
        }
      });
      
      // Update state
      AppState.set('svgData.items', currentItems);
    }
    
    // Process categories
    if (data.categories && Array.isArray(data.categories)) {
      // Create ID map for faster lookup
      const categoryIdMap = new Map();
      currentCategories.forEach((category, index) => {
        categoryIdMap.set(category.id, index);
      });
      
      // Process each imported category
      data.categories.forEach(importedCategory => {
        const existingIndex = categoryIdMap.get(importedCategory.id);
        
        if (existingIndex !== undefined) {
          // Update existing category
          currentCategories[existingIndex] = {
            ...currentCategories[existingIndex],
            ...importedCategory
          };
        } else {
          // Add new category
          currentCategories.push(importedCategory);
        }
      });
      
      // Update state
      AppState.set('svgData.categories', currentCategories);
    }
    
    // Process settings if needed
    if (data.settings) {
      // Implement settings import if needed
    }
    
    // Update category counts
    updateCategoryCounts();
  }
  
  /**
   * Replace existing data with imported data
   * @param {Object} data - Imported data
   */
  function replaceData(data) {
    // Process items
    if (data.items && Array.isArray(data.items)) {
      const items = data.items.map(item => {
        const newItem = { ...item };
        
        // If item has SVG content, store it in cache and remove from item
        if (newItem.svgContent) {
          const svgCache = AppState.get('svgCache') || {};
          svgCache[newItem.filePath] = newItem.svgContent;
          AppState.set('svgCache', svgCache);
          
          delete newItem.svgContent;
        }
        
        return newItem;
      });
      
      // Update state
      AppState.set('svgData.items', items);
    }
    
    // Process categories
    if (data.categories && Array.isArray(data.categories)) {
      AppState.set('svgData.categories', data.categories);
    }
    
    // Process settings if needed
    if (data.settings) {
      // Implement settings import if needed
    }
    
    // Update category counts
    updateCategoryCounts();
  }
  
  /**
   * Update category counts
   */
  function updateCategoryCounts() {
    const items = AppState.get('svgData.items') || [];
    const categories = AppState.get('svgData.categories') || [];
    
    // Count items per category
    const counts = {};
    items.forEach(item => {
      if (!item.category) return;
      
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    
    // Update category objects
    const updatedCategories = categories.map(category => ({
      ...category,
      count: counts[category.id] || 0
    }));
    
    // Update state
    AppState.set('svgData.categories', updatedCategories);
  }
  
  // Public API
  return {
    init
  };
})();

// Make DataManager available globally
window.DataManager = DataManager;