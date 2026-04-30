document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Card Spotlight
    const cards = document.querySelectorAll('.link-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--lx', `${x}%`);
            card.style.setProperty('--ly', `${y}%`);
        });
    });

    // Main Background Spotlight
    const bg = document.querySelector('.bg-gradient-mesh');
    if (bg) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            bg.style.setProperty('--mx', `${x}%`);
            bg.style.setProperty('--my', `${y}%`);
        });

        // Touch support
        document.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const x = (touch.clientX / window.innerWidth) * 100;
            const y = (touch.clientY / window.innerHeight) * 100;
            bg.style.setProperty('--mx', `${x}%`);
            bg.style.setProperty('--my', `${y}%`);
        });
    }
});
