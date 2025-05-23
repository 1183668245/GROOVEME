// Song creation page interaction logic
document.addEventListener('DOMContentLoaded', function() {
    // Get page elements
    const musicPage = document.getElementById('music-page');
    const songLyricsInput = document.getElementById('song-lyrics');
    const styleOptions = document.querySelectorAll('.style-option');
    const genderOptions = document.querySelectorAll('.gender-option');
    const generateMusicBtn = document.getElementById('generate-music-btn');
    const musicResult = document.getElementById('music-result');
    
    // API related constants (if suno-api.js is not imported via module)
    // const API_KEY = 'sk-RC4ixnYnvpH9jJ63835eD349E345494eBb2394FbF4E49553'; // Moved to suno-api.js
    // const SUBMIT_URL = 'https://api.gpt.ge/suno/submit/music'; // Moved to suno-api.js
    // const FETCH_URL_PREFIX = 'https://api.gpt.ge/suno/fetch/'; // Moved to suno-api.js
    
    // Initialize selection state
    let selectedStyle = null;
    let selectedGender = null;
    
    // Style selection event
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
    
    // Gender selection event
    genderOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from other options
            genderOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to the current option
            this.classList.add('active');
            // Update selected gender
            selectedGender = this.getAttribute('data-gender');
        });
    });
    
    // Generate song button click event
    generateMusicBtn.addEventListener('click', async function() { // Note: added async
        // Get user input
        const lyrics = songLyricsInput.value.trim();
        // Validate input
        if (!lyrics) {
            alert('Please enter lyrics content');
            return;
        }
        if (!selectedStyle) {
            alert('Please select a music style');
            return;
        }
        if (!selectedGender) {
            alert('Please select a singer gender');
            return;
        }
        // Show loading state
        musicResult.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Submitting task, please wait...</div>';
       
        try {
            const tags = mapStyleToTags(selectedStyle, selectedGender);
            const lines = lyrics.split('\n').filter(line => line.trim() !== '');
            const title = lines.length > 0 ? lines[0].substring(0, 20) : 'AI Generated Song'; // Title can be more flexible

            // 1. Submit task to Suno API
            // Assume submitSunoMusicTask and fetchSunoMusicResult are globally available via <script> tag
            // Or you need to import them based on your module system
            const taskId = await submitSunoMusicTask(lyrics, title, tags);
            console.log('Suno task submitted. Task ID:', taskId);
            // Update loading message to be more generic, matching screenshot style
            musicResult.innerHTML = `<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Task submitted (ID: ${taskId}). Generating song, please be patient...</div>`;

            // 2. Poll for results
            let taskData = null;
            let attempts = 0;
            const maxAttempts = 60; // Approx 5 minutes (60 * 5s)
            const pollInterval = 5000; // 5 seconds

            while (attempts < maxAttempts) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, pollInterval)); // Wait
                console.log(`Fetching task status, attempt ${attempts}...`);
                taskData = await fetchSunoMusicResult(taskId);
                
                if (taskData.status === 'SUCCESS') {
                    console.log('Suno task completed:', taskData);
                    if (taskData.data && taskData.data.length > 0) {
                        displayMusicResult(taskData, taskId); // Pass taskId for use in loading message
                    } else {
                        musicResult.innerHTML = '<div class="error-message">Song generation successful, but no valid song data returned.</div>';
                        console.error('No song data in successful response:', taskData);
                    }
                    return; // Success, exit loop
                } else if (taskData.status === 'FAIL') {
                    console.error('Suno task failed:', taskData);
                    musicResult.innerHTML = `<div class="error-message">Song generation failed: ${taskData.fail_reason || 'Unknown error'}</div>`;
                    return; // Failure, exit loop
                } else if (taskData.status === 'PROCESSING') {
                    // During song generation, maintain generic loading message, don't show detailed status
                    // musicResult.innerHTML = `<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Task (ID: ${taskId}) is processing (${taskData.progress || 'N/A'})... Please be patient (Attempt ${attempts}/${maxAttempts})</div>`;
                    // console.log(`Task ${taskId} is PROCESSING (Attempt ${attempts}/${maxAttempts})`);
                } else {
                     // Other statuses, e.g., QUEUED or NOT_START, also maintain generic loading message
                    // musicResult.innerHTML = `<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Task (ID: ${taskId}) status: ${taskData.status}. Waiting for processing... (Attempt ${attempts}/${maxAttempts})</div>`;
                    // console.log(`Task ${taskId} status: ${taskData.status} (Attempt ${attempts}/${maxAttempts})`);
                }
                // Ensure that if not in a final state, the loading message remains unchanged or only updates necessary ID
                if (taskData.status !== 'SUCCESS' && taskData.status !== 'FAIL') {
                    musicResult.innerHTML = `<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Task submitted (ID: ${taskId}). Generating song, please be patient...</div>`;
                }
            }

            // Timeout handling
            if (attempts >= maxAttempts) {
                console.error('Suno task timed out.');
                musicResult.innerHTML = '<div class="error-message">Song generation timed out. Please try again later.</div>';
            }

        } catch (error) {
            console.error('Error during music generation process:', error);
            musicResult.innerHTML = `<div class="error-message">An error occurred: ${error.message}</div>`;
        }
    });
    
    // Map style and gender to tags
    function mapStyleToTags(style, gender) {
        // Style mapping
        const styleMap = {
            'Pop': 'pop',
            'Rock': 'rock',
            'Folk': 'folk',
            'Electronic': 'electronic',
            'Hip Hop': 'hip hop',
            'Traditional': 'traditional chinese',
            'Jazz': 'jazz',
            'R&B': 'r&b'
        };
        
        // Gender mapping
        const genderMap = {
            'Male': 'male vocals',
            'Female': 'female vocals',
            'Chorus': 'choir'
        };
        
        // Combine tags
        const styleTags = styleMap[style] || 'pop'; // Default to pop if style not found
        const genderTags = genderMap[gender] || ''; // Default to empty if gender not found
        
        return `${styleTags} ${genderTags}`.trim();
    }
    
    // Create mock music result
    function createMockMusicResult(lyrics, style, gender) {
        // Generate random title
        const lines = lyrics.split('\n').filter(line => line.trim() !== '');
        const title = lines.length > 0 ? lines[0].substring(0, 10) : 'Untitled Song';
        
        // Create mock data
        return {
            data: [{
                title: title,
                audio_url: 'https://example.com/sample-audio.mp3', // Example audio URL
                image_url: '', // Example image URL
                created_at: new Date().toISOString(),
                metadata: {
                    tags: mapStyleToTags(style, gender)
                }
            }]
        };
    }
    
    // Display music generation result
    function displayMusicResult(taskData) {
        // taskData is now the object returned by fetchSunoMusicResult, containing status and data
        // We need taskData.data (which is an array)
        const songs = taskData.data;
        if (!songs || songs.length === 0) {
            musicResult.innerHTML = '<div class="error-message">No generated song data found</div>';
            return;
        }

        // Get the first generated song
        const song = songs[0]; // API might return multiple results, take the first one here
        console.log('Fetched song data for display:', song); // Print fetched song data to console

        // Create song player HTML
        const playerHTML = `
            <div class="music-player">
                <div class="music-info">
                    <div class="music-cover">
                        <img src="${song.image_url || '#'}" alt="${song.title}" onerror="this.onerror=null;this.src='';this.innerHTML='<i class=\'fas fa-music\'></i>'">
                    </div>
                    <div class="music-details">
                        <h3 class="music-title">${song.title}</h3>
                        <p class="music-meta">${song.metadata.tags || 'Unknown Style'} · Generated on ${formatDate(new Date(song.created_at))}</p>
                    </div>
                </div>
                <div class="audio-controls">
                    <audio controls autoplay>
                        <source src="${song.audio_url}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
                <div class="action-buttons">
                    <button id="copy-link-btn" class="action-btn"><i class="fas fa-copy"></i> Copy Link</button>
                    <button id="share-twitter-btn" class="action-btn"><i class="fab fa-twitter"></i> Share on Twitter</button>
                </div>
            </div>
        `;
        
        musicResult.innerHTML = playerHTML;

        // Add button event listener
        const copyLinkBtn = document.getElementById('copy-link-btn');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(song.audio_url).then(() => {
                    alert('Song link copied to clipboard!');
                }).catch(err => {
                    console.error('Could not copy link: ', err);
                    alert('Failed to copy link. Please copy manually.');
                });
            });
        }

        const shareTwitterBtn = document.getElementById('share-twitter-btn');
        if (shareTwitterBtn) {
            shareTwitterBtn.addEventListener('click', function() {
                const twitterShareUrl = `https://x.com/compose/post`;
                window.open(twitterShareUrl, '_blank');
            });
        }
    }
    
    // Format date
    function formatDate(date) {
        return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    }
    
    // Number padding
    function padZero(num) {
        return num < 10 ? '0' + num : num;
    }
    
    // Navigation menu interaction
    const navItems = document.querySelectorAll('.nav-menu li');
    const pageContents = document.querySelectorAll('.page-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            
            // Update navigation menu activation state
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Update page display
            pageContents.forEach(page => {
                if (page.id === targetPage + '-page') {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
        });
    });
});