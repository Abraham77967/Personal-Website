document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    const viewport = document.querySelector('.gallery-viewport');
    const track = document.querySelector('.gallery-track');
    const cards = document.querySelectorAll('.gallery-card');
    
    if (!viewport || !track || !cards.length) return;

    // --- Configuration ---
    const cardCount = cards.length;
    const theta = 360 / cardCount; // 60 degrees for 6 cards
    
    // Mobile-aware configuration
    const isMobile = window.innerWidth < 600;
    const radius = isMobile ? 400 : 350; // Larger radius on mobile to push cards back
    const sensitivity = isMobile ? 0.08 : 0.2; // Much lower sensitivity for touch screens
    
    // --- State ---
    let rotationAngle = 0;   
    let currentAngle = 0;    
    let isDragging = false;
    let startX = 0;
    let dragStartAngle = 0;
    let velocity = 0;
    let lastTime = 0;
    let lastX = 0;

    // --- Pointer Interaction ---
    const onDown = (e) => {
        isDragging = true;
        startX = e.pageX || e.touches[0].pageX;
        dragStartAngle = rotationAngle;
        velocity = 0;
        lastTime = performance.now();
        lastX = startX;
    };

    const onMove = (e) => {
        if (!isDragging) return;
        
        const x = e.pageX || e.touches[0].pageX;
        const deltaX = x - startX;
        
        rotationAngle = dragStartAngle + (deltaX * sensitivity);

        const now = performance.now();
        const dt = now - lastTime;
        if (dt > 0) {
            // Smoothed velocity tracking
            const instantVelocity = (x - lastX) / dt * 8;
            velocity = velocity * 0.5 + instantVelocity * 0.5;
        }
        lastTime = now;
        lastX = x;
    };

    const onUp = () => {
        isDragging = false;
    };

    viewport.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    // --- Render Loop ---
    const render = () => {
        if (!isDragging) {
            // Apply Momentum
            rotationAngle += velocity;
            velocity *= 0.92; // Heavier friction for better control

            // Soft Snapping - Only kicks in when almost still
            if (Math.abs(velocity) < 0.15) {
                const snapTarget = Math.round(rotationAngle / theta) * theta;
                // Very gentle snap to prevent jitter
                rotationAngle += (snapTarget - rotationAngle) * 0.06;
                velocity *= 0.8;
            }
        }

        // Smoothly interpolate current angle toward rotation angle
        // Lower lerp factor for smoother visual transition
        currentAngle += (rotationAngle - currentAngle) * 0.12;

        // Position each card on the cylinder
        cards.forEach((card, i) => {
            const angle = (i * theta) + currentAngle;
            
            // Normalize angle to -180 to 180 for center logic
            let normalizedAngle = angle % 360;
            if (normalizedAngle > 180) normalizedAngle -= 360;
            if (normalizedAngle < -180) normalizedAngle += 360;

            const centerFactor = Math.abs(normalizedAngle); 
            const focus = Math.max(0, 1 - (centerFactor / 90)); 
            
            // Pass focus value to CSS for dynamic effects
            card.style.setProperty('--focus', focus);
            
            // 3D Cylinder Positioning
            card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
            
            // Visibility and stacking
            card.style.opacity = Math.max(0.05, focus + 0.1);
            card.style.zIndex = Math.round(focus * 100);
        });

        requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
});
