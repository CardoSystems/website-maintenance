// ============================================================================
// media-edm.js - EDM player (Dance Television) functionality
// ============================================================================
// Responsibility: EDM video player window and controls
// Size: ~20KB (extracted from 63KB monolithic file)

import { AUDIO_SOURCES, showWindowsDialog } from './globals.js';
import { initEDMPlayer, initVideoControls, resizeVideoContainer } from './media-utils.js';

let edmPlayerInstance = null;

/**
 * Show EDM player window
 */
export function showEDMPlayer() {
    playSound(AUDIO_SOURCES.startSound);
    
    if (edmPlayerInstance) {
        edmPlayerInstance.style.display = 'block';
        return;
    }
    
    try {
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay';
        
        const dialogWindow = document.createElement('div');
        dialogWindow.className = 'window edm-player-window';
        
        const titleBar = document.createElement('div');
        titleBar.className = 'title-bar';
        
        const titleText = document.createElement('div');
        titleText.className = 'title-bar-text';
        titleText.textContent = 'Dance Television - EDM';
        
        const titleControls = document.createElement('div');
        titleControls.className = 'title-bar-controls';
        
        const minimizeBtn = document.createElement('button');
        minimizeBtn.setAttribute('aria-label', 'Minimize');
        
        const maximizeBtn = document.createElement('button');
        maximizeBtn.setAttribute('aria-label', 'Maximize');
        
        const closeBtn = document.createElement('button');
        closeBtn.setAttribute('aria-label', 'Close');
        
        const windowBody = document.createElement('div');
        windowBody.className = 'window-body';
        
        const edmContainer = document.createElement('div');
        edmContainer.className = 'edm-player-container';
        
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        const videoElement = document.createElement('video');
        videoElement.id = 'edm-video';
        videoElement.controls = false;
        videoElement.autoplay = false;
        videoElement.muted = true;
        videoElement.playsInline = true;
        
        videoContainer.appendChild(videoElement);
        
        const customControls = document.createElement('div');
        customControls.className = 'video-controls';
        customControls.innerHTML = `
            <div class="control-buttons">
                <button class="video-btn" id="video-play-btn">
                    <span class="play-icon">▶</span>
                    <span class="pause-icon" style="display:none;">⏸</span>
                </button>
                <button class="video-btn" id="video-stop-btn">⏹</button>
                <div class="volume-control">
                    <button class="video-btn" id="video-mute-btn">🔊</button>
                    <input type="range" id="video-volume-slider" min="0" max="100" value="80">
                </div>
                <button class="video-btn" id="video-fullscreen-btn">⛶</button>
            </div>
            <div class="progress-container">
                <div class="win7-progress-bar">
                    <div class="win7-progress-green" id="video-progress-bar"></div>
                </div>
                <div class="time-display">
                    <span id="video-current-time">00:00</span> / <span id="video-duration">Ao Vivo</span>
                </div>
            </div>
        `;
        
        const stationInfo = document.createElement('div');
        stationInfo.className = 'edm-station-info';
        stationInfo.innerHTML = `
            <div class="edm-logo">
                <img src="assets/logos/dancetv.svg" alt="Dance Television Logo">
            </div>
            <div class="edm-details">
                <h3>Dance Television One</h3>
                <p>Electronic Dance Music - Transmissão ao vivo</p>
                <div class="edm-status" id="edm-status">A carregar...</div>
            </div>
        `;
        
        edmContainer.appendChild(videoContainer);
        edmContainer.appendChild(customControls);
        edmContainer.appendChild(stationInfo);
        
        const nowPlaying = document.createElement('div');
        nowPlaying.className = 'now-playing';
        nowPlaying.innerHTML = `
            <fieldset>
                <legend>A Tocar Agora</legend>
                <div class="now-playing-info" id="edm-now-playing-info">
                    <div class="marquee">
                        <span>Dance Television One - Emissão em Direto</span>
                    </div>
                </div>
            </fieldset>
        `;
        edmContainer.appendChild(nowPlaying);
        
        windowBody.appendChild(edmContainer);
        
        titleControls.appendChild(minimizeBtn);
        titleControls.appendChild(maximizeBtn);
        titleControls.appendChild(closeBtn);
        
        titleBar.appendChild(titleText);
        titleBar.appendChild(titleControls);
        
        dialogWindow.appendChild(titleBar);
        dialogWindow.appendChild(windowBody);
        dialogOverlay.appendChild(dialogWindow);
        
        document.body.appendChild(dialogOverlay);
        
        dialogWindow.style.position = 'absolute';
        dialogWindow.style.top = '50%';
        dialogWindow.style.left = '50%';
        dialogWindow.style.transform = 'translate(-50%, -50%)';
        
        if (typeof setupWindowControls === 'function') {
            setupWindowControls(dialogWindow, titleBar);
        }
        
        edmPlayerInstance = dialogWindow;
        
        closeBtn.addEventListener('click', () => {
            if (videoElement.hlsInstance) {
                videoElement.hlsInstance.destroy();
            }
            if (typeof closeWindow === 'function') {
                closeWindow(dialogWindow);
            } else {
                try {
                    if (dialogOverlay.parentNode && dialogOverlay.parentNode.contains(dialogOverlay)) {
                        dialogOverlay.parentNode.removeChild(dialogOverlay);
                    } else if (typeof dialogOverlay.remove === 'function') {
                        dialogOverlay.remove();
                    }
                } catch (err) {
                    console.warn('[Media EDM] Failed to remove overlay:', err);
                }
            }
            edmPlayerInstance = null;
        });
        
        maximizeBtn.addEventListener('click', () => {
            if (dialogWindow.classList.contains('maximized')) {
                dialogWindow.classList.remove('maximized');
                dialogWindow.style.width = '';
                dialogWindow.style.height = '';
                dialogWindow.style.top = '50%';
                dialogWindow.style.left = '50%';
                dialogWindow.style.transform = 'translate(-50%, -50%)';
                videoContainer.style.height = '';
                // Allow resize logic to recompute
                try { resizeVideoContainer(); } catch (e) { /* ignore */ }
            } else {
                dialogWindow.classList.add('maximized');
                // Let CSS control maximize dimensions (desktop/mobile specific rules)
                dialogWindow.style.width = '';
                dialogWindow.style.height = '';
                dialogWindow.style.top = '';
                dialogWindow.style.left = '';
                dialogWindow.style.transform = '';
                videoContainer.style.height = '';
                try { resizeVideoContainer(); } catch (e) { /* ignore */ }
            }
        });
        
        minimizeBtn.addEventListener('click', () => {
            dialogWindow.classList.add('minimized');
            setTimeout(() => {
                dialogWindow.classList.remove('minimized');
            }, 300);
        });
        
        initEDMPlayer(videoElement);
        initVideoControls(videoElement);
        
    } catch (error) {
        console.error('EDM player error:', error);
        showWindowsDialog('Erro', 'Falha ao carregar o stream EDM.');
    }
}

/**
 * Play sound helper
 */
function playSound(url) {
    try {
        const sound = new Audio(url);
        sound.volume = AUDIO_SOURCES.volume;
        sound.play().catch(() => {});
    } catch (e) {
        console.log('Audio error:', e.message);
    }
}
