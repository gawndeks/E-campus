/**
 * eCampus International School - Animations JavaScript
 * Handles Scroll Reveal, Counters, and Smooth Scrolling
 */

document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Scroll Reveal Animations --- */
    const revealElements = document.querySelectorAll('.reveal');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealOptions = {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before it hits the bottom
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));


    /* --- 2. Animated Counters --- */
    const counters = document.querySelectorAll('.counter-value');
    let hasCounted = false;

    const counterCallback = (entries, observer) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasCounted) {
            hasCounted = true;
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps

                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current) + "+";
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target + "+";
                    }
                };
                updateCounter();
            });
            // Stop observing the counter section
            observer.disconnect();
        }
    };

    const counterSection = document.querySelector('.stats-section');
    if (counterSection) {
        const counterObserver = new IntersectionObserver(counterCallback, { threshold: 0.5 });
        counterObserver.observe(counterSection);
    }


    /* --- 3. Smooth Scrolling for Anchor Links --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });


    /* --- 4. Back to Top Button --- */
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } // This is the missing closing brace for `if (backToTopBtn)`

});
