// ------------------------------------------------------------------------------
// media.js - Handles Radio player, EDM player and RSS feed viewer functionality
// ------------------------------------------------------------------------------

// Media player instances
let radioPlayerInstance = null;
let edmPlayerInstance = null;
let hlsInstance = null;
let hlsEdmInstance = null;

// Initialize media features
function initMediaFeatures() {
    // Add event listeners for media buttons
    const radioButton = document.getElementById('winamp-btn');
    const edmButton = document.getElementById('edm-btn');
    const rssButton = document.getElementById('rss-btn');
    const refreshButton = document.getElementById('refresh-btn');

    if (radioButton) {
        radioButton.addEventListener('click', showRadioPlayer);
    }

    if (edmButton) {
        edmButton.addEventListener('click', showEDMPlayer);
    }

    if (rssButton) {
        rssButton.addEventListener('click', showRSSFeed);
    }
    
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshWebsite);
    }
}

// Refresh the website with no-cache
function refreshWebsite() {
    // Play button click sound
    if (typeof playSound === 'function') {
        playSound(AUDIO_SOURCES.startSound);
    }
    
    // Show a Windows-style dialog box
    showWindowsDialog(
        'Reiniciando Website',
        'A página será reiniciada com cache limpo...'
    );
    
    // Set no-cache headers and reload after a short delay
    setTimeout(() => {
        // Add cache-busting query parameter to force a fresh reload
        const cacheBuster = new Date().getTime();
        window.location.href = window.location.pathname + '?nocache=' + cacheBuster;
    }, 1500);
}

// Show Radio player
function showRadioPlayer() {
    // Play button click sound
    if (typeof playSound === 'function') {
        playSound(AUDIO_SOURCES.startSound);
    }

    // If radio player is already running, just show it
    if (radioPlayerInstance) {
        radioPlayerInstance.style.display = 'block';
        return;
    }

    try {
        // Create Radio dialog elements
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
        
        // Create radio player container
        const radioContainer = document.createElement('div');
        radioContainer.className = 'radio-player-container';
        
        // Create radio station info
        const stationInfo = document.createElement('div');
        stationInfo.className = 'radio-station-info';
        stationInfo.innerHTML = `
            <div class="radio-logo">
                <img src="https://cdn-images.rtp.pt/common/img/channels/logos/color-negative/horizontal/antena3.png?w=350&q=90" alt="Antena 3 Logo">
            </div>
            <div class="radio-details">
                <h3>Antena 3</h3>
                <p>Rádio pública portuguesa - Música, cultura e entretenimento</p>
                <div class="radio-status" id="radio-status">A carregar...</div>
            </div>
        `;
        radioContainer.appendChild(stationInfo);
        
        // Create audio element and controls
        const audioElement = document.createElement('audio');
        audioElement.id = 'radio-audio';
        audioElement.controls = true;
        
        // Create custom controls
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
        
        // Add radio element and controls to container
        radioContainer.appendChild(audioElement);
        radioContainer.appendChild(customControls);
        
        
        // Add now playing section
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
        
        // Add radio container to window body
        windowBody.appendChild(radioContainer);
        
        // Assemble the dialog
        titleControls.appendChild(minimizeBtn);
        titleControls.appendChild(maximizeBtn);
        titleControls.appendChild(closeBtn);
        
        titleBar.appendChild(titleText);
        titleBar.appendChild(titleControls);
        
        dialogWindow.appendChild(titleBar);
        dialogWindow.appendChild(windowBody);
        
        dialogOverlay.appendChild(dialogWindow);
        
        // Add to document
        document.body.appendChild(dialogOverlay);
        
        // Position window
        dialogWindow.style.position = 'absolute';
        dialogWindow.style.top = '50%';
        dialogWindow.style.left = '50%';
        dialogWindow.style.transform = 'translate(-50%, -50%)';
        
        // Make window draggable and setup controls
        if (typeof setupWindowControls === 'function') {
            setupWindowControls(dialogWindow, titleBar);
        } else {
            // Fallback if window manager is not available
            if (typeof makeDialogDraggable === 'function') {
                makeDialogDraggable(dialogWindow, titleBar);
            }
        }
        
        // Store instance for later reference
        radioPlayerInstance = dialogWindow;
        
        // Add event listeners
        closeBtn.addEventListener('click', () => {
            // Stop audio when closing
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            
            // Use centralized close function for proper cleanup
            if (typeof closeWindow === 'function') {
                closeWindow(dialogWindow);
            } else {
                // Fallback if window manager function not available
                document.body.removeChild(dialogOverlay);
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
        
        // Initialize HLS.js player
        initHLSPlayer(audioElement);
        
        // Initialize audio controls
        initAudioControls(audioElement);
        
        // Setup quality selector
        setupQualitySelector(audioElement);
        
    } catch (error) {
        console.error('Error initializing Radio player:', error);
        showWindowsDialog('Erro', 'Falha ao carregar o rádio. Por favor, tente novamente mais tarde.');
    }
}

// Show EDM player (Dance Television)
function showEDMPlayer() {
    console.log("EDM button clicked"); // Debug log
    // Play button click sound
    if (typeof playSound === 'function') {
        playSound(AUDIO_SOURCES.startSound);
    }

    // If EDM player is already running, just show it
    if (edmPlayerInstance) {
        edmPlayerInstance.style.display = 'block';
        return;
    }

    try {
        console.log("Creating EDM player"); // Debug log
        // Create EDM dialog elements
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
        
        // Create EDM player container
        const edmContainer = document.createElement('div');
        edmContainer.className = 'edm-player-container';
        
        // Create video element for EDM stream
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        const videoElement = document.createElement('video');
        videoElement.id = 'edm-video';
        videoElement.controls = false;
        videoElement.autoplay = false;
        videoElement.muted = true; // Start muted to avoid autoplay issues
        videoElement.playsInline = true;
        
        videoContainer.appendChild(videoElement);
        
        // Create custom controls
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
        
        // Create station info
        const stationInfo = document.createElement('div');
        stationInfo.className = 'edm-station-info';
        stationInfo.innerHTML = `
            <div class="edm-logo">
                <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Fmedia%2F%3Fmedia_id%3D766470164860572&f=1&ipt=3ac4a4f54989aedb51d3a6e353413e3f523d90bce4bfa524d2c5fff31bd016b8" alt="Dance Television Logo">
            </div>
            <div class="edm-details">
                <h3>Dance Television One</h3>
                <p>Electronic Dance Music - Transmissão ao vivo</p>
                <div class="edm-status" id="edm-status">A carregar...</div>
            </div>
        `;
        
        // Add all components to the container
        edmContainer.appendChild(videoContainer);
        edmContainer.appendChild(customControls);
        edmContainer.appendChild(stationInfo);
        
        // Add now playing section
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
        
        // Add container to window body
        windowBody.appendChild(edmContainer);
        
        // Assemble the dialog
        titleControls.appendChild(minimizeBtn);
        titleControls.appendChild(maximizeBtn);
        titleControls.appendChild(closeBtn);
        
        titleBar.appendChild(titleText);
        titleBar.appendChild(titleControls);
        
        dialogWindow.appendChild(titleBar);
        dialogWindow.appendChild(windowBody);
        
        dialogOverlay.appendChild(dialogWindow);
        
        // Add to document
        document.body.appendChild(dialogOverlay);
        
        // Position window
        dialogWindow.style.position = 'absolute';
        dialogWindow.style.top = '50%';
        dialogWindow.style.left = '50%';
        dialogWindow.style.transform = 'translate(-50%, -50%)';
        
        // Make window draggable and setup controls
        if (typeof setupWindowControls === 'function') {
            setupWindowControls(dialogWindow, titleBar);
        } else {
            // Fallback if window manager is not available
            if (typeof makeDialogDraggable === 'function') {
                makeDialogDraggable(dialogWindow, titleBar);
            }
        }
        
        // Store instance for later reference
        edmPlayerInstance = dialogWindow;
        
        // Add event listeners
        closeBtn.addEventListener('click', () => {
            // Stop video when closing
            if (hlsEdmInstance) {
                hlsEdmInstance.destroy();
                hlsEdmInstance = null;
            }
            
            // Use centralized close function for proper cleanup
            if (typeof closeWindow === 'function') {
                closeWindow(dialogWindow);
            } else {
                // Fallback if window manager function not available
                document.body.removeChild(dialogOverlay);
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
            } else {
                dialogWindow.classList.add('maximized');
                dialogWindow.style.width = '90%';
                dialogWindow.style.height = '80%';
                dialogWindow.style.top = '10%';
                dialogWindow.style.left = '5%';
                dialogWindow.style.transform = 'none';
                
                // Resize video container in maximized mode
                videoContainer.style.height = '70%';
            }
        });
        
        minimizeBtn.addEventListener('click', () => {
            dialogWindow.classList.add('minimized');
            setTimeout(() => {
                dialogWindow.classList.remove('minimized');
            }, 300);
        });
        
        // Initialize HLS.js player for EDM
        initEDMPlayer(videoElement);
        
        // Initialize video controls
        initVideoControls(videoElement);
        
    } catch (error) {
        console.error('Error initializing EDM player:', error);
        showWindowsDialog('Erro', 'Falha ao carregar o stream EDM. Por favor, tente novamente mais tarde.');
    }
}

// Initialize HLS.js player
function initHLSPlayer(audioElement) {
    const streamUrl = 'https://streaming-live.rtp.pt/liveradio/antena380a/chunklist_DVR.m3u8';
    const statusElement = document.getElementById('radio-status');
    
    if (Hls.isSupported()) {
        hlsInstance = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true
        });
        
        // Bind HLS to audio element
        hlsInstance.attachMedia(audioElement);
        
        // Load source
        hlsInstance.on(Hls.Events.MEDIA_ATTACHED, function() {
            hlsInstance.loadSource(streamUrl);
            statusElement.textContent = 'Stream conectado, a carregar...';
        });
        
        // Error handling
        hlsInstance.on(Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        statusElement.textContent = 'Erro de rede, a tentar recuperar...';
                        hlsInstance.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        statusElement.textContent = 'Erro de mídia, a tentar recuperar...';
                        hlsInstance.recoverMediaError();
                        break;
                    default:
                        statusElement.textContent = 'Erro fatal: ' + data.type;
                        hlsInstance.destroy();
                        break;
                }
            }
        });
        
        // Stream loaded
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
            statusElement.textContent = 'Stream carregado, pronto para reproduzir';
            
            // Auto play (with sound muted to comply with browser policies)
            audioElement.muted = true;
            audioElement.play().then(() => {
                // Unmute after a short delay
                setTimeout(() => {
                    audioElement.muted = false;
                    updatePlayPauseButton(audioElement, true);
                }, 500);
            }).catch(e => {
                console.log('Reprodução automática bloqueada pelo navegador', e);
                updatePlayPauseButton(audioElement, false);
            });
        });
        
        // Update stream info
        hlsInstance.on(Hls.Events.FRAG_CHANGED, function() {
            // You could update currently playing info here if available in stream metadata
            updateNowPlaying('Antena 3 - Rádio em Direto');
        });
        
    } else if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        audioElement.src = streamUrl;
        audioElement.addEventListener('loadedmetadata', function() {
            statusElement.textContent = 'Stream carregado, pronto para reproduzir';
            audioElement.play();
        });
        audioElement.addEventListener('error', function() {
            statusElement.textContent = 'Erro ao carregar stream';
        });
    } else {
        statusElement.textContent = 'HLS não suportado neste navegador';
    }
}

// Initialize EDM HLS.js player
function initEDMPlayer(videoElement) {
    const streamUrl = 'https://m1b2.worldcast.tv/dancetelevisionone/2/dancetelevisionone.m3u8';
    const statusElement = document.getElementById('edm-status');
    
    if (Hls.isSupported()) {
        hlsEdmInstance = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true
        });
        
        // Bind HLS to video element
        hlsEdmInstance.attachMedia(videoElement);
        
        // Load source
        hlsEdmInstance.on(Hls.Events.MEDIA_ATTACHED, function() {
            hlsEdmInstance.loadSource(streamUrl);
            statusElement.textContent = 'Stream conectado, a carregar...';
        });
        
        // Error handling
        hlsEdmInstance.on(Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        statusElement.textContent = 'Erro de rede, a tentar recuperar...';
                        hlsEdmInstance.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        statusElement.textContent = 'Erro de mídia, a tentar recuperar...';
                        hlsEdmInstance.recoverMediaError();
                        break;
                    default:
                        statusElement.textContent = 'Erro fatal: ' + data.type;
                        hlsEdmInstance.destroy();
                        break;
                }
            }
        });
        
        // Stream loaded
        hlsEdmInstance.on(Hls.Events.MANIFEST_PARSED, function() {
            statusElement.textContent = 'Stream carregado, pronto para reproduzir';
            
            // Set initial size
            resizeVideoContainer();
            
            // Add event to handle video loading
            videoElement.addEventListener('loadedmetadata', function() {
                resizeVideoContainer();
            });
            
            // Auto play with 50% volume (not muted)
            videoElement.muted = false;
            videoElement.volume = 0.5;
            videoElement.play().then(() => {
                updateVideoPlayPauseButton(videoElement, true);
            }).catch(e => {
                console.log('Reprodução automática bloqueada pelo navegador', e);
                updateVideoPlayPauseButton(videoElement, false);
            });
        });
        
        // Update stream info
        hlsEdmInstance.on(Hls.Events.FRAG_CHANGED, function() {
            // You could update currently playing info here if available in stream metadata
            updateEDMNowPlaying('Dance Television One - Transmissão ao vivo');
        });
        
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoElement.src = streamUrl;
        videoElement.addEventListener('loadedmetadata', function() {
            statusElement.textContent = 'Stream carregado, pronto para reproduzir';
            videoElement.play();
        });
        videoElement.addEventListener('error', function() {
            statusElement.textContent = 'Erro ao carregar stream';
        });
    } else {
        statusElement.textContent = 'HLS não suportado neste navegador';
    }
}

// Resize video container based on video dimensions
function resizeVideoContainer() {
    const videoContainer = document.querySelector('.video-container');
    const videoElement = document.getElementById('edm-video');
    
    if (videoContainer && videoElement) {
        // Set container dimensions based on video aspect ratio
        const aspectRatio = videoElement.videoWidth / videoElement.videoHeight || 16/9;
        const containerWidth = videoContainer.clientWidth;
        const height = containerWidth / aspectRatio;
        
        // Set min/max height constraints
        videoContainer.style.height = Math.min(Math.max(height, 240), 480) + 'px';
    }
}

// Initialize audio controls
function initAudioControls(audioElement) {
    const playBtn = document.getElementById('radio-play-btn');
    const stopBtn = document.getElementById('radio-stop-btn');
    const muteBtn = document.getElementById('radio-mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.getElementById('audio-progress-bar');
    const currentTimeDisplay = document.getElementById('current-time');
    
    // Set initial volume
    audioElement.volume = volumeSlider.value / 100;
    
    // Play/Pause button
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            if (audioElement.paused) {
                audioElement.play()
                    .then(() => updatePlayPauseButton(audioElement, true))
                    .catch(e => console.error('Falha na reprodução:', e));
            } else {
                audioElement.pause();
                updatePlayPauseButton(audioElement, false);
            }
        });
    }
    
    // Stop button
    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            audioElement.pause();
            // For live streams, seeking might not work as expected
            try {
                audioElement.currentTime = 0;
            } catch (e) {
                console.log('Busca não suportada para este stream');
            }
            updatePlayPauseButton(audioElement, false);
        });
    }
    
    // Mute button
    if (muteBtn) {
        muteBtn.addEventListener('click', function() {
            audioElement.muted = !audioElement.muted;
            muteBtn.textContent = audioElement.muted ? '🔇' : '🔊';
        });
    }
    
    // Volume slider
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            audioElement.volume = this.value / 100;
            
            // Update mute button based on volume
            if (audioElement.volume === 0) {
                muteBtn.textContent = '🔇';
            } else if (audioElement.volume < 0.5) {
                muteBtn.textContent = '🔉';
            } else {
                muteBtn.textContent = '🔊';
            }
        });
    }
    
    // Time update for progress bar
    audioElement.addEventListener('timeupdate', function() {
        // Live streams might not have duration or reliable currentTime
        if (!isNaN(audioElement.duration) && isFinite(audioElement.duration)) {
            const percent = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = percent + '%';
            
            // Format time display
            const minutes = Math.floor(audioElement.currentTime / 60);
            const seconds = Math.floor(audioElement.currentTime % 60);
            currentTimeDisplay.textContent = 
                (minutes < 10 ? '0' : '') + minutes + ':' + 
                (seconds < 10 ? '0' : '') + seconds;
        } else {
            // For live streams, show an animated progress bar
            progressBar.style.width = '100%';
            progressBar.classList.add('sending-progress');
            currentTimeDisplay.textContent = 'Ao Vivo';
        }
    });
    
    // Listen for play/pause events to update UI
    audioElement.addEventListener('play', function() {
        updatePlayPauseButton(audioElement, true);
    });
    
    audioElement.addEventListener('pause', function() {
        updatePlayPauseButton(audioElement, false);
    });
}

// Initialize video controls
function initVideoControls(videoElement) {
    const playBtn = document.getElementById('video-play-btn');
    const stopBtn = document.getElementById('video-stop-btn');
    const muteBtn = document.getElementById('video-mute-btn');
    const volumeSlider = document.getElementById('video-volume-slider');
    const progressBar = document.getElementById('video-progress-bar');
    const currentTimeDisplay = document.getElementById('video-current-time');
    const fullscreenBtn = document.getElementById('video-fullscreen-btn');
    
    // Set initial volume
    videoElement.volume = volumeSlider.value / 100;
    
    // Play/Pause button
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            if (videoElement.paused) {
                videoElement.play()
                    .then(() => updateVideoPlayPauseButton(videoElement, true))
                    .catch(e => console.error('Falha na reprodução:', e));
            } else {
                videoElement.pause();
                updateVideoPlayPauseButton(videoElement, false);
            }
        });
    }
    
    // Stop button
    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            videoElement.pause();
            // For live streams, seeking might not work as expected
            try {
                videoElement.currentTime = 0;
            } catch (e) {
                console.log('Busca não suportada para este stream');
            }
            updateVideoPlayPauseButton(videoElement, false);
        });
    }
    
    // Mute button
    if (muteBtn) {
        muteBtn.addEventListener('click', function() {
            videoElement.muted = !videoElement.muted;
            muteBtn.textContent = videoElement.muted ? '🔇' : '🔊';
        });
    }
    
    // Volume slider
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            videoElement.volume = this.value / 100;
            
            // Update mute button based on volume
            if (videoElement.volume === 0) {
                muteBtn.textContent = '🔇';
            } else if (videoElement.volume < 0.5) {
                muteBtn.textContent = '🔉';
            } else {
                muteBtn.textContent = '🔊';
            }
        });
    }
    
    // Fullscreen button
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            } else if (videoElement.webkitRequestFullscreen) {
                videoElement.webkitRequestFullscreen();
            } else if (videoElement.msRequestFullscreen) {
                videoElement.msRequestFullscreen();
            }
        });
    }
    
    // Time update for progress bar
    videoElement.addEventListener('timeupdate', function() {
        // Live streams might not have duration or reliable currentTime
        if (!isNaN(videoElement.duration) && isFinite(videoElement.duration)) {
            const percent = (videoElement.currentTime / videoElement.duration) * 100;
            progressBar.style.width = percent + '%';
            
            // Format time display
            const minutes = Math.floor(videoElement.currentTime / 60);
            const seconds = Math.floor(videoElement.currentTime % 60);
            currentTimeDisplay.textContent = 
                (minutes < 10 ? '0' : '') + minutes + ':' + 
                (seconds < 10 ? '0' : '') + seconds;
        } else {
            // For live streams, show an animated progress bar
            progressBar.style.width = '100%';
            progressBar.classList.add('sending-progress');
            currentTimeDisplay.textContent = 'Ao Vivo';
        }
    });
    
    // Listen for play/pause events to update UI
    videoElement.addEventListener('play', function() {
        updateVideoPlayPauseButton(videoElement, true);
    });
    
    videoElement.addEventListener('pause', function() {
        updateVideoPlayPauseButton(videoElement, false);
    });
}

// Update play/pause button state
function updatePlayPauseButton(audioElement, isPlaying) {
    const playBtn = document.getElementById('radio-play-btn');
    if (!playBtn) return;
    
    const playIcon = playBtn.querySelector('.play-icon');
    const pauseIcon = playBtn.querySelector('.pause-icon');
    
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
    } else {
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
    }
}

// Update video play/pause button state
function updateVideoPlayPauseButton(videoElement, isPlaying) {
    const playBtn = document.getElementById('video-play-btn');
    if (!playBtn) return;
    
    const playIcon = playBtn.querySelector('.play-icon');
    const pauseIcon = playBtn.querySelector('.pause-icon');
    
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
    } else {
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
    }
}

// Setup quality selector
function setupQualitySelector(audioElement) {
    const qualityRadios = document.querySelectorAll('input[name="radio-quality"]');
    
    qualityRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Store current playback state
            const wasPlaying = !audioElement.paused;
            
            // Destroy current HLS instance
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            
            // Get selected quality
            const quality = this.value;
            let streamUrl = 'https://streaming-live.rtp.pt/liveradio/antena380a/chunklist_DVR.m3u8';
            
            // Different quality URLs (these are examples, as the actual URLs might differ)
            if (quality === 'medium') {
                streamUrl = 'https://streaming-live.rtp.pt/liveradio/antena380a/chunklist_DVR.m3u8';
            } else if (quality === 'low') {
                streamUrl = 'https://streaming-live.rtp.pt/liveradio/antena340a/chunklist_DVR.m3u8';
            }
            
            // Reinitialize player with new quality
            initHLSPlayer(audioElement);
            
            // Restore playback state if it was playing
            if (wasPlaying) {
                audioElement.play().catch(e => console.error('Falha na reprodução:', e));
            }
        });
    });
}

// Update now playing information
function updateNowPlaying(text) {
    const nowPlayingInfo = document.getElementById('now-playing-info');
    if (nowPlayingInfo) {
        const marquee = nowPlayingInfo.querySelector('.marquee span');
        if (marquee) {
            marquee.textContent = text;
        }
    }
}

// Update EDM now playing information
function updateEDMNowPlaying(text) {
    const nowPlayingInfo = document.getElementById('edm-now-playing-info');
    if (nowPlayingInfo) {
        const marquee = nowPlayingInfo.querySelector('.marquee span');
        if (marquee) {
            marquee.textContent = text;
        }
    }
}

// Show RSS feed
function showRSSFeed() {
    // Play button click sound
    if (typeof playSound === 'function') {
        playSound(AUDIO_SOURCES.startSound);
    }
    
    try {
        // Create RSS dialog elements
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay';
        
        const dialogWindow = document.createElement('div');
        dialogWindow.className = 'window rss-window';
        
        const titleBar = document.createElement('div');
        titleBar.className = 'title-bar';
        
        const titleText = document.createElement('div');
        titleText.className = 'title-bar-text';
        titleText.textContent = 'Leitor de Feed RSS';
        
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
        
        // Create RSS feed container
        const rssContainer = document.createElement('div');
        rssContainer.className = 'rss-container';
        rssContainer.innerHTML = `
            <div class="loading-indicator">
                <div class="win7-progress-bar">
                    <div class="win7-progress-green sending-progress" style="width: 100%"></div>
                </div>
                <div class="loading-text">A carregar notícias...</div>
            </div>
        `;
        
        // Assemble the dialog
        titleControls.appendChild(minimizeBtn);
        titleControls.appendChild(maximizeBtn);
        titleControls.appendChild(closeBtn);
        
        titleBar.appendChild(titleText);
        titleBar.appendChild(titleControls);
        
        dialogWindow.appendChild(titleBar);
        windowBody.appendChild(rssContainer);
        dialogWindow.appendChild(windowBody);
        
        dialogOverlay.appendChild(dialogWindow);
        
        // Add to document
        document.body.appendChild(dialogOverlay);
        
        // Position window
        dialogWindow.style.position = 'absolute';
        dialogWindow.style.top = '50%';
        dialogWindow.style.left = '50%';
        dialogWindow.style.transform = 'translate(-50%, -50%)';
        
        // Make window draggable and setup controls
        if (typeof setupWindowControls === 'function') {
            setupWindowControls(dialogWindow, titleBar);
        } else {
            // Fallback if window manager is not available
            makeFeedWindowDraggable(dialogWindow, titleBar);
        }
        
        // Add event listeners for window controls
        closeBtn.addEventListener('click', () => {
            // Use centralized close function for proper cleanup
            if (typeof closeWindow === 'function') {
                closeWindow(dialogWindow);
            } else {
                // Fallback if window manager function not available
                document.body.removeChild(dialogOverlay);
            }
        });
        
        // Load RSS feed
        loadRSSFeed(rssContainer);
        
    } catch (error) {
        console.error('Error displaying RSS feed:', error);
        showWindowsDialog('Erro', 'Falha ao carregar o feed RSS. Por favor, tente novamente mais tarde.');
    }
}

// Make RSS window draggable
function makeFeedWindowDraggable(dialogWindow, titleBar) {
    let isDragging = false;
    let offsetX, offsetY;
    
    // Mouse down event on title bar starts dragging
    titleBar.addEventListener('mousedown', function(e) {
        // Don't initiate drag if clicking on a control button
        if (e.target.tagName === 'BUTTON') return;
        
        isDragging = true;
        
        // Calculate the offset from the mouse position to the window position
        const rect = dialogWindow.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Add a subtle transition when dragging starts
        dialogWindow.style.transition = 'none';
        
        // Change cursor to grabbing
        titleBar.style.cursor = 'grabbing';
        
        // Prevent text selection during drag
        e.preventDefault();
    });
    
    // Mouse move event handles the dragging
    function moveHandler(e) {
        if (!isDragging) return;
        
        // Calculate new position
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        // Update window position
        dialogWindow.style.left = x + 'px';
        dialogWindow.style.top = y + 'px';
        dialogWindow.style.transform = 'none';
    }
    
    // Mouse up event ends dragging
    function upHandler() {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Reset cursor
        titleBar.style.cursor = 'move';
        
        // Add a subtle transition when dragging ends
        dialogWindow.style.transition = 'box-shadow 0.2s ease';
    }
    
    // Add event listeners
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    
    // Remove event listeners when window is closed
    dialogWindow.addEventListener('DOMNodeRemoved', function() {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
    });
}

// Load RSS feed data
function loadRSSFeed(container) {
    // Use RSS-Parser library to fetch and parse RSS feed
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
    const RSS_URL = 'https://news.google.com/rss?hl=pt-PT&gl=PT&ceid=PT:pt-150';
    
    // Create new RSS parser instance
    const parser = new RSSParser();
    
    // Fetch and parse the RSS feed
    parser.parseURL(CORS_PROXY + RSS_URL)
        .then(feed => {
            // Process feed data
            displayRSSFeed(container, feed);
        })
        .catch(error => {
            console.error('Error fetching RSS feed:', error);
            container.innerHTML = `
                <div class="rss-error">
                    <p>Não foi possível carregar o feed RSS.</p>
                    <p class="error-details">Detalhes: ${error.message}</p>
                </div>
            `;
        });
}

// Display RSS feed in the container
function displayRSSFeed(container, feed) {
    // Clear loading indicator
    container.innerHTML = '';
    
    // Add feed header
    const header = document.createElement('div');
    header.className = 'rss-header';
    header.innerHTML = `
        <h3>${feed.title || 'Feed RSS'}</h3>
        <p class="rss-description">${feed.description || ''}</p>
    `;
    container.appendChild(header);
    
    // Check if there are any items
    if (!feed.items || feed.items.length === 0) {
        const noItems = document.createElement('div');
        noItems.className = 'no-items';
        noItems.textContent = 'Não foram encontradas notícias neste feed.';
        container.appendChild(noItems);
        return;
    }
    
    // Create items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'rss-items';
    
    // Add feed items
    feed.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'rss-item';
        
        // Format date
        let dateString = '';
        if (item.pubDate) {
            const date = new Date(item.pubDate);
            dateString = date.toLocaleString('pt-PT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Create item HTML
        itemElement.innerHTML = `
            <div class="rss-item-header">
                <h4>${item.title || 'Sem título'}</h4>
                <span class="rss-date">${dateString}</span>
            </div>
            <div class="rss-content">
                ${item.content || item.contentSnippet || 'Sem conteúdo disponível'}
            </div>
            <div class="rss-item-footer">
                <a href="${item.link}" target="_blank" class="rss-link">Ler mais</a>
            </div>
        `;
        
        itemsContainer.appendChild(itemElement);
    });
    
    container.appendChild(itemsContainer);
}

// Initialize HLS.js player
function initHLSPlayer(audioElement) {
    const streamUrl = 'https://streaming-live.rtp.pt/liveradio/antena380a/chunklist_DVR.m3u8';
    const statusElement = document.getElementById('radio-status');
    
    if (Hls.isSupported()) {
        hlsInstance = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true
        });
        
        // Bind HLS to audio element
        hlsInstance.attachMedia(audioElement);
        
        // Load source
        hlsInstance.on(Hls.Events.MEDIA_ATTACHED, function() {
            hlsInstance.loadSource(streamUrl);
            statusElement.textContent = 'Stream attached, loading...';
        });
        
        // Error handling
        hlsInstance.on(Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        statusElement.textContent = 'Network error, trying to recover...';
                        hlsInstance.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        statusElement.textContent = 'Media error, trying to recover...';
                        hlsInstance.recoverMediaError();
                        break;
                    default:
                        statusElement.textContent = 'Fatal error: ' + data.type;
                        hlsInstance.destroy();
                        break;
                }
            }
        });
        
        // Stream loaded
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
            statusElement.textContent = 'Stream loaded, ready to play';
            
            // Auto play (with sound muted to comply with browser policies)
            audioElement.muted = true;
            audioElement.play().then(() => {
                // Unmute after a short delay
                setTimeout(() => {
                    audioElement.muted = false;
                    updatePlayPauseButton(audioElement, true);
                }, 500);
            }).catch(e => {
                console.log('Auto-play prevented by browser', e);
                updatePlayPauseButton(audioElement, false);
            });
        });
        
        // Update stream info
        hlsInstance.on(Hls.Events.FRAG_CHANGED, function() {
            // You could update currently playing info here if available in stream metadata
            updateNowPlaying('Antena 3 - Live Radio');
        });
        
    } else if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        audioElement.src = streamUrl;
        audioElement.addEventListener('loadedmetadata', function() {
            statusElement.textContent = 'Stream loaded, ready to play';
            audioElement.play();
        });
        audioElement.addEventListener('error', function() {
            statusElement.textContent = 'Error loading stream';
        });
    } else {
        statusElement.textContent = 'HLS not supported in this browser';
    }
}

// Initialize audio controls
function initAudioControls(audioElement) {
    const playBtn = document.getElementById('radio-play-btn');
    const stopBtn = document.getElementById('radio-stop-btn');
    const muteBtn = document.getElementById('radio-mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.getElementById('audio-progress-bar');
    const currentTimeDisplay = document.getElementById('current-time');
    
    // Set initial volume
    audioElement.volume = volumeSlider.value / 100;
    
    // Play/Pause button
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            if (audioElement.paused) {
                audioElement.play()
                    .then(() => updatePlayPauseButton(audioElement, true))
                    .catch(e => console.error('Play failed:', e));
            } else {
                audioElement.pause();
                updatePlayPauseButton(audioElement, false);
            }
        });
    }
    
    // Stop button
    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            audioElement.pause();
            // For live streams, seeking might not work as expected
            try {
                audioElement.currentTime = 0;
            } catch (e) {
                console.log('Seeking not supported for this stream');
            }
            updatePlayPauseButton(audioElement, false);
        });
    }
    
    // Mute button
    if (muteBtn) {
        muteBtn.addEventListener('click', function() {
            audioElement.muted = !audioElement.muted;
            muteBtn.textContent = audioElement.muted ? '🔇' : '🔊';
        });
    }
    
    // Volume slider
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            audioElement.volume = this.value / 100;
            
            // Update mute button based on volume
            if (audioElement.volume === 0) {
                muteBtn.textContent = '🔇';
            } else if (audioElement.volume < 0.5) {
                muteBtn.textContent = '🔉';
            } else {
                muteBtn.textContent = '🔊';
            }
        });
    }
    
    // Time update for progress bar
    audioElement.addEventListener('timeupdate', function() {
        // Live streams might not have duration or reliable currentTime
        if (!isNaN(audioElement.duration) && isFinite(audioElement.duration)) {
            const percent = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = percent + '%';
            
            // Format time display
            const minutes = Math.floor(audioElement.currentTime / 60);
            const seconds = Math.floor(audioElement.currentTime % 60);
            currentTimeDisplay.textContent = 
                (minutes < 10 ? '0' : '') + minutes + ':' + 
                (seconds < 10 ? '0' : '') + seconds;
        } else {
            // For live streams, show an animated progress bar
            progressBar.style.width = '100%';
            progressBar.classList.add('sending-progress');
            currentTimeDisplay.textContent = 'Live';
        }
    });
    
    // Listen for play/pause events to update UI
    audioElement.addEventListener('play', function() {
        updatePlayPauseButton(audioElement, true);
    });
    
    audioElement.addEventListener('pause', function() {
        updatePlayPauseButton(audioElement, false);
    });
}

// Update play/pause button state
function updatePlayPauseButton(audioElement, isPlaying) {
    const playBtn = document.getElementById('radio-play-btn');
    if (!playBtn) return;
    
    const playIcon = playBtn.querySelector('.play-icon');
    const pauseIcon = playBtn.querySelector('.pause-icon');
    
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
    } else {
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
    }
}

// Setup quality selector
function setupQualitySelector(audioElement) {
    const qualityRadios = document.querySelectorAll('input[name="radio-quality"]');
    
    qualityRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Store current playback state
            const wasPlaying = !audioElement.paused;
            
            // Destroy current HLS instance
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            
            // Get selected quality
            const quality = this.value;
            let streamUrl = 'https://streaming-live.rtp.pt/liveradio/antena380a/chunklist_DVR.m3u8';
            
            // Different quality URLs (these are examples, as the actual URLs might differ)
            if (quality === 'medium') {
                streamUrl = 'https://streaming-live.rtp.pt/liveradio/antena380a/chunklist_DVR.m3u8';
            } else if (quality === 'low') {
                streamUrl = 'https://streaming-live.rtp.pt/liveradio/antena340a/chunklist_DVR.m3u8';
            }
            
            // Reinitialize player with new quality
            initHLSPlayer(audioElement);
            
            // Restore playback state if it was playing
            if (wasPlaying) {
                audioElement.play().catch(e => console.error('Play failed:', e));
            }
        });
    });
}

// Update now playing information
function updateNowPlaying(text) {
    const nowPlayingInfo = document.getElementById('now-playing-info');
    if (nowPlayingInfo) {
        const marquee = nowPlayingInfo.querySelector('.marquee span');
        if (marquee) {
            marquee.textContent = text;
        }
    }
}

// Show RSS feed
function showRSSFeed() {
    // Play button click sound
    if (typeof playSound === 'function') {
        playSound(AUDIO_SOURCES.startSound);
    }

    // Create RSS dialog elements
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';
    
    const dialogWindow = document.createElement('div');
    dialogWindow.className = 'window rss-feed-window';
    
    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';
    
    const titleText = document.createElement('div');
    titleText.className = 'title-bar-text';
    titleText.textContent = 'News Feed';
    
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
    
    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'win7-progress loading-indicator';
    loadingDiv.innerHTML = `
        <div class="win7-progress-bar">
            <div class="win7-progress-green"></div>
        </div>
        <div class="loading-text">Loading RSS feed...</div>
    `;
    windowBody.appendChild(loadingDiv);
    
    // Create feed container
    const feedContainer = document.createElement('div');
    feedContainer.className = 'rss-feed-container';
    feedContainer.style.display = 'none';
    windowBody.appendChild(feedContainer);
    
    // Assemble the dialog
    titleControls.appendChild(minimizeBtn);
    titleControls.appendChild(maximizeBtn);
    titleControls.appendChild(closeBtn);
    
    titleBar.appendChild(titleText);
    titleBar.appendChild(titleControls);
    
    dialogWindow.appendChild(titleBar);
    dialogWindow.appendChild(windowBody);
    
    dialogOverlay.appendChild(dialogWindow);
    
    // Add to document
    document.body.appendChild(dialogOverlay);
    
    // Position window
    dialogWindow.style.position = 'absolute';
    dialogWindow.style.top = '50%';
    dialogWindow.style.left = '50%';
    dialogWindow.style.transform = 'translate(-50%, -50%)';
    
    // Make window draggable
    if (typeof makeDialogDraggable === 'function') {
        makeDialogDraggable(dialogWindow, titleBar);
    } else {
        // Fallback draggable implementation
        makeFeedWindowDraggable(dialogWindow, titleBar);
    }
    
    // Add event listeners
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(dialogOverlay);
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
    
    // Load RSS feed
    loadRSSFeed(feedContainer, loadingDiv);
}

// Load RSS feed data
async function loadRSSFeed(container, loadingIndicator) {
    try {
        // Create parser
        const parser = new RSSParser();
        
        // Fetch and parse feed (via proxy to avoid CORS issues)
        const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=';
        const feedUrl = 'https://www.noticiasaominuto.com/rss/ultima-hora';
        const response = await fetch(proxyUrl + encodeURIComponent(feedUrl));
        const data = await response.json();
        
        // Create feed HTML
        let feedHTML = `<div class="rss-header">
            <h3>${data.feed.title || 'News Feed'}</h3>
            <p class="rss-description">${data.feed.description || ''}</p>
        </div>`;
        
        // Add items
        feedHTML += '<div class="rss-items">';
        
        if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const date = new Date(item.pubDate).toLocaleDateString();
                
                feedHTML += `
                <div class="rss-item">
                    <div class="rss-item-header">
                        <h4>${item.title}</h4>
                        <span class="rss-date">${date}</span>
                    </div>
                    <div class="rss-content">
                        ${item.description || item.content || ''}
                    </div>
                    <div class="rss-item-footer">
                        <a href="${item.link}" target="_blank" class="rss-link">Read More</a>
                    </div>
                </div>`;
            });
        } else {
            feedHTML += '<p class="no-items">No feed items found.</p>';
        }
        
        feedHTML += '</div>';
        
        // Update container
        container.innerHTML = feedHTML;
        container.style.display = 'block';
        loadingIndicator.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading RSS feed:', error);
        container.innerHTML = `
        <div class="rss-error">
            <p>Error loading feed. Please try again later.</p>
            <p class="error-details">${error.message}</p>
        </div>`;
        container.style.display = 'block';
        loadingIndicator.style.display = 'none';
    }
}

// Fallback draggable implementation (if makeDialogDraggable is not available)
function makeFeedWindowDraggable(dialogWindow, titleBar) {
    let isDragging = false;
    let offsetX, offsetY;
    
    // Mouse down event on title bar starts dragging
    titleBar.addEventListener('mousedown', function(e) {
        // Don't initiate drag if clicking on a control button
        if (e.target.tagName === 'BUTTON') return;
        
        isDragging = true;
        
        // Calculate the offset from the mouse position to the window position
        const rect = dialogWindow.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Remove transition while dragging
        dialogWindow.style.transition = 'none';
        
        // Change cursor to grabbing
        titleBar.style.cursor = 'grabbing';
        
        // Prevent text selection during drag
        e.preventDefault();
    });
    
    // Mouse move event handles the dragging
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        // Calculate new position
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        // Update window position
        dialogWindow.style.left = x + 'px';
        dialogWindow.style.top = y + 'px';
        dialogWindow.style.transform = 'none';
    });
    
    // Mouse up event ends dragging
    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Reset cursor
        titleBar.style.cursor = 'move';
        
        // Add a subtle transition when dragging ends
        dialogWindow.style.transition = 'box-shadow 0.2s ease';
    });
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', initMediaFeatures);


