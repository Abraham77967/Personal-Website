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
        const centerX = trackRect.left + (trackRect.width / 2);

        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + (cardRect.width / 2);
            
            // Calculate distance from center (-1 to 1)
            // We want cards within 1 viewport width to have the effect
            let distance = (cardCenterX - centerX) / (trackRect.width / 1.5);
            
            // Clamp distance for extreme cases
            const clampedDistance = Math.max(-1.5, Math.min(1.5, distance));
            
            // Apply 3D Transformations
            // 1. Rotation: cards on left rotate right, cards on right rotate left
            const rotation = clampedDistance * -45; // Max 45 deg rotation
            
            // 2. Scale: cards in center are larger
            const scale = 1 - (Math.abs(clampedDistance) * 0.2); // Scale down to 0.8
            
            // 3. Depth (translateZ): cards in center are closer
            const depth = Math.abs(clampedDistance) * -200; // Push back up to 200px
            
            // 4. Opacity: cards on edges fade out
            const opacity = 1 - (Math.abs(clampedDistance) * 0.6);

            card.style.transform = `
                translateX(${clampedDistance * -20}px) 
                translateZ(${depth}px) 
                rotateY(${rotation}deg) 
                scale(${scale})
            `;
            card.style.opacity = opacity;
            
            // Optional: update icon color based on distance
            const icon = card.querySelector('.card-main-icon');
            if (icon) {
                const colorValue = 1 - Math.abs(clampedDistance);
                icon.style.opacity = 0.2 + (colorValue * 0.8);
            }
        });

        requestAnimationFrame(update3DEffect);
    };

    // Initial run
    update3DEffect();

    // Scroll listener is optional since we use requestAnimationFrame for smooth orbit
    // but we can also trigger on scroll for better responsiveness
    track.addEventListener('scroll', () => {
        // update3DEffect is running in rAF loop
    }, { passive: true });
});
