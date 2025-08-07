/**
 * mobile-maximize.js
 * A simple script to maximize specific windows (news, EDM, Antena 3 radio, email)
 * when the website is viewed on a mobile device
 */

(function() {
  'use strict';

  // Target window classes to maximize on mobile
  const targetWindows = [
    'rss-window',      // News window
    'rss-feed-window', // News feed window
    'edm-player-window', // EDM window
    'radio-player-window', // Antena 3 radio window
    'email-form-window'  // Email window
  ];

  /**
   * Detects if the current device is a mobile device using multiple techniques
   * @returns {boolean} True if the current device is a mobile device
   */
  function isMobileDevice() {
    // Combine multiple detection methods for reliability
    
    // 1. Check for touch capability
    const hasTouchCapability = (
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      navigator.msMaxTouchPoints > 0
    );
    
    // 2. Check screen width - common mobile breakpoint
    const isSmallScreen = window.innerWidth <= 768;
    
    // 3. Check for mobile user agent (less reliable but still useful)
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 
      'iemobile', 'opera mini', 'mobile', 'mobi'
    ];
    const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
    
    // 4. Check orientation API availability (typically available on mobile)
    const hasOrientationAPI = typeof window.orientation !== 'undefined' || 
                              typeof window.screen.orientation !== 'undefined';

    // Determine mobile status based on criteria
    // Count how many "mobile indicators" we detect
    let mobileFactors = 0;
    if (hasTouchCapability) mobileFactors++;
    if (isSmallScreen) mobileFactors++;
    if (isMobileUserAgent) mobileFactors++;
    if (hasOrientationAPI) mobileFactors++;
    
    // Return true if at least 2 factors indicate mobile
    return mobileFactors >= 2;
  }

  /**
   * Maximizes a window element
   * @param {HTMLElement} windowElement - The window to maximize
   */
  function maximizeWindow(windowElement) {
    if (!windowElement || !windowElement.classList) return;
    
    // Store original dimensions and position if not already stored
    if (!windowElement._originalState) {
      windowElement._originalState = {
        width: windowElement.style.width,
        height: windowElement.style.height,
        left: windowElement.style.left,
        top: windowElement.style.top,
        transform: windowElement.style.transform
      };
    }
    
    // Apply maximized class
    windowElement.classList.add('maximized');
    
    // Set dimensions for mobile view
    windowElement.style.width = '100%';
    windowElement.style.height = '85%';
    windowElement.style.top = '7.5%';
    windowElement.style.left = '0';
    windowElement.style.transform = 'none';
    
    // Remove resize handles if present
    const resizeHandles = windowElement.querySelectorAll('.resize-handle');
    resizeHandles.forEach(handle => {
      if (handle.parentNode) {
        handle.parentNode.removeChild(handle);
      }
    });
    
    // Adjust container sizes if the function exists
    if (typeof window.adjustContainerSizes === 'function') {
      window.adjustContainerSizes(windowElement);
    }
  }

  /**
   * Checks if a window should be maximized based on its class
   * @param {HTMLElement} windowElement - The window to check
   * @returns {boolean} True if the window should be maximized
   */
  function shouldMaximizeWindow(windowElement) {
    if (!windowElement || !windowElement.classList) return false;
    
    // Check if window has one of our target classes
    return targetWindows.some(className => windowElement.classList.contains(className));
  }

  /**
   * Observes the DOM for new windows and maximizes them if needed
   */
  function setupWindowObserver() {
    // Only set up if we're on mobile
    if (!isMobileDevice()) return;
    
    // Create a mutation observer to watch for new windows
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            // If it's an element node
            if (node.nodeType === Node.ELEMENT_NODE) {
              // If it's a dialog overlay with a window
              if (node.classList && node.classList.contains('dialog-overlay')) {
                const newWindow = node.querySelector('.window');
                if (newWindow && shouldMaximizeWindow(newWindow)) {
                  // Wait a small delay to allow initializations to complete
                  setTimeout(() => maximizeWindow(newWindow), 50);
                }
              }
              // If it's a window directly
              else if (node.classList && node.classList.contains('window') && shouldMaximizeWindow(node)) {
                // Wait a small delay to allow initializations to complete
                setTimeout(() => maximizeWindow(node), 50);
              }
            }
          });
        }
      });
    });
    
    // Start observing the document body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Enhance the maximize button behavior to keep windows maximized on mobile
   */
  function enhanceMaximizeButtons() {
    // Only enhance if we're on mobile
    if (!isMobileDevice()) return;
    
    // Store the original setupWindowControls function
    const originalSetupWindowControls = window.setupWindowControls;
    
    if (typeof originalSetupWindowControls === 'function') {
      // Override the setupWindowControls function
      window.setupWindowControls = function(windowElement, titleBar) {
        // Call the original function first
        originalSetupWindowControls(windowElement, titleBar);
        
        // Only enhance if this is one of our target windows
        if (shouldMaximizeWindow(windowElement)) {
          // Find the maximize button
          const maximizeBtn = titleBar.querySelector('button[aria-label="Maximize"]');
          
          if (maximizeBtn) {
            // Automatically maximize the window
            setTimeout(() => maximizeWindow(windowElement), 100);
            
            // Override the maximize button's click event
            const newMaximizeBtn = maximizeBtn.cloneNode(true);
            maximizeBtn.parentNode.replaceChild(newMaximizeBtn, maximizeBtn);
            
            newMaximizeBtn.addEventListener('click', function(e) {
              // If already maximized on mobile, prevent un-maximizing
              if (windowElement.classList.contains('maximized')) {
                e.stopPropagation();
                return;
              }
              
              // If not maximized, maximize it
              maximizeWindow(windowElement);
            });
          }
        }
      };
    }
  }

  /**
   * Initialize mobile detection and setup
   */
  function init() {
    // Check if we're on a mobile device
    const isMobile = isMobileDevice();
    console.log('Mobile device detected:', isMobile);
    
    if (isMobile) {
      // Set a flag in session storage
      window.sessionStorage.setItem('isMobileMode', 'true');
      
      // Add a class to the body for potential CSS targeting
      document.body.classList.add('mobile-device');
      
      // Set up the window observer to catch new windows
      setupWindowObserver();
      
      // Enhance maximize buttons
      enhanceMaximizeButtons();
      
      // Add mobile-specific CSS
      const style = document.createElement('style');
      style.textContent = `
        /* Mobile-specific styles for windows */
        @media (max-width: 768px) {
          .window.maximized {
            width: 100% !important;
            height: 85% !important;
            top: 7.5% !important;
            left: 0 !important;
            transform: none !important;
            border-radius: 0 !important;
          }
          
          .window.maximized .window-body {
            height: calc(100% - 30px) !important;
            overflow-y: auto !important;
          }
          
          /* Improved button sizes for touch */
          button {
            min-height: 30px;
            min-width: 70px;
            margin: 5px;
          }
          
          /* Better form layout */
          .field-row {
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 12px;
          }
          
          .field-row label {
            margin-bottom: 5px;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Maximize any existing windows that match our criteria
      document.querySelectorAll('.window').forEach(window => {
        if (shouldMaximizeWindow(window)) {
          maximizeWindow(window);
        }
      });
    } else {
      // Set non-mobile status
      window.sessionStorage.setItem('isMobileMode', 'false');
    }
  }

  // Initialize when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded, run immediately
    init();
  }
  
  // Also check on resize (e.g., orientation changes)
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      // Re-check mobile status
      const wasMobile = window.sessionStorage.getItem('isMobileMode') === 'true';
      const isNowMobile = isMobileDevice();
      
      // If status changed, re-initialize
      if (wasMobile !== isNowMobile) {
        init();
      }
    }, 250);
  });
})();
