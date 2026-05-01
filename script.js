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
    const radius = 350; // Radius of the wheel
    
    // --- State ---
    let rotationAngle = 0;   // Target rotation in degrees
    let currentAngle = 0;    // Smoothed rotation for rendering
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
        
        // Convert pixel drag to angular rotation
        // Adjust sensitivity as needed
        const sensitivity = 0.25; 
        rotationAngle = dragStartAngle + (deltaX * sensitivity);

        // Track velocity
        const now = performance.now();
        const dt = now - lastTime;
        if (dt > 0) {
            velocity = (x - lastX) / dt * 10;
        }
        lastTime = now;
        lastX = x;
    };

    const onUp = () => {
        isDragging = false;
        
        // Snap to nearest card when momentum stops
        // Handled in the render loop
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
            velocity *= 0.94; // Friction

            // Snap to nearest theta (60 degrees)
            if (Math.abs(velocity) < 0.2) {
                const snapTarget = Math.round(rotationAngle / theta) * theta;
                rotationAngle += (snapTarget - rotationAngle) * 0.1;
                velocity *= 0.8;
            }
        }

        // Smoothly interpolate current angle toward rotation angle
        currentAngle += (rotationAngle - currentAngle) * 0.15;

        // Position each card on the cylinder
        cards.forEach((card, i) => {
            const angle = (i * theta) + currentAngle;
            
            // Normalize angle to -180 to 180 for center logic
            let normalizedAngle = angle % 360;
            if (normalizedAngle > 180) normalizedAngle -= 360;
            if (normalizedAngle < -180) normalizedAngle += 360;

            const centerFactor = Math.abs(normalizedAngle); // 0 is dead center
            const focus = Math.max(0, 1 - (centerFactor / 90)); // Focus falloff within 90 deg
            
            // Pass focus value to CSS for dynamic effects
            card.style.setProperty('--focus', focus);
            
            // 3D Cylinder Positioning
            card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
            
            // Visibility and stacking
            card.style.opacity = Math.max(0.1, focus + 0.1); // Slightly higher min opacity
            card.style.zIndex = Math.round(focus * 100);
        });

        requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
});
