/**
 * admin.js
 * Main administrative panel functionality
 */

const Admin = (function() {
    // DOM references
    let adminPanel;
    let adminToggle;
    
    /**
     * Initialize the admin panel
     */
    function init() {
      console.log('Initializing admin panel...');
      
      // Create admin panel if it doesn't exist
      if (!adminPanel) {
        createAdminPanel();
      }
      
      // Set up toggle button event
      adminToggle = document.getElementById('admin-panel-toggle');
      if (adminToggle) {
        adminToggle.addEventListener('click', toggleAdminPanel);
      }
      
      // Initialize admin modules
      initModules();
      
      console.log('Admin panel initialized');
    }
    
    /**
     * Create the admin panel UI
     */
    function createAdminPanel() {
      // Create panel container
      adminPanel = document.createElement('div');
      adminPanel.id = 'admin-panel';
      adminPanel.className = 'fixed inset-0 bg-white z-50 transform translate-x-full transition-transform duration-300 ease-in-out flex';
      
      // Create panel content
      adminPanel.innerHTML = `
        <div class="w-64 bg-dark text-white h-full flex flex-col">
          <div class="p-4 border-b border-gray-700">
            <h2 class="text-xl font-bold">SVG Marketplace Admin</h2>
          </div>
          <nav class="admin-nav flex-1 overflow-y-auto py-4">
            <a href="#" class="admin-nav-item active" data-section="dashboard">
              <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>
            <a href="#" class="admin-nav-item" data-section="svg-manager">
              <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              SVG Manager
            </a>
            <a href="#" class="admin-nav-item" data-section="svg-uploader">
              <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              Upload SVG
            </a>
            <a href="#" class="admin-nav-item" data-section="svg-editor">
              <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              SVG Editor
            </a>
            <a href="#" class="admin-nav-item" data-section="data-manager">
              <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              Data Manager
            </a>
          </nav>
          <div class="p-4 border-t border-gray-700">
            <button id="admin-logout" class="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
              Exit Admin
            </button>
          </div>
        </div>
        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="admin-header bg-white border-b p-4 flex justify-between items-center">
            <h3 class="text-lg font-medium admin-section-title">Dashboard</h3>
            <button id="admin-close" class="text-gray-500 hover:text-gray-700">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="admin-content flex-1 overflow-auto p-6">
            <div class="admin-section active" id="admin-dashboard">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <div class="flex items-center">
                    <div class="p-3 rounded-full bg-primary bg-opacity-20 mr-4">
                      <svg class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-gray-500 text-sm">Total SVGs</p>
                      <h4 class="text-2xl font-bold text-dark svg-count">0</h4>
                    </div>
                  </div>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <div class="flex items-center">
                    <div class="p-3 rounded-full bg-secondary bg-opacity-20 mr-4">
                      <svg class="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-gray-500 text-sm">Categories</p>
                      <h4 class="text-2xl font-bold text-dark category-count">0</h4>
                    </div>
                  </div>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <div class="flex items-center">
                    <div class="p-3 rounded-full bg-success bg-opacity-20 mr-4">
                      <svg class="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-gray-500 text-sm">Free SVGs</p>
                      <h4 class="text-2xl font-bold text-dark free-count">0</h4>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-lg font-medium mb-4">Recent Activity</h3>
                <div class="recent-activity">
                  <p class="text-gray-500 text-center py-4">No recent activity</p>
                </div>
              </div>
              
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-medium mb-4">Quick Actions</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button class="quick-action bg-white border border-gray-300 rounded p-4 text-left hover:bg-gray-50 transition-colors" data-section="svg-uploader">
                    <div class="flex items-center">
                      <svg class="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      Upload New SVG
                    </div>
                  </button>
                  <button class="quick-action bg-white border border-gray-300 rounded p-4 text-left hover:bg-gray-50 transition-colors" data-section="svg-editor">
                    <div class="flex items-center">
                      <svg class="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit SVG
                    </div>
                  </button>
                  <button class="quick-action bg-white border border-gray-300 rounded p-4 text-left hover:bg-gray-50 transition-colors" data-section="data-manager">
                    <div class="flex items-center">
                      <svg class="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Export Data
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- SVG Manager Section -->
            <div class="admin-section" id="admin-svg-manager">
              <!-- Content will be loaded by svg-manager.js -->
              <div class="loading-placeholder flex justify-center items-center h-64">
                <div class="loading-spinner"></div>
              </div>
            </div>
            
            <!-- SVG Uploader Section -->
            <div class="admin-section" id="admin-svg-uploader">
              <!-- Content will be loaded by svg-uploader.js -->
              <div class="loading-placeholder flex justify-center items-center h-64">
                <div class="loading-spinner"></div>
              </div>
            </div>
            
            <!-- SVG Editor Section -->
            <div class="admin-section" id="admin-svg-editor">
              <!-- Content will be loaded by svg-editor.js -->
              <div class="loading-placeholder flex justify-center items-center h-64">
                <div class="loading-spinner"></div>
              </div>
            </div>
            
            <!-- Data Manager Section -->
            <div class="admin-section" id="admin-data-manager">
              <!-- Content will be loaded by data-manager.js -->
              <div class="loading-placeholder flex justify-center items-center h-64">
                <div class="loading-spinner"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add to DOM
      document.body.appendChild(adminPanel);
      
      // Set up event listeners
      setupAdminPanelEvents();
      
      // Update dashboard stats
      updateDashboardStats();
    }
    
    /**
     * Set up event listeners for admin panel
     */
    function setupAdminPanelEvents() {
      // Close button
      const closeBtn = adminPanel.querySelector('#admin-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeAdminPanel);
      }
      
      // Logout button
      const logoutBtn = adminPanel.querySelector('#admin-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          try {
            localStorage.setItem('svg_marketplace_admin', 'disabled');
          } catch (e) {
            console.error('Failed to save admin preference:', e);
          }
          
          closeAdminPanel();
          
          // Remove admin button after a delay
          setTimeout(() => {
            const adminButton = document.getElementById('admin-panel-toggle');
            if (adminButton) {
              adminButton.remove();
            }
          }, 300);
        });
      }
      
      // Navigation items
      const navItems = adminPanel.querySelectorAll('.admin-nav-item');
      navItems.forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Get section to show
          const sectionId = this.dataset.section;
          
          // Update active navigation item
          navItems.forEach(navItem => {
            navItem.classList.remove('active');
          });
          this.classList.add('active');
          
          // Update section title
          const sectionTitle = adminPanel.querySelector('.admin-section-title');
          if (sectionTitle) {
            sectionTitle.textContent = this.textContent.trim();
          }
          
          // Show selected section
          showAdminSection(sectionId);
        });
      });
      
      // Quick action buttons
      const quickActions = adminPanel.querySelectorAll('.quick-action');
      quickActions.forEach(btn => {
        btn.addEventListener('click', function() {
          const sectionId = this.dataset.section;
          
          // Find and click the corresponding nav item
          const navItem = adminPanel.querySelector(`.admin-nav-item[data-section="${sectionId}"]`);
          if (navItem) {
            navItem.click();
          }
        });
      });
    }
    
    /**
     * Show a specific admin section
     * @param {string} sectionId - ID of section to show
     */
    function showAdminSection(sectionId) {
      // Hide all sections
      const sections = adminPanel.querySelectorAll('.admin-section');
      sections.forEach(section => {
        section.classList.remove('active');
      });
      
      // Show selected section
      const selectedSection = adminPanel.querySelector(`#admin-${sectionId}`);
      if (selectedSection) {
        selectedSection.classList.add('active');
      }
    }
    
    /**
     * Toggle admin panel visibility
     */
    function toggleAdminPanel() {
      // Check if panel is open
      const isOpen = !adminPanel.classList.contains('translate-x-full');
      
      if (isOpen) {
        closeAdminPanel();
      } else {
        openAdminPanel();
      }
    }
    
    /**
     * Open admin panel
     */
    function openAdminPanel() {
      adminPanel.classList.remove('translate-x-full');
      
      // Update dashboard stats
      updateDashboardStats();
    }
    
    /**
     * Close admin panel
     */
    function closeAdminPanel() {
      adminPanel.classList.add('translate-x-full');
    }
    
    /**
     * Initialize admin modules
     */
    function initModules() {
      // These will be loaded by their respective JS files
      if (window.SVGManager && typeof window.SVGManager.init === 'function') {
        window.SVGManager.init();
      }
      
      if (window.SVGUploader && typeof window.SVGUploader.init === 'function') {
        window.SVGUploader.init();
      }
      
      if (window.SVGEditor && typeof window.SVGEditor.init === 'function') {
        window.SVGEditor.init();
      }
      
      if (window.DataManager && typeof window.DataManager.init === 'function') {
        window.DataManager.init();
      }
    }
    
    /**
     * Update dashboard statistics
     */
    function updateDashboardStats() {
      // Get stats from state
      const svgItems = AppState.get('svgData.items') || [];
      const categories = AppState.get('svgData.categories') || [];
      
      // Update stats in UI
      const svgCount = adminPanel.querySelector('.svg-count');
      if (svgCount) {
        svgCount.textContent = svgItems.length;
      }
      
      const categoryCount = adminPanel.querySelector('.category-count');
      if (categoryCount) {
        categoryCount.textContent = categories.length;
      }
      
      const freeCount = adminPanel.querySelector('.free-count');
      if (freeCount) {
        const freeSVGs = svgItems.filter(item => item.price === 0).length;
        freeCount.textContent = freeSVGs;
      }
    }
    
    // Initialize when all modules are loaded
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(init, 500); // Wait for other modules to load
    });
    
    // Public API
    return {
      init,
      openPanel: openAdminPanel,
      closePanel: closeAdminPanel,
      togglePanel: toggleAdminPanel,
      showSection: showAdminSection,
      updateStats: updateDashboardStats
    };
  })();
  
  // Make Admin available globally
  window.Admin = Admin;