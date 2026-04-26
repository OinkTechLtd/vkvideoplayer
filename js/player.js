// Player JavaScript - Handles video loading and sharing

// Video type detection patterns
const VIDEO_PATTERNS = {
    vk: [
        /vk\.com\/video(-?\d+)_(\d+)/,
        /vk\.com\/clip(-?\d+)_(\d+)/,
        /m\.vk\.com\/video(-?\d+)_(\d+)/
    ],
    youtube: [
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
        /youtu\.be\/([a-zA-Z0-9_-]+)/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
    ],
    mp4: [
        /\.mp4(\?.*)?$/i,
        /videodelivery\.net/,
        /cdn.*\.mp4/i
    ],
    hls: [
        /\.m3u8(\?.*)?$/i,
        /\/hls\//i,
        /\/m3u8\//i,
        /type=m3u8/i
    ],
    dash: [
        /\.mpd(\?.*)?$/i,
        /\/dash\//i,
        /type=dash/i
    ]
};

// Current video state
let currentVideo = {
    type: null,
    id: null,
    url: null,
    title: ''
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializePlayer();
    checkUrlForVideo();
});

// Initialize event listeners
function initializePlayer() {
    const loadBtn = document.getElementById('loadBtn');
    const videoInput = document.getElementById('videoUrl');
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    // Load button click
    if (loadBtn) {
        loadBtn.addEventListener('click', handleLoadVideo);
    }

    // Enter key in input
    if (videoInput) {
        videoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLoadVideo();
            }
        });
    }

    // Copy link button
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyShareLink);
    }

    // Hint buttons
    document.querySelectorAll('.hint-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            let example = '';
            switch(type) {
                case 'vk':
                    example = 'https://vk.com/video-223245678_456239329';
                    break;
                case 'youtube':
                    example = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                    break;
                case 'mp4':
                    example = 'https://example.com/video.mp4';
                    break;
                case 'hls':
                    example = 'https://zabava-htlive.cdn.ngenix.net/hls/CH_STS_7/variant.m3u8';
                    break;
            }
            videoInput.value = example;
            videoInput.focus();
        });
    });
}

// Handle video loading
function handleLoadVideo() {
    const videoInput = document.getElementById('videoUrl');
    const url = videoInput.value.trim();

    if (!url) {
        showError('Пожалуйста, введите ссылку на видео');
        return;
    }

    showLoading(true);
    hideError();

    // Detect video type
    const videoType = detectVideoType(url);

    if (!videoType) {
        showLoading(false);
        showError('Не удалось определить тип видео. Пожалуйста, проверьте ссылку.');
        return;
    }

    // Extract video ID
    const videoId = extractVideoId(url, videoType);

    if (!videoId) {
        showLoading(false);
        showError('Не удалось извлечь ID видео из ссылки');
        return;
    }

    // Store current video info
    currentVideo = {
        type: videoType,
        id: videoId,
        url: url,
        title: `Видео ${videoType.toUpperCase()}`
    };

    // Load the appropriate player
    setTimeout(() => {
        loadPlayer(videoType, videoId, url);
        showLoading(false);
        updateShareUrl();
        showShareSection();
    }, 500);
}

// Detect video type from URL
function detectVideoType(url) {
    for (const [type, patterns] of Object.entries(VIDEO_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(url)) {
                return type;
            }
        }
    }
    return null;
}

// Extract video ID based on type
function extractVideoId(url, type) {
    switch(type) {
        case 'vk':
            for (const pattern of VIDEO_PATTERNS.vk) {
                const match = url.match(pattern);
                if (match) {
                    return `${match[1]}_${match[2]}`;
                }
            }
            break;
        case 'youtube':
            for (const pattern of VIDEO_PATTERNS.youtube) {
                const match = url.match(pattern);
                if (match) {
                    return match[1];
                }
            }
            break;
        case 'mp4':
        case 'hls':
        case 'dash':
            return url;
    }
    return null;
}

// Load the appropriate player - ALL types use VK SDK Player
function loadPlayer(type, id, url) {
    // Hide all players first
    hideAllPlayers();

    // All video types now use VK SDK Player from original-player.html
    loadVKSDKPlayer(url, type);
}

// Hide all player containers
    document.getElementById('errorMessage')?.classList.add('hidden');
    
    // Show original VK SDK player root - this is our main player now
    const vkRoot = document.getElementById('vk-player-root');
    if (vkRoot) {
        vkRoot.style.display = 'block';
        vkRoot.classList.remove('hidden');
    }
}

// Load VK SDK Player - supports all video types (VK, YouTube, MP4, HLS, DASH)
function loadVKSDKPlayer(url, type = 'mp4') {
    const vkRoot = document.getElementById('vk-player-root');
    
    if (!vkRoot) {
        showError('Плеер не найден. Убедитесь, что original-player.html подключен.');
        return;
    }

    // Show the VK SDK player root
    vkRoot.style.display = 'block';
    vkRoot.innerHTML = '';
    vkRoot.classList.remove('hidden');

    // Determine MIME type based on video type
    let mimeType = 'video/mp4';
    if (type === 'hls' || url.includes('.m3u8') || url.includes('hls')) {
        mimeType = 'application/x-mpegURL';
    } else if (type === 'dash' || url.includes('.mpd')) {
        mimeType = 'application/dash+xml';
    } else if (type === 'youtube') {
        // For YouTube, we still use the direct URL - VK SDK will handle it
        mimeType = 'video/youtube';
    }

    console.log('[VK SDK Player] Loading:', url, 'Type:', type, 'MIME:', mimeType);

    // Call the initPlayer function from original-player.html
    // This uses the VK Video SDK which supports external sources
    if (window.initPlayer && typeof window.initPlayer === 'function') {
        try {
            window.initPlayer(url, mimeType);
            console.log('[VK SDK Player] Successfully initialized with URL:', url);
        } catch (error) {
            console.error('[VK SDK Player] Error initializing:', error);
            showError('Ошибка при инициализации плеера: ' + error.message);
        }
    } else {
        // Fallback: create a simple video element if initPlayer is not available
        console.warn('[VK SDK Player] initPlayer not found, using fallback');
        
        const videoElement = document.createElement('video');
        videoElement.controls = true;
        videoElement.style.cssText = 'width: 100%; height: 100%; background: #000;';
        
        const source = document.createElement('source');
        source.src = url;
        source.type = mimeType;
        
        videoElement.appendChild(source);
        videoElement.innerHTML += 'Ваш браузер не поддерживает это видео.';
        
        vkRoot.appendChild(videoElement);
    }
}

// Expose loadVKSDKPlayer to window for use by original-player.html
window.loadVKSDKPlayer = loadVKSDKPlayer;

// Load YouTube Player
function loadYouTubePlayer(videoId) {
    const container = document.getElementById('youtube-container');
    const iframe = document.getElementById('youtube-player');

    if (!container || !iframe) return;

    container.classList.remove('hidden');

    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;

    console.log('YouTube video loaded:', videoId);
}

// Load MP4/HLS/DASH Player using Video.js from original-player.html
function loadMP4Player(url, type = 'mp4') {
    const container = document.getElementById('mp4-container');
    const video = document.getElementById('mp4-player');
    const source = container.querySelector('source');

    if (!container || !video) {
        // Fallback: try to use the original player via window.initPlayer
        console.log('[VideoHub] MP4 container not found, trying original player...');
        if (window.initPlayer && typeof window.initPlayer === 'function') {
            let mimeType = 'video/mp4';
            if (type === 'hls' || url.includes('.m3u8') || url.includes('hls')) {
                mimeType = 'application/x-mpegURL';
            } else if (type === 'dash' || url.includes('.mpd')) {
                mimeType = 'application/dash+xml';
            }
            window.initPlayer(url, mimeType);
            container?.classList.remove('hidden');
            return;
        }
        showError('Плеер не найден. Убедитесь, что original-player.html подключен.');
        return;
    }

    container.classList.remove('hidden');

    // Determine MIME type based on video type
    let mimeType = 'video/mp4';
    if (type === 'hls' || url.includes('.m3u8') || url.includes('hls')) {
        mimeType = 'application/x-mpegURL';
    } else if (type === 'dash' || url.includes('.mpd')) {
        mimeType = 'application/dash+xml';
    }

    source.src = url;
    source.type = mimeType;
    
    // Reload video
    video.load();
    
    // If using Video.js, reinitialize
    if (video.player && typeof video.player.src === 'function') {
        video.player.src({ type: mimeType, src: url });
        video.player.play().catch(e => console.log('Autoplay prevented:', e));
    }

    console.log(`${type.toUpperCase()} video loaded:`, url, 'MIME:', mimeType);
}

// Show/hide loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.toggle('hidden', !show);
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

// Hide error message
function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

// Update share URL
function updateShareUrl() {
    const shareInput = document.getElementById('shareUrl');
    if (shareInput && currentVideo.id) {
        const baseUrl = window.location.origin + window.location.pathname;
        const hash = `#video-${currentVideo.type}-${currentVideo.id}`;
        shareInput.value = baseUrl + hash;
    }
}

// Show share section
function showShareSection() {
    const shareSection = document.getElementById('shareSection');
    if (shareSection) {
        shareSection.classList.remove('hidden');
    }
}

// Copy share link to clipboard
function copyShareLink() {
    const shareInput = document.getElementById('shareUrl');
    if (shareInput) {
        shareInput.select();
        shareInput.setSelectionRange(0, 99999);

        navigator.clipboard.writeText(shareInput.value).then(() => {
            const copyBtn = document.getElementById('copyLinkBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Скопировано!';
            copyBtn.style.background = 'var(--success-color)';

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 2000);
        }).catch(err => {
            alert('Не удалось скопировать ссылку. Попробуйте вручную.');
        });
    }
}

// Share functions
function shareToVK() {
    const url = encodeURIComponent(document.getElementById('shareUrl').value);
    window.open(`https://vk.com/share.php?url=${url}`, '_blank', 'width=600,height=400');
}

function shareToTelegram() {
    const url = encodeURIComponent(document.getElementById('shareUrl').value);
    window.open(`https://t.me/share/url?url=${url}`, '_blank', 'width=600,height=400');
}

function shareToWhatsApp() {
    const url = encodeURIComponent(document.getElementById('shareUrl').value);
    window.open(`https://api.whatsapp.com/send?text=${url}`, '_blank', 'width=600,height=400');
}

// Check URL hash for video on page load
function checkUrlForVideo() {
    const hash = window.location.hash;
    if (hash.startsWith('#video-')) {
        const parts = hash.replace('#video-', '').split('-');
        if (parts.length >= 2) {
            const type = parts[0];
            const id = parts.slice(1).join('-');

            // Reconstruct full ID for VK (owner_id_video_id)
            let fullId = id;
            let url = '';

            // For HLS/DASH/MP4, the ID is the encoded URL
            if (type === 'hls' || type === 'dash' || type === 'mp4') {
                try {
                    url = decodeURIComponent(id);
                } catch (e) {
                    url = id;
                }
                fullId = url;
            }

            currentVideo = { type, id: fullId, url, title: '' };

            // Set input value for display
            const videoInput = document.getElementById('videoUrl');
            if (videoInput && url) {
                videoInput.value = url;
            }

            // Auto-load the video
            setTimeout(() => {
                loadPlayer(type, fullId, url);
                updateShareUrl();
                showShareSection();
            }, 500);
        }
    }
}

// Make share functions available globally
window.shareToVK = shareToVK;
window.shareToTelegram = shareToTelegram;
window.shareToWhatsApp = shareToWhatsApp;

console.log('Player initialized successfully!');
