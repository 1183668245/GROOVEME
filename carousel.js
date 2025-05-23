// Carousel auto-display functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get carousel elements
    const carousel = document.querySelector('.featured-carousel');
    const carouselItems = carousel.querySelectorAll('.carousel-item');
    const prevButton = carousel.querySelector('.prev');
    const nextButton = carousel.querySelector('.next');
    
    // Create carousel indicators
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'carousel-indicators';
    
    // Create an indicator for each carousel item
    carouselItems.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'carousel-indicator';
        if (index === 0) indicator.classList.add('active');
        
        // Click indicator to switch to the corresponding carousel item
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
            resetAutoSlide(); // Reset auto-slide timer
        });
        
        indicatorsContainer.appendChild(indicator);
    });
    
    carousel.appendChild(indicatorsContainer);
    
    // Current carousel item index
    let currentIndex = 0;
    const totalItems = carouselItems.length;
    
    // Update carousel display
    function updateCarousel() {
        // Remove active class from all carousel items
        carouselItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to the current carousel item
        carouselItems[currentIndex].classList.add('active');
        
        // Update indicators
        const indicators = carousel.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Switch to the next carousel item
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }
    
    // Switch to the previous carousel item
    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    }
    
    // Add button click events
    nextButton.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide(); // Reset auto-slide timer
    });
    
    prevButton.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide(); // Reset auto-slide timer
    });
    
    // Auto-slide
    let autoSlideInterval;
    const slideInterval = 4000; // Set to switch every 4 seconds
    
    function startAutoSlide() {
        // Ensure old timer is cleared before creating a new one
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, slideInterval);
    }
    
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
    
    // Pause auto-slide on mouse hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });
    
    // Resume auto-slide on mouse leave
    carousel.addEventListener('mouseleave', () => {
        startAutoSlide(); // This will clear the old timer and create a new one
    });
    
    // Start auto-slide
    startAutoSlide();
});