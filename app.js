// Particle system background
let particles = [];
const HOME_PARTICLE_COUNT = 150;  // Reduced number of particles in home section
const OTHER_PARTICLE_COUNT = 40;    // Reduced number for other sections
let currentSection = 'home';
const INTERACTION_RADIUS = 200;  // How close the cursor needs to be to affect particles
let contentElements = [];  // Array to store content element boundaries
const SAFE_ZONE = {};  // Define a safe zone around text to prevent spawning particles there

class Particle {
    constructor(opacity = 1) {
        // Create particle at a random position
        this.position = createVector(random(width), random(height));
        // Slower velocity for more gentle movement
        this.velocity = createVector(random(-0.8, 0.8), random(-0.8, 0.8));
        this.size = random(8, 18);
        
        // Assign one of several colors in blue monochromatic palette
        this.colorType = floor(random(4)); // 0, 1, 2, or 3
        switch(this.colorType) {
            case 0:
                this.baseColor = color(49, 159, 206); // Primary blue #319FCE
                break;
            case 1:
                this.baseColor = color(90, 178, 216); // Light blue #5AB2D8
                break;
            case 2:
                this.baseColor = color(33, 128, 168); // Dark blue #2180A8
                break;
            case 3:
                this.baseColor = color(134, 199, 232); // Lightest blue #86C7E8
                break;
        }
        
        this.highlightColor = color(255, 255, 255, 200); // White highlight for all particles
        this.currentColor = this.baseColor;
        this.opacity = opacity;
        this.targetOpacity = opacity;
        this.glowIntensity = random(0.8, 1.2); // Random glow intensity for varied effect
    }

    update() {
        // Update position
        this.position.add(this.velocity);
        
        // Bounce off edges
        if (this.position.x < 0 || this.position.x > width) this.velocity.x *= -1;
        if (this.position.y < 0 || this.position.y > height) this.velocity.y *= -1;
        
        // Smoothly transition opacity
        this.opacity = lerp(this.opacity, this.targetOpacity, 0.1);

        // Check distance from mouse if in home section
        if (currentSection === 'home') {
            const distance = dist(this.position.x, this.position.y, mouseX, mouseY);
            
            if (distance < INTERACTION_RADIUS) {
                // Calculate how much the color should change based on distance
                const lerpAmount = map(distance, 0, INTERACTION_RADIUS, 1, 0);
                
                // Interpolate between base and highlight colors
                const r = lerp(red(this.baseColor), red(this.highlightColor), lerpAmount);
                const g = lerp(green(this.baseColor), green(this.highlightColor), lerpAmount);
                const b = lerp(blue(this.baseColor), blue(this.highlightColor), lerpAmount);
                
                this.currentColor = color(r, g, b);
            } else {
                this.currentColor = this.baseColor;
            }
        } else {
            this.currentColor = this.baseColor;
        }
    }

    display() {
        // Draw stylistic flowing lines instead of bubbles
        push();
        noFill();
        stroke(
            red(this.currentColor),
            green(this.currentColor),
            blue(this.currentColor),
            this.opacity * 150
        );
        strokeWeight(this.size / 4);
        const angle = this.velocity.heading();
        const len = this.size * 2;
        const x1 = this.position.x + cos(angle) * len;
        const y1 = this.position.y + sin(angle) * len;
        const x2 = this.position.x - cos(angle) * len;
        const y2 = this.position.y - sin(angle) * len;
        line(x1, y1, x2, y2);
        pop();
    }

    setOpacity(newOpacity) {
        this.targetOpacity = newOpacity;
    }
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('animated-bg');
    
    // Initialize particles immediately
    for (let i = 0; i < HOME_PARTICLE_COUNT; i++) {
        particles.push(new Particle(1));
    }
    
    // Initialize scroll position check
    updateParticleVisibility();
}

function draw() {
    clear();
    
    // Draw particles
    particles.forEach(particle => {
        particle.update();
        particle.display();
    });
}

function updateParticleVisibility() {
    const homeSection = document.getElementById('home');
    const homeSectionRect = homeSection.getBoundingClientRect();
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Determine if we're in the home section
    const inHome = scrollPosition < homeSectionRect.height;
    currentSection = inHome ? 'home' : 'other';
    
    // Update particle opacity based on section
    particles.forEach((particle, index) => {
        if (index < OTHER_PARTICLE_COUNT) {
            // These particles are always visible
            particle.setOpacity(1);
        } else {
            // These particles fade out below the home section
            particle.setOpacity(inHome ? 1 : 0);
        }
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeButton = document.querySelector('.close-button');
    const learnMoreButtons = document.querySelectorAll('.learn-more');
    const navbar = document.getElementById('navbar');
    const homeSection = document.getElementById('home');
    const aboutSection = document.getElementById('about');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollToTopButton = document.querySelector('.scroll-to-top');
    const projectsSection = document.getElementById('projects');
    const scrollToAboutButton = document.getElementById('scroll-to-about');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    let headerHeight = 0; // Variable to store the header height

    // Function to calculate and apply header height
    function setHeaderOffset() {
        headerHeight = navbar.offsetHeight;
        document.documentElement.style.scrollPaddingTop = `${headerHeight}px`;
    }

    // Initial calculation
    setHeaderOffset();

    // Recalculate on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setHeaderOffset, 100); // Debounce resize
    });

    // Modal logic (keep as is)
    learnMoreButtons.forEach(button => {
        button.addEventListener('click', () => {
            modalTitle.textContent = button.dataset.title;
            modalDescription.textContent = button.dataset.description;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; 
        });
    });

    closeButton.addEventListener('click', () => {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = ''; 
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            document.body.style.overflow = ''; 
        }
    });

    // Function to handle scroll events - Uses calculated headerHeight
    function handleScroll() {
        const scrollPosition = window.scrollY;
        // const headerHeight = navbar.offsetHeight; // Now uses global variable
        // const scrollPaddingOffset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop); // Now uses global variable

        // Navbar/Scroll-to-top visibility
        const homeHeight = homeSection.offsetHeight;
        navbar.classList.toggle('visible', scrollPosition > homeHeight * 0.7);
        scrollToTopButton.classList.toggle('visible', scrollPosition > homeHeight);

        // Active link highlighting - Uses calculated headerHeight
        let currentActiveSectionId = 'home'; 
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Check if the user has scrolled past the top of the section, considering the dynamic headerHeight
            if (scrollPosition >= sectionTop - headerHeight - 10) { // Use headerHeight directly
                 currentActiveSectionId = section.getAttribute('id');
            }
        });

        // Update active class
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentActiveSectionId}`);
        });
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // --- Ensure NO custom click handlers for navLinks --- 

    // Handle scroll-to-top button click
    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Handle "View my work" button click - Now targets Projects
    scrollToAboutButton.addEventListener('click', () => {
        if (projectsSection) { // Check if projects section exists
           projectsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Handle Contact Form Submission
    if (contactForm) { // Add check to ensure form exists
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const endpoint = 'https://formspree.io/f/mgvaqeaz'; // <-- Updated Endpoint

            if (!submitButton) return; // Exit if button not found

            submitButton.disabled = true;
            formStatus.textContent = 'Sending...';
            formStatus.style.color = 'var(--text-dark)';

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.textContent = 'Message sent, thank you for reaching out!';
                    formStatus.style.color = 'green';
                    contactForm.reset(); // Clear the form
                } else {
                    const data = await response.json();
                    if (data && Object.hasOwnProperty.call(data, 'errors')) {
                        formStatus.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        formStatus.textContent = 'Oops! There was a problem submitting your form.';
                    }
                    formStatus.style.color = 'red';
                }
            } catch (error) {
                console.error('Form submission error:', error); // Log error for debugging
                formStatus.textContent = 'Oops! There was a network problem.';
                formStatus.style.color = 'red';
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    // Call handleScroll on page load
    handleScroll();
}); // End DOMContentLoaded