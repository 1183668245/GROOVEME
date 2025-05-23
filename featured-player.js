// Video playback functionality implementation
document.addEventListener('DOMContentLoaded', function() {
    // Get all clickable video elements
    const carouselItems = document.querySelectorAll('.carousel-item .carousel-content');
    const featuredLargeCard = document.querySelector('.featured-large-card .video-thumbnail');
    const featuredSmallCards = document.querySelectorAll('.featured-small-card .video-thumbnail');
    
    // Create video player modal
    const videoModal = document.createElement('div');
    videoModal.className = 'video-modal';
    videoModal.innerHTML = `
        <div class="video-modal-content">
            <span class="close-video">&times;</span>
            <div class="video-container">
                <video id="video-player" controls>
                    <source src="" type="video/mp4">
                    Your browser does not support video playback.
                </video>
            </div>
        </div>
    `;
    document.body.appendChild(videoModal);
    videoModal.style.display = 'none'; // <--- 添加这一行
    
    // Get video player and close button
    const videoPlayer = document.getElementById('video-player');
    const closeButton = document.querySelector('.close-video');
    
    // Video data mapping - in a real project, this might be fetched from a server
    const videoData = {
        'Build On with B': 'Build On with B.mp4',
        'Siren-Chain Anthem': 'Siren.mp4', 
        '《Mubarak》-区块链之光': '《Mubarak》-区块链之光.mp4', // Keep Chinese if it's a title
        '《SKYAI 天际线》': 'SKYAI天际线.mp4', // Keep Chinese if it's a title
        '你我动听的歌': 'SKYAI天际线.mp4', // Assume this large featured video also uses SKYAI天际线.mp4
        // Mapping for small video cards below
        '宝贝狗之歌': '宝贝狗之歌.mp4', // Corresponds to babydoge.jpg (Keep Chinese if it's a title)
        'Learn withTUT': 'Learn withTUT.mp4', // Corresponds to Learn withTUT.jpg
        'Broccoli的加密王国': '《Broccoli的加密王国》.mp4', // Corresponds to Broccoli.jpg (Keep Chinese if it's a title)
        'FLOKI革命': 'FLOKI革命.mp4', // Corresponds to FLOKI.jpg (Keep Chinese if it's a title)
        'Build On with B ': 'Build On with B.mp4', // Corresponds to Build On with B.jpg (Note the space at the end of the title, keep if it's in app.html, otherwise remove)
        '铁拳颂': '铁拳颂.mp4' // Corresponds to FIST.jpg (Keep Chinese if it's a title)
    };
    
    // Open video modal and play video
    function openVideoModal(videoTitle) {
        const videoSrc = videoData[videoTitle] || ''; // Default video
        videoPlayer.querySelector('source').src = videoSrc;
        videoPlayer.load(); // Reload video source
        videoModal.style.display = 'flex';
        videoPlayer.play();
    }
    
    // Close video modal
    function closeVideoModal() {
        videoModal.style.display = 'none';
        videoPlayer.pause();
    }
    
    // Add click event to carousel items
    carouselItems.forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('.carousel-caption h3').textContent;
            openVideoModal(title);
        });
    });
    
    // Add click event to large featured video
    if (featuredLargeCard) {
        featuredLargeCard.addEventListener('click', function() {
            const title = this.closest('.featured-large-card').querySelector('.video-info h4').textContent;
            openVideoModal(title);
        });
    }
    
    // Add click event to small video cards
    featuredSmallCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.closest('.featured-small-card').querySelector('.video-info h5').textContent;
            openVideoModal(title);
        });
    });
    
    // Close button click event
    closeButton.addEventListener('click', closeVideoModal);
    
    // Click modal background to close
    videoModal.addEventListener('click', function(event) {
        if (event.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // ESC key to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && videoModal.style.display === 'flex') {
            closeVideoModal();
        }
    });
    // Hide all play buttons
    const playOverlays = document.querySelectorAll('.play-overlay');
    playOverlays.forEach(overlay => {
        overlay.style.display = 'none';
    });
});
