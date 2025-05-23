// Video generation page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const videoPage = document.getElementById('video-page');
    if (!videoPage) return;
    
    const uploadArea = document.getElementById('audio-upload-area');
    const audioFileInput = document.getElementById('audio-file');
    const uploadedPreview = document.getElementById('uploaded-audio-preview');
    const audioNameElement = document.getElementById('audio-name');
    const audioSizeElement = document.getElementById('audio-size');
    const previewAudioBtn = document.getElementById('preview-audio-btn');
    const removeAudioBtn = document.getElementById('remove-audio-btn');
    const audioPreview = document.getElementById('audio-preview');
    const generateVideoBtn = document.getElementById('generate-video-btn');
    const videoResult = document.getElementById('video-result');
    const styleOptions = document.querySelectorAll('.video-form-container .style-option');
    
    let selectedAudioFile = null;
    let selectedStyle = 'Pop'; // Default style, corresponds to English
    
    // Initialize style selection
    styleOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from other options
            styleOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to the current option
            this.classList.add('active');
            // Update selected style
            selectedStyle = this.getAttribute('data-style');
        });
    });
    
    // Select the first style by default
    if (styleOptions.length > 0) {
        styleOptions[0].classList.add('active');
    }
    
    // Upload area click event
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            audioFileInput.click();
        });
    }
    
    // Drag and drop upload functionality
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            if (e.dataTransfer.files.length > 0) {
                handleAudioFile(e.dataTransfer.files[0]);
            }
        });
    }
    
    // File selection event
    if (audioFileInput) {
        audioFileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                handleAudioFile(this.files[0]);
            }
        });
    }
    
    // Handle audio file
    function handleAudioFile(file) {
        // Check file type
        if (!file.type.startsWith('audio/')) {
            alert('Please upload an audio file!');
            return;
        }
        
        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            alert('File size cannot exceed 50MB!');
            return;
        }
        
        selectedAudioFile = file;
        
        // Display file information
        audioNameElement.textContent = file.name;
        audioSizeElement.textContent = formatFileSize(file.size);
        uploadedPreview.style.display = 'flex';
        
        // Create audio preview URL
        const audioURL = URL.createObjectURL(file);
        audioPreview.src = audioURL;
    }
    
    // Preview audio
    if (previewAudioBtn) {
        previewAudioBtn.addEventListener('click', function() {
            if (audioPreview.style.display === 'none') {
                audioPreview.style.display = 'block';
                audioPreview.play();
                this.innerHTML = '<i class="fas fa-pause"></i> Pause';
            } else {
                if (audioPreview.paused) {
                    audioPreview.play();
                    this.innerHTML = '<i class="fas fa-pause"></i> Pause';
                } else {
                    audioPreview.pause();
                    this.innerHTML = '<i class="fas fa-play"></i> Preview';
                }
            }
        });
    }
    
    // Audio playback ended event
    if (audioPreview) {
        audioPreview.addEventListener('ended', function() {
            previewAudioBtn.innerHTML = '<i class="fas fa-play"></i> Preview';
        });
    }
    
    // Remove audio file
    if (removeAudioBtn) {
        removeAudioBtn.addEventListener('click', function() {
            selectedAudioFile = null;
            uploadedPreview.style.display = 'none';
            audioPreview.style.display = 'none';
            audioPreview.pause();
            audioPreview.src = '';
            audioFileInput.value = '';
        });
    }
    
    // Generate video button click event
    if (generateVideoBtn) {
        generateVideoBtn.addEventListener('click', function() {
            showCustomDialog('This feature is under development, please stay tuned...');
            // return; // If you don't want subsequent logic to execute, you can return directly
        });
    }

    // Custom dialog function
    function showCustomDialog(message) {
        // If a dialog already exists, don't create another one
        if (document.getElementById('custom-dialog')) return;
        const dialog = document.createElement('div');
        dialog.id = 'custom-dialog';
        dialog.className = 'custom-dialog-mask';
        dialog.innerHTML = `
            <div class="custom-dialog-box">
                <div class="custom-dialog-content">${message}</div>
                <button class="custom-dialog-btn">OK</button>
            </div>
        `;
        document.body.appendChild(dialog);
        dialog.querySelector('.custom-dialog-btn').onclick = function() {
            document.body.removeChild(dialog);
        };
    }
    
    // Display generated video
    function displayGeneratedVideo() {
        // Use example video here, in a real project, use the video URL returned by the API
        const videoSrc = 'https://example.com/sample-video.mp4';
        
        videoResult.innerHTML = `
            <div class="video-player-container">
                <video class="video-player" controls>
                    <source src="${videoSrc}" type="video/mp4">
                    Your browser does not support HTML5 video.
                </video>
            </div>
            <div class="video-controls">
                <button class="video-download-btn">
                    <i class="fas fa-download"></i> Download Video
                </button>
                <button class="video-share-btn">
                    <i class="fas fa-share-alt"></i> Share
                </button>
            </div>
        `;
        
        // Add download button event
        const downloadBtn = videoResult.querySelector('.video-download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                // Create a download link
                const a = document.createElement('a');
                a.href = videoSrc;
                a.download = 'GrooveMe-MV.mp4';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        }
        
        // 添加分享按钮事件
        const shareBtn = videoResult.querySelector('.video-share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function() {
                // 如果浏览器支持Web Share API
                if (navigator.share) {
                    navigator.share({
                        title: 'GrooveMe生成的MV视频',
                        text: '看看我用GrooveMe生成的MV视频！',
                        url: window.location.href
                    })
                    .catch(error => console.log('分享失败:', error));
                } else {
                    // 复制链接到剪贴板
                    const dummy = document.createElement('input');
                    document.body.appendChild(dummy);
                    dummy.value = window.location.href;
                    dummy.select();
                    document.execCommand('copy');
                    document.body.removeChild(dummy);
                    
                    alert('链接已复制到剪贴板！');
                }
            });
        }
    }
    
    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    }
});