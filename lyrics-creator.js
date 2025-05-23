document.addEventListener('DOMContentLoaded', function() {
    // Page switching functionality
    const navItems = document.querySelectorAll('.nav-menu li');
    const pages = document.querySelectorAll('.page-content');
    
    // Ensure only the active page is visible on page load
    function updatePageVisibility() {
        // First, hide all pages
        pages.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
        
        // Find the currently active navigation item
        const activeNav = document.querySelector('.nav-menu li.active');
        if (activeNav) {
            const pageId = activeNav.getAttribute('data-page');
            const activePage = document.getElementById(pageId + '-page');
            if (activePage) {
                activePage.style.display = 'block';
                activePage.classList.add('active');
            }
        }
    }
    
    // Execute once on page load to ensure correct initial state
    updatePageVisibility();
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            
            // Remove active class from all navigation items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to the currently clicked navigation item
            this.classList.add('active');
            
            // Update page visibility
            updatePageVisibility();
        });
    });
    
    // Style tag selection functionality
    const styleTags = document.querySelectorAll('.style-tag');
    let selectedStyles = [];
    
    styleTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const style = this.getAttribute('data-style');
            
            if (this.classList.contains('active')) {
                // If already selected, deselect it
                this.classList.remove('active');
                selectedStyles = selectedStyles.filter(s => s !== style);
            } else {
                // If not selected, select it
                this.classList.add('active');
                selectedStyles.push(style);
            }
        });
    });
    
    // Generate lyrics functionality
    const generateBtn = document.getElementById('generate-lyrics-btn');
    const lyricsGrid = document.getElementById('lyrics-grid');

    // Modify generate button click event handler
    generateBtn.addEventListener('click', async function() {
        const promptText = document.getElementById('lyrics-prompt').value.trim();
        // Get selected style tags (if your API call requires styles)
        const selectedStyleElements = document.querySelectorAll('.style-tag.active');
        const selectedStyles = Array.from(selectedStyleElements).map(tag => tag.getAttribute('data-style'));

        // Build the final prompt, can combine description and styles
        let finalPrompt = promptText;
        if (selectedStyles.length > 0) {
            finalPrompt += " Style: " + selectedStyles.join(', '); 
        }

        if (finalPrompt.trim() === '') {
            alert('Please enter a description or select a style');
            return;
        }

        // Show loading state
        generateBtn.textContent = 'Generating...';
        generateBtn.disabled = true;
        lyricsGrid.innerHTML = ''; // Clear previous lyrics results

        let loadingContainer = document.getElementById('loading-container');
        if (!loadingContainer) {
            loadingContainer = document.createElement('div');
            loadingContainer.id = 'loading-container';
            loadingContainer.className = 'loading-container';
            // Ensure loadingContainer is added inside or near generate-button-container
            const buttonContainer = document.querySelector('.generate-button-container');
            if (buttonContainer) {
                buttonContainer.appendChild(loadingContainer);
            } else {
                // If button container is not found, add to the end of lyrics-creator-container as a fallback
                document.querySelector('.lyrics-creator-container').appendChild(loadingContainer);
            }

            const notesAnimation = document.createElement('div');
            notesAnimation.className = 'music-notes-animation';
            for (let i = 0; i < 5; i++) {
                const note = document.createElement('span');
                note.className = 'music-note';
                notesAnimation.appendChild(note);
            }
            loadingContainer.appendChild(notesAnimation);

            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.id = 'lyrics-progress-bar'; // Ensure ID matches update logic in suno-api.js (if needed)
            progressContainer.appendChild(progressBar);
            loadingContainer.appendChild(progressContainer);

            const loadingStatus = document.createElement('div');
            loadingStatus.id = 'loading-status';
            loadingStatus.className = 'loading-status';
            loadingContainer.appendChild(loadingStatus);
        }

        loadingContainer.style.display = 'flex';
        const loadingStatusEl = document.getElementById('loading-status');
        const progressBarEl = document.getElementById('lyrics-progress-bar');
        
        if (loadingStatusEl) loadingStatusEl.textContent = 'Submitting request...';
        if (progressBarEl) progressBarEl.style.width = '5%';

        try {
            console.log(`Preparing to call generateAndFetchLyrics, prompt: "${finalPrompt}"`);
            const lyricsText = await generateAndFetchLyrics(finalPrompt);

            if (lyricsText) {
                if (loadingStatusEl) loadingStatusEl.textContent = 'Lyrics generated successfully!';
                if (progressBarEl) progressBarEl.style.width = '100%';

                lyricsGrid.innerHTML = ''; // Clear previous lyrics results

                // Create lyrics card
                const card = document.createElement('div');
                card.className = 'lyrics-card';

                const cardHeader = document.createElement('div');
                cardHeader.className = 'lyrics-card-header';
                cardHeader.textContent = 'Generated Lyrics'; // You can set this dynamically based on API response title

                const cardBody = document.createElement('div');
                cardBody.className = 'lyrics-card-body';
                // Handle line breaks, replace \n with <br>
                const formattedLyrics = lyricsText.replace(/\n/g, '<br>');
                cardBody.innerHTML = formattedLyrics;

                const cardFooter = document.createElement('div');
                cardFooter.className = 'lyrics-card-footer';

                const copyButton = document.createElement('button');
                copyButton.className = 'copy-lyrics-btn';
                copyButton.textContent = 'Copy Lyrics';
                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(lyricsText) // Use original lyricsText for copying
                        .then(() => {
                            copyButton.textContent = 'Copied!';
                            setTimeout(() => {
                                copyButton.textContent = 'Copy Lyrics';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Failed to copy lyrics:', err);
                            alert('Failed to copy. Please copy manually.');
                        });
                });

                cardFooter.appendChild(copyButton);
                card.appendChild(cardHeader);
                card.appendChild(cardBody);
                card.appendChild(cardFooter);
                lyricsGrid.appendChild(card);

            } else {
                if (loadingStatusEl) loadingStatusEl.textContent = 'Failed to retrieve lyrics.';
                if (progressBarEl) progressBarEl.style.width = '100%';
                lyricsGrid.innerHTML = '<p>Could not generate lyrics. Please try again later or check the console for more information.</p>';
            }

        } catch (error) {
            console.error('Error calling API in lyrics-creator.js:', error);
            if (loadingStatusEl) loadingStatusEl.textContent = 'Generation failed: ' + error.message;
            if (progressBarEl) progressBarEl.style.width = '100%'; 
            if (progressBarEl) progressBarEl.style.backgroundColor = 'red'; 
            lyricsGrid.innerHTML = `<p>An error occurred while generating lyrics: ${error.message}</p>`;
            // alert('An error occurred while generating lyrics: ' + error.message); // Can keep alert or just display error on page
        } finally {
            // Restore button state regardless of success or failure
            generateBtn.textContent = 'Generate';
            generateBtn.disabled = false;
            // 可以选择在一段时间后隐藏加载动画
            // setTimeout(() => {
            //     if (loadingContainer) loadingContainer.style.display = 'none';
            // }, 3000);
        }
    });

});
