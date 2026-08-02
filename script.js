// =========================================
// PORTFOLIO JAVASCRIPT
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    initPageLoadExperience();
    initTheme();

    // Initialize all components
    initNavigation();
    initNavDateTime();
    initRotatingTitles();
    initSkeletonLoaders();
    initProjectModal();
    initScrollReveal();
    initContactForm();
    initNewsletterSignup();
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
// THEME TOGGLE
// =========================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle?.querySelector('.sun-icon');
    const moonIcon = themeToggle?.querySelector('.moon-icon');
    
    if (!themeToggle || !sunIcon || !moonIcon) return;

    // Use saved preference only so the default stays light.
    const savedTheme = localStorage.getItem('portfolio-theme');
    
    const setTheme = (isDark) => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            document.documentElement.removeAttribute('data-theme');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    };

    // Initialize theme
    if (savedTheme === 'dark') {
        setTheme(true);
    } else {
        setTheme(false);
    }

    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.hasAttribute('data-theme');
        setTheme(!isDark);
        localStorage.setItem('portfolio-theme', !isDark ? 'dark' : 'light');
    });
}

// =========================================
// NAVIGATION
// =========================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const ensureNavCtas = () => {
        if (!navMenu || navMenu.querySelector('.nav-cta-group')) return;

        const ctaGroup = document.createElement('li');
        ctaGroup.className = 'nav-cta-group';
        ctaGroup.innerHTML = `
            <a class="nav-cta-link nav-cta-link--outline" href="index.html#portfolio">Portfolio</a>
            <a class="nav-cta-link nav-cta-link--solid" href="contact.html">Contact Me</a>
        `;

        navMenu.appendChild(ctaGroup);
    };

    ensureNavCtas();

    const navInteractiveLinks = document.querySelectorAll('.nav-link, .nav-cta-link');
    let lastScroll = 0;
    let navScrollFrame = 0;

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close menu when clicking a link
    navInteractiveLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle?.classList.remove('active');
            navMenu?.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    const logoLinks = document.querySelectorAll('.nav-logo, .footer-logo-link');
    logoLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const hero = document.getElementById('hero');
            if (!hero) return;
            event.preventDefault();
            hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    const sections = document.querySelectorAll('section[id]');
    const navLinkMap = new Map(
        Array.from(navLinks).map(link => [link.getAttribute('href'), link])
    );

    const setActiveNavLink = (targetHref) => {
        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === targetHref;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    let currentPageHref = Array.from(navLinks).find(link => {
        const href = link.getAttribute('href') || '';
        return href.split('#')[0] === currentPath;
    })?.getAttribute('href');

    if (!currentPageHref && currentPath.endsWith('-case-study.html')) {
        currentPageHref = 'case-studies.html';
    }

    if (currentPageHref) {
        setActiveNavLink(currentPageHref);
    }

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

            setActiveNavLink(activeLink.getAttribute('href'));
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
    const modalMainView = modal.querySelector('.modal-main-view');
    const modalDetailsView = modal.querySelector('.modal-details-view');
    const learnMoreBtn = modal.querySelector('.learn-more-btn');
    const modalBackBtn = modal.querySelector('.modal-back-btn');
    const modalCaseStudyContent = modal.querySelector('.modal-details-content');
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
            description: 'A developer-centric collaboration platform with discussion, project sharing, and engagement workflows designed for modern product teams. DevBug enables developers to connect, share their ongoing projects, ask for help on complex bugs, and build a portfolio of their contributions. The platform integrates seamlessly with GitHub, allowing users to import repositories, track issue resolution, and showcase their technical expertise within an active, supportive community.',
            tech: ['PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'highlight.js'],
            thumbnail: 'images/DevBug/Thumbnail.webp',
            images: [
                'images/DevBug/Mainpage.webp',
                'images/DevBug/Dashboard.webp',
                'images/DevBug/Bugs.webp',
                'images/DevBug/Solutions.webp',
                'images/DevBug/Leaderboard.webp',
                'images/DevBug/Chat.webp',
                'images/DevBug/User_profile.webp',
                'images/DevBug/Registration.webp',
                'images/DevBug/About.webp'
            ],
            link: 'https://devbug.gt.tc',
            caseStudy: 'devbug-case-study.html',
            github: 'https://github.com/m-saad-1/DevBug'
        },
        2: {
            title: 'FashionHub',
            tagline: 'E-commerce Platform',
            icon: '🛍️',
            iconImage: 'images/Fashionhub.webp',
            description: 'A fashion storefront with product discovery, promotional storytelling, and a conversion-focused shopping interface. It provides an elegant, modern shopping experience tailored for apparel brands. With features like dynamic filtering, real-time inventory tracking, seamless cart management, and a robust admin dashboard, FashionHub ensures both customers and administrators have a frictionless journey from product discovery to final checkout.',
            tech: ['PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'Node.js + Express', 'Stripe SDK'],
            thumbnail: 'images/FashionHub/thumbnail-900.webp',
            images: [
                'images/FashionHub/Main_page.webp',
                'images/FashionHub/Shop_page.webp',
                'images/FashionHub/Cart.webp',
                'images/FashionHub/Signup.webp',
                'images/FashionHub/Dashboard.webp',
                'images/FashionHub/Admin_panel.webp',
                'images/FashionHub/About.webp',
                'images/FashionHub/Contact.webp'
            ],
            link: 'https://fashion-hub.gt.tc',
            caseStudy: 'fashionhub-case-study.html',
            github: 'https://github.com/m-saad-1/Men-Fashion-Hub'
        },
        3: {
            title: 'Progress OS',
            tagline: 'Productivity Dashboard',
            icon: '📋',
            iconImage: 'images/personalOS.webp',
            description: 'A progress operating system for workflow management with focused modules for planning, tracking, and execution. Designed to replace fragmented productivity tools, Progress OS unifies your tasks, habits, and long-term goals into a single cohesive dashboard. It features deep analytics, daily review mechanisms, and Pomodoro-style time tracking to help you maintain deep work focus and systematically achieve your objectives.',
            tech: ['Electron', 'Node.js', 'SQLite', 'React 18', 'TypeScript', 'Vite', 'Tailwind CSS'],
            thumbnail: 'images/PersonalOS/thumbnail.avif',
            images: [
                'images/PersonalOS/Dashboard.webp',
                'images/PersonalOS/Task_page.webp',
                'images/PersonalOS/Goals_page.webp',
                'images/PersonalOS/Habits_page.webp',
                'images/PersonalOS/Time_management_page.webp',
                'images/PersonalOS/Notes_page.webp',
                'images/PersonalOS/Analytics_page.webp',
                'images/PersonalOS/Reviews_page.webp',
                'images/PersonalOS/Archive_page.webp',
                'images/PersonalOS/Settings.webp'
            ],
            link: 'https://progress-os.netlify.app',
            caseStudy: 'progress-os-case-study.html',
            github: 'https://github.com/m-saad-1/Progress-Operating-System'
        },
        4: {
            title: 'VisualShare',
            tagline: 'Social Image Sharing App',
            icon: '🖼️',
            iconImage: 'images/visualshare.webp',
            description: 'A visual-first social experience focused on streamlined sharing, feed clarity, and strong content presentation. Inspired by minimalist design principles, VisualShare allows creators to upload high-resolution imagery and curate their portfolios without the noise of typical social media algorithms. It includes real-time interactions, custom mood boards, and secure cloud storage powered by Firebase.',
            tech: ['React', 'Firebase', 'Storage', 'Realtime DB'],
            thumbnail: 'images/VisualShare/thumbnail-900.webp',
            images: [
                'images/VisualShare/visual.webp',
                'images/VisualShare/visual1.webp',
                'images/VisualShare/visual2.webp',
                'images/VisualShare/visual3.webp',
                'images/VisualShare/visual4.webp'
            ],
            link: 'https://visualshare.gt.tc',
            caseStudy: 'visualshare-case-study.html',
            github: 'https://github.com/m-saad-1/VisualShare'
        },
        5: {
            title: 'Apple Leaf Disease Detection System',
            tagline: 'Agritech Computer Vision',
            icon: '🌿',
            description: 'A machine-learning concept focused on identifying crop health issues from image samples to support faster field-level diagnostics. Utilizing advanced convolutional neural networks and Grad-CAM explainability, this tool allows farmers to upload photos of apple leaves and receive instant, highly accurate disease classifications. It bridges the gap between complex AI models and accessible agricultural solutions.',
            tech: ['Python', 'TensorFlow / Keras', 'Flask', 'OpenCV', 'EfficientNet', 'Grad-CAM', 'NumPy'],
            thumbnail: 'images/leaf_disease_detection/thumbnail-900.webp',
            images: [
                'images/leaf_disease_detection/thumbnail-900.webp',
                'images/leaf_disease_detection/Uplaodimage_and_predictedimageanddetails.webp',
                'images/leaf_disease_detection/Diseasedimage_prediction.webp',
                'images/leaf_disease_detection/Healthyimageprediction.webp',
                'images/leaf_disease_detection/Gradcam_attentionmapanalysis_Explainability.webp'
            ],
            link: '',
            caseStudy: 'apple-leaf-case-study.html',
            github: 'https://github.com/m-saad-1/Apple_leaf_disease_detection'
        },
        6: {
            title: 'Broady',
            tagline: 'Multi-Brand Fashion Marketplace',
            icon: '🛍️',
            description: 'A production-level multi-brand fashion marketplace featuring product discovery, brand dashboards, orders, returns, and event-driven operations. Built with a robust microservices-inspired architecture, Broady handles complex split-cart checkouts, cross-brand inventory sync, and real-time faceted search using Meilisearch. It provides independent boutiques with powerful analytics while offering consumers a seamless, unified shopping experience.',
            tech: ['Next.js', 'Express', 'Prisma', 'PostgreSQL', 'Redis'],
            thumbnail: 'images/Broady/Broady/thumbnail-900.avif',
            images: [
                'images/Broady/Broady/Main_page.avif',
                'images/Broady/Broady/Catalog_page.avif',
                'images/Broady/Broady/Products_page.avif',
                'images/Broady/Broady/Cart.avif',
                'images/Broady/Broady/Checkout.avif',
                'images/Broady/Broady/Customer_dashboard.avif',
                'images/Broady/Broady/Orde_details.avif',
                'images/Broady/Broady/Brand_Dashabord.avif',
                'images/Broady/Broady/Ingestion_control.avif',
                'images/Broady/Broady/Brand_operations_request.avif',
                'images/Broady/Broady/Admin_pannel.avif',
                'images/Broady/Broady/Admin_brand_dashboard.avif',
                'images/Broady/Broady/Admin_brands_management.avif',
                'images/Broady/Broady/exchangerequests,refund,deliveryfailure,damagedisputes.avif',
                'images/Broady/Broady/Login_registration_page.avif'
            ],
            link: '',
            caseStudy: 'broady-case-study.html',
            github: 'https://github.com/m-saad-1/broady'
        },
        7: {
            title: 'PaperShare',
            tagline: 'Academic Research Platform',
            icon: '📄',
            description: 'A platform designed to simplify the discovery, sharing, and discussion of academic research papers. PaperShare provides a unified interface for students, researchers, and academics to request hard-to-find papers, upload documents, and engage in real-time academic discourse. Features include a dynamic leaderboard, interactive chat, and a highly organized paper repository.',
            tech: ['Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'WebSockets'],
            thumbnail: 'images/Papershare/thumbnail-900.avif',
            images: [
                'images/Papershare/Main_page.avif',
                'images/Papershare/Dashboard.avif',
                'images/Papershare/Leaderboard.avif',
                'images/Papershare/Papers_page.avif',
                'images/Papershare/Chat_page.avif',
                'images/Papershare/Requested_papers.avif',
                'images/Papershare/Upload.avif'
            ],
            link: 'https://papershare.vercel.app',
            caseStudy: 'papershare-case-study.html',
            github: 'https://github.com/m-saad-1/papershare'
        },
        8: {
            title: 'ReceptionAI',
            tagline: 'Multi-Vertical AI Receptionist',
            icon: 'AI',
            description: 'A multi-vertical AI receptionist demo that routes conversations across restaurant, salon, dental, and gym personas. The backend streams Gemini responses over SSE, persists each conversation in MongoDB, and extracts structured lead data into a live admin view so business owners can see captured names, requests, and follow-up needs in real time.',
            tech: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Zustand', 'Node.js', 'Express', 'MongoDB'],
            thumbnail: 'images/AI_Chatbot/thumbnail-900.avif',
            images: [
                'images/AI_Chatbot/thumbnail-900.avif'
            ],
            link: 'https://multireceptionai.vercel.app/',
            caseStudy: 'ai-chatbot-case-study.html',
            github: 'https://github.com/m-saad-1/receptionai'
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
    let modalLayoutFrame = 0;

    function updateModalDensity() {
        if (!modalMainView || !modalTech || !modalDescription) return;

        const techItems = Array.from(modalTech.children);
        if (!techItems.length) {
            modalMainView.classList.remove('is-tech-heavy');
            return;
        }

        const firstTop = techItems[0].offsetTop;
        const hasMultipleRows = techItems.some(item => Math.abs(item.offsetTop - firstTop) > 2);
        modalMainView.classList.toggle('is-tech-heavy', window.innerWidth <= 768 && hasMultipleRows);
    }

    function scheduleModalDensityUpdate() {
        if (modalLayoutFrame) {
            cancelAnimationFrame(modalLayoutFrame);
        }

        modalLayoutFrame = requestAnimationFrame(updateModalDensity);
    }

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

        // Handle Learn More / Case Study
        const modalCaseStudy = modal.querySelector('.modal-casestudy');
        if (project.caseStudy) {
            if (modalCaseStudy) {
                modalCaseStudy.href = project.caseStudy;
                modalCaseStudy.style.display = 'inline-flex';
            }
            if (learnMoreBtn) learnMoreBtn.style.display = 'inline-flex';
        } else {
            if (modalCaseStudy) modalCaseStudy.style.display = 'none';
            if (learnMoreBtn) learnMoreBtn.style.display = 'none';
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
        scheduleModalDensityUpdate();
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
        
        // Reset pan/zoom state
        currentZoom = 1;
        panX = 0;
        panY = 0;
        updateTransform();

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
        
        currentZoom = 1;
        panX = 0;
        panY = 0;
        updateTransform();
    }

    // Keyboard navigation for carousel & lightbox
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') {
            previousSlide();
            if (lightbox.classList.contains('active') && currentProject && currentProject.images[currentCarouselIndex]) {
                openLightbox(currentProject.images[currentCarouselIndex]);
            }
        }
        if (e.key === 'ArrowRight') {
            nextSlide();
            if (lightbox.classList.contains('active') && currentProject && currentProject.images[currentCarouselIndex]) {
                openLightbox(currentProject.images[currentCarouselIndex]);
            }
        }
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

    // Lightbox Next/Prev Buttons
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (event) => {
            event.stopPropagation();
            previousSlide();
            if (currentProject && currentProject.images[currentCarouselIndex]) {
                openLightbox(currentProject.images[currentCarouselIndex]);
            }
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (event) => {
            event.stopPropagation();
            nextSlide();
            if (currentProject && currentProject.images[currentCarouselIndex]) {
                openLightbox(currentProject.images[currentCarouselIndex]);
            }
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (event) => {
            if (event.target === lightbox || event.target === lightboxStage) {
                closeLightbox();
            }
        });
    }

    // Advanced Pan & Zoom Logic
    let currentZoom = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let panX = 0, panY = 0;
    let initialPinchDistance = null;

    function updateTransform() {
        if (lightboxImage) {
            lightboxImage.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
        }
    }

    if (lightboxImage) {
        // Double click to zoom
        lightboxImage.addEventListener('dblclick', (event) => {
            event.stopPropagation();
            if (currentZoom > 1) {
                currentZoom = 1;
                panX = 0;
                panY = 0;
            } else {
                currentZoom = 2.5;
            }
            updateTransform();
        });

        // Mouse Wheel Zoom
        lightboxImage.addEventListener('wheel', (event) => {
            if (!lightbox || !lightbox.classList.contains('active')) return;
            event.preventDefault();
            
            const zoomAmount = -event.deltaY * 0.005;
            const newZoom = Math.min(Math.max(0.5, currentZoom + zoomAmount), 10); // clamp zoom 0.5x to 10x
            
            // Zoom towards pointer
            const rect = lightboxImage.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            panX -= mouseX / currentZoom * (newZoom - currentZoom);
            panY -= mouseY / currentZoom * (newZoom - currentZoom);
            
            currentZoom = newZoom;
            updateTransform();
        }, { passive: false });

        // Pointer Events for Dragging and Pinching
        lightboxImage.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            isDragging = true;
            startX = event.clientX - panX;
            startY = event.clientY - panY;
            lightboxImage.setPointerCapture(event.pointerId);
        });

        lightboxImage.addEventListener('pointermove', (event) => {
            if (!isDragging) return;
            panX = event.clientX - startX;
            panY = event.clientY - startY;
            updateTransform();
        });

        lightboxImage.addEventListener('pointerup', (event) => {
            isDragging = false;
            lightboxImage.releasePointerCapture(event.pointerId);
        });

        lightboxImage.addEventListener('pointercancel', (event) => {
            isDragging = false;
            lightboxImage.releasePointerCapture(event.pointerId);
        });
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

    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', async () => {
            if (!currentProject || !currentProject.caseStudy) return;
            
            modalMainView.style.display = 'none';
            modalDetailsView.style.display = 'flex';
            modalCaseStudyContent.innerHTML = '<p style="padding: 2rem; text-align: center;">Loading details...</p>';
            
            try {
                const response = await fetch(currentProject.caseStudy);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract relevant sections (user requested to omit the hero and meta grid)
                const style = doc.querySelector('style');
                const body = doc.querySelector('.case-study-body');
                
                modalCaseStudyContent.innerHTML = '';
                if (style) modalCaseStudyContent.appendChild(style.cloneNode(true));
                if (body) modalCaseStudyContent.appendChild(body);
                
                // Reset scroll position
                modal.querySelector('.modal-body').scrollTop = 0;
                
            } catch (error) {
                console.error('Failed to load case study:', error);
                modalCaseStudyContent.innerHTML = '<p style="padding: 2rem; text-align: center; color: red;">Failed to load project details.</p>';
            }
        });
    }

    if (modalBackBtn) {
        modalBackBtn.addEventListener('click', () => {
            modalDetailsView.style.display = 'none';
            modalMainView.style.display = 'block';
            modalMainView.classList.remove('is-tech-heavy');
            modalCaseStudyContent.innerHTML = '';
        });
    }

    function openModal() {
        if (modalMainView && modalDetailsView) {
            modalMainView.style.display = 'block';
            modalDetailsView.style.display = 'none';
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modal.querySelector('.modal-body').scrollTop = 0;
        requestAnimationFrame(scheduleModalDensityUpdate);
    }

    function closeModal() {
        modal.classList.remove('active');
        modalMainView?.classList.remove('is-tech-heavy');
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
    const revealElements = document.querySelectorAll('.about-card, .about-story-card, .skill-card, .contact-card, .project-card, .feature-card, .timeline-step, .faq-item, .case-study-card, .contact-link-card, .page-hero-panel, .page-stat, .expertise-pill');

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
    const grids = document.querySelectorAll('.skills-grid, .portfolio-grid, .feature-grid, .timeline-grid, .case-study-grid, .contact-links-list');
    grids.forEach(grid => {
        const items = grid.querySelectorAll('.skill-card, .project-card, .feature-card, .timeline-step, .case-study-card, .contact-link-card');
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
// NEWSLETTER SIGNUP
// =========================================
function initNewsletterSignup() {
    const banner = document.getElementById('newsletterBanner');
    if (!banner) return;

    const form = banner.querySelector('.newsletter-form');
    const emailInput = banner.querySelector('#newsletterEmail');
    const submitBtn = banner.querySelector('.newsletter-submit');
    const closeBtn = banner.querySelector('.newsletter-close');
    const status = banner.querySelector('.newsletter-status');

    if (!form || !emailInput || !submitBtn || !closeBtn || !status) return;

    const dismissedKey = 'portfolio-newsletter-dismissed';
    const subscribedKey = 'portfolio-newsletter-subscribed';
    const showDelay = 7000;
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

    const isSuppressed = Boolean(localStorage.getItem(dismissedKey) || localStorage.getItem(subscribedKey));

    const openBanner = () => {
        banner.classList.add('visible');
        banner.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => emailInput.focus({ preventScroll: true }));
    };

    const closeBanner = (persist = true) => {
        banner.classList.remove('visible');
        banner.setAttribute('aria-hidden', 'true');
        if (persist) {
            localStorage.setItem(dismissedKey, '1');
        }
    };

    if (!isSuppressed) {
        window.setTimeout(() => {
            if (!localStorage.getItem(dismissedKey) && !localStorage.getItem(subscribedKey)) {
                openBanner();
            }
        }, showDelay);
    }

    closeBtn.addEventListener('click', () => closeBanner(true));

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = String(emailInput.value || '').trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            status.textContent = 'Please enter a valid email address.';
            status.classList.add('is-error');
            status.classList.remove('is-success');
            emailInput.focus();
            return;
        }

        const originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
        status.classList.remove('is-error', 'is-success');
        status.textContent = 'Sending your subscription...';

        try {
            if (isEmailJsConfigured) {
                await window.emailjs.send(config.serviceId, config.templateId, {
                    name: 'Portfolio Newsletter',
                    from_name: 'Portfolio Newsletter',
                    from_email: email,
                    email,
                    message: `Newsletter subscription request from ${email}`,
                    to_name: 'Muhammad Saad',
                    reply_to: email,
                    sent_at: new Date().toLocaleString()
                });
            } else {
                const response = await fetch('https://formsubmit.co/ajax/mhsaad23305@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'Portfolio Newsletter',
                        email,
                        message: `Newsletter subscription request from ${email}`,
                        _subject: 'New portfolio newsletter signup',
                        _captcha: 'false'
                    })
                });

                if (!response.ok) {
                    throw new Error(`Newsletter signup failed (${response.status})`);
                }
            }

            localStorage.setItem(subscribedKey, email);
            status.textContent = 'Subscribed. You will hear from me when a new case study or launch note drops.';
            status.classList.add('is-success');
            form.reset();

            window.setTimeout(() => {
                closeBanner(false);
            }, 2200);
        } catch (error) {
            console.error('Newsletter signup failed:', error);
            status.textContent = 'Something went wrong. You can still reach me at mhsaad23305@gmail.com.';
            status.classList.add('is-error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
        }
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
