document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    const track = document.querySelector('.gallery-track');
    const cards = document.querySelectorAll('.gallery-card');

    if (!track || !cards.length) return;

    const update3DEffect = () => {
        const trackRect = track.getBoundingClientRect();
        if (trackRect.width === 0) {
            requestAnimationFrame(update3DEffect);
            return;
        }

        const centerX = trackRect.left + (trackRect.width / 2);

        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + (cardRect.width / 2);
            
            // Calculate distance from center (-1 to 1)
            // Use a wider divisor to keep neighbors visible
            let distance = (cardCenterX - centerX) / (trackRect.width / 2.2);
            
            // Clamp distance
            const clampedDistance = Math.max(-2, Math.min(2, distance));
            
            // Apply 3D Transformations for a "Wheel" effect
            // 1. Rotation: Pivot cards around a central axis
            const rotation = clampedDistance * -35; 
            
            // 2. Scale: Subtle scaling
            const scale = 1 - (Math.abs(clampedDistance) * 0.15);
            
            // 3. Depth & Arc: Push back and pull toward center for the curve
            const depth = Math.abs(clampedDistance) * -180;
            const horizontalPull = clampedDistance * -40; // Pull neighbors inward
            
            // 4. Opacity: Keep neighbors visible
            const opacity = Math.max(0.2, 1 - (Math.abs(clampedDistance) * 0.5));

            card.style.transform = `
                translateX(${horizontalPull}px) 
                translateZ(${depth}px) 
                rotateY(${rotation}deg) 
                scale(${scale})
            `;
            card.style.opacity = opacity;
            
            // Optional: update icon color based on distance
            const icon = card.querySelector('.card-main-icon');
            if (icon) {
                const colorValue = 1 - Math.abs(clampedDistance);
                icon.style.opacity = 0.2 + (Math.max(0, colorValue) * 0.8);
            }
        });

        requestAnimationFrame(update3DEffect);
    };

    // Initial run with a small delay for mobile layout stability
    setTimeout(update3DEffect, 100);

    // Scroll listener is optional since we use requestAnimationFrame for smooth orbit
    // but we can also trigger on scroll for better responsiveness
    track.addEventListener('scroll', () => {
        // update3DEffect is running in rAF loop
    }, { passive: true });
});
