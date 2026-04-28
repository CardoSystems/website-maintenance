// ============================================================================
// window-resizable.js - Window resize handle creation and management
// ============================================================================
// Responsibility: Window resizing with 8 resize handles (n, e, s, w, ne, se, sw, nw)
// Size: ~12KB (extracted from 22.5KB monolithic file)

/**
 * Makes a window element resizable with 8 resize handles
 * @param {HTMLElement} windowElement - The window to make resizable
 */
export function makeResizable(windowElement) {
    // CRITICAL FIX: Check for non-resizable windows to prevent EDM window resizing bug
    const nonResizableWindows = [
        'email-form-window', 
        'radio-player-window', 
        'edm-player-window',
        'rss-window',
        'rss-feed-window'
    ];
    
    const isNonResizable = nonResizableWindows.some(className => windowElement.classList.contains(className));
    
    if (isNonResizable) {
        console.log('[Window Manager] Skipping resize handles for non-resizable window:', windowElement.className);
        const existingHandles = windowElement.querySelectorAll('.resize-handle');
        existingHandles.forEach(handle => {
            handle.style.pointerEvents = 'none';
            if (handle.parentNode) {
                handle.parentNode.removeChild(handle);
            }
        });
        return;
    }
    
    // Create resize handles
    const directions = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'];
    
    if (windowElement.classList.contains('maximized')) {
        return;
    }
    
    // Remove any existing resize handles
    const existingHandles = windowElement.querySelectorAll('.resize-handle');
    existingHandles.forEach(handle => windowElement.removeChild(handle));
    
    directions.forEach(dir => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${dir}`;
        handle.style.position = 'absolute';
        handle.style.zIndex = '1000';
        
        // Set handle position and size
        setHandleStyles(handle, dir);
        
        windowElement.appendChild(handle);
        
        // Add resize event listener
        handle.addEventListener('mousedown', createResizeHandler(windowElement, dir));
    });
}

/**
 * Set styles for resize handle based on direction
 */
function setHandleStyles(handle, dir) {
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
}

/**
 * Create resize event handler for a specific direction
 */
function createResizeHandler(windowElement, dir) {
    return function(e) {
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
            
            // Adjust contents to fit
            if (typeof adjustContainerSizes === 'function') {
                adjustContainerSizes(windowElement);
            }
        }
        
        function resizeEnd() {
            document.removeEventListener('mousemove', resizeMove);
            document.removeEventListener('mouseup', resizeEnd);
            
            const parentScope = windowElement;
            parentScope.originalWidth = windowElement.offsetWidth;
            parentScope.originalHeight = windowElement.offsetHeight;
        }
        
        document.addEventListener('mousemove', resizeMove);
        document.addEventListener('mouseup', resizeEnd);
    };
}
