// ============================================================================
// window-draggable.js - Window drag functionality
// ============================================================================
// Responsibility: Make windows draggable via title bar
// Size: ~7KB (extracted from 22.5KB monolithic file)

/**
 * Makes window draggable by title bar
 * @param {HTMLElement} windowElement - Window to drag
 * @param {HTMLElement} titleBar - Title bar trigger
 */
export function makeDraggable(windowElement, titleBar) {
    let isDragging = false;
    let offsetX, offsetY;
    
    if (!windowElement.style.position) {
        windowElement.style.position = 'absolute';
    }
    
    titleBar.style.cursor = 'move';
    
    titleBar.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        
        isDragging = true;
        
        const rect = windowElement.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        windowElement.style.transition = 'none';
        titleBar.style.cursor = 'grabbing';
        
        e.preventDefault();
    });
    
    function moveHandler(e) {
        if (!isDragging) return;
        
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        windowElement.style.left = x + 'px';
        windowElement.style.top = y + 'px';
        windowElement.style.transform = 'none';
    }
    
    function upHandler() {
        if (!isDragging) return;
        
        isDragging = false;
        titleBar.style.cursor = 'move';
        windowElement.style.transition = 'box-shadow 0.2s ease';
    }
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    
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
