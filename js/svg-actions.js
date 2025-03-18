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
    
    // Public API
    return {
      copySvgToClipboard,
      downloadSvg,
      downloadBundle,
      copyMetadataToClipboard
    };
  })();
  
  // Make SvgActions available globally
  window.SvgActions = SvgActions;