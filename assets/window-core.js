// ============================================================================
// window-core.js - Window management orchestrator and utilities
// ============================================================================
// Responsibility: Setup window controls, minimize, maximize, close, resize containers
// Size: ~18KB (extracted from 22.5KB monolithic file)

import { makeDraggable } from './window-draggable.js';
import { makeResizable } from './window-resizable.js';

/**
 * Setup all window controls (drag, resize, minimize, maximize, close)
 * @param {HTMLElement} windowElement - Window element
 * @param {HTMLElement} titleBar - Title bar element
 */
export function setupWindowControls(windowElement, titleBar) {
    if (!windowElement || !titleBar) {
        console.error("Window or title bar not provided to setupWindowControls");
        return;
    }

    console.log("Setting up window controls for", windowElement.className);
    
    const minimizeBtn = titleBar.querySelector('button[aria-label="Minimize"]');
    const maximizeBtn = titleBar.querySelector('button[aria-label="Maximize"]');
    const closeBtn = titleBar.querySelector('button[aria-label="Close"]');
    
    let originalWidth = windowElement.offsetWidth;
    let originalHeight = windowElement.offsetHeight;
    let originalLeft = '50%';
    let originalTop = '50%';
    let originalTransform = 'translate(-50%, -50%)';
    
    makeDraggable(windowElement, titleBar);
    
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
        if (maximizeBtn) {
            maximizeBtn.disabled = true;
            maximizeBtn.style.opacity = '0.5';
            maximizeBtn.style.cursor = 'not-allowed';
        }
    }
    
    adjustContainerSizes(windowElement);
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', function() {
            windowElement.classList.add('minimized');
            setTimeout(() => {
                windowElement.classList.remove('minimized');
            }, 300);
        });
    }
    
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', function() {
            const nonResizable = [
                'email-form-window', 
                'radio-player-window', 
                'edm-player-window',
                'rss-window',
                'rss-feed-window'
            ];
            if (nonResizable.some(className => windowElement.classList.contains(className))) {
                return;
            }
            
            if (windowElement.classList.contains('maximized')) {
                windowElement.classList.remove('maximized');
                windowElement.style.width = originalWidth + 'px';
                windowElement.style.height = originalHeight + 'px';
                windowElement.style.left = originalLeft;
                windowElement.style.top = originalTop;
                windowElement.style.transform = originalTransform;
                
                const existingHandles = windowElement.querySelectorAll('.resize-handle');
                if (existingHandles.length === 0) {
                    makeResizable(windowElement);
                }
                
                adjustContainerSizes(windowElement);
            } else {
                originalWidth = windowElement.offsetWidth;
                originalHeight = windowElement.offsetHeight;
                originalLeft = windowElement.style.left || '50%';
                originalTop = windowElement.style.top || '50%';
                originalTransform = windowElement.style.transform || 'translate(-50%, -50%)';
                
                const resizeHandles = windowElement.querySelectorAll('.resize-handle');
                resizeHandles.forEach(handle => windowElement.removeChild(handle));
                
                windowElement.classList.add('maximized');
                windowElement.style.width = '90%';
                windowElement.style.height = '85%';
                windowElement.style.top = '7.5%';
                windowElement.style.left = '5%';
                windowElement.style.transform = 'none';
                
                adjustContainerSizes(windowElement);
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeWindow(windowElement);
        });
    }
}

/**
 * Close window - remove from DOM + cleanup listeners
 * @param {HTMLElement} windowElement - Window to close
 */
export function closeWindow(windowElement) {
    const overlay = windowElement.closest('.dialog-overlay');
    if (!overlay) {
        console.error("Could not find parent overlay for window");
        return;
    }
    
    const titleBar = windowElement.querySelector('.title-bar');
    if (titleBar) {
        titleBar.replaceWith(titleBar.cloneNode(true));
    }
    
    const resizeHandles = windowElement.querySelectorAll('.resize-handle');
    resizeHandles.forEach(handle => windowElement.removeChild(handle));
    
    try {
        if (overlay.parentNode && overlay.parentNode.contains(overlay)) {
            overlay.parentNode.removeChild(overlay);
        } else if (typeof overlay.remove === 'function') {
            overlay.remove();
        }
    } catch (err) {
        console.warn('[Window Core] Failed to remove overlay:', err);
    }
    
    document.body.style.pointerEvents = 'none';
    setTimeout(() => {
        document.body.style.pointerEvents = 'auto';
    }, 100);
}

/**
 * Adjust container sizes for different window types
 * @param {HTMLElement} windowElement - Window element
 */
export function adjustContainerSizes(windowElement) {
    if (windowElement.classList.contains('radio-player-window')) {
        adjustRadioPlayerContainer(windowElement);
    } else if (windowElement.classList.contains('edm-player-window')) {
        adjustEDMPlayerContainer(windowElement);
    } else if (windowElement.classList.contains('rss-window') || windowElement.classList.contains('rss-feed-window')) {
        adjustRSSContainer(windowElement);
    } else if (windowElement.classList.contains('email-form-window')) {
        adjustEmailFormContainer(windowElement);
    } else {
        const windowBody = windowElement.querySelector('.window-body');
        if (windowBody) {
            const titleBarHeight = windowElement.querySelector('.title-bar')?.offsetHeight || 30;
            windowBody.style.height = `calc(100% - ${titleBarHeight}px)`;
            windowBody.style.overflowY = 'auto';
        }
    }
    
    if (windowElement.classList.contains('maximized')) {
        const windowBody = windowElement.querySelector('.window-body');
        if (windowBody) {
            windowBody.style.height = 'calc(100% - 30px)';
            windowBody.style.overflowY = 'auto';
        }
        
        if (windowElement.classList.contains('edm-player-window')) {
            const videoContainer = windowElement.querySelector('.video-container');
            if (videoContainer) {
                videoContainer.style.height = 'calc(70% - 30px)';
            }
        }
    }
}

function adjustRadioPlayerContainer(windowElement) {
    const windowBody = windowElement.querySelector('.window-body');
    const titleBarHeight = windowElement.querySelector('.title-bar')?.offsetHeight || 30;
    
    if (windowBody) {
        windowBody.style.height = `calc(100% - ${titleBarHeight}px)`;
        windowBody.style.overflowY = 'auto';
    }
}

function adjustEDMPlayerContainer(windowElement) {
    const windowBody = windowElement.querySelector('.window-body');
    const videoContainer = windowElement.querySelector('.video-container');
    const titleBarHeight = windowElement.querySelector('.title-bar')?.offsetHeight || 30;
    
    if (windowBody) {
        windowBody.style.height = `calc(100% - ${titleBarHeight}px)`;
        windowBody.style.overflowY = 'auto';
        
        if (videoContainer) {
            if (windowElement.classList.contains('maximized')) {
                videoContainer.style.height = 'calc(70% - 30px)';
            } else {
                videoContainer.style.height = '600px';
            }
        }
    }
}

function adjustRSSContainer(windowElement) {
    const windowBody = windowElement.querySelector('.window-body');
    const rssContainer = windowElement.querySelector('.rss-container, .rss-feed-container');
    const titleBarHeight = windowElement.querySelector('.title-bar')?.offsetHeight || 30;
    
    if (windowBody && rssContainer) {
        windowBody.style.height = `calc(100% - ${titleBarHeight}px)`;
        rssContainer.style.height = `calc(100% - 20px)`;
        rssContainer.style.maxHeight = 'none';
        rssContainer.style.fontSize = '1.1em';
        
        const newsItems = rssContainer.querySelectorAll('.news-item');
        newsItems.forEach(item => {
            item.style.marginBottom = '20px';
            item.style.padding = '15px';
            item.style.borderBottom = '1px solid #ddd';
        });
    }
}

function adjustEmailFormContainer(windowElement) {
    const windowBody = windowElement.querySelector('.window-body');
    const titleBarHeight = windowElement.querySelector('.title-bar')?.offsetHeight || 30;
    
    if (windowBody) {
        windowBody.style.height = `calc(100% - ${titleBarHeight}px)`;
        windowBody.style.overflowY = 'auto';
    }
}
