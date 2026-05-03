document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) { lucide.createIcons(); }

    const viewport = document.querySelector('.gallery-viewport');
    const track = document.querySelector('.gallery-track');
    const cards = document.querySelectorAll('.gallery-card');
    const detailBlocks = document.querySelectorAll('.detail-block');
    const swipeHint = document.querySelector('.swipe-hint');
    const body = document.body;

    if (!viewport || !track || !cards.length) return;

    // --- CONFIG ---
    const isMobile = window.innerWidth < 600;
    const cardWidth = isMobile ? 190 : 260;
    const cardHeight = isMobile ? 300 : 380;
    const gap = isMobile ? 80 : 120;
    const step = cardWidth + gap;
    const DIRECTION_THRESHOLD = 8;

    // Wrapping
    const totalWidth = cards.length * step;
    const halfTotal = totalWidth / 2;

    // --- STATE ---
    let currentX = 0;
    let targetX = 0;
    let isDragging = false;
    let velocity = 0;
    let lastActiveIndex = -1;

    // Touch tracking
    let touchStartX = 0;
    let touchStartY = 0;
    let dragStartTargetX = 0;
    let lastTouchX = 0;
    let lastTouchTime = 0;
    let direction = null;
    let dragDistance = 0; // Track total movement to distinguish tap vs swipe

    // --- INITIAL CARD LAYOUT ---
    // Position all cards at the viewport center; JS will offset them each frame
    cards.forEach((card) => {
        card.style.position = 'absolute';
        card.style.left = '50%';
        card.style.top = '40%';
        card.style.marginLeft = `${-(cardWidth / 2)}px`;
        card.style.marginTop = `${-(cardHeight / 2)}px`;
        card.style.willChange = 'transform';
    });

    // Track is just a container, no movement on it
    track.style.position = 'absolute';
    track.style.left = '0';
    track.style.top = '0';
    track.style.width = '100%';
    track.style.height = '100%';

    // --- TOUCH HANDLERS ---
    viewport.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        lastTouchX = t.clientX;
        lastTouchTime = performance.now();
        dragStartTargetX = targetX;
        isDragging = true;
        direction = null;
        velocity = 0;
        dragDistance = 0;

        if (swipeHint) {
            swipeHint.style.opacity = '0';
            // Use visibility:hidden instead of remove() to preserve layout space
            setTimeout(() => { swipeHint.style.visibility = 'hidden'; }, 600);
        }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        const t = e.touches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;

        if (direction === null) {
            if (Math.abs(dx) > DIRECTION_THRESHOLD || Math.abs(dy) > DIRECTION_THRESHOLD) {
                direction = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
            } else {
                return;
            }
        }

        if (direction === 'v') {
            isDragging = false;
            return;
        }

        e.preventDefault();

        const now = performance.now();
        const dt = now - lastTouchTime;
        if (dt > 0) {
            const raw = ((t.clientX - lastTouchX) / dt) * 12;
            velocity = Math.max(-15, Math.min(15, raw));
        }
        lastTouchX = t.clientX;
        lastTouchTime = now;

        targetX = dragStartTargetX + dx;
        dragDistance = Math.abs(dx);
    }, { passive: false });

    viewport.addEventListener('touchend', () => {
        isDragging = false;
        direction = null;
    });

    viewport.addEventListener('touchcancel', () => {
        isDragging = false;
        direction = null;
    });

    // Block link navigation if it was a swipe, not a tap
    viewport.addEventListener('click', (e) => {
        if (dragDistance > DIRECTION_THRESHOLD) {
            e.preventDefault();
        }
    });

    // --- MOUSE FALLBACK ---
    let mouseDown = false;
    viewport.addEventListener('mousedown', (e) => {
        mouseDown = true;
        touchStartX = e.clientX;
        dragStartTargetX = targetX;
        lastTouchX = e.clientX;
        lastTouchTime = performance.now();
        velocity = 0;
        isDragging = true;
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!mouseDown) return;
        const dx = e.clientX - touchStartX;

        const now = performance.now();
        const dt = now - lastTouchTime;
        if (dt > 0) {
            const raw = ((e.clientX - lastTouchX) / dt) * 12;
            velocity = Math.max(-15, Math.min(15, raw));
        }
        lastTouchX = e.clientX;
        lastTouchTime = now;

        targetX = dragStartTargetX + dx;
    });

    window.addEventListener('mouseup', () => {
        mouseDown = false;
        isDragging = false;
    });

    // --- Wrapping helper: keeps a value in [-halfTotal, halfTotal) ---
    const wrap = (val) => {
        val = val % totalWidth;
        if (val > halfTotal) val -= totalWidth;
        if (val < -halfTotal) val += totalWidth;
        return val;
    };

    // --- CORE RENDER LOOP ---
    const render = () => {
        if (!isDragging) {
            targetX += velocity;
            velocity *= 0.85;

            // Snap early and decisively (no clamping — infinite loop)
            if (Math.abs(velocity) < 2) {
                velocity = 0;
                // Find the nearest snap point, accounting for wrapping
                const wrapped = wrap(targetX);
                const snap = Math.round(wrapped / step) * step;
                const diff = snap - wrapped;
                targetX += diff * 0.25;
            }
        }

        // Smooth interpolation
        currentX += (targetX - currentX) * 0.18;

        // Detect active card (wrapped)
        const wrappedCurrent = wrap(currentX);
        const rawIndex = Math.round(-wrappedCurrent / step);
        const activeIndex = ((rawIndex % cards.length) + cards.length) % cards.length;
        if (activeIndex !== lastActiveIndex) {
            lastActiveIndex = activeIndex;
            updateActiveProject(activeIndex);
        }

        // Position each card with wrapping
        cards.forEach((card, i) => {
            // Where this card should be relative to center
            let xPos = (i * step) + currentX;

            // Wrap into [-halfTotal, halfTotal)
            xPos = wrap(xPos);

            const dist = Math.abs(xPos);
            const focus = Math.max(0, 1 - (dist / (step * 1.2)));

            card.style.setProperty('--focus', focus);
            card.style.transform = `translate3d(${xPos}px, 0, 0)`;
            card.style.pointerEvents = focus > 0.6 ? 'auto' : 'none';
        });

        requestAnimationFrame(render);
    };

    const updateActiveProject = (index) => {
        const activeCard = cards[index];
        if (!activeCard) return;
        const projectID = activeCard.getAttribute('data-project');
        detailBlocks.forEach(block => {
            block.classList.toggle('is-active', block.getAttribute('data-project') === projectID);
        });
        body.setAttribute('data-theme', projectID === 'planora' ? 'planora' : 'default');
    };

    updateActiveProject(0);
    requestAnimationFrame(render);
});
