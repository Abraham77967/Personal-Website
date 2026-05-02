document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    const viewport = document.querySelector('.gallery-viewport');
    const track = document.querySelector('.gallery-track');
    const cards = document.querySelectorAll('.gallery-card');
    const detailBlocks = document.querySelectorAll('.detail-block');
    const swipeHint = document.querySelector('.swipe-hint');
    const body = document.body;
    
    if (!viewport || !track || !cards.length) return;

    // --- 3D WHEEL ENGINE ---
    const cardCount = cards.length;
    const theta = 360 / cardCount;
    
    const isMobile = window.innerWidth < 600;
    const radius = isMobile ? 280 : 350; // Closer on mobile (was 400)
    const sensitivity = isMobile ? 0.25 : 0.15; // More responsive (was 0.08)
    const friction = 0.92;
    const MAX_VELOCITY = 5;
    
    let rotationAngle = 0;   
    let currentAngle = 0;    
    let isDragging = false;
    let startX = 0;
    let dragStartAngle = 0;
    let velocity = 0;
    let lastTime = 0;
    let lastX = 0;
    let lastActiveIndex = -1;

    const onDown = (e) => {
        isDragging = true;
        startX = e.pageX || (e.touches && e.touches[0].pageX);
        dragStartAngle = rotationAngle;
        velocity = 0;
        lastTime = performance.now();
        lastX = startX;

        // Hide swipe hint on first interaction
        if (swipeHint) {
            swipeHint.style.opacity = '0';
            setTimeout(() => swipeHint.remove(), 600);
        }
    };

    const onMove = (e) => {
        if (!isDragging) return;
        
        const x = e.pageX || (e.touches && e.touches[0].pageX);
        const deltaX = x - startX;
        
        rotationAngle = dragStartAngle + (deltaX * sensitivity);

        const now = performance.now();
        const dt = now - lastTime;
        if (dt > 0) {
            const instantVelocity = (x - lastX) / dt * 4;
            velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity * 0.5 + instantVelocity * 0.5));
        }
        lastTime = now;
        lastX = x;
    };

    const onUp = () => { isDragging = false; };

    viewport.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    const render = () => {
        if (!isDragging) {
            rotationAngle += velocity;
            velocity *= friction;

            if (Math.abs(velocity) < 0.15) {
                const snapTarget = Math.round(rotationAngle / theta) * theta;
                rotationAngle += (snapTarget - rotationAngle) * 0.08;
                velocity *= 0.8;
            }
        }

        currentAngle += (rotationAngle - currentAngle) * 0.12;

        // CALCULATE ACTIVE INDEX
        let normalizedCurrent = -currentAngle % 360;
        if (normalizedCurrent < 0) normalizedCurrent += 360;
        
        const activeIndex = Math.round(normalizedCurrent / theta) % cardCount;
        
        if (activeIndex !== lastActiveIndex) {
            lastActiveIndex = activeIndex;
            updateActiveProject(activeIndex);
        }

        cards.forEach((card, i) => {
            const angle = (i * theta) + currentAngle;
            let normalizedAngle = angle % 360;
            if (normalizedAngle > 180) normalizedAngle -= 360;
            if (normalizedAngle < -180) normalizedAngle += 360;

            const centerFactor = Math.abs(normalizedAngle); 
            // Only show cards in the front 180 degrees
            const focus = Math.max(0, 1 - (centerFactor / 90)); 
            
            card.style.setProperty('--focus', focus);
            card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
            
            // Fade out completely when rotating to the back
            card.style.opacity = centerFactor > 95 ? 0 : Math.max(0.05, focus + 0.1);
            card.style.zIndex = Math.round(focus * 100);
            card.style.pointerEvents = focus > 0.3 ? 'auto' : 'none';
        });

        requestAnimationFrame(render);
    };

    const updateActiveProject = (index) => {
        const activeCard = cards[index];
        if (!activeCard) return;
        
        const projectID = activeCard.getAttribute('data-project');
        
        // Toggle Active Detail Block
        detailBlocks.forEach(block => {
            if (block.getAttribute('data-project') === projectID) {
                block.classList.add('is-active');
            } else {
                block.classList.remove('is-active');
            }
        });

        // Toggle Theme
        if (projectID === 'planora') {
            body.setAttribute('data-theme', 'planora');
        } else {
            body.setAttribute('data-theme', 'default');
        }
    };

    requestAnimationFrame(render);
});
