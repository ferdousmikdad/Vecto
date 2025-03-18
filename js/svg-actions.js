/**
 * svg-actions.js
 * Handles SVG-specific actions like copying and downloading
 */

const SvgActions = (function() {
  /**
   * Copy SVG code to clipboard
   * @param {string} svgId - ID of the SVG to copy
   * @return {Promise<boolean>} Success status
   */
  async function copySvgToClipboard(svgId) {
    try {
      const item = DataLoader.getSvgById(svgId);
      if (!item) {
        UIManager.showNotification('SVG not found', 'error');
        return false;
      }
      
      // Load SVG content
      const svgContent = await DataLoader.loadSvgContent(item.filePath);
      
      // Use the Clipboard API to copy content
      await navigator.clipboard.writeText(svgContent);
      
      UIManager.showNotification('SVG code copied to clipboard!', 'success');
      return true;
    } catch (error) {
      console.error('Error copying SVG to clipboard:', error);
      UIManager.showNotification('Failed to copy SVG code', 'error');
      return false;
    }
  }
  
  /**
   * Download SVG file
   * @param {string} svgId - ID of the SVG to download
   * @return {Promise<boolean>} Success status
   */
  async function downloadSvg(svgId) {
    try {
      const item = DataLoader.getSvgById(svgId);
      if (!item) {
        UIManager.showNotification('SVG not found', 'error');
        return false;
      }
      
      // Load SVG content
      const svgContent = await DataLoader.loadSvgContent(item.filePath);
      
      // Create a Blob with the SVG code
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      UIManager.showNotification('SVG downloaded successfully!', 'success');
      return true;
    } catch (error) {
      console.error('Error downloading SVG:', error);
      UIManager.showNotification('Failed to download SVG', 'error');
      return false;
    }
  }
  
  /**
   * Create and download a bundle of multiple SVGs
   * @param {Array<string>} svgIds - Array of SVG IDs to include in bundle
   * @return {Promise<boolean>} Success status
   */
  async function downloadBundle(svgIds) {
    // Check if JSZip is available
    if (typeof JSZip !== 'function') {
      console.error('JSZip library not available. Make sure to include it.');
      UIManager.showNotification('Bundle download requires JSZip library', 'error');
      return false;
    }
    
    try {
      if (!svgIds || svgIds.length === 0) {
        UIManager.showNotification('No SVGs selected for bundle', 'error');
        return false;
      }
      
      // Show loading state
      UIManager.showLoading();
      
      // Create a new ZIP file
      const zip = new JSZip();
      
      // Process each SVG
      const items = AppState.get('svgData.items');
      const promises = [];
      
      for (const svgId of svgIds) {
        const item = items.find(i => i.id === svgId);
        if (!item) continue;
        
        const promise = DataLoader.loadSvgContent(item.filePath)
          .then(content => {
            // Add SVG to zip
            const fileName = item.filePath.split('/').pop();
            zip.file(fileName, content);
            
            // Also add metadata JSON
            const metadataJSON = JSON.stringify(item, null, 2);
            zip.file(`${fileName}.json`, metadataJSON);
          });
        
        promises.push(promise);
      }
      
      // Wait for all SVGs to be processed
      await Promise.all(promises);
      
      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `svg-bundle-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      UIManager.hideLoading();
      UIManager.showNotification(`Bundle with ${svgIds.length} SVGs downloaded successfully!`, 'success');
      return true;
    } catch (error) {
      console.error('Error creating SVG bundle:', error);
      UIManager.hideLoading();
      UIManager.showNotification('Failed to create SVG bundle', 'error');
      return false;
    }
  }
  
  /**
   * Copy metadata JSON for an SVG
   * @param {string} svgId - ID of the SVG
   * @return {Promise<boolean>} Success status
   */
  async function copyMetadataToClipboard(svgId) {
    try {
      const item = DataLoader.getSvgById(svgId);
      if (!item) {
        UIManager.showNotification('SVG not found', 'error');
        return false;
      }
      
      // Create a formatted JSON string
      const jsonString = JSON.stringify(item, null, 2);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(jsonString);
      
      UIManager.showNotification('SVG metadata copied to clipboard!', 'success');
      return true;
    } catch (error) {
      console.error('Error copying metadata:', error);
      UIManager.showNotification('Failed to copy metadata', 'error');
      return false;
    }
  }
  
  /**
   * Open a popup to view SVG details
   * @param {string} svgId - ID of the SVG to view
   */
  function openSvgPopup(svgId) {
    // Get SVG item data
    const item = DataLoader.getSvgById(svgId);
    if (!item) {
      UIManager.showNotification('SVG not found', 'error');
      return;
    }
    
    // Show loading state
    UIManager.showLoading();
    
    // Load SVG content
    DataLoader.loadSvgContent(item.filePath)
      .then(svgContent => {
        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        backdrop.id = 'svg-popup-backdrop';
        
        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col';
        
        // Create modal header
        const header = document.createElement('div');
        header.className = 'p-6 border-b flex justify-between items-center';
        header.innerHTML = `
          <h2 class="text-2xl font-medium text-dark">${item.name}</h2>
          <button class="close-modal text-gray-500 hover:text-gray-700">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        `;
        
        // Create modal body
        const body = document.createElement('div');
        body.className = 'p-6 overflow-y-auto flex-1';
        
        // Create content tabs
        const tabs = document.createElement('div');
        tabs.className = 'border-b mb-6';
        tabs.innerHTML = `
          <div class="flex space-x-6">
            <button class="popup-tab active py-3 px-1 border-b-2 border-primary font-medium" data-tab="preview">Preview</button>
            <button class="popup-tab py-3 px-1 border-b-2 border-transparent text-gray-500 font-medium" data-tab="code">SVG Code</button>
            <button class="popup-tab py-3 px-1 border-b-2 border-transparent text-gray-500 font-medium" data-tab="details">Details</button>
          </div>
        `;
        
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        
        // Preview tab (default)
        const previewTab = document.createElement('div');
        previewTab.className = 'tab-pane active' 
        previewTab.dataset.tab = 'preview';
        previewTab.innerHTML = `
          <div class="flex justify-center items-center bg-gray-100 p-8 rounded-lg" style="min-height: 300px;">
            ${svgContent}
          </div>
        `;
        
        // Make sure SVG renders at appropriate size
        const svgElement = previewTab.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.maxHeight = '50vh';
          svgElement.classList.add(`text-${item.previewColor || 'primary'}`);
        }
        
        // Code tab
        const codeTab = document.createElement('div');
        codeTab.className = 'tab-pane hidden';
        codeTab.dataset.tab = 'code';
        codeTab.innerHTML = `
          <div class="relative">
            <pre class="bg-gray-800 text-white p-4 rounded-lg text-sm overflow-auto max-h-[50vh]"><code>${svgContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
            <button class="copy-code absolute top-4 right-4 bg-white text-gray-800 p-2 rounded hover:bg-gray-200">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        `;
        
        // Details tab
        const detailsTab = document.createElement('div');
        detailsTab.className = 'tab-pane hidden';
        detailsTab.dataset.tab = 'details';
        
        // Format tags
        const formattedTags = item.tags ? item.tags.map(tag => 
          `<span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">${tag}</span>`
        ).join('') : '';
        
        detailsTab.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium mb-4">Information</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-gray-500">Name</p>
                  <p class="font-medium">${item.name}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Description</p>
                  <p>${item.description}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Category</p>
                  <p class="font-medium">${item.category}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">File Path</p>
                  <p class="font-medium text-sm font-mono">${item.filePath}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-medium mb-4">Tags</h3>
              <div class="flex flex-wrap">
                ${formattedTags || '<p class="text-gray-500">No tags available</p>'}
              </div>
            </div>
          </div>
        `;
        
        // Add tabs to content
        tabContent.appendChild(previewTab);
        tabContent.appendChild(codeTab);
        tabContent.appendChild(detailsTab);
        
        // Create modal footer
        const footer = document.createElement('div');
        footer.className = 'p-6 border-t bg-gray-50 flex justify-end space-x-4';
        footer.innerHTML = `
          <button class="download-btn px-4 py-2 bg-light text-dark rounded-lg hover:bg-gray-300 transition-colors">
            <svg class="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          <button class="copy-btn px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
            <svg class="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy SVG
          </button>
        `;
        
        // Assemble modal
        body.appendChild(tabs);
        body.appendChild(tabContent);
        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(footer);
        backdrop.appendChild(modal);
        
        // Add to DOM
        document.body.appendChild(backdrop);
        
        // Set up event listeners
        // Close modal
        const closeButton = backdrop.querySelector('.close-modal');
        closeButton.addEventListener('click', () => {
          backdrop.classList.add('fade-out');
          setTimeout(() => {
            document.body.removeChild(backdrop);
          }, 200);
        });
        
        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            backdrop.classList.add('fade-out');
            setTimeout(() => {
              document.body.removeChild(backdrop);
            }, 200);
          }
        });
        
        // Tab switching
        const tabButtons = backdrop.querySelectorAll('.popup-tab');
        tabButtons.forEach(button => {
          button.addEventListener('click', () => {
            // Update active tab button
            tabButtons.forEach(btn => {
              btn.classList.remove('active', 'border-primary');
              btn.classList.add('text-gray-500', 'border-transparent');
            });
            button.classList.add('active', 'border-primary');
            button.classList.remove('text-gray-500', 'border-transparent');
            
            // Show active tab content
            const tabName = button.dataset.tab;
            const tabPanes = backdrop.querySelectorAll('.tab-pane');
            tabPanes.forEach(pane => {
              if (pane.dataset.tab === tabName) {
                pane.classList.remove('hidden');
              } else {
                pane.classList.add('hidden');
              }
            });
          });
        });
        
        // Copy code button
        const copyCodeButton = backdrop.querySelector('.copy-code');
        if (copyCodeButton) {
          copyCodeButton.addEventListener('click', () => {
            Utils.copyToClipboard(svgContent)
              .then(() => UIManager.showNotification('SVG code copied to clipboard', 'success'))
              .catch(() => UIManager.showNotification('Failed to copy SVG code', 'error'));
          });
        }
        
        // Copy button in footer
        const copyButton = backdrop.querySelector('.copy-btn');
        copyButton.addEventListener('click', () => {
          Utils.copyToClipboard(svgContent)
            .then(() => UIManager.showNotification('SVG code copied to clipboard', 'success'))
            .catch(() => UIManager.showNotification('Failed to copy SVG code', 'error'));
        });
        
        // Download button
        const downloadButton = backdrop.querySelector('.download-btn');
        downloadButton.addEventListener('click', () => {
          SvgActions.downloadSvg(svgId);
        });
        
        // Add animation
        backdrop.classList.add('fade-in');
        modal.classList.add('slide-up');
        
        // Hide loading
        UIManager.hideLoading();
      })
      .catch(error => {
        console.error('Error loading SVG content:', error);
        UIManager.showNotification('Failed to load SVG details', 'error');
        UIManager.hideLoading();
      });
  }
  
  // Add CSS for the animations
  function addPopupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .fade-in {
        animation: fadeIn 0.2s ease-out forwards;
      }
      
      .fade-out {
        animation: fadeOut 0.2s ease-out forwards;
      }
      
      .slide-up {
        animation: slideUp 0.3s ease-out forwards;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      /* Tab styling */
      .popup-tab.active {
        color: var(--tw-color-primary, #4F46E5);
        border-color: var(--tw-color-primary, #4F46E5);
      }
      
      /* Make sure SVG in preview is responsive */
      .tab-pane[data-tab="preview"] svg {
        max-width: 100%;
        height: auto;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Initialize popup styles
  document.addEventListener('DOMContentLoaded', () => {
    addPopupStyles();
  });
  
  // Public API
  return {
    copySvgToClipboard,
    downloadSvg,
    downloadBundle,
    copyMetadataToClipboard,
    openSvgPopup
  };
})();

// Make SvgActions available globally
window.SvgActions = SvgActions;