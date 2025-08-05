// ------------------------------------------------------------------------------
// window-manager.js - Handles window management functionality for Windows 7 style dialogs
// ------------------------------------------------------------------------------

/**
 * Makes a window draggable, resizable, and handles window controls
 * @param {HTMLElement} windowElement - The window element to make draggable and resizable
 * @param {HTMLElement} titleBar - The title bar element that triggers the drag
 */
function setupWindowControls(windowElement, titleBar) {
    if (!windowElement || !titleBar) {
        console.error("Window or title bar not provided to setupWindowControls");
        return;
    }

    console.log("Setting up window controls for", windowElement.className);
    
    // Find control buttons
    const minimizeBtn = titleBar.querySelector('button[aria-label="Minimize"]');
    const maximizeBtn = titleBar.querySelector('button[aria-label="Maximize"]');
    const closeBtn = titleBar.querySelector('button[aria-label="Close"]');
    
    // Store original dimensions and position
    let originalWidth = windowElement.offsetWidth;
    let originalHeight = windowElement.offsetHeight;
    let originalLeft = '50%';
    let originalTop = '50%';
    let originalTransform = 'translate(-50%, -50%)';
    
    // Make draggable
    makeDraggable(windowElement, titleBar);
    
    // Set up resize handlers - skip for email, radio, EDM, and RSS windows
    const nonResizableWindows = [
        'email-form-window', 
        'radio-player-window', 
        'edm-player-window',
        'rss-window',
        'rss-feed-window'
    ];
    const isResizable = !nonResizableWindows.some(className => windowElement.classList.contains(className));
    
    if (isResizable) {
        makeResizable(windowElement);
    } else {
        // For non-resizable windows, remove maximize button functionality
        if (maximizeBtn) {
            maximizeBtn.disabled = true;
            maximizeBtn.style.opacity = '0.5';
            maximizeBtn.style.cursor = 'not-allowed';
        }
    }
    
    // Initial container size adjustment
    adjustContainerSizes(windowElement);
    
    // Minimize button
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', function() {
            windowElement.classList.add('minimized');
            setTimeout(() => {
                windowElement.classList.remove('minimized');
            }, 300);
        });
    }
    
    // Maximize button
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', function() {
            // Skip for non-resizable windows
            const nonResizableWindows = [
                'email-form-window', 
                'radio-player-window', 
                'edm-player-window',
                'rss-window',
                'rss-feed-window'
            ];
            if (nonResizableWindows.some(className => windowElement.classList.contains(className))) {
                return;
            }
            
            if (windowElement.classList.contains('maximized')) {
                // Restore window
                windowElement.classList.remove('maximized');
                windowElement.style.width = originalWidth + 'px';
                windowElement.style.height = originalHeight + 'px';
                windowElement.style.left = originalLeft;
                windowElement.style.top = originalTop;
                windowElement.style.transform = originalTransform;
                
                // Restore resize handles if they were removed
                const existingHandles = windowElement.querySelectorAll('.resize-handle');
                if (existingHandles.length === 0) {
                    makeResizable(windowElement);
                }
                
                // Adjust container sizes
                adjustContainerSizes(windowElement);
            } else {
                // Store current size and position before maximizing
                originalWidth = windowElement.offsetWidth;
                originalHeight = windowElement.offsetHeight;
                originalLeft = windowElement.style.left || '50%';
                originalTop = windowElement.style.top || '50%';
                originalTransform = windowElement.style.transform || 'translate(-50%, -50%)';
                
                // Remove resize handles when maximized
                const resizeHandles = windowElement.querySelectorAll('.resize-handle');
                resizeHandles.forEach(handle => windowElement.removeChild(handle));
                
                // Maximize window - standard maximize for all windows since RSS is non-resizable now
                windowElement.classList.add('maximized');
                windowElement.style.width = '90%';
                windowElement.style.height = '85%'; // Slightly taller for better content display
                windowElement.style.top = '7.5%';  // Adjusted to center vertically
                windowElement.style.left = '5%';
                windowElement.style.transform = 'none';
                
                // Adjust container sizes
                adjustContainerSizes(windowElement);
            }
        });
    }
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            // Use our centralized close function for proper cleanup
            closeWindow(windowElement);
        });
    }
}

/**
 * Makes a window element draggable by its title bar
 * @param {HTMLElement} windowElement - The window to make draggable
 * @param {HTMLElement} titleBar - The title bar that triggers the drag
 */
function makeDraggable(windowElement, titleBar) {
    let isDragging = false;
    let offsetX, offsetY;
    
    // Initial positioning if not set
    if (!windowElement.style.position) {
        windowElement.style.position = 'absolute';
    }
    
    titleBar.style.cursor = 'move';
    
    // Mouse down event on title bar starts dragging
    titleBar.addEventListener('mousedown', function(e) {
        // Don't initiate drag if clicking on a control button
        if (e.target.tagName === 'BUTTON') return;
        
        isDragging = true;
        
        // Calculate the offset from the mouse position to the window position
        const rect = windowElement.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Add a subtle transition when dragging starts
        windowElement.style.transition = 'none';
        
        // Change cursor to grabbing
        titleBar.style.cursor = 'grabbing';
        
        // Prevent text selection during drag
        e.preventDefault();
    });
    
    // Function to handle mouse move
    function moveHandler(e) {
        if (!isDragging) return;
        
        // Calculate new position
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        // Update window position
        windowElement.style.left = x + 'px';
        windowElement.style.top = y + 'px';
        windowElement.style.transform = 'none';
    }
    
    // Function to handle mouse up
    function upHandler() {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Reset cursor
        titleBar.style.cursor = 'move';
        
        // Add a subtle transition when dragging ends
        windowElement.style.transition = 'box-shadow 0.2s ease';
    }
    
    // Add event listeners
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    
    // Clean up event listeners when window is removed
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && Array.from(mutation.removedNodes).includes(windowElement)) {
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('mouseup', upHandler);
                observer.disconnect();
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Makes a window element resizable
 * @param {HTMLElement} windowElement - The window to make resizable
 */
function makeResizable(windowElement) {
    // Create resize handles
    const directions = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'];
    
    // Don't add resize handles for maximized windows
    if (windowElement.classList.contains('maximized')) {
        return;
    }
    
    // First remove any existing resize handles to avoid duplicates
    const existingHandles = windowElement.querySelectorAll('.resize-handle');
    existingHandles.forEach(handle => windowElement.removeChild(handle));
    
    directions.forEach(dir => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${dir}`;
        handle.style.position = 'absolute';
        handle.style.zIndex = '1000'; // Ensure handles are clickable
        
        // Set the position and size of the handle
        switch(dir) {
            case 'n':
                handle.style.top = '-3px';
                handle.style.left = '0';
                handle.style.width = '100%';
                handle.style.height = '6px';
                handle.style.cursor = 'n-resize';
                break;
            case 'e':
                handle.style.top = '0';
                handle.style.right = '-3px';
                handle.style.width = '6px';
                handle.style.height = '100%';
                handle.style.cursor = 'e-resize';
                break;
            case 's':
                handle.style.bottom = '-3px';
                handle.style.left = '0';
                handle.style.width = '100%';
                handle.style.height = '6px';
                handle.style.cursor = 's-resize';
                break;
            case 'w':
                handle.style.top = '0';
                handle.style.left = '-3px';
                handle.style.width = '6px';
                handle.style.height = '100%';
                handle.style.cursor = 'w-resize';
                break;
            case 'ne':
                handle.style.top = '-3px';
                handle.style.right = '-3px';
                handle.style.width = '10px';
                handle.style.height = '10px';
                handle.style.cursor = 'ne-resize';
                break;
            case 'se':
                handle.style.bottom = '-3px';
                handle.style.right = '-3px';
                handle.style.width = '10px';
                handle.style.height = '10px';
                handle.style.cursor = 'se-resize';
                break;
            case 'sw':
                handle.style.bottom = '-3px';
                handle.style.left = '-3px';
                handle.style.width = '10px';
                handle.style.height = '10px';
                handle.style.cursor = 'sw-resize';
                break;
            case 'nw':
                handle.style.top = '-3px';
                handle.style.left = '-3px';
                handle.style.width = '10px';
                handle.style.height = '10px';
                handle.style.cursor = 'nw-resize';
                break;
        }
        
        windowElement.appendChild(handle);
        
        // Add event listeners for resizing
        handle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = windowElement.offsetWidth;
            const startHeight = windowElement.offsetHeight;
            const startLeft = windowElement.offsetLeft;
            const startTop = windowElement.offsetTop;
            
            function resizeMove(e) {
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;
                
                // Calculate new dimensions based on direction
                switch(dir) {
                    case 'e':
                        newWidth = startWidth + (e.clientX - startX);
                        break;
                    case 's':
                        newHeight = startHeight + (e.clientY - startY);
                        break;
                    case 'w':
                        newWidth = startWidth - (e.clientX - startX);
                        newLeft = startLeft + (e.clientX - startX);
                        break;
                    case 'n':
                        newHeight = startHeight - (e.clientY - startY);
                        newTop = startTop + (e.clientY - startY);
                        break;
                    case 'ne':
                        newWidth = startWidth + (e.clientX - startX);
                        newHeight = startHeight - (e.clientY - startY);
                        newTop = startTop + (e.clientY - startY);
                        break;
                    case 'se':
                        newWidth = startWidth + (e.clientX - startX);
                        newHeight = startHeight + (e.clientY - startY);
                        break;
                    case 'sw':
                        newWidth = startWidth - (e.clientX - startX);
                        newHeight = startHeight + (e.clientY - startY);
                        newLeft = startLeft + (e.clientX - startX);
                        break;
                    case 'nw':
                        newWidth = startWidth - (e.clientX - startX);
                        newHeight = startHeight - (e.clientY - startY);
                        newLeft = startLeft + (e.clientX - startX);
                        newTop = startTop + (e.clientY - startY);
                        break;
                }
                
                // Apply minimum dimensions
                newWidth = Math.max(newWidth, 300);
                newHeight = Math.max(newHeight, 200);
                
                // Update window dimensions
                windowElement.style.width = newWidth + 'px';
                windowElement.style.height = newHeight + 'px';
                windowElement.style.left = newLeft + 'px';
                windowElement.style.top = newTop + 'px';
                
                // Adjust contents to fit new dimensions
                adjustContainerSizes(windowElement);
            }
            
            function resizeEnd() {
                document.removeEventListener('mousemove', resizeMove);
                document.removeEventListener('mouseup', resizeEnd);
                
                // Update the original dimensions if window is later maximized and restored
                const parentScope = windowElement;
                parentScope.originalWidth = windowElement.offsetWidth;
                parentScope.originalHeight = windowElement.offsetHeight;
            }
            
            document.addEventListener('mousemove', resizeMove);
            document.addEventListener('mouseup', resizeEnd);
        });
    });
}

/**
 * Properly removes a window and its overlay from the DOM and cleans up event listeners
 * @param {HTMLElement} windowElement - The window to close
 */
function closeWindow(windowElement) {
    // Find the parent overlay
    const overlay = windowElement.closest('.dialog-overlay');
    if (!overlay) {
        console.error("Could not find parent overlay for window");
        return;
    }
    
    // Remove any remaining event listeners
    const titleBar = windowElement.querySelector('.title-bar');
    if (titleBar) {
        titleBar.replaceWith(titleBar.cloneNode(true));
    }
    
    // Remove any resize handles and their listeners
    const resizeHandles = windowElement.querySelectorAll('.resize-handle');
    resizeHandles.forEach(handle => windowElement.removeChild(handle));
    
    // Remove the overlay from the DOM
    document.body.removeChild(overlay);
    
    // Force a small delay before allowing new windows to be created
    // This helps prevent click-through issues
    document.body.style.pointerEvents = 'none';
    setTimeout(() => {
        document.body.style.pointerEvents = 'auto';
    }, 100);
}

/**
 * Adjusts the container sizes within a window to fit properly
 * @param {HTMLElement} windowElement - The window element
 */
function adjustContainerSizes(windowElement) {
    // Adjust container size for different window types
    if (windowElement.classList.contains('radio-player-window')) {
        adjustRadioPlayerContainer(windowElement);
    } else if (windowElement.classList.contains('edm-player-window')) {
        adjustEDMPlayerContainer(windowElement);
    } else if (windowElement.classList.contains('rss-window') || windowElement.classList.contains('rss-feed-window')) {
        adjustRSSContainer(windowElement);
    } else if (windowElement.classList.contains('email-form-window')) {
        adjustEmailFormContainer(windowElement);
    } else {
        // Generic adjustment for any window
        const windowBody = windowElement.querySelector('.window-body');
        if (windowBody) {
            // Set window-body to fill available space minus title bar
            const titleBarHeight = windowElement.querySelector('.title-bar')?.offsetHeight || 30;
            windowBody.style.height = `calc(100% - ${titleBarHeight}px)`;
            windowBody.style.overflowY = 'auto';
        }
    }
    
    // If the window is maximized, ensure the content fills it properly
    if (windowElement.classList.contains('maximized')) {
        const windowBody = windowElement.querySelector('.window-body');
        if (windowBody) {
            windowBody.style.height = 'calc(100% - 30px)'; // Adjust for title bar
            windowBody.style.overflowY = 'auto';
        }
        
        // Resize specific containers based on window type
        if (windowElement.classList.contains('edm-player-window')) {
            const videoContainer = windowElement.querySelector('.video-container');
            if (videoContainer) {
                videoContainer.style.height = 'calc(70% - 30px)';
            }
        }
    }
}

/**
 * Adjusts the radio player container to fit the window
 * @param {HTMLElement} windowElement - The radio player window
 */
function adjustRadioPlayerContainer(windowElement) {
    const windowBody = windowElement.querySelector('.window-body');
    const radioContainer = windowElement.querySelector('.radio-player-container');
    const titleBarHeight = windowElement.querySelector('.title-bar')?.offsetHeight || 30;
    
    if (windowBody && radioContainer) {
        windowBody.style.height = `calc(100% - ${titleBarHeight}px)`;
        windowBody.style.overflowY = 'auto';
    }
}

/**
 * Adjusts the EDM player container to fit the window
 * @param {HTMLElement} windowElement - The EDM player window
 */
function adjustEDMPlayerContainer(windowElement) {
    const windowBody = windowElement.querySelector('.window-body');
    const edmContainer = windowElement.querySelector('.edm-player-container');
    const videoContainer = windowElement.querySelector('.video-container');
    const titleBarHeight = windowElement.querySelector('.title-bar')?.offsetHeight || 30;
    
    if (windowBody && edmContainer) {
        windowBody.style.height = `calc(100% - ${titleBarHeight}px)`;
        windowBody.style.overflowY = 'auto';
        
        if (videoContainer) {
            // If maximized, make video bigger
            if (windowElement.classList.contains('maximized')) {
                videoContainer.style.height = 'calc(70% - 30px)';
            } else {
                // Reset to default if not maximized
                videoContainer.style.height = '600px';
            }
        }
    }
}

/**
 * Adjusts the RSS container to fit the window
 * @param {HTMLElement} windowElement - The RSS window
 */
function adjustRSSContainer(windowElement) {
    const windowBody = windowElement.querySelector('.window-body');
    const rssContainer = windowElement.querySelector('.rss-container, .rss-feed-container');
    const titleBarHeight = windowElement.querySelector('.title-bar')?.offsetHeight || 30;
    
    if (windowBody && rssContainer) {
        // News windows now have a fixed large size (already doubled)
        windowBody.style.height = `calc(100% - ${titleBarHeight}px)`;
        rssContainer.style.height = `calc(100% - 20px)`;
        rssContainer.style.maxHeight = 'none';
        rssContainer.style.fontSize = '1.1em'; // Larger text for better readability
        
        // Add more space between items for better readability
        const newsItems = rssContainer.querySelectorAll('.news-item');
        newsItems.forEach(item => {
            item.style.marginBottom = '20px';
            item.style.padding = '15px';
            item.style.borderBottom = '1px solid #ddd';
        });
    }
}

/**
 * Adjusts the email form container to fit the window
 * @param {HTMLElement} windowElement - The email form window
 */
function adjustEmailFormContainer(windowElement) {
    const windowBody = windowElement.querySelector('.window-body');
    const titleBarHeight = windowElement.querySelector('.title-bar')?.offsetHeight || 30;
    
    if (windowBody) {
        windowBody.style.height = `calc(100% - ${titleBarHeight}px)`;
        windowBody.style.overflowY = 'auto';
    }
}
