// ============================================================================
// iptv-player.js - TDT IPTV Player
// ============================================================================

import { AUDIO_SOURCES, showWindowsDialog } from '../assets/globals.js';
import { initVideoControls } from '../assets/media-utils.js';

let iptvPlayerInstance = null;
let iptvChannels = [];
let iptvEPG = [];
let currentChannelIndex = 0;
let hlsInstance = null;

/**
 * Parses an M3U file text into an array of channel objects.
 */
function parseM3U(m3uText) {
    const lines = m3uText.split('\n');
    const channels = [];
    let currentChannel = { name: 'Unknown Channel', group: '', logo: '', tvgId: '' };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith('#EXTINF:')) {
            // Parse #EXTINF:-1 group-title="TV" tvg-id="..." tvg-logo="...",Channel Name
            const titleMatch = line.match(/,(.+)$/);
            if (titleMatch) {
                currentChannel.name = titleMatch[1].trim();
            }
            
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            if (logoMatch) {
                currentChannel.logo = logoMatch[1];
            }
            
            const idMatch = line.match(/tvg-id="([^"]+)"/);
            if (idMatch) {
                currentChannel.tvgId = idMatch[1];
            }
            
            const groupMatch = line.match(/group-title="([^"]+)"/);
            if (groupMatch) {
                currentChannel.group = groupMatch[1];
            }
        } else if (line.startsWith('#EXTVLCOPT:')) {
            // Ignore VLC options
            continue;
        } else if (line.startsWith('#')) {
            // Other comments
            continue;
        } else if (line.startsWith('http')) {
            // URL found
            if (currentChannel.name === 'Unknown Channel') {
                // If no EXTINF preceded it, use a generic name based on count
                currentChannel.name = `Canal ${channels.length + 1}`;
            }
            currentChannel.url = line;
            channels.push({...currentChannel});
            // Reset for next
            currentChannel = { name: 'Unknown Channel', group: '', logo: '', tvgId: '' };
        }
    }
    return channels;
}

async function fetchChannels() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/LITUATUI/M3UPT/main/M3U/M3UPT.m3u');
        const text = await response.text();
        iptvChannels = parseM3U(text);
        // Filter out youtube links as hls.js cannot play them
        iptvChannels = iptvChannels.filter(c => !c.url.includes('youtube.com') && !c.url.includes('youtu.be'));
    } catch (err) {
        console.error('Failed to fetch M3U:', err);
    }
}

async function fetchEPG() {
    try {
        const targetUrl = 'https://github.com/LITUATUI/M3UPT/raw/main/EPG/epg-m3upt.xml.gz';
        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
        const response = await fetch(proxyUrl);
        
        // Decompress GZIP stream natively
        const ds = new DecompressionStream('gzip');
        const decompressedStream = response.body.pipeThrough(ds);
        const xmlText = await new Response(decompressedStream).text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        const programmes = Array.from(xmlDoc.querySelectorAll('programme'));
        iptvEPG = programmes.map(prog => {
            return {
                channel: prog.getAttribute('channel'),
                start: parseXMLTVDate(prog.getAttribute('start')),
                stop: parseXMLTVDate(prog.getAttribute('stop')),
                title: prog.querySelector('title')?.textContent || 'Sem Título',
                desc: prog.querySelector('desc')?.textContent || ''
            };
        });
        console.log(`[IPTV] Loaded ${iptvEPG.length} EPG entries.`);
    } catch (err) {
        console.error('Failed to fetch EPG:', err);
    }
}

function parseXMLTVDate(dateStr) {
    // Format: YYYYMMDDHHMMSS +ZZZZ
    if (!dateStr) return new Date();
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const hour = dateStr.slice(8, 10);
    const min = dateStr.slice(10, 12);
    const sec = dateStr.slice(12, 14);
    const offset = dateStr.slice(15);
    
    // Create an ISO string that JS can parse natively
    const isoStr = `${year}-${month}-${day}T${hour}:${min}:${sec}${offset}`;
    return new Date(isoStr);
}

function getCurrentProgramme(tvgId) {
    if (!tvgId || iptvEPG.length === 0) return null;
    const now = new Date();
    
    for (let i = 0; i < iptvEPG.length; i++) {
        const prog = iptvEPG[i];
        if (prog.channel === tvgId && now >= prog.start && now <= prog.stop) {
            return prog;
        }
    }
    return null;
}

async function loadChannel(videoElement, index) {
    if (iptvChannels.length === 0) return;
    
    // Wrap around index
    if (index >= iptvChannels.length) index = 0;
    if (index < 0) index = iptvChannels.length - 1;
    
    currentChannelIndex = index;
    const channel = iptvChannels[index];
    
    const nameEl = document.getElementById('iptv-channel-name');
    const statusEl = document.getElementById('iptv-channel-status');
    const epgTitleEl = document.getElementById('iptv-epg-title-text');
    const epgDescEl = document.getElementById('iptv-epg-desc-text');
    
    if (nameEl) nameEl.textContent = channel.name || `Canal ${index + 1}`;
    if (statusEl) statusEl.textContent = 'A carregar...';

    // Update EPG info
    if (epgTitleEl && epgDescEl) {
        const currentProg = getCurrentProgramme(channel.tvgId);
        if (currentProg) {
            epgTitleEl.textContent = currentProg.title;
            epgDescEl.textContent = currentProg.desc;
        } else {
            epgTitleEl.textContent = 'Sem programação disponível';
            epgDescEl.textContent = '';
        }
    }

    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    let streamUrl = channel.url;

    // Basic nested M3U fetch logic (for github urls that point to another m3u)
    if (streamUrl.endsWith('.m3u')) {
        try {
            const nestedRes = await fetch(streamUrl);
            const nestedText = await nestedRes.text();
            const nestedLines = nestedText.split('\n');
            const nestedUrl = nestedLines.find(l => l.trim().startsWith('http'));
            if (nestedUrl) streamUrl = nestedUrl.trim();
        } catch (e) {
            console.warn('Failed to fetch nested M3U:', streamUrl);
        }
    }

    if (Hls.isSupported()) {
        hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(videoElement);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            if (statusEl) statusEl.textContent = 'Em Direto';
            videoElement.play().catch(e => console.log('Autoplay prevented', e));
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                if (statusEl) statusEl.textContent = 'Erro ao carregar';
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error('HLS network error');
                        hlsInstance.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error('HLS media error');
                        hlsInstance.recoverMediaError();
                        break;
                    default:
                        hlsInstance.destroy();
                        break;
                }
            }
        });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = streamUrl;
        videoElement.addEventListener('loadedmetadata', function () {
            if (statusEl) statusEl.textContent = 'Em Direto';
            videoElement.play().catch(e => console.log('Autoplay prevented', e));
        });
        videoElement.addEventListener('error', function () {
            if (statusEl) statusEl.textContent = 'Erro ao carregar';
        });
    }
}

export async function showIPTVPlayer() {
    // playSound
    try {
        const sound = new Audio(AUDIO_SOURCES.startSound);
        sound.volume = AUDIO_SOURCES.volume;
        sound.play().catch(() => {});
    } catch (e) {}

    if (iptvPlayerInstance) {
        iptvPlayerInstance.style.display = 'block';
        return;
    }

    try {
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay';
        
        const dialogWindow = document.createElement('div');
        dialogWindow.className = 'window iptv-player-window';
        
        const titleBar = document.createElement('div');
        titleBar.className = 'title-bar';
        
        const titleText = document.createElement('div');
        titleText.className = 'title-bar-text';
        titleText.textContent = 'TDT - Televisão Digital';
        
        const titleControls = document.createElement('div');
        titleControls.className = 'title-bar-controls';
        
        const closeBtn = document.createElement('button');
        closeBtn.setAttribute('aria-label', 'Close');
        
        titleControls.appendChild(closeBtn);
        titleBar.appendChild(titleText);
        titleBar.appendChild(titleControls);
        
        const windowBody = document.createElement('div');
        windowBody.className = 'window-body';
        
        const container = document.createElement('div');
        container.className = 'iptv-player-container';
        
        const videoContainer = document.createElement('div');
        videoContainer.className = 'iptv-video-container';
        
        const videoElement = document.createElement('video');
        videoElement.id = 'iptv-video';
        videoElement.controls = true; // Use native controls for simplicity
        videoElement.autoplay = true;
        videoElement.muted = false;
        videoElement.playsInline = true;
        
        videoContainer.appendChild(videoElement);
        
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'iptv-controls';
        controlsDiv.innerHTML = `
            <div class="iptv-channel-info">
                <div class="iptv-channel-name" id="iptv-channel-name">A carregar lista de canais...</div>
                <div class="iptv-channel-status" id="iptv-channel-status">Aguarde...</div>
            </div>
            <div class="iptv-nav-buttons">
                <button class="iptv-nav-btn" id="iptv-prev-btn" title="Canal Anterior">▼</button>
                <button class="iptv-nav-btn" id="iptv-next-btn" title="Próximo Canal">▲</button>
            </div>
        `;
        
        const epgDiv = document.createElement('div');
        epgDiv.className = 'iptv-epg-container';
        epgDiv.innerHTML = `
            <div class="iptv-epg-header">A Dar Agora</div>
            <div class="iptv-epg-title" id="iptv-epg-title-text">...</div>
            <div class="iptv-epg-desc" id="iptv-epg-desc-text">...</div>
            <div class="iptv-credits">Lista & EPG por <a href="https://github.com/LITUATUI/M3UPT/" target="_blank">LITUATUI/M3UPT</a></div>
        `;
        
        container.appendChild(videoContainer);
        container.appendChild(controlsDiv);
        container.appendChild(epgDiv);
        windowBody.appendChild(container);
        
        dialogWindow.appendChild(titleBar);
        dialogWindow.appendChild(windowBody);
        dialogOverlay.appendChild(dialogWindow);
        
        document.body.appendChild(dialogOverlay);
        
        dialogWindow.style.position = 'absolute';
        dialogWindow.style.top = '50%';
        dialogWindow.style.left = '50%';
        dialogWindow.style.transform = 'translate(-50%, -50%)';
        
        iptvPlayerInstance = dialogWindow;
        
        closeBtn.addEventListener('click', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            videoElement.pause();
            videoElement.removeAttribute('src');
            videoElement.load();
            
            try {
                if (dialogOverlay.parentNode) {
                    dialogOverlay.parentNode.removeChild(dialogOverlay);
                }
            } catch (err) {}
            iptvPlayerInstance = null;
        });

        // Setup Dragging if function exists
        if (typeof window.makeDraggable === 'function') {
            try { window.makeDraggable(dialogWindow, titleBar); } catch(e){}
        }

        // Fetch channels if empty
        if (iptvChannels.length === 0) {
            await fetchChannels();
        }

        // Fetch EPG if empty
        if (iptvEPG.length === 0) {
            await fetchEPG();
        }

        if (iptvChannels.length > 0) {
            loadChannel(videoElement, 0);
            
            document.getElementById('iptv-prev-btn').addEventListener('click', () => {
                loadChannel(videoElement, currentChannelIndex - 1);
            });
            
            document.getElementById('iptv-next-btn').addEventListener('click', () => {
                loadChannel(videoElement, currentChannelIndex + 1);
            });
        } else {
            document.getElementById('iptv-channel-name').textContent = 'Nenhum canal encontrado.';
            document.getElementById('iptv-channel-status').textContent = 'Erro';
        }
        
    } catch (error) {
        console.error('IPTV player error:', error);
        showWindowsDialog('Erro', 'Falha ao carregar o TDT.');
    }
}
