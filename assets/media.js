// ============================================================================
// media.js - Barrel module for media functionality
// ============================================================================
// REFACTORED: Split into modular files for maintainability and performance
// This file serves as the main entry point with re-exports
//
// Module breakdown (~10KB each):
// - media-core.js: Core initialization and coordination  
// - media-radio.js: Radio player UI and management
// - media-edm.js: EDM player UI and management
// - media-rss.js: RSS feed reader functionality
// - media-utils.js: Shared audio/video utilities and HLS management
//

import { 
    initMediaFeatures, 
    refreshWebsite, 
    showRadioPlayer, 
    showEDMPlayer, 
    showRSSFeed,
    showIPTVPlayer
} from './media-core.js';

// Re-export all functions for backwards compatibility
export {
    initMediaFeatures,
    refreshWebsite,
    showRadioPlayer,
    showEDMPlayer,
    showRSSFeed,
    showIPTVPlayer
};

// Bind to window object for backwards compatibility
window.initMediaFeatures = initMediaFeatures;
window.refreshWebsite = refreshWebsite;
window.showRadioPlayer = showRadioPlayer;
window.showEDMPlayer = showEDMPlayer;
window.showRSSFeed = showRSSFeed;
window.showIPTVPlayer = showIPTVPlayer;
