// ===== CONFIGURATION =====
const CONFIG = {
    observerOptions: {
        threshold: [0, 0.1, 0.5],
        rootMargin: '0px 0px -100px 0px'
    },
    animationDelay: 50, 
    scrollThreshold: 5 
};
// ===== INTERSECTION OBSERVER SETUP =====
class AnimationController {
    constructor() {
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            CONFIG.observerOptions
        );
        this.animatedElements = new Set();
        this.scrollListener = null;
        this.parallaxElements = [];
        this.init();
    }

    init() {
        const fadeElements = document.querySelectorAll('.fade-in-element');
        fadeElements.forEach(el => this.observer.observe(el));
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(el => this.observer.observe(el));
        this.setupParallax();
        this.setupScrollEffects();
        this.initHeroAnimation();
        this.initStatCounters();
        this.initChart();
        this.addScrollListener();
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.triggerAnimation(entry.target);
            } else {
                this.resetAnimation(entry.target);
            }
        });
    }

    triggerAnimation(element) {
        if (this.animatedElements.has(element)) {
            return;
        }
        this.animatedElements.add(element);

        if (element.classList.contains('timeline-item')) {
            this.animateTimelineItem(element);
        } else if (element.classList.contains('fade-in-element')) {
            this.animateFadeInElement(element);
        }
            this.handleStaggeredAnimation(element);
    }

    resetAnimation(element) {
        element.classList.remove('visible');
        this.animatedElements.delete(element);
    }

    animateTimelineItem(element) {
        setTimeout(() => {
            element.classList.add('visible');
        }, 50);
    }

    animateFadeInElement(element) {
        setTimeout(() => {
            element.classList.add('visible');
        }, 50);
    }

    handleStaggeredAnimation(parentElement) {
        const siblings = parentElement.parentElement?.querySelectorAll('.fade-in-element.visible');
        if (siblings && siblings.length > 1) {
        }
    }

    // ===== HERO TEXT REVEAL ANIMATION =====
    initHeroAnimation() {
        const heroTitle = document.getElementById('heroTitle');
        if (!heroTitle) return;

        const words = heroTitle.querySelectorAll('.hero__word');
        words.forEach(word => {
            word.style.opacity = '0';
            word.style.animationPlayState = 'running';
        });

        setTimeout(() => {
            words.forEach(word => {
                word.style.animationPlayState = 'running';
            });
        }, 100);
    }

    // ===== STAT COUNTER ANIMATION =====
    initStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const countUp = (element) => {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000; 
            const steps = 60;
            const increment = target / steps;
            let current = 0;

            const counter = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(counter);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, duration / steps);
        };

        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    entry.target.dataset.counted = 'true';
                    countUp(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statNumbers.forEach(stat => statObserver.observe(stat));
    }

    // ===== PARALLAX SETUP =====
    setupParallax() {
        const hero = document.getElementById('hero');
        if (!hero) return;

        const shapes = hero.querySelectorAll('.hero__shape');
        this.parallaxElements = Array.from(shapes);
    }

    // ===== SCROLL EFFECTS =====
    setupScrollEffects() {
        const scrollEffectElements = document.querySelectorAll('[class*="section"]');
        this.scrollEffectElements = Array.from(scrollEffectElements);
    }

    addScrollListener() {
        let lastScrollY = 0;
        let rafId = null;

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                this.updateScrollEffects(scrollY);
                this.updateParallax(scrollY);
                lastScrollY = scrollY;
            });
        });
    }

    updateParallax(scrollY) {
        this.parallaxElements.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            const yOffset = scrollY * speed;
            shape.style.transform = `translateY(${yOffset}px)`;
        });

        const heroContent = document.querySelector('.hero__content');
        if (heroContent && scrollY < window.innerHeight) {
            const contentSpeed = 0.3;
            const contentOffset = scrollY * contentSpeed;
            heroContent.style.transform = `translateY(${contentOffset * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrollY / window.innerHeight) * 0.3;
        }
    }

    updateScrollEffects(scrollY) {
        const viewportCenter = scrollY + window.innerHeight / 2;

        this.scrollEffectElements.forEach(section => {
            const rect = section.getBoundingClientRect();
            const elementCenter = rect.top + window.scrollY + rect.height / 2;
            const distance = Math.abs(viewportCenter - elementCenter);
            const maxDistance = window.innerHeight;
            const opacity = Math.max(0.7, 1 - distance / maxDistance * 0.3);
            const scale = Math.max(0.95, 1 - distance / maxDistance * 0.05);

            if (distance < maxDistance * 1.5) {
                section.style.opacity = opacity;
                section.style.transform = `scale(${scale})`;
            }
        });
    }

    // ===== CHART.JS INITIALIZATION =====
    initChart() {
        const chartCanvas = document.getElementById('diabetesChart');
        if (!chartCanvas) return;

        const ctx = chartCanvas.getContext('2d');
        const chartData = {
            labels: [
                'Usia 15-30 tahun',
                'Usia 30-45 tahun',
                'Usia 45-60 tahun',
                'Usia 60+ tahun'
            ],
            datasets: [{
                data: [15, 28, 35, 22],
                backgroundColor: [
                    '#56C5B6', 
                    '#109497',  
                    '#1C5C7A',  
                    '#052B56'   
                ],
                borderColor: '#FFFFFF',
                borderWidth: 3,
                borderRadius: 8,
                hoverBorderWidth: 4,
                hoverOffset: 10
            }]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto"
                        },
                        color: '#333333',
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(5, 43, 86, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: false,
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        };

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: chartOptions
        });

        const chartContainer = chartCanvas.closest('.chart-container');
        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !chartContainer.dataset.animated) {
                    chartContainer.dataset.animated = 'true';
                    this.chart.resize();
                }
            });
        }, { threshold: 0.5 });

        if (chartContainer) {
            chartObserver.observe(chartContainer);
        }
    }
}

// ===== TIMELINE ITEM SPECIAL ANIMATION =====
class TimelineAnimator {
    constructor() {
        this.timelineItems = document.querySelectorAll('.timeline-item');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateTimelineItem(entry.target);
                    } else {
                        this.resetTimelineItem(entry.target);
                    }
                });
            },
            {
                threshold: 0.3,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        this.timelineItems.forEach(item => observer.observe(item));
    }

    animateTimelineItem(item) {
        const index = Array.from(this.timelineItems).indexOf(item);
        const delay = index * 100; 

        setTimeout(() => {
            item.classList.add('visible');
        }, delay);
    }

    resetTimelineItem(item) {
        item.classList.remove('visible');
    }
}

// ===== SMOOTH SCROLL ENHANCEMENT =====
class SmoothScrollEnhancer {
    constructor() {
        this.init();
    }

    init() {
        if (!CSS.supports('scroll-behavior', 'smooth')) {
            this.polyfillSmoothScroll();
        }
        this.setupScrollHints();
    }

    polyfillSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    setupScrollHints() {
        const scrollHint = document.querySelector('.hero__scroll-hint');
        if (!scrollHint) return;
        let hasScrolled = false;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100 && !hasScrolled) {
                hasScrolled = true;
                scrollHint.style.opacity = '0';
                scrollHint.style.pointerEvents = 'none';
                scrollHint.style.transition = 'opacity 0.3s ease-out';
            } else if (window.scrollY < 100 && hasScrolled) {
                hasScrolled = false;
                scrollHint.style.opacity = '1';
                scrollHint.style.pointerEvents = 'auto';
            }
        });
    }
}

// ===== INTERACTIVE CARD ENHANCEMENTS =====
class CardInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupCardHovers();
        this.setupMobileTap();
    }

    setupCardHovers() {
        const cards = document.querySelectorAll(
            '.trigger-card, .type-card, .prevention-card, .timeline-content'
        );

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupMobileTap() {
        const cards = document.querySelectorAll(
            '.trigger-card, .type-card, .prevention-card, .timeline-content'
        );

        cards.forEach(card => {
            card.addEventListener('touchstart', () => {
                card.style.transform = 'scale(0.98)';
            });

            card.addEventListener('touchend', () => {
                card.style.transform = 'scale(1)';
            });
        });
    }
}

// ===== PERFORMANCE MONITORING =====
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            if (window.performance && window.performance.timing) {
                const perfTiming = window.performance.timing;
                const loadTime = perfTiming.loadEventEnd - perfTiming.navigationStart;
                console.log(`Page loaded in ${loadTime}ms`);
            }
        });
        this.monitorScrollFPS();
    }

    monitorScrollFPS() {
        let lastFrameTime = performance.now();
        let frameCount = 0;

        const measureFPS = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastFrameTime;
            
            if (deltaTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / deltaTime);
                if (fps < 30) {
                    console.warn(`Low FPS detected: ${fps}`);
                }
                frameCount = 0;
                lastFrameTime = currentTime;
            }
            frameCount++;
            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    }
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    const animationController = new AnimationController();
    const timelineAnimator = new TimelineAnimator();
    const smoothScroll = new SmoothScrollEnhancer();
    const cardInteractions = new CardInteractions();
    const performanceMonitor = new PerformanceMonitor();

    console.log('Diabetes Education Page Initialized');
    console.log('All animations and interactions are live');
});

// ===== UTILITY FUNCTIONS =====

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

window.addEventListener('resize', debounce(() => {
    console.log('Window resized - animations recalculated');
}, 250));

// ===== ACCESSIBILITY ENHANCEMENTS =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
    document.documentElement.style.setProperty('--transition-fast', '0.01ms');
    document.documentElement.style.setProperty('--transition-normal', '0.01ms');
    document.documentElement.style.setProperty('--transition-slow', '0.01ms');
    console.log('Reduced motion mode enabled');
}

// ===== ERROR HANDLING =====

window.addEventListener('error', (event) => {
    console.error('Error occurred:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});