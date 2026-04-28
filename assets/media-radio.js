// ============================================================================
// media-radio.js - Radio player (Antena 3) functionality
// ============================================================================
// Responsibility: Radio player window and controls
// Size: ~18KB (extracted from 63KB monolithic file)

import { AUDIO_SOURCES, showWindowsDialog } from './globals.js';
import { initHLSPlayer, initAudioControls } from './media-utils.js';

let radioPlayerInstance = null;

/**
 * Show radio player window
 */
export function showRadioPlayer() {
    playSound(AUDIO_SOURCES.startSound);
    
    if (radioPlayerInstance) {
        radioPlayerInstance.style.display = 'block';
        return;
    }
    
    try {
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay';
        
        const dialogWindow = document.createElement('div');
        dialogWindow.className = 'window radio-player-window';
        
        const titleBar = document.createElement('div');
        titleBar.className = 'title-bar';
        
        const titleText = document.createElement('div');
        titleText.className = 'title-bar-text';
        titleText.textContent = 'Antena 3 - Rádio';
        
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
        
        const radioContainer = document.createElement('div');
        radioContainer.className = 'radio-player-container';
        
        const stationInfo = document.createElement('div');
        stationInfo.className = 'radio-station-info';
        stationInfo.innerHTML = `
            <div class="radio-logo">
                <img src="assets/logos/antena3.svg" alt="Antena 3 Logo">
            </div>
            <div class="radio-details">
                <h3>Antena 3</h3>
                <p>Rádio pública portuguesa - Música, cultura e entretenimento</p>
                <div class="radio-status" id="radio-status">A carregar...</div>
            </div>
        `;
        radioContainer.appendChild(stationInfo);
        
        const audioElement = document.createElement('audio');
        audioElement.id = 'radio-audio';
        audioElement.controls = true;
        
        const customControls = document.createElement('div');
        customControls.className = 'radio-controls';
        customControls.innerHTML = `
            <div class="control-buttons">
                <button class="radio-btn" id="radio-play-btn">
                    <span class="play-icon">▶</span>
                    <span class="pause-icon" style="display:none;">⏸</span>
                </button>
                <button class="radio-btn" id="radio-stop-btn">⏹</button>
                <div class="volume-control">
                    <button class="radio-btn" id="radio-mute-btn">🔊</button>
                    <input type="range" id="volume-slider" min="0" max="100" value="80">
                </div>
            </div>
            <div class="progress-container">
                <div class="win7-progress-bar">
                    <div class="win7-progress-green" id="audio-progress-bar"></div>
                </div>
                <div class="time-display">
                    <span id="current-time">00:00</span> / <span id="duration">Ao Vivo</span>
                </div>
            </div>
        `;
        
        radioContainer.appendChild(audioElement);
        radioContainer.appendChild(customControls);
        
        const nowPlaying = document.createElement('div');
        nowPlaying.className = 'now-playing';
        nowPlaying.innerHTML = `
            <fieldset>
                <legend>A Tocar Agora</legend>
                <div class="now-playing-info" id="now-playing-info">
                    <div class="marquee">
                        <span>Antena 3 - Emissão em Direto</span>
                    </div>
                </div>
            </fieldset>
        `;
        radioContainer.appendChild(nowPlaying);
        
        windowBody.appendChild(radioContainer);
        
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
        
        radioPlayerInstance = dialogWindow;
        
        closeBtn.addEventListener('click', () => {
            if (audioElement.hlsInstance) {
                audioElement.hlsInstance.destroy();
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
                    console.warn('[Media Radio] Failed to remove overlay:', err);
                }
            }
            radioPlayerInstance = null;
        });
        
        maximizeBtn.addEventListener('click', () => {
            if (dialogWindow.classList.contains('maximized')) {
                dialogWindow.classList.remove('maximized');
                dialogWindow.style.width = '';
                dialogWindow.style.height = '';
                dialogWindow.style.top = '50%';
                dialogWindow.style.left = '50%';
                dialogWindow.style.transform = 'translate(-50%, -50%)';
            } else {
                dialogWindow.classList.add('maximized');
                dialogWindow.style.width = '90%';
                dialogWindow.style.height = '80%';
                dialogWindow.style.top = '10%';
                dialogWindow.style.left = '5%';
                dialogWindow.style.transform = 'none';
            }
        });
        
        minimizeBtn.addEventListener('click', () => {
            dialogWindow.classList.add('minimized');
            setTimeout(() => {
                dialogWindow.classList.remove('minimized');
            }, 300);
        });
        
        initHLSPlayer(audioElement);
        initAudioControls(audioElement);
        
    } catch (error) {
        console.error('Radio player error:', error);
        showWindowsDialog('Erro', 'Falha ao carregar o rádio.');
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
