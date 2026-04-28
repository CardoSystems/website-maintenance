// ============================================================================
// media-core.js - Media system core initialization and coordination
// ============================================================================
// Responsibility: Central coordinator for all media features
// Size: ~10KB (optimized from 63KB monolithic file)

import { AUDIO_SOURCES, showWindowsDialog } from './globals.js';
import { showRadioPlayer } from './media-radio.js';
import { showEDMPlayer } from './media-edm.js';
import { showRSSFeed } from './media-rss.js';
import { showIPTVPlayer } from '../iptv-player-assets/iptv-player.js';

// Track initialization state to prevent duplicate listeners
let mediaFeaturesInitialized = false;

/**
 * Initialize all media features at startup
 * CRITICAL: Only runs once to prevent ghost button listeners
 */
export function initMediaFeatures() {
    if (mediaFeaturesInitialized) {
        console.log('[Media Core] Already initialized, skipping');
        return;
    }
    
    mediaFeaturesInitialized = true;
    console.log('[Media Core] Initializing all media features');
    
    const radioButton = document.getElementById('winamp-btn');
    const edmButton = document.getElementById('edm-btn');
    const rssButton = document.getElementById('rss-btn');
    const tdtButton = document.getElementById('tdt-btn');

    if (radioButton) {
        radioButton.addEventListener('click', showRadioPlayer);
        console.log('[Media Core] Radio button attached');
    }

    if (edmButton) {
        edmButton.addEventListener('click', showEDMPlayer);
        console.log('[Media Core] EDM button attached');
    }

    if (rssButton) {
        rssButton.addEventListener('click', showRSSFeed);
        console.log('[Media Core] RSS button attached');
    }

    if (tdtButton) {
        tdtButton.addEventListener('click', showIPTVPlayer);
        console.log('[Media Core] TDT button attached');
    }
}

/**
 * Refresh website with cache clearing
 */
export function refreshWebsite() {
    const playSound = (url) => {
        try {
            const sound = new Audio(url);
            sound.volume = AUDIO_SOURCES.volume;
            sound.play().catch(() => {});
        } catch (e) {
            console.log('Audio error:', e.message);
        }
    };
    
    playSound(AUDIO_SOURCES.startSound);
    
    showWindowsDialog(
        'Reiniciando Website',
        'A página será reiniciada com cache limpo...'
    );
    
    setTimeout(() => {
        const cacheBuster = new Date().getTime();
        window.location.href = window.location.pathname + '?nocache=' + cacheBuster;
    }, 1500);
}

// Export all media player functions for backwards compatibility
export { showRadioPlayer, showEDMPlayer, showRSSFeed, showIPTVPlayer };
