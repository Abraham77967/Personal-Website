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
    const SWIPE_THRESHOLD = 30; // px needed to trigger a card change
    const totalWidth = cards.length * step;
    const halfTotal = totalWidth / 2;

    // --- STATE ---
    let currentIndex = 0;
    let currentX = 0;
    let targetX = 0;
    let lastActiveIndex = -1;

    // Touch tracking
    let touchStartX = 0;
    let touchStartY = 0;
    let direction = null; // null | 'h' | 'v'
    let swiped = false;   // prevents multiple triggers per gesture

    // --- INITIAL CARD LAYOUT ---
    cards.forEach((card) => {
        card.style.position = 'absolute';
        card.style.left = '50%';
        card.style.top = '40%';
        card.style.marginLeft = `${-(cardWidth / 2)}px`;
        card.style.marginTop = `${-(cardHeight / 2)}px`;
        card.style.willChange = 'transform';
    });

    track.style.position = 'absolute';
    track.style.left = '0';
    track.style.top = '0';
    track.style.width = '100%';
    track.style.height = '100%';

    // --- NAVIGATION ---
    const goNext = () => {
        currentIndex = (currentIndex + 1) % cards.length;
        targetX -= step; // Always move left by one step
    };

    const goPrev = () => {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        targetX += step; // Always move right by one step
    };

    // --- TOUCH HANDLERS ---
    viewport.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        direction = null;
        swiped = false;

        if (swipeHint) {
            swipeHint.style.opacity = '0';
            setTimeout(() => { swipeHint.style.visibility = 'hidden'; }, 600);
        }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;

        // Decide direction once
        if (direction === null) {
            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                direction = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
            } else {
                return;
            }
        }

        if (direction === 'v') return; // let browser scroll

        e.preventDefault(); // lock vertical scroll during horizontal swipe

        // Trigger card change once per gesture
        if (!swiped && Math.abs(dx) > SWIPE_THRESHOLD) {
            swiped = true;
            if (dx < 0) goNext();
            else goPrev();
        }
    }, { passive: false });

    // --- MOUSE FALLBACK ---
    let mouseStartX = 0;
    let mouseSwiped = false;

    viewport.addEventListener('mousedown', (e) => {
        mouseStartX = e.clientX;
        mouseSwiped = false;
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (mouseSwiped || mouseStartX === null) return;
        const dx = e.clientX - mouseStartX;
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
            mouseSwiped = true;
            if (dx < 0) goNext();
            else goPrev();
        }
    });

    window.addEventListener('mouseup', () => {
        mouseStartX = null;
    });

    // --- TAP HANDLING ---
    viewport.addEventListener('click', (e) => {
        // Block navigation if it was a swipe
        if (swiped || mouseSwiped) {
            e.preventDefault();
        }
    });

    // --- Wrapping helper ---
    const wrap = (val) => {
        val = val % totalWidth;
        if (val > halfTotal) val -= totalWidth;
        if (val < -halfTotal) val += totalWidth;
        return val;
    };

    // Cache previous focus values
    const prevFocus = new Float32Array(cards.length);

    // --- CORE RENDER LOOP ---
    const render = () => {
        // Smooth spring animation toward target
        currentX += (targetX - currentX) * 0.12;

        // Snap exactly when close enough
        if (Math.abs(targetX - currentX) < 0.5) {
            currentX = targetX;
        }

        // Detect active card
        if (currentIndex !== lastActiveIndex) {
            lastActiveIndex = currentIndex;
            updateActiveProject(currentIndex);
        }

        // Position each card with wrapping
        for (let i = 0; i < cards.length; i++) {
            let xPos = (i * step) + currentX;
            xPos = wrap(xPos);

            const dist = Math.abs(xPos);
            const focus = Math.max(0, 1 - (dist / (step * 1.2)));

            const card = cards[i];
            card.style.transform = `translate3d(${xPos}px, 0, 0)`;

            if (Math.abs(focus - prevFocus[i]) > 0.01) {
                prevFocus[i] = focus;
                card.style.setProperty('--focus', focus);
                card.style.pointerEvents = focus > 0.6 ? 'auto' : 'none';
            }
        }

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
