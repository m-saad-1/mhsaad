// =========================================
// PORTFOLIO JAVASCRIPT
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    initPageLoadExperience();

    // Initialize all components
    initNavigation();
    initNavDateTime();
    initRotatingTitles();
    initSkeletonLoaders();
    initProjectModal();
    initScrollReveal();
    initContactForm();
    initScrollIndicator();
    initScrollToTop();
});

function initPageLoadExperience() {
    const body = document.body;
    const heroImage = document.querySelector('.hero-avatar');
    const loader = document.getElementById('pipeLoader');

    const finishLoading = () => {
        // Wait for two paint frames to ensure the hero image is rendered on screen.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                body.classList.remove('app-loading');
                if (loader) {
                    loader.classList.add('hidden');
                    setTimeout(() => loader.remove(), 220);
                }
            });
        });
    };

    if (!heroImage) {
        finishLoading();
        return;
    }

    if (heroImage.complete && heroImage.naturalWidth > 0) {
        finishLoading();
    } else {
        heroImage.addEventListener('load', finishLoading, { once: true });
        heroImage.addEventListener('error', finishLoading, { once: true });
    }
}

// =========================================
// NAVIGATION
// =========================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    let lastScroll = 0;
    let navScrollFrame = 0;

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    const logoLinks = document.querySelectorAll('.nav-logo, .footer-logo-link');
    logoLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const hero = document.getElementById('hero');
            if (!hero) return;
            hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    const sections = document.querySelectorAll('section[id]');
    const navLinkMap = new Map(
        Array.from(navLinks).map(link => [link.getAttribute('href'), link])
    );

    const updateNavbarState = () => {
        const currentScroll = window.pageYOffset;

        navbar.classList.toggle('scrolled', currentScroll > 100);
        navbar.classList.toggle('hidden', currentScroll > lastScroll && currentScroll > 500);

        lastScroll = currentScroll;
        navScrollFrame = 0;
    };

    window.addEventListener('scroll', () => {
        if (navScrollFrame) return;
        navScrollFrame = requestAnimationFrame(updateNavbarState);
    }, { passive: true });

    const activeSectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const id = entry.target.getAttribute('id');
            const activeLink = navLinkMap.get(`#${id}`);
            if (!activeLink) return;

            navLinks.forEach(link => link.classList.remove('active'));
            activeLink.classList.add('active');
        });
    }, {
        rootMargin: '-35% 0px -45% 0px',
        threshold: 0.01
    });

    sections.forEach(section => activeSectionObserver.observe(section));
    updateNavbarState();
}

function initNavDateTime() {
    const timeEl = document.getElementById('navTime');
    const ampmEl = document.getElementById('navAmPm');
    const dateEl = document.getElementById('navDate');

    if (!timeEl || !ampmEl || !dateEl) return;

    const updateClock = () => {
        const now = new Date();

        const timeFormatter = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const dateFormatter = new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const parts = timeFormatter.formatToParts(now);
        const hour = parts.find(p => p.type === 'hour')?.value || '12';
        const minute = parts.find(p => p.type === 'minute')?.value || '00';
        const dayPeriod = (parts.find(p => p.type === 'dayPeriod')?.value || 'AM').toUpperCase();

        timeEl.textContent = `${hour}:${minute}`;
        ampmEl.textContent = dayPeriod;
        dateEl.textContent = dateFormatter.format(now).toUpperCase();
    };

    updateClock();
    setInterval(updateClock, 1000);
}

// =========================================
// ROTATING TITLES
// =========================================
function initRotatingTitles() {
    const titles = document.querySelectorAll('.rotating-title');
    let currentIndex = 0;
    const interval = 3000;

    if (titles.length === 0) return;

    function showNextTitle() {
        titles[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % titles.length;
        titles[currentIndex].classList.add('active');
    }

    setInterval(showNextTitle, interval);
}

function initSkeletonLoaders() {
    const mediaPairs = [
        { img: '.hero-avatar', container: '.hero-image' },
        { img: '.project-thumb-img', container: '.project-thumbnail' }
    ];

    mediaPairs.forEach(pair => {
        document.querySelectorAll(pair.img).forEach(img => {
            const container = img.closest(pair.container);
            if (!container) return;

            const markLoaded = () => container.classList.add('loaded');
            if (img.complete && img.naturalWidth > 0) {
                markLoaded();
            } else {
                img.addEventListener('load', markLoaded, { once: true });
                img.addEventListener('error', markLoaded, { once: true });
            }
        });
    });
}

// =========================================
// PROJECT MODAL
// =========================================
function initProjectModal() {
    const modal = document.getElementById('projectModal');
    if (!modal) return;

    const modalOverlay = modal.querySelector('.modal-overlay');
    const modalClose = modal.querySelector('.modal-close');
    const projectCards = document.querySelectorAll('.project-card');
    const modalTitle = modal.querySelector('.modal-title');
    const modalTagline = modal.querySelector('.modal-tagline');
    const modalPlatformIcon = modal.querySelector('.modal-platform-icon');
    const modalDescription = modal.querySelector('.modal-description');
    const modalTech = modal.querySelector('.modal-tech');
    const modalLive = modal.querySelector('.modal-live');
    const modalGithub = modal.querySelector('.modal-github');
    const slidesContainer = modal.querySelector('.carousel-slides');
    const prevBtn = modal.querySelector('.carousel-prev');
    const nextBtn = modal.querySelector('.carousel-next');
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = lightbox ? lightbox.querySelector('.lightbox-image') : null;
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const lightboxStage = lightbox ? lightbox.querySelector('.lightbox-stage') : null;

    // Project data powered by local image assets
    const projects = {
        1: {
            title: 'DevBug',
            tagline: 'Developer Community Platform',
            icon: '🐞',
            description: 'A developer-centric collaboration platform with discussion, project sharing, and engagement workflows designed for modern product teams.',
            tech: ['PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'highlight.js'],
            thumbnail: 'images/DevBug/Thumbnail.webp',
            images: [
                'images/DevBug/devbug1.webp',
                'images/DevBug/devbug2.webp',
                'images/DevBug/devbug3.webp',
                'images/DevBug/devbug4.webp',
                'images/DevBug/devbug5.webp',
                'images/DevBug/devbug6.webp',
                'images/DevBug/devbug7.webp',
                'images/DevBug/devbug8.webp',
                'images/DevBug/devbug9.webp'
            ],
            link: 'https://devbug.ct.ws',
            github: 'https://github.com/m-saad-1/DevBug'
        },
        2: {
            title: 'FashionHub',
            tagline: 'E-commerce Platform',
            icon: '🛍️',
            iconImage: 'images/Fashionhub.webp',
            description: 'A fashion storefront with product discovery, promotional storytelling, and a conversion-focused shopping interface.',
            tech: ['PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'Node.js + Express', 'Stripe SDK'],
            thumbnail: 'images/FashionHub/Thumbnail.webp',
            images: [
                'images/FashionHub/fashionhub1.webp',
                'images/FashionHub/fashionhub2.webp',
                'images/FashionHub/fashionhub3.webp',
                'images/FashionHub/fashionhub4.webp',
                'images/FashionHub/fashionhub5.webp',
                'images/FashionHub/fashionhub7.webp',
                'images/FashionHub/fashionhub8.webp',
                'images/FashionHub/fashionhub9.webp'
            ],
            link: 'https://fashionhub.ct.ws',
            github: 'https://github.com/m-saad-1/Men-Fashion-Hub'
        },
        3: {
            title: 'Personal Operating System (Personal OS)',
            tagline: 'Productivity Dashboard',
            icon: '📋',
            iconImage: 'images/personalOS.webp',
            description: 'A personal operating system for workflow management with focused modules for planning, tracking, and execution.',
            tech: ['Electron', 'Node.js', 'SQLite', 'React 18', 'TypeScript', 'Vite', 'Tailwind CSS'],
            thumbnail: 'images/PersonalOS/thumbnail.webp',
            images: [
                'images/PersonalOS/PersonalOS 1.webp',
                'images/PersonalOS/PersonalOS 2.webp',
                'images/PersonalOS/PersonalOS 3.webp',
                'images/PersonalOS/PersonalOS 4.webp',
                'images/PersonalOS/PersonalOS 5.webp',
                'images/PersonalOS/PersonalOS 6.webp',
                'images/PersonalOS/PersonalOS 7.webp',
                'images/PersonalOS/PersonalOS 8.webp',
                'images/PersonalOS/PersonalOS 9.webp',
                'images/PersonalOS/PersonalOS 10.webp'
            ],
            link: '',
            github: 'https://github.com/m-saad-1/Progress-Operating-System'
        },
        4: {
            title: 'VisualShare',
            tagline: 'Social Image Sharing App',
            icon: '🖼️',
            iconImage: 'images/visualshare.webp',
            description: 'A visual-first social experience focused on streamlined sharing, feed clarity, and strong content presentation.',
            tech: ['React', 'Firebase', 'Storage', 'Realtime DB'],
            thumbnail: 'images/VisualShare/thumbnail.webp',
            images: [
                'images/VisualShare/visual.webp',
                'images/VisualShare/visual1.webp',
                'images/VisualShare/visual2.webp',
                'images/VisualShare/visual3.webp',
                'images/VisualShare/visual4.webp'
            ],
            link: 'https://visualshare.ct.ws/',
            github: 'https://github.com/m-saad-1/VisualShare'
        },
        5: {
            title: 'Apple Leaf Disease Detection System',
            tagline: 'Agritech Computer Vision',
            icon: '🌿',
            description: 'A machine-learning concept focused on identifying crop health issues from image samples to support faster field-level diagnostics.',
            tech: ['Python', 'TensorFlow / Keras', 'Flask', 'OpenCV', 'EfficientNet', 'Grad-CAM', 'NumPy'],
            thumbnail: 'images/leaf_disease_detection/thumbnail.webp',
            images: [
                'images/leaf_disease_detection/thumbnail.webp',
                'images/leaf_disease_detection/leaf_detection1.webp',
                'images/leaf_disease_detection/leaf_detection2.webp',
                'images/leaf_disease_detection/leaf_detection4.webp',
                'images/leaf_disease_detection/3.webp'
            ],
            link: '',
            github: 'https://github.com/m-saad-1/Apple_leaf_disease_detection'
        }
    };

    let currentCarouselIndex = 0;
    let currentProject = null;
    let currentProjectId = null;
    let currentProjectSlides = [];
    let touchStartX = 0;
    let touchEndX = 0;
    let lightboxZoomed = false;
    let carouselUpdateFrame = 0;
    let lightboxZoomFrame = 0;
    let pendingCarouselIndex = 0;
    let pendingZoomState = false;
    let wheelZoomAccumulator = 0;
    const decodedImageCache = new Set();

    function preloadImage(src) {
        if (!src) return Promise.resolve();
        if (decodedImageCache.has(src)) return Promise.resolve();

        return new Promise(resolve => {
            const image = new Image();
            image.decoding = 'async';
            image.loading = 'eager';
            image.src = src;

            const settle = async () => {
                try {
                    if (typeof image.decode === 'function') {
                        await image.decode();
                    }
                } catch (_) {
                    // Keep the UI responsive even if decode rejects.
                }
                decodedImageCache.add(src);
                resolve();
            };

            if (image.complete) {
                settle();
                return;
            }

            image.addEventListener('load', settle, { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
        });
    }

    function markMediaLoaded(container) {
        if (container) {
            container.classList.add('loaded');
        }
    }

    function hydrateSlideImage(slide) {
        if (!slide) return;

        const slideImage = slide.querySelector('img');
        const source = slideImage?.dataset.src;
        if (!slideImage || !source || slide.dataset.hydrated === 'true') return;

        slide.dataset.hydrated = 'true';

        const markLoaded = () => markMediaLoaded(slide);
        slideImage.addEventListener('load', markLoaded, { once: true });
        slideImage.addEventListener('error', markLoaded, { once: true });
        slideImage.src = source;
    }

    function hydrateVisibleSlides(activeIndex) {
        if (!currentProjectSlides.length) return;

        const totalSlides = currentProjectSlides.length;
        const visibleSlides = Math.min(getVisibleSlides(), totalSlides);
        const preloadRadius = Math.min(totalSlides, visibleSlides + 1);

        for (let offset = 0; offset < preloadRadius; offset += 1) {
            const slideIndex = (activeIndex + offset) % totalSlides;
            hydrateSlideImage(currentProjectSlides[slideIndex]);
        }
    }

    // Open modal
    projectCards.forEach(card => {
        const openProjectFromCard = () => {
            const projectId = card.dataset.project;
            const project = projects[projectId];

            if (project) {
                currentProject = project;
                currentProjectId = projectId;
                currentCarouselIndex = 0;
                populateModal(project);
                openModal();
            }
        };

        card.addEventListener('click', openProjectFromCard);
        card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            openProjectFromCard();
        });
    });

    // Close modal
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
            return;
        }
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function populateModal(project) {
        // Title and Icon
        modalTitle.textContent = project.title;
        modalTagline.textContent = project.tagline || '';
        if (project.iconImage) {
            modalPlatformIcon.innerHTML = `<img src="${project.iconImage}" alt="${project.title} logo" class="project-logo-icon modal-logo-icon">`;
        } else {
            modalPlatformIcon.textContent = project.icon;
        }

        // Description
        modalDescription.textContent = project.description;

        // Tech stack
        modalTech.replaceChildren(...project.tech.map(tech => {
            const techTag = document.createElement('span');
            techTag.textContent = tech;
            return techTag;
        }));

        // Update links
        if (project.link) {
            modalLive.href = project.link;
            modalLive.style.display = 'inline-flex';
        } else {
            modalLive.removeAttribute('href');
            modalLive.style.display = 'none';
        }

        if (project.github) {
            modalGithub.href = project.github;
            modalGithub.style.display = 'inline-flex';
        } else {
            modalGithub.removeAttribute('href');
            modalGithub.style.display = 'none';
        }

        // Carousel
        populateCarousel(project);
    }

    function populateCarousel(project) {
        if (!currentProjectId) return;

        const fragment = document.createDocumentFragment();

        project.images.forEach((image, index) => {
            const slide = document.createElement('button');
            slide.className = `carousel-slide${index === 0 ? ' active' : ''}`;
            slide.type = 'button';
            slide.dataset.index = String(index);
            slide.setAttribute('aria-label', `Open image ${index + 1}`);

            const slideImage = document.createElement('img');
            slideImage.alt = `${project.title} preview ${index + 1}`;
            slideImage.decoding = 'async';
            slideImage.loading = index < 2 ? 'eager' : 'lazy';
            slideImage.fetchPriority = index === 0 ? 'high' : 'low';
            slideImage.dataset.src = image;

            if (index === 0 && decodedImageCache.has(image)) {
                slideImage.src = image;
                slide.dataset.hydrated = 'true';
                markMediaLoaded(slide);
            } else if (index < 2) {
                slideImage.src = image;
                slide.dataset.hydrated = 'true';
            }

            slide.appendChild(slideImage);
            fragment.appendChild(slide);
        });

        slidesContainer.replaceChildren(fragment);
        currentProjectSlides = Array.from(slidesContainer.querySelectorAll('.carousel-slide'));
        currentCarouselIndex = 0;
        pendingCarouselIndex = 0;

        prevBtn.onclick = previousSlide;
        nextBtn.onclick = nextSlide;

        currentProjectSlides.forEach(slide => {
            const slideImage = slide.querySelector('img');
            if (slideImage) {
                const markLoaded = () => slide.classList.add('loaded');
                if (slideImage.complete && slideImage.naturalWidth > 0) {
                    markLoaded();
                } else {
                    slideImage.addEventListener('load', markLoaded, { once: true });
                    slideImage.addEventListener('error', markLoaded, { once: true });
                }
            }
        });

        hydrateVisibleSlides(0);
        goToSlide(0);

        project.images.slice(0, Math.min(2, project.images.length)).forEach(image => {
            preloadImage(image);
        });
    }

    function getVisibleSlides() {
        if (window.innerWidth <= 480) return 2;
        if (window.innerWidth <= 992) return 3;
        return 4;
    }

    function goToSlide(index) {
        if (!currentProjectSlides.length) return;

        const totalSlides = currentProjectSlides.length;
        const visibleSlides = Math.min(getVisibleSlides(), totalSlides);
        const maxStartIndex = Math.max(0, totalSlides - visibleSlides);

        pendingCarouselIndex = (index + totalSlides) % totalSlides;
        currentCarouselIndex = pendingCarouselIndex;

        if (carouselUpdateFrame) return;

        carouselUpdateFrame = requestAnimationFrame(() => {
            carouselUpdateFrame = 0;

            if (!currentProjectSlides.length) return;

            const normalizedIndex = pendingCarouselIndex % currentProjectSlides.length;
            hydrateVisibleSlides(normalizedIndex);
            currentProjectSlides.forEach((slide, slideIndex) => {
                slide.classList.toggle('active', slideIndex === normalizedIndex);
            });

            const startIndex = Math.min(normalizedIndex, maxStartIndex);
            const offset = (startIndex * 100) / visibleSlides;
            slidesContainer.style.transform = `translate3d(-${offset}%, 0, 0)`;
        });
    }

    function openLightbox(src) {
        if (!lightbox || !lightboxImage || !lightboxStage) return;
        lightbox.classList.add('loading');
        lightboxStage.classList.remove('loaded');
        lightboxImage.removeAttribute('src');
        lightboxZoomed = false;
        lightboxImage.classList.remove('zoomed');
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');

        const stageImage = new Image();
        stageImage.decoding = 'async';
        stageImage.src = src;

        const applyLightboxImage = async () => {
            try {
                if (typeof stageImage.decode === 'function') {
                    await stageImage.decode();
                }
            } catch (_) {
                // Ignore decode failures and still reveal the image.
            }

            if (!lightbox.classList.contains('active')) return;

            lightboxImage.src = src;
            lightbox.classList.remove('loading');
            lightboxStage.classList.add('loaded');
            decodedImageCache.add(src);
        };

        if (stageImage.complete) {
            applyLightboxImage();
            return;
        }

        stageImage.addEventListener('load', applyLightboxImage, { once: true });
        stageImage.addEventListener('error', () => {
            if (!lightbox.classList.contains('active')) return;
            lightboxImage.src = src;
            lightbox.classList.remove('loading');
            lightboxStage.classList.add('loaded');
        }, { once: true });
    }

    function closeLightbox() {
        if (!lightbox || !lightboxImage || !lightboxStage) return;
        lightbox.classList.remove('active');
        lightbox.classList.remove('loading');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxZoomed = false;
        lightboxImage.classList.remove('zoomed');
        lightboxImage.src = '';
        lightboxStage.classList.remove('loaded');
        wheelZoomAccumulator = 0;
        pendingZoomState = false;
        if (lightboxZoomFrame) {
            cancelAnimationFrame(lightboxZoomFrame);
            lightboxZoomFrame = 0;
        }
    }

    // Keyboard navigation for carousel
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') previousSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    window.addEventListener('resize', () => {
        if (modal.classList.contains('active')) {
            goToSlide(currentCarouselIndex);
        }
    });

    const carouselContainer = modal.querySelector('.carousel-container');
    carouselContainer.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (event) => {
        touchEndX = event.changedTouches[0].clientX;
        const delta = touchEndX - touchStartX;
        if (Math.abs(delta) < 40) return;
        if (delta > 0) {
            previousSlide();
        } else {
            nextSlide();
        }
    }, { passive: true });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }

    if (lightboxImage) {
        lightboxImage.addEventListener('click', (event) => {
            event.stopPropagation();
            lightboxZoomed = !lightboxZoomed;
            lightboxImage.classList.toggle('zoomed', lightboxZoomed);
        });

        lightboxImage.addEventListener('wheel', (event) => {
            if (!lightbox || !lightbox.classList.contains('active')) return;
            event.preventDefault();
            wheelZoomAccumulator += event.deltaY;

            if (Math.abs(wheelZoomAccumulator) < 48) return;

            pendingZoomState = wheelZoomAccumulator < 0;
            wheelZoomAccumulator = 0;

            if (lightboxZoomFrame) return;

            lightboxZoomFrame = requestAnimationFrame(() => {
                lightboxZoomFrame = 0;
                lightboxZoomed = pendingZoomState;
                lightboxImage.classList.toggle('zoomed', lightboxZoomed);
            });
        }, { passive: false });
    }

    slidesContainer.addEventListener('click', (event) => {
        const slide = event.target.closest('.carousel-slide');
        if (!slide || !slidesContainer.contains(slide)) return;

        const index = Number(slide.dataset.index);
        if (Number.isNaN(index)) return;

        goToSlide(index);
        if (currentProject && currentProject.images[index]) {
            openLightbox(currentProject.images[index]);
        }
    });

    function previousSlide() {
        goToSlide(currentCarouselIndex - 1);
    }

    function nextSlide() {
        goToSlide(currentCarouselIndex + 1);
    }

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        closeLightbox();
        if (carouselUpdateFrame) {
            cancelAnimationFrame(carouselUpdateFrame);
            carouselUpdateFrame = 0;
        }
        document.body.style.overflow = '';
    }
}

// =========================================
// SCROLL REVEAL ANIMATIONS
// =========================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.about-card, .skill-card, .contact-card, .project-card');

    revealElements.forEach(el => {
        el.classList.add('reveal');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Clear transition delay after the animation completes so hover effects are instant
                const delay = parseFloat(entry.target.style.transitionDelay) || 0;
                const duration = 0.35; // Matches the 0.35s transition in styles.css
                setTimeout(() => {
                    entry.target.style.transitionDelay = '';
                }, (delay + duration) * 1000);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.01,
        rootMargin: '80px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    // Stagger animation for grid items
    const grids = document.querySelectorAll('.skills-grid, .portfolio-grid');
    grids.forEach(grid => {
        const items = grid.querySelectorAll('.skill-card, .project-card');
        items.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.03}s`;
        });
    });
}

// =========================================
// CONTACT FORM
// =========================================
function initContactForm() {
    const form = document.getElementById('contactForm');

    if (!form) return;

    const EMAILJS_CONFIG = {
        publicKey: 'jwAK1lWQGhjwf2PL8',
        serviceId: 'service_jsn6z3m',
        templateId: 'template_pyqy19b'
    };

    const config = window.EMAILJS_CONFIG || EMAILJS_CONFIG;
    const isEmailJsConfigured = !!(
        window.emailjs &&
        config.publicKey && !config.publicKey.startsWith('YOUR_') &&
        config.serviceId && !config.serviceId.startsWith('YOUR_') &&
        config.templateId && !config.templateId.startsWith('YOUR_')
    );

    if (isEmailJsConfigured) {
        window.emailjs.init({ publicKey: config.publicKey });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            name: form.querySelector('#name').value,
            email: form.querySelector('#email').value,
            message: form.querySelector('#message').value
        };

        // Simulate form submission
        const submitBtn = form.querySelector('.form-submit');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const handleSuccess = () => {
            submitBtn.textContent = 'Message Sent!';
            setTimeout(() => {
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1800);
        };

        const handleFailure = () => {
            submitBtn.textContent = 'Send Failed';
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1800);
        };

        if (isEmailJsConfigured) {
            window.emailjs
                .send(config.serviceId, config.templateId, {
                    from_name: formData.name,
                    from_email: formData.email,
                    message: formData.message,
                    to_name: 'Muhammad Saad',
                    reply_to: formData.email,
                    sent_at: new Date().toLocaleString()
                })
                .then(handleSuccess)
                .catch(handleFailure);
        } else {
            // Fallback mode if credentials are not configured yet.
            setTimeout(handleSuccess, 900);
            console.log('EmailJS not configured yet. Add credentials in window.EMAILJS_CONFIG.');
            console.log('Form submitted (fallback):', formData);
        }
    });

    // Input animations
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });
}

// =========================================
// SCROLL INDICATOR
// =========================================
function initScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator');

    if (!indicator) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            indicator.style.opacity = '0';
            indicator.style.visibility = 'hidden';
        } else {
            indicator.style.opacity = '1';
            indicator.style.visibility = 'visible';
        }
    });

    indicator.addEventListener('click', () => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (!scrollTopBtn) return;

    const toggleButton = () => {
        if (window.pageYOffset > 320) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    };

    window.addEventListener('scroll', toggleButton);
    toggleButton();

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =========================================
// UTILITY FUNCTIONS
// =========================================

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Only intercept actual in-page anchor navigation.
        if (!href || href === '#' || !href.startsWith('#')) {
            return;
        }

        const target = document.querySelector(href);
        if (!target) {
            return;
        }

        e.preventDefault();
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Prevent right-click on images (optional)
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', (e) => e.preventDefault());
});

// Removed parallax and delayed body-load animation to prevent scroll jank and section paint artifacts.

// =========================================
// THEME TOGGLE (Optional future feature)
// =========================================
function initThemeToggle() {
    // Placeholder for dark mode toggle
    // Can be implemented if requested
}

// =========================================
// CURSOR EFFECTS (Optional luxury feature)
// =========================================
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// Uncomment to enable custom cursor
// initCustomCursor();
