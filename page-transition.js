// Music rhythm mask transition animation control
document.addEventListener('DOMContentLoaded', function() {
    // Create transition animation element
    const transitionElement = document.createElement('div');
    transitionElement.className = 'page-transition';
    document.body.appendChild(transitionElement);
    
    // Create rhythm wave container
    const rhythmContainer = document.createElement('div');
    rhythmContainer.className = 'rhythm-container';
    transitionElement.appendChild(rhythmContainer);
    
    // Create stage light effect
    const stageLight = document.createElement('div');
    stageLight.className = 'stage-light';
    rhythmContainer.appendChild(stageLight);
    
    // Create multiple spotlights
    for (let i = 0; i < 3; i++) {
        const spotlight = document.createElement('div');
        spotlight.className = 'spotlight';
        spotlight.style.left = `${Math.random() * 80 + 10}%`;
        spotlight.style.top = `${Math.random() * 80 + 10}%`;
        rhythmContainer.appendChild(spotlight);
    }
    
    // Function to generate rhythm waves
    function createRhythmWaves() {
        // Clear previous rhythm waves
        const oldWaves = rhythmContainer.querySelectorAll('.rhythm-wave');
        oldWaves.forEach(wave => wave.remove());
        
        // Create multiple rhythm waves
        const waveCount = 8; // Number of rhythm waves
        const maxSize = Math.max(window.innerWidth, window.innerHeight) * 2;
        
        for (let i = 0; i < waveCount; i++) {
            setTimeout(() => {
                const wave = document.createElement('div');
                wave.className = 'rhythm-wave';
                
                // Set size and position
                wave.style.width = `${maxSize}px`;
                wave.style.height = `${maxSize}px`;
                
                // Set animation
                const duration = 1.5 + Math.random() * 0.5; // 1.5-2 seconds random duration
                const delay = i * 0.2; // Stagger start time
                wave.style.animation = `rhythm-pulse ${duration}s ease-out ${delay}s forwards`;
                
                rhythmContainer.appendChild(wave);
            }, i * 200); // Stagger creation time
        }
        
        // Activate stage light effect
        stageLight.style.animation = 'stage-light-pulse 2s ease-in-out infinite';
        
        // Activate spotlights
        const spotlights = rhythmContainer.querySelectorAll('.spotlight');
        spotlights.forEach((spotlight, index) => {
            spotlight.style.opacity = '0.7';
            spotlight.style.animation = `spotlight-move ${8 + index}s ease-in-out infinite ${index * 0.5}s`;
        });
    }
    
    // Get all links that need transition effects
    const transitionLinks = document.querySelectorAll('a[href="app.html"]');
    
    // Add click event to each link
    transitionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default navigation
            const targetHref = this.getAttribute('href');
            
            // Add transition animation class
            document.body.classList.add('transitioning');
            transitionElement.classList.add('animate-out');
            
            // Create rhythm wave animation
            createRhythmWaves();
            
            // Navigate to target page after animation completes
            setTimeout(() => {
                window.location.href = targetHref;
            }, 1800); // Match animation duration
        });
    });
    
    // If navigating from another page, show enter animation
    if (document.referrer && document.referrer.includes('index.html')) {
        transitionElement.classList.add('animate-in');
        document.body.classList.add('transitioning');
        
        // Create rhythm wave animation
        createRhythmWaves();
        
        // Remove class after animation completes
        setTimeout(() => {
            transitionElement.classList.remove('animate-in');
            document.body.classList.remove('transitioning');
        }, 1800);
    }
});