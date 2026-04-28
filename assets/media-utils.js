// ============================================================================
// media-utils.js - Shared audio/video utilities and HLS management
// ============================================================================
// Responsibility: Common functions for audio/video control and HLS streaming
// Size: ~15KB (extracted from 63KB monolithic file)

import { AUDIO_SOURCES, showWindowsDialog } from './globals.js';

/**
 * Initialize HLS.js for audio streaming
 */
export function initHLSPlayer(audioElement) {
    const streamUrl = 'https://streaming-live.rtp.pt/liveradio/antena380a/chunklist_DVR.m3u8';
    const statusElement = document.getElementById('radio-status');
    
    if (!window.Hls) {
        console.log('HLS.js not available');
        return;
    }
    
    if (Hls.isSupported()) {
        const hlsInstance = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true
        });
        
        hlsInstance.attachMedia(audioElement);
        
        hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
            hlsInstance.loadSource(streamUrl);
            if (statusElement) statusElement.textContent = 'Stream conectado, a carregar...';
        });
        
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        if (statusElement) statusElement.textContent = 'Erro de rede, tentando...';
                        hlsInstance.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        if (statusElement) statusElement.textContent = 'Erro de mídia, tentando...';
                        hlsInstance.recoverMediaError();
                        break;
                    default:
                        if (statusElement) statusElement.textContent = 'Erro fatal: ' + data.type;
                        hlsInstance.destroy();
                        break;
                }
            }
        });
        
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            if (statusElement) statusElement.textContent = 'Pronto para reproduzir';
            audioElement.muted = true;
            audioElement.play().then(() => {
                setTimeout(() => { audioElement.muted = false; }, 500);
                updatePlayPauseButton(audioElement, true);
            }).catch(e => console.log('Autoplay bloqueado', e));
        });
        
        audioElement.hlsInstance = hlsInstance;
    } else if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
        audioElement.src = streamUrl;
    }
}

/**
 * Initialize HLS.js for video streaming (EDM)
 */
export function initEDMPlayer(videoElement) {
    const streamUrl = 'https://m1b2.worldcast.tv/dancetelevisionone/2/dancetelevisionone.m3u8';
    const statusElement = document.getElementById('edm-status');
    // prefer Hls.js when available, but gracefully fall back to native playback
    const hasHls = typeof window.Hls !== 'undefined';
    
    if (hasHls && Hls.isSupported()) {
        const hlsInstance = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true
        });
        
        hlsInstance.attachMedia(videoElement);
        
        hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
            hlsInstance.loadSource(streamUrl);
            if (statusElement) statusElement.textContent = 'Stream conectado, a carregar...';
        });
        
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        if (statusElement) statusElement.textContent = 'Erro de rede, tentando...';
                        hlsInstance.startLoad();
                        break;
                    default:
                        if (statusElement) statusElement.textContent = 'Erro: ' + data.type;
                        hlsInstance.destroy();
                        break;
                }
            }
        });
        
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            if (statusElement) statusElement.textContent = 'Pronto para reproduzir';
            videoElement.volume = 0.5;
            videoElement.play().catch(e => console.log('Autoplay bloqueado', e));
        });
        
        videoElement.hlsInstance = hlsInstance;
        return;
    }

    // Native HLS support (Safari / iOS) fallback
    if (videoElement.canPlayType && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        try {
            videoElement.crossOrigin = 'anonymous';
            videoElement.src = streamUrl;
            videoElement.addEventListener('loadedmetadata', () => {
                if (statusElement) statusElement.textContent = 'Pronto para reproduzir (nativo)';
            });
            videoElement.play().catch(e => console.log('Native autoplay blocked', e));
            return;
        } catch (err) {
            console.warn('Native HLS fallback failed:', err);
        }
    }

    // Last resort: try fetching the manifest to detect accessibility, then inform user
    try {
        fetch(streamUrl, { method: 'HEAD', mode: 'cors' })
            .then(resp => {
                if (!resp.ok) throw new Error('Status ' + resp.status);
                if (statusElement) statusElement.textContent = 'Stream acessível, tentativa de reprodução...';
                // attempt to set as src and play
                try {
                    videoElement.src = streamUrl;
                    videoElement.play().catch(() => {});
                } catch (e) {
                    console.warn('Attempt to play after HEAD check failed', e);
                }
            })
            .catch(err => {
                console.error('EDM stream not reachable or blocked by CORS:', err);
                if (statusElement) statusElement.textContent = 'Erro ao aceder ao stream (CORS/rede).';
            });
    } catch (err) {
        console.error('EDM fallback error:', err);
        if (statusElement) statusElement.textContent = 'Erro ao iniciar o stream.';
    }

    // If HLS/native attempts fail, provide a safe public MP4 fallback for testing
    const TEST_FALLBACK = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    setTimeout(() => {
        try {
            if ((!videoElement.hlsInstance && !videoElement.src) || videoElement.src === '') {
                if (statusElement) statusElement.textContent = 'A carregar reprodução de teste...';
                videoElement.crossOrigin = 'anonymous';
                videoElement.src = TEST_FALLBACK;
                videoElement.play().then(() => {
                    if (statusElement) statusElement.textContent = 'Reprodução de teste ativa';
                }).catch(e => {
                    console.warn('Test fallback autoplay blocked', e);
                    if (statusElement) statusElement.textContent = 'Reprodução de teste pronta (clique em play)';
                });
            }
        } catch (err) {
            console.warn('Test fallback failed:', err);
        }
    }, 800);
}

/**
 * Initialize audio controls for media player
 */
export function initAudioControls(audioElement) {
    const playBtn = document.getElementById('radio-play-btn');
    const stopBtn = document.getElementById('radio-stop-btn');
    const muteBtn = document.getElementById('radio-mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.getElementById('audio-progress-bar');
    const currentTimeDisplay = document.getElementById('current-time');
    
    if (volumeSlider) {
        audioElement.volume = volumeSlider.value / 100;
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (audioElement.paused) {
                audioElement.play()
                    .then(() => updatePlayPauseButton(audioElement, true))
                    .catch(e => console.error('Play error:', e));
            } else {
                audioElement.pause();
                updatePlayPauseButton(audioElement, false);
            }
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            audioElement.pause();
            try {
                audioElement.currentTime = 0;
            } catch (e) {
                console.log('Seek not supported');
            }
            updatePlayPauseButton(audioElement, false);
        });
    }
    
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            audioElement.muted = !audioElement.muted;
            muteBtn.textContent = audioElement.muted ? '🔇' : '🔊';
        });
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audioElement.volume = e.target.value / 100;
            muteBtn.textContent = audioElement.volume === 0 ? '🔇' : 
                                 audioElement.volume < 0.5 ? '🔉' : '🔊';
        });
    }
    
    audioElement.addEventListener('timeupdate', () => {
        if (progressBar && isFinite(audioElement.duration)) {
            progressBar.style.width = (audioElement.currentTime / audioElement.duration) * 100 + '%';
        }
    });
}

/**
 * Initialize video controls for EDM player
 */
export function initVideoControls(videoElement) {
    const playBtn = document.getElementById('video-play-btn');
    const stopBtn = document.getElementById('video-stop-btn');
    const muteBtn = document.getElementById('video-mute-btn');
    const volumeSlider = document.getElementById('video-volume-slider');
    const progressBar = document.getElementById('video-progress-bar');
    
    if (volumeSlider) {
        videoElement.volume = volumeSlider.value / 100;
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (videoElement.paused) {
                videoElement.play()
                    .then(() => updateVideoPlayPauseButton(videoElement, true))
                    .catch(e => console.error('Play error:', e));
            } else {
                videoElement.pause();
                updateVideoPlayPauseButton(videoElement, false);
            }
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            videoElement.pause();
            try {
                videoElement.currentTime = 0;
            } catch (e) {
                console.log('Seek not supported');
            }
            updateVideoPlayPauseButton(videoElement, false);
        });
    }
    
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            videoElement.muted = !videoElement.muted;
            muteBtn.textContent = videoElement.muted ? '🔇' : '🔊';
        });
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            videoElement.volume = e.target.value / 100;
            muteBtn.textContent = videoElement.volume === 0 ? '🔇' : 
                                 videoElement.volume < 0.5 ? '🔉' : '🔊';
        });
    }
    
    videoElement.addEventListener('timeupdate', () => {
        if (progressBar && isFinite(videoElement.duration)) {
            progressBar.style.width = (videoElement.currentTime / videoElement.duration) * 100 + '%';
        }
    });
}

/**
 * Update play/pause button UI
 */
export function updatePlayPauseButton(audioElement, isPlaying) {
    const playBtn = document.getElementById('radio-play-btn');
    if (playBtn) {
        const playIcon = playBtn.querySelector('.play-icon');
        const pauseIcon = playBtn.querySelector('.pause-icon');
        if (playIcon && pauseIcon) {
            if (isPlaying) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'inline';
            } else {
                playIcon.style.display = 'inline';
                pauseIcon.style.display = 'none';
            }
        }
    }
}

/**
 * Update video play/pause button UI
 */
export function updateVideoPlayPauseButton(videoElement, isPlaying) {
    const playBtn = document.getElementById('video-play-btn');
    if (playBtn) {
        const playIcon = playBtn.querySelector('.play-icon');
        const pauseIcon = playBtn.querySelector('.pause-icon');
        if (playIcon && pauseIcon) {
            if (isPlaying) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'inline';
            } else {
                playIcon.style.display = 'inline';
                pauseIcon.style.display = 'none';
            }
        }
    }
}

/**
 * Update "now playing" information
 */
export function updateNowPlaying(text) {
    const nowPlayingInfo = document.getElementById('now-playing-info');
    if (nowPlayingInfo) {
        const marquee = nowPlayingInfo.querySelector('.marquee span');
        if (marquee) {
            marquee.textContent = text;
        }
    }
}

/**
 * Update EDM "now playing" information
 */
export function updateEDMNowPlaying(text) {
    const nowPlayingInfo = document.getElementById('edm-now-playing-info');
    if (nowPlayingInfo) {
        const marquee = nowPlayingInfo.querySelector('.marquee span');
        if (marquee) {
            marquee.textContent = text;
        }
    }
}

/**
 * Resize video container based on dimensions
 */
export function resizeVideoContainer() {
    const videoContainer = document.querySelector('.video-container');
    const videoElement = document.getElementById('edm-video');
    
    if (videoContainer && videoElement && videoElement.videoWidth) {
        const aspectRatio = videoElement.videoWidth / videoElement.videoHeight || 16/9;
        const containerWidth = videoContainer.clientWidth;
        const height = containerWidth / aspectRatio;
        
        videoContainer.style.height = Math.min(Math.max(height, 240), 480) + 'px';
    }
}
