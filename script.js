document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // --- Scroll Progress Indicator ---
    const progressLine = document.querySelector('.scroll-progress');
    const updateScrollProgress = () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressLine) {
            progressLine.style.width = scrolled + "%";
        }
    };

    window.addEventListener('scroll', updateScrollProgress);

    // --- Intersection Observer for Reveal Animations ---
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add a small delay based on index for staggered effect
                const index = entry.target.style.getPropertyValue('--index') || 0;
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // --- Haptic Feedback Visuals (Optional but nice) ---
    // CSS :active already handles most, but we can add more JS logic here if needed.
    const cards = document.querySelectorAll('.link-card');
    cards.forEach(card => {
        card.addEventListener('touchstart', () => {
            // Can add specific mobile feedback here
        }, { passive: true });
    });
});
