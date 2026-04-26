// VK SDK Player - Universal player for all video types (m3u8, mp4, youtube, vk)
// Similar to implementation on cdnvideohub.com

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

        // Clear container
        container.innerHTML = '';

        // Create iframe for VK Player
        const iframe = document.createElement('iframe');
        iframe.id = 'vk-player-iframe';
        iframe.className = 'vk-player-iframe';
        iframe.src = 'about:blank';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'true');
        
        container.appendChild(iframe);

        // Initialize player based on type
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

        // Auto-detect video type if not specified
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

        // YouTube patterns
        if (url.match(/youtube\.com|youtu\.be/)) {
            return 'youtube';
        }

        // VK patterns
        if (url.match(/vk\.com\/video|vk\.com\/clip/)) {
            return 'vk';
        }

        // HLS patterns
        if (lowerUrl.endsWith('.m3u8') || lowerUrl.includes('/hls/') || lowerUrl.includes('type=m3u8')) {
            return 'hls';
        }

        // DASH patterns
        if (lowerUrl.endsWith('.mpd') || lowerUrl.includes('/dash/') || lowerUrl.includes('type=dash')) {
            return 'dash';
        }

        // MP4 patterns
        if (lowerUrl.endsWith('.mp4') || lowerUrl.includes('videodelivery.net')) {
            return 'mp4';
        }

        // Default to HLS for streaming URLs
        if (lowerUrl.includes('stream') || lowerUrl.includes('live')) {
            return 'hls';
        }

        return 'mp4';
    }

    // Load YouTube video
    function loadYouTube(iframe, url) {
        const videoId = extractYouTubeId(url);
        if (!videoId) {
            console.error('[VK Player] Invalid YouTube URL');
            return;
        }

        const playerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        iframe.src = playerUrl;
        console.log('[VK Player] YouTube loaded:', videoId);
    }

    // Extract YouTube video ID
    function extractYouTubeId(url) {
        const patterns = [
            /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
            /youtu\.be\/([a-zA-Z0-9_-]+)/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
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

        const ownerId = match[1];
        const videoId = match[2];
        const playerUrl = `https://vk.com/video_ext.php?oid=${ownerId}&id=${videoId}&hd=2&autoplay=1`;
        iframe.src = playerUrl;
        console.log('[VK Player] VK Video loaded:', { ownerId, videoId });
    }

    // Load HLS stream using hls.js embedded in iframe
    function loadHLS(iframe, url) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>VK Player HLS</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: #000; }
        video { width: 100%; height: 100%; object-fit: contain; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"><\/script>
</head>
<body>
    <video id="video" autoplay playsinline></video>
    <script>
        (function() {
            const video = document.getElementById('video');
            const source = '${url.replace(/'/g, "\\'")}';
            
            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    video.play().catch(e => console.log('Autoplay prevented:', e));
                });
                hls.on(Hls.Events.ERROR, function(event, data) {
                    if (data.fatal) {
                        console.error('HLS fatal error:', data);
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                break;
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function() {
                    video.play().catch(e => console.log('Autoplay prevented:', e));
                });
            } else {
                console.error('HLS not supported');
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
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>VK Player MP4</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: #000; }
        video { width: 100%; height: 100%; object-fit: contain; }
    </style>
</head>
<body>
    <video id="video" autoplay playsinline controls>
        <source src="${url.replace(/"/g, '&quot;')}" type="video/mp4">
        Your browser does not support the video tag.
    </video>
    <script>
        (function() {
            const video = document.getElementById('video');
            video.play().catch(e => console.log('Autoplay prevented:', e));
        })();
    <\/script>
</body>
</html>`;

        iframe.srcdoc = html;
        console.log('[VK Player] MP4 loaded');
    }

    // Play video
    function playVideo() {
        const iframe = playerContainer?.querySelector('#vk-player-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage('{ "event": "command", "func": "playVideo", "args": "" }', '*');
        }
    }

    // Pause video
    function pauseVideo() {
        const iframe = playerContainer?.querySelector('#vk-player-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage('{ "event": "command", "func": "pauseVideo", "args": "" }', '*');
        }
    }

    // Destroy player
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

    // Also expose as initPlayer for compatibility
    window.initPlayer = function(url, type) {
        const container = document.getElementById('vk-player-root') || document.getElementById('playerContainer');
        if (container) {
            return initVKPlayer(container.id, { url, type });
        }
        return null;
    };

    console.log('[VK Player] SDK initialized successfully');
})();
