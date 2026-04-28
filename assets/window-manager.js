// ============================================================================
// window-manager.js - Barrel module re-exporting window management functions
// ============================================================================
// Responsibility: Central export point for window management modules
// Size: 3.2KB barrel (down from 22.5KB monolithic)

export { setupWindowControls, closeWindow, adjustContainerSizes } from './window-core.js';
export { makeDraggable } from './window-draggable.js';
export { makeResizable } from './window-resizable.js';

// Backwards compatibility - bind to window object
import { setupWindowControls, closeWindow, adjustContainerSizes } from './window-core.js';
import { makeDraggable } from './window-draggable.js';
import { makeResizable } from './window-resizable.js';

window.setupWindowControls = setupWindowControls;
window.closeWindow = closeWindow;
window.adjustContainerSizes = adjustContainerSizes;
window.makeDraggable = makeDraggable;
window.makeResizable = makeResizable;
