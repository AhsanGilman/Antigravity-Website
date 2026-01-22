document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Smooth scrolling for anchor links (fallback/enhancement)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 70; // Header height
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Intersection Observer for active nav highlighting
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -30% 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${currentId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Typewriter Effect
    const texts = ["Bioinformatician", "Genomic Science Researcher", "DVM Graduate"];
    let count = 0;
    let index = 0;
    let currentText = "";
    let letter = "";
    let isDeleting = false;
    let typeSpeed = 100;

    (function type() {
        if (count === texts.length) {
            count = 0;
        }
        currentText = texts[count];

        if (isDeleting) {
            letter = currentText.slice(0, --index);
            typeSpeed = 50;
        } else {
            letter = currentText.slice(0, ++index);
            typeSpeed = 100;
        }

        const typeWriterText = document.getElementById('typewriter-text');
        if (typeWriterText) {
            typeWriterText.textContent = letter;
        }

        if (!isDeleting && letter.length === currentText.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && letter.length === 0) {
            isDeleting = false;
            count++;
            typeSpeed = 500; // Pause before new word
        }

        setTimeout(type, typeSpeed);
    })();

    // Image Modal Logic
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".close-modal");

    // Zoom & Pan Logic
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomOutBtn = document.getElementById("zoomOut");
    let currentZoom = 1;

    // Pan (Drag) Logic
    let isDragging = false;
    let startX, startY;
    let translateX = 0, translateY = 0;

    function updateTransform() {
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
    }

    // Reset zoom and position when opening modal
    function resetView() {
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
        modalImg.style.cursor = 'grab';
    }

    if (modal) {
        // ... (existing click logic) ...
    }

    // Add click event to all certification cards
    const certCards = document.querySelectorAll("#certifications .card");
    certCards.forEach(card => {
        card.addEventListener("click", function () {
            const img = this.querySelector(".card-img-wrapper img");
            if (img && modal) {
                modal.style.display = "flex";
                modal.style.alignItems = "center";
                modal.style.justifyContent = "center";
                modalImg.src = img.src;
                resetView(); // Reset zoom and pan on open
            }
        });
    });

    // Panning Event Listeners
    modalImg.addEventListener('mousedown', (e) => {
        if (currentZoom > 1) { // Only allow drag if zoomed in
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            modalImg.style.cursor = 'grabbing';
            e.preventDefault(); // Prevent default image drag
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            modalImg.style.cursor = 'grab';
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });

    if (zoomInBtn && modalImg) {
        zoomInBtn.onclick = function (e) {
            e.stopPropagation(); // Prevent closing modal
            currentZoom += 0.2;
            updateTransform();
        }
    }

    if (zoomOutBtn && modalImg) {
        zoomOutBtn.onclick = function (e) {
            e.stopPropagation(); // Prevent closing modal
            if (currentZoom > 0.4) {
                currentZoom -= 0.2;
                updateTransform();
            }
        }
    }

    // Close logic
    if (closeBtn) {
        closeBtn.onclick = function () {
            modal.style.display = "none";
        }
    }

    if (modal) {
        modal.onclick = function (e) {
            // Only close if clicking the background (modal) strictly, not children
            if (e.target === modal) {
                modal.style.display = "none";
            }
        }
    }
});
