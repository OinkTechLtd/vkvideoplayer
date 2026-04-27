// VK SDK Player - Universal player for all video types
// Uses VK-styled player interface (like original-player.html) for ALL video types
// Works with vk.com, rutube.ru, ok.ru, youtube, mp4, m3u8, etc.

(function() {
    'use strict';

    let playerContainer = null;

    // Initialize VK Player
    function initVKPlayer(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[VK Player] Container not found:', containerId);
            return null;
        }

        playerContainer = container;
        container.innerHTML = '';
        container.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden;background:#000;margin:0;padding:0;';

        if (options.url) {
            loadVideo(options.url, options.type);
        }

        return {
            load: (url, type) => loadVideo(url, type),
            play: () => {},
            pause: () => {},
            destroy: () => destroyPlayer()
        };
    }

    // Load video by URL and type - ALL use VK-styled iframe wrapper
    function loadVideo(url, type = 'auto') {
        if (!playerContainer) {
            console.error('[VK Player] Player not initialized');
            return;
        }

        if (type === 'auto') {
            type = detectVideoType(url);
        }

        console.log('[VK Player] Loading video:', { url, type });

        // Clear previous content
        playerContainer.innerHTML = '';

        // Create VK-styled player wrapper
        const playerWrapper = createVKPlayerWrapper(url, type);
        playerContainer.appendChild(playerWrapper);
    }

    // Create VK-styled player wrapper (mimics original-player.html style)
    function createVKPlayerWrapper(url, type) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#000;';

        const iframe = document.createElement('iframe');
        iframe.className = 'vk-player-iframe';
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('scrolling', 'no');

        let playerUrl = '';

        switch (type) {
            case 'youtube':
                playerUrl = getYouTubeEmbedUrl(url);
                break;
            case 'vk':
                playerUrl = getVKEmbedUrl(url);
                break;
            case 'ok':
                playerUrl = getOKEmbedUrl(url);
                break;
            case 'rutube':
                playerUrl = getRutubeEmbedUrl(url);
                break;
            case 'hls':
            case 'm3u8':
                playerUrl = getHLSPlayerUrl(url);
                break;
            case 'mp4':
            default:
                playerUrl = getMP4PlayerUrl(url);
                break;
        }

        iframe.src = playerUrl;
        wrapper.appendChild(iframe);
        return wrapper;
    }

    // Get embed URLs for different platforms
    function getYouTubeEmbedUrl(url) {
        const videoId = extractYouTubeId(url);
        return videoId 
            ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`
            : 'about:blank';
    }

    function getVKEmbedUrl(url) {
        const match = url.match(/vk\.com\/(?:video|clip)(-?\d+)_(\d+)/);
        if (!match) return 'about:blank';
        const ownerId = match[1], videoId = match[2];
        return `https://vk.com/video_ext.php?oid=${ownerId}&id=${videoId}&hd=2&autoplay=1`;
    }

    function getOKEmbedUrl(url) {
        const patterns = [
            /ok\.ru\/video\/(\d+)/,
            /ok\.ru\/webapi\/video\/embed\/(\d+)/,
            /ok\.ru\/videoembed\/(\d+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return `https://ok.ru/videoembed/${match[1]}?autoplay=1`;
            }
        }
        return 'about:blank';
    }

    function getRutubeEmbedUrl(url) {
        const patterns = [
            /rutube\.ru\/video\/([a-zA-Z0-9_-]+)/,
            /rutube\.ru\/play\/embed\/([a-zA-Z0-9_-]+)/,
            /rutube\.ru\/player\/\?v=([a-zA-Z0-9_-]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return `https://rutube.ru/play/embed/${match[1]}?autoplay=1`;
            }
        }
        return 'about:blank';
    }

    function getHLSPlayerUrl(url) {
        // Use original-player.html with src parameter for ALL video types
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/original-player.html');
        return `${baseUrl}?src=${encodeURIComponent(url)}&type=hls`;
    }

    function getMP4PlayerUrl(url) {
        // Use original-player.html with src parameter for ALL video types
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/original-player.html');
        return `${baseUrl}?src=${encodeURIComponent(url)}&type=mp4`;
    }

    // Detect video type from URL
    function detectVideoType(url) {
        if (!url) return 'mp4';
        if (url.match(/youtube\.com|youtu\.be/)) return 'youtube';
        if (url.match(/vk\.com\/video|vk\.com\/clip/)) return 'vk';
        if (url.match(/ok\.ru\/video|ok\.ru\/webapi\/video/)) return 'ok';
        if (url.match(/rutube\.ru\/video|rutube\.ru\/play\/embed/)) return 'rutube';
        if (url.toLowerCase().endsWith('.m3u8') || url.includes('/hls/') || url.includes('type=m3u8')) return 'hls';
        if (url.toLowerCase().endsWith('.mpd') || url.includes('/dash/') || url.includes('type=dash')) return 'dash';
        if (url.toLowerCase().endsWith('.mp4') || url.includes('videodelivery.net')) return 'mp4';
        if (url.toLowerCase().includes('stream') || url.toLowerCase().includes('live')) return 'hls';
        return 'mp4';
    }

    function extractYouTubeId(url) {
        const patterns = [
            /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
            /youtu\.be\/([a-zA-Z0-9_-]+)/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
        }
        return null;
    }

    function playVideo() {}
    function pauseVideo() {}
    function destroyPlayer() {
        if (playerContainer) {
            playerContainer.innerHTML = '';
            playerContainer = null;
        }
    }

    window.VKPlayer = {
        init: initVKPlayer,
        load: loadVideo,
        play: playVideo,
        pause: pauseVideo,
        destroy: destroyPlayer,
        detectType: detectVideoType
    };

    window.initPlayer = function(url, type) {
        const container = document.getElementById('vk-player-root') || document.getElementById('playerContainer');
        if (container) {
            return initVKPlayer(container.id, { url, type });
        }
        return null;
    };

    console.log('[VK Player] SDK initialized successfully - uses VK-styled player for all video types');
})();
