// Update notice functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const updateNotice = document.querySelector('.update-notice');
    const modal = document.getElementById('update-modal');
    const closeBtn = modal.querySelector('.close');
    
    // Click notice to display modal
    updateNotice.addEventListener('click', function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
    
    // Click close button to hide modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore background scrolling
    });
    
    // Click outside modal area to close modal
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Add notice blinking effect
    function blinkNotice() {
        updateNotice.classList.add('blink');
        setTimeout(() => {
            updateNotice.classList.remove('blink');
        }, 1000);
    }
    
    // Initial blinking effect
    setTimeout(blinkNotice, 2000);
    // Blink every 30 seconds
    setInterval(blinkNotice, 30000);
});