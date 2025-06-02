// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navUl = document.querySelector('nav ul');
    const secondaryNav = document.querySelector('.secondary-nav');

    if (hamburger && navUl) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            secondaryNav.classList.toggle('active');
        });
    }

    // Smooth scrolling effect
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add static title effect (remove dynamic typing effect)
    const heroTitle = document.querySelector('.hero-content h2');
    if (heroTitle) {
        // Increase main title font size
        heroTitle.style.fontSize = '2.5rem'; // Increase font size
        heroTitle.style.fontWeight = '700'; // Bold
        
        // Display full text directly, without typing effect
        heroTitle.style.position = 'relative';
    }
   
    // Image loading animation - remove animation effect for logo
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // If it's a logo image, don't add animation effect
        if (img.closest('.logo')) {
            // Set logo to visible immediately, without animation
            img.style.opacity = '1';
        } else {
            // Other images keep their original loading animation
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        }
    });

    // Initial call
    animateOnScroll();
    
    // Call on scroll
    window.addEventListener('scroll', animateOnScroll);

    // Add CSS class for animation, but exclude logo
    const style = document.createElement('style');
    style.textContent = `
        .feature-card, .hero-image, .join-content {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .feature-card.animate, .hero-image.animate, .join-content.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .hero-image.animate {
            transition-delay: 0.2s;
        }
        
        .feature-card:nth-child(2).animate {
            transition-delay: 0.2s;
        }
        
        .feature-card:nth-child(3).animate {
            transition-delay: 0.4s;
        }
        
        /* Modify image animation rules, exclude logo */
        img:not(.logo img) {
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        
        img:not(.logo img).loaded {
            opacity: 1;
        }
        
        /* Ensure logo is always visible */
        .logo img {
            opacity: 1 !important;
        }
    `;
    document.head.appendChild(style);

    // Mobile menu toggle
    const menuIcon = document.querySelector('.menu-icon');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuIcon && mobileMenu) {
        menuIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
            
            // Close menu when clicking outside
            document.addEventListener('click', function closeMenu(e) {
                if (!mobileMenu.contains(e.target) && !menuIcon.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                    document.removeEventListener('click', closeMenu);
                }
            });
        });
    }

    // Add wallet connection handling
    const connectWalletButtons = document.querySelectorAll('.connect-wallet');
    connectWalletButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Check if MetaMask is installed
            if (typeof window.ethereum !== 'undefined') {
                try {
                    // Request account access
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    if (accounts && accounts.length > 0) {
                        const address = accounts[0];
                        updateWalletDisplay(address);
                        
                        // Listen for account changes
                        window.ethereum.on('accountsChanged', function (accounts) {
                            if (accounts.length > 0) {
                                updateWalletDisplay(accounts[0]);
                            } else {
                                // Reset buttons if disconnected
                                updateWalletDisplay('');
                                connectWalletButtons.forEach(btn => {
                                    btn.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error connecting wallet:', error);
                    if (error.code === 4001) {
                        alert('Please connect your wallet to continue');
                    } else {
                        alert('Error connecting to wallet: ' + error.message);
                    }
                }
            } else {
                alert('Please install MetaMask to connect your wallet');
                window.open('https://metamask.io/download/', '_blank');
            }
        });
    });
    
    // Check if already connected
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts && accounts.length > 0) {
                    updateWalletDisplay(accounts[0]);
                }
            })
            .catch(console.error);
    }
});


function onWalletConnected(network, address, balance) {
  document.getElementById('wallet-status').style.display = 'block';
  document.getElementById('network').textContent = network;
  document.getElementById('address').textContent = address;
  document.getElementById('balance').textContent = balance;
  document.getElementById('connect-wallet').style.display = 'none';
}


window.addEventListener('DOMContentLoaded', function() {
  // Hide music visualizer animation
  const canvas = document.getElementById('music-visual');
  if (canvas) {
    canvas.style.display = 'none';
  }
  
  // Ensure logo is displayed immediately
  const logoImg = document.querySelector('.logo img');
  if (logoImg) {
    logoImg.style.opacity = '1';
  }
  

});



// Scroll animation function
function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .hero-image, .join-content');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        // Add animation class when element enters viewport
        if (elementTop < window.innerHeight - 100 && elementBottom > 0) {
            element.classList.add('animate');
        } else {
            element.classList.remove('animate');
        }
    });
    
    // Add smooth transition effect for video
    const video = document.querySelector('.hero-bg video');
    if (video) {
        // Listen for video loop event
        video.addEventListener('timeupdate', function() {
            // Start fading out when video is near the end (0.5 seconds remaining)
            if (this.duration - this.currentTime < 0.5) {
                this.style.opacity = '0';
            } else if (this.currentTime < 0.5) {
                // Fade in when video starts
                this.style.opacity = '1';
            }
        });
    }
    
    // Add fixed header effect on scroll
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Increase background opacity when scrolling down
        if (scrollTop > 50) {
            header.style.background = 'rgba(10, 10, 26, 0.9)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        } else {
            // Restore original style when scrolling to top
            header.style.background = 'rgba(10, 10, 26, 0.7)';
            header.style.boxShadow = 'none';
        }
        
        lastScrollTop = scrollTop;
    });
}


// Music planet interaction effect - optimize responsive experience
document.addEventListener('DOMContentLoaded', function() {
    const musicPlanet = document.querySelector('.music-planet-container');
    const pulseWave = document.querySelector('.pulse-wave');
    const pulseWave2 = document.querySelector('.pulse-wave-2');
    const planetBody = document.querySelector('.planet-body');
    
    if (musicPlanet && pulseWave && pulseWave2) {
        // Add touch feedback
        musicPlanet.addEventListener('click', function(e) {
            // Prevent event bubbling
            e.preventDefault();
            e.stopPropagation();
            
            // Add click/touch feedback
            if (planetBody) {
                planetBody.style.filter = 'brightness(1.2)';
                setTimeout(() => {
                    planetBody.style.filter = '';
                }, 300);
            }
            
            // Reset animation
            pulseWave.style.animation = 'none';
            pulseWave2.style.animation = 'none';
            
            // Trigger re-arrange
            void pulseWave.offsetWidth;
            void pulseWave2.offsetWidth;
            
            // Set new animation
            pulseWave.style.opacity = '1';
            pulseWave2.style.opacity = '1';
            
            // Adjust animation according to screen width
            if (window.innerWidth <= 576) {
                pulseWave.style.animation = 'pulse-wave-animation 2s ease-out forwards';
                pulseWave2.style.animation = 'pulse-wave-animation-2 3s ease-out forwards';
            } else {
                pulseWave.style.animation = 'pulse-wave-animation 3s ease-out forwards';
                pulseWave2.style.animation = 'pulse-wave-animation-2 4s ease-out forwards';
            }
            
            // Play sound effect (optional) - optimize for different devices
            playPulseSound();
        });
        
        // Add window size change listener, dynamic adjust position
        window.addEventListener('resize', debounce(function() {
            adjustPlanetPosition();
        }, 250));
        
        // Initial adjust position
        adjustPlanetPosition();
    }
    
    // Adjust planet position according to screen size
    function adjustPlanetPosition() {
        if (!musicPlanet) return;
        
        // Get hero area height
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;
        
        const heroHeight = heroSection.offsetHeight;
        
        // In particularly small screens, put planet at bottom
        if (window.innerWidth <= 576) {
            musicPlanet.style.top = 'auto';
            musicPlanet.style.bottom = '20px';
            musicPlanet.style.transform = 'none';
        } 
        // In landscape mode adjust
        else if (window.innerHeight <= 500 && window.innerWidth > window.innerHeight) {
            musicPlanet.style.top = '50%';
            musicPlanet.style.bottom = 'auto';
            musicPlanet.style.transform = 'translateY(-50%)';
        }
        // Default vertically centered
        else {
            musicPlanet.style.top = '50%';
            musicPlanet.style.bottom = 'auto';
            musicPlanet.style.transform = 'translateY(-50%)';
        }
    }
    
    // Simple sound effect (optional) - optimize for mobile devices
    function playPulseSound() {
        // Check if Web Audio API is supported
        if (!window.AudioContext && !window.webkitAudioContext) return;
        
        try {
            // Create audio context
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create oscillator
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            // Set audio parameters - use shorter sound effect on mobile
            oscillator.type = 'sine';
            
            // Use shorter sound effect on small screens
            const duration = window.innerWidth <= 576 ? 0.8 : 1.5;
            
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4音符
            oscillator.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + duration); // 滑向A3
            
            // Set volume decay - lower volume on mobile
            const volume = window.innerWidth <= 576 ? 0.2 : 0.3;
            gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
            
            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            // Play and stop
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.log('Audio playback error:', e);
        }
    }
    
    // Debounce function, avoid resize event frequent trigger
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const feedbackFab = document.getElementById('feedback-fab');
    const feedbackFormContainer = document.getElementById('feedback-form-container');
    const closeFeedbackFormBtn = document.getElementById('close-feedback-form');
    const submitFeedbackBtn = document.getElementById('submit-feedback');
    const feedbackMessage = document.getElementById('feedback-message');

    if (feedbackFab && feedbackFormContainer && closeFeedbackFormBtn && submitFeedbackBtn) {
        feedbackFab.addEventListener('click', () => {
            feedbackFormContainer.classList.toggle('visible');
        });

        closeFeedbackFormBtn.addEventListener('click', () => {
            feedbackFormContainer.classList.remove('visible');
        });

        submitFeedbackBtn.addEventListener('click', () => {
            const message = feedbackMessage.value.trim();
            if (message) {
                // Here you would typically send the feedback to a server
                // For now, we'll just log it and show an alert
                console.log('Feedback submitted:', message);
                alert('Thank you for your feedback!');
                feedbackMessage.value = ''; // Clear the textarea
                feedbackFormContainer.classList.remove('visible');
            } else {
                alert('Please enter your feedback before submitting.');
            }
        });
    }
});

// Add formatWalletAddress function
function formatWalletAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
}

// Update wallet display in both header and mobile menu
function updateWalletDisplay(address) {
    // Update header wallet button
    const headerWalletBtn = document.querySelector('.secondary-nav .connect-wallet');
    if (headerWalletBtn) {
        headerWalletBtn.innerHTML = `<i class="fas fa-wallet"></i> ${formatWalletAddress(address)}`;
    }
    
    // Update mobile menu wallet button
    const mobileWalletBtn = document.querySelector('.mobile-menu .connect-wallet');
    if (mobileWalletBtn) {
        mobileWalletBtn.innerHTML = `<i class="fas fa-wallet"></i> ${formatWalletAddress(address)}`;
    }
}
