// ============================================================================
// media-rss.js - RSS feed reader functionality
// ============================================================================
// Responsibility: RSS feed display and management
// Size: ~12KB (extracted from 63KB monolithic file)

import { AUDIO_SOURCES, showWindowsDialog } from './globals.js';

/**
 * Show RSS feed window
 */
export function showRSSFeed() {
    playSound(AUDIO_SOURCES.startSound);
    
    try {
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
        
        titleControls.appendChild(minimizeBtn);
        titleControls.appendChild(maximizeBtn);
        titleControls.appendChild(closeBtn);
        
        titleBar.appendChild(titleText);
        titleBar.appendChild(titleControls);
        
        dialogWindow.appendChild(titleBar);
        windowBody.appendChild(rssContainer);
        dialogWindow.appendChild(windowBody);
        
        dialogOverlay.appendChild(dialogWindow);
        
        document.body.appendChild(dialogOverlay);
        
        dialogWindow.style.position = 'absolute';
        dialogWindow.style.top = '50%';
        dialogWindow.style.left = '50%';
        dialogWindow.style.transform = 'translate(-50%, -50%)';
        
        if (typeof setupWindowControls === 'function') {
            setupWindowControls(dialogWindow, titleBar);
        } else {
            makeFeedWindowDraggable(dialogWindow, titleBar);
        }
        
        closeBtn.addEventListener('click', () => {
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
                    console.warn('[Media RSS] Failed to remove overlay:', err);
                }
            }
        });
        
        loadRSSFeed(rssContainer);
        
    } catch (error) {
        console.error('RSS feed error:', error);
        showWindowsDialog('Erro', 'Falha ao carregar o feed RSS.');
    }
}

/**
 * Make RSS window draggable
 */
export function makeFeedWindowDraggable(dialogWindow, titleBar) {
    let isDragging = false;
    let offsetX, offsetY;
    
    titleBar.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        
        isDragging = true;
        
        const rect = dialogWindow.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        dialogWindow.style.transition = 'none';
        titleBar.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    function moveHandler(e) {
        if (!isDragging) return;
        
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        dialogWindow.style.left = x + 'px';
        dialogWindow.style.top = y + 'px';
        dialogWindow.style.transform = 'none';
    }
    
    function upHandler() {
        if (!isDragging) return;
        isDragging = false;
        titleBar.style.cursor = 'move';
        dialogWindow.style.transition = 'box-shadow 0.2s ease';
    }
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    
    dialogWindow.addEventListener('DOMNodeRemoved', function() {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
    });
}

/**
 * Load RSS feed data
 */
export function loadRSSFeed(container) {
    const CORS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';
    const RSS_URL = 'https://www.rtp.pt/noticias/rss';

    // Try fetch via CORS proxy first, then direct fetch, then show helpful error
    async function tryFetch(url) {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Status code ' + resp.status);
        return resp.text();
    }

    async function parseXmlToFeed(xmlText) {
        const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
        const channel = doc.querySelector('channel');
        const title = channel?.querySelector('title')?.textContent || 'Feed RSS';
        const description = channel?.querySelector('description')?.textContent || '';
        const items = Array.from(doc.querySelectorAll('item')).map(item => ({
            title: item.querySelector('title')?.textContent || 'Sem título',
            link: item.querySelector('link')?.textContent || '#',
            content: item.querySelector('description')?.textContent || '',
            contentSnippet: item.querySelector('description')?.textContent || '',
            pubDate: item.querySelector('pubDate')?.textContent || ''
        }));
        return { title, description, items };
    }

    (async () => {
        try {
            // proxy attempt
            const xml = await tryFetch(CORS_PROXY + encodeURIComponent(RSS_URL));
            const feed = await parseXmlToFeed(xml);
            displayRSSFeed(container, feed);
            return;
        } catch (errProxy) {
            console.warn('Proxy fetch failed, trying direct fetch:', errProxy.message);
        }

        try {
            const xml = await tryFetch(RSS_URL);
            const feed = await parseXmlToFeed(xml);
            displayRSSFeed(container, feed);
            return;
        } catch (errDirect) {
            console.error('RSS fetch error:', errDirect);
            container.innerHTML = `
                <div class="rss-error">
                    <p>Não foi possível carregar o feed RSS automaticamente.</p>
                    <p>Tente configurar um proxy CORS ou verificar ligação de rede.</p>
                    <p class="error-details">Erro: ${errDirect.message}</p>
                </div>
            `;
        }
    })();
}

/**
 * Display RSS feed in container
 */
export function displayRSSFeed(container, feed) {
    container.innerHTML = '';
    
    const header = document.createElement('div');
    header.className = 'rss-header';
    header.innerHTML = `
        <h3>${feed.title || 'Feed RSS'}</h3>
        <p class="rss-description">${feed.description || ''}</p>
    `;
    container.appendChild(header);
    
    if (!feed.items || feed.items.length === 0) {
        const noItems = document.createElement('div');
        noItems.className = 'no-items';
        noItems.textContent = 'Sem notícias disponíveis.';
        container.appendChild(noItems);
        return;
    }
    
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'rss-items';
    
    feed.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'rss-item';
        
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
        
        itemElement.innerHTML = `
            <div class="rss-item-header">
                <h4>${item.title || 'Sem título'}</h4>
                <span class="rss-date">${dateString}</span>
            </div>
            <div class="rss-content">
                ${item.content || item.contentSnippet || 'Sem conteúdo'}
            </div>
            <div class="rss-item-footer">
                <a href="${item.link}" target="_blank" class="rss-link">Ler mais</a>
            </div>
        `;
        
        itemsContainer.appendChild(itemElement);
    });
    
    container.appendChild(itemsContainer);
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
