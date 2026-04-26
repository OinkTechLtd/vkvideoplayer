// VK SDK Player - Universal player for all video types (m3u8, mp4, youtube, vk, ok.ru, rutube.ru)
// Similar to implementation on cdnvideohub.com
// ALL videos use VK-styled iframe wrapper

(function() {
    'use strict';

    // VK Player instance
    let vkPlayerInstance = null;
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

        const iframe = document.createElement('iframe');
        iframe.id = 'vk-player-iframe';
        iframe.className = 'vk-player-iframe';
        iframe.src = 'about:blank';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'true');
        
        container.appendChild(iframe);

        if (options.url) {
            loadVideo(options.url, options.type);
        }

        return {
            load: (url, type) => loadVideo(url, type),
            play: () => playVideo(),
            pause: () => pauseVideo(),
            destroy: () => destroyPlayer()
        };
    }

    // Load video by URL and type
    function loadVideo(url, type = 'auto') {
        if (!playerContainer) {
            console.error('[VK Player] Player not initialized');
            return;
        }

        const iframe = playerContainer.querySelector('#vk-player-iframe');
        if (!iframe) {
            console.error('[VK Player] Iframe not found');
            return;
        }

        if (type === 'auto') {
            type = detectVideoType(url);
        }

        console.log('[VK Player] Loading video:', { url, type });

        switch (type) {
            case 'youtube':
                loadYouTube(iframe, url);
                break;
            case 'vk':
                loadVKVideo(iframe, url);
                break;
            case 'ok':
                loadOKVideo(iframe, url);
                break;
            case 'rutube':
                loadRutubeVideo(iframe, url);
                break;
            case 'hls':
            case 'm3u8':
                loadHLS(iframe, url);
                break;
            case 'mp4':
            default:
                loadMP4(iframe, url);
                break;
        }
    }

    // Detect video type from URL
    function detectVideoType(url) {
        if (!url) return 'mp4';

        const lowerUrl = url.toLowerCase();

        if (url.match(/youtube\.com|youtu\.be/)) {
            return 'youtube';
        }

        if (url.match(/vk\.com\/video|vk\.com\/clip/)) {
            return 'vk';
        }

        if (url.match(/ok\.ru\/video|ok\.ru\/webapi\/video/)) {
            return 'ok';
        }

        if (url.match(/rutube\.ru\/video|rutube\.ru\/play\/embed/)) {
            return 'rutube';
        }

        if (lowerUrl.endsWith('.m3u8') || lowerUrl.includes('/hls/') || lowerUrl.includes('type=m3u8')) {
            return 'hls';
        }

        if (lowerUrl.endsWith('.mpd') || lowerUrl.includes('/dash/') || lowerUrl.includes('type=dash')) {
            return 'dash';
        }

        if (lowerUrl.endsWith('.mp4') || lowerUrl.includes('videodelivery.net')) {
            return 'mp4';
        }

        if (lowerUrl.includes('stream') || lowerUrl.includes('live')) {
            return 'hls';
        }

        return 'mp4';
    }

    // Create VK-styled player HTML wrapper
    function createVKStyledPlayerHTML(src, platform) {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>VK Player</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { 
            width: 100%; height: 100%; overflow: hidden; background: #000;
            font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
        }
        .player-wrapper {
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            background: #000; position: relative;
        }
        .player-frame { width: 100%; height: 100%; border: none; }
        .vk-branding {
            position: absolute; top: 10px; left: 10px;
            background: rgba(0, 0, 0, 0.6); color: #fff;
            padding: 4px 8px; border-radius: 4px; font-size: 12px;
            opacity: 0; transition: opacity 0.3s; pointer-events: none;
        }
        .player-wrapper:hover .vk-branding { opacity: 1; }
    </style>
</head>
<body>
    <div class="player-wrapper">
        <iframe class="player-frame" src="${src}" frameborder="0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>
        <div class="vk-branding">VK Player</div>
    </div>
    <script>
        document.addEventListener('fullscreenchange', function() {
            if (document.fullscreenElement) {
                document.body.style.background = '#000';
            }
        });
    <\/script>
</body>
</html>`;
    }

    // Load YouTube video with VK-styled wrapper
    function loadYouTube(iframe, url) {
        const videoId = extractYouTubeId(url);
        if (!videoId) {
            console.error('[VK Player] Invalid YouTube URL');
            return;
        }
        const html = createVKStyledPlayerHTML(
            `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`, 
            'youtube'
        );
        iframe.srcdoc = html;
        console.log('[VK Player] YouTube loaded in VK wrapper:', videoId);
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

    // Load VK Video
    function loadVKVideo(iframe, url) {
        const match = url.match(/vk\.com\/(?:video|clip)(-?\d+)_(\d+)/);
        if (!match) {
            console.error('[VK Player] Invalid VK video URL');
            return;
        }
        const ownerId = match[1], videoId = match[2];
        const playerUrl = `https://vk.com/video_ext.php?oid=${ownerId}&id=${videoId}&hd=2&autoplay=1`;
        const html = createVKStyledPlayerHTML(playerUrl, 'vk');
        iframe.srcdoc = html;
        console.log('[VK Player] VK Video loaded:', { ownerId, videoId });
    }

    // Load OK.ru video
    function loadOKVideo(iframe, url) {
        let videoId = null;
        const patterns = [
            /ok\.ru\/video\/(\d+)/,
            /ok\.ru\/webapi\/video\/embed\/(\d+)/,
            /ok\.ru\/videoembed\/(\d+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) { videoId = match[1]; break; }
        }
        if (!videoId) {
            console.error('[VK Player] Invalid OK.ru video URL');
            return;
        }
        const playerUrl = `https://ok.ru/videoembed/${videoId}`;
        const html = createVKStyledPlayerHTML(playerUrl, 'ok');
        iframe.srcdoc = html;
        console.log('[VK Player] OK.ru Video loaded:', videoId);
    }

    // Load RuTube video
    function loadRutubeVideo(iframe, url) {
        let videoId = null;
        const patterns = [
            /rutube\.ru\/video\/([a-zA-Z0-9_-]+)/,
            /rutube\.ru\/play\/embed\/([a-zA-Z0-9_-]+)/,
            /rutube\.ru\/player\/\?v=([a-zA-Z0-9_-]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) { videoId = match[1]; break; }
        }
        if (!videoId) {
            console.error('[VK Player] Invalid RuTube video URL');
            return;
        }
        const playerUrl = `https://rutube.ru/play/embed/${videoId}`;
        const html = createVKStyledPlayerHTML(playerUrl, 'rutube');
        iframe.srcdoc = html;
        console.log('[VK Player] RuTube Video loaded:', videoId);
    }

    // Load HLS stream
    function loadHLS(iframe, url) {
        const safeUrl = url.replace(/'/g, "\\'");
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>VK Player HLS</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: #000; font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif; }
        video { width: 100%; height: 100%; object-fit: contain; }
        .vk-branding { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; opacity: 0; transition: opacity 0.3s; }
        body:hover .vk-branding { opacity: 1; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"><\/script>
</head>
<body style="position:relative">
    <video id="video" autoplay playsinline></video>
    <div class="vk-branding">VK Player</div>
    <script>
        (function() {
            const video = document.getElementById('video');
            const source = '${safeUrl}';
            if (Hls.isSupported()) {
                const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
                hls.loadSource(source); hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(e=>{}));
                hls.on(Hls.Events.ERROR, (evt, data) => {
                    if (data.fatal) {
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
                        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
                        else hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', () => video.play().catch(e=>{}));
            }
        })();
    <\/script>
</body>
</html>`;
        iframe.srcdoc = html;
        console.log('[VK Player] HLS stream loaded');
    }

    // Load MP4 video
    function loadMP4(iframe, url) {
        const safeUrl = url.replace(/"/g, '&quot;');
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>VK Player MP4</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: #000; font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif; }
        video { width: 100%; height: 100%; object-fit: contain; }
        .vk-branding { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; opacity: 0; transition: opacity 0.3s; }
        body:hover .vk-branding { opacity: 1; }
    </style>
</head>
<body style="position:relative">
    <video id="video" autoplay playsinline controls>
        <source src="${safeUrl}" type="video/mp4">
    </video>
    <div class="vk-branding">VK Player</div>
    <script>
        (function() { const video = document.getElementById('video'); video.play().catch(e=>{}); })();
    <\/script>
</body>
</html>`;
        iframe.srcdoc = html;
        console.log('[VK Player] MP4 loaded');
    }

    // Play/Pause/Destroy
    function playVideo() {
        const iframe = playerContainer?.querySelector('#vk-player-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage('{ "event": "command", "func": "playVideo", "args": "" }', '*');
        }
    }

    function pauseVideo() {
        const iframe = playerContainer?.querySelector('#vk-player-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage('{ "event": "command", "func": "pauseVideo", "args": "" }', '*');
        }
    }

    function destroyPlayer() {
        if (playerContainer) {
            playerContainer.innerHTML = '';
            playerContainer = null;
            vkPlayerInstance = null;
        }
    }

    // Expose to global scope
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
        if (container) return initVKPlayer(container.id, { url, type });
        return null;
    };

    console.log('[VK Player] SDK initialized successfully');
})();
