// Particle system background
let particles = [];
const SPLASH_PARTICLE_COUNT = 150;  // Reduced number of particles in splash section
const OTHER_PARTICLE_COUNT = 40;    // Reduced number for other sections
let currentSection = 'splash';
const INTERACTION_RADIUS = 200;  // How close the cursor needs to be to affect particles
let contentElements = [];  // Array to store content element boundaries
const BOUNCE_STRENGTH = 1.2;  // Reduced bounce strength for more subtle movement
const SAFE_ZONE = {};  // Define a safe zone around text to prevent spawning particles there

class Particle {
    constructor(opacity = 1) {
        // Create particle at a safe position that doesn't overlap with text
        this.position = this.getSafePosition();
        // Slower velocity for more gentle movement
        this.velocity = createVector(random(-0.8, 0.8), random(-0.8, 0.8));
        this.size = random(8, 18);
        
        // Assign one of several colors in blue/purple palette
        this.colorType = floor(random(4)); // 0, 1, 2, or 3
        switch(this.colorType) {
            case 0:
                this.baseColor = color(71, 75, 255); // Blue
                this.cssClass = 'particle-blue';
                break;
            case 1:
                this.baseColor = color(132, 90, 223); // Purple
                this.cssClass = 'particle-purple';
                break;
            case 2:
                this.baseColor = color(64, 196, 255); // Cyan
                this.cssClass = 'particle-cyan';
                break;
            case 3:
                this.baseColor = color(94, 114, 228); // Indigo
                this.cssClass = 'particle-indigo';
                break;
        }
        
        this.highlightColor = color(255, 255, 255, 200); // White highlight for all particles
        this.currentColor = this.baseColor;
        this.opacity = opacity;
        this.targetOpacity = opacity;
        this.glowIntensity = random(0.8, 1.2); // Random glow intensity for varied effect
    }
    
    // Find a position that doesn't overlap with the text content
    getSafePosition() {
        let pos;
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            pos = createVector(random(width), random(height));
            attempts++;
            
            // If we've tried too many times, just use this position
            if (attempts >= maxAttempts) break;
            
            // Check if position is in SAFE_ZONE
            if (SAFE_ZONE.x1 && pos.x >= SAFE_ZONE.x1 && pos.x <= SAFE_ZONE.x2 && 
                pos.y >= SAFE_ZONE.y1 && pos.y <= SAFE_ZONE.y2) {
                // Position is in safe zone, try again
                continue;
            }
            
            // Also check if any element is at this position
            let overlapsElement = false;
            for (let element of contentElements) {
                if (pos.x >= element.x && pos.x <= element.x + element.width &&
                    pos.y >= element.y && pos.y <= element.y + element.height) {
                    overlapsElement = true;
                    break;
                }
            }
            
            if (!overlapsElement) {
                // Found a good position
                break;
            }
        } while (true);
        
        return pos;
    }

    update() {
        // Store previous position for collision detection
        const prevPosition = createVector(this.position.x, this.position.y);
        
        // Update position
        this.position.add(this.velocity);
        
        // Bounce off edges
        if (this.position.x < 0 || this.position.x > width) this.velocity.x *= -1;
        if (this.position.y < 0 || this.position.y > height) this.velocity.y *= -1;
        
        // Bounce off content elements
        if (currentSection === 'splash') {
            for (let element of contentElements) {
                if (this.checkElementCollision(element, prevPosition)) {
                    break; // Only process one collision per frame for smoother animation
                }
            }
        }
        
        // Smoothly transition opacity
        this.opacity = lerp(this.opacity, this.targetOpacity, 0.1);

        // Check distance from mouse if in splash section
        if (currentSection === 'splash') {
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
    
    // Check if particle collides with an element and handle bounce physics
    checkElementCollision(element, prevPosition) {
        // Calculate half of the particle size for more accurate collisions
        const radius = this.size / 2;
        
        // Check if particle overlaps with the element
        if (this.position.x + radius > element.x && 
            this.position.x - radius < element.x + element.width &&
            this.position.y + radius > element.y && 
            this.position.y - radius < element.y + element.height) {
            
            // Determine which side we collided with by comparing previous position
            const collisionPoint = this.getCollisionPoint(element, prevPosition);
            
            if (collisionPoint.side === 'left' || collisionPoint.side === 'right') {
                // Horizontal collision, reverse x velocity with some randomness
                this.velocity.x *= -BOUNCE_STRENGTH;
                // Add slight y variation for more natural bounces
                this.velocity.y += random(-0.3, 0.3);
            } else if (collisionPoint.side === 'top' || collisionPoint.side === 'bottom') {
                // Vertical collision, reverse y velocity with some randomness
                this.velocity.y *= -BOUNCE_STRENGTH;
                // Add slight x variation for more natural bounces
                this.velocity.x += random(-0.3, 0.3);
            }
            
            // Normalize velocity if it gets too fast after multiple collisions
            const speed = this.velocity.mag();
            if (speed > 4) {
                this.velocity.setMag(4);
            }
            
            // Move particle outside the element to prevent sticking
            this.position.x = collisionPoint.x;
            this.position.y = collisionPoint.y;
            
            // Flash effect when a particle hits something
            this.flashEffect();
            
            return true; // Collision happened
        }
        
        return false; // No collision
    }
    
    // Determine which side of the element the particle collided with
    getCollisionPoint(element, prevPosition) {
        const radius = this.size / 2;
        
        // Calculate distances from each side of the element
        const distToLeft = Math.abs(this.position.x + radius - element.x);
        const distToRight = Math.abs(this.position.x - radius - (element.x + element.width));
        const distToTop = Math.abs(this.position.y + radius - element.y);
        const distToBottom = Math.abs(this.position.y - radius - (element.y + element.height));
        
        // Find smallest distance to determine collision side
        const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
        
        // Return position based on collision side
        if (minDist === distToLeft) {
            return { x: element.x - radius, y: this.position.y, side: 'left' };
        } else if (minDist === distToRight) {
            return { x: element.x + element.width + radius, y: this.position.y, side: 'right' };
        } else if (minDist === distToTop) {
            return { x: this.position.x, y: element.y - radius, side: 'top' };
        } else {
            return { x: this.position.x, y: element.y + element.height + radius, side: 'bottom' };
        }
    }

    display() {
        // Create glassy particle effect with gradient and glow
        push();
        noStroke();
        
        // Adjust opacity for our particles with some transparency
        const particleColor = color(
            red(this.currentColor), 
            green(this.currentColor), 
            blue(this.currentColor), 
            this.opacity * 100 // More transparent for glassy look
        );
        
        // Draw the glow effect first (larger than actual particle)
        const glowSize = this.size * 1.5;
        let glowColor = color(
            red(this.currentColor),
            green(this.currentColor),
            blue(this.currentColor),
            this.opacity * 30 * this.glowIntensity
        );
        fill(glowColor);
        ellipse(this.position.x, this.position.y, glowSize);
        
        // Draw the particle body (glassy gradient handled via CSS classes)
        fill(particleColor);
        ellipse(this.position.x, this.position.y, this.size);
        
        // For the center highlight - small white dot
        fill(255, 255, 255, this.opacity * 120);
        ellipse(this.position.x - this.size/5, this.position.y - this.size/5, this.size * 0.3);
        
        pop();
    }

    setOpacity(newOpacity) {
        this.targetOpacity = newOpacity;
    }
    
    // Flash effect when colliding
    flashEffect() {
        // Store original color
        const originalColor = this.baseColor;
        
        // Change to white
        this.baseColor = color(255, 255, 255);
        this.currentColor = this.baseColor;
        
        // Increase glow intensity temporarily
        const originalGlow = this.glowIntensity;
        this.glowIntensity = 2.5;
        
        // Reset after short delay
        setTimeout(() => {
            this.baseColor = originalColor;
            this.currentColor = this.baseColor;
            this.glowIntensity = originalGlow;
        }, 150);
    }
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('animated-bg');
    
    // Get content element boundaries first, to prevent particles spawning on text
    setTimeout(() => {
        updateContentElementBoundaries();
        
        // Define a safety zone around the text content to prevent particles from spawning there
        // and potentially getting stuck
        defineTextSafeZone();
        
        // Initialize particles only after we've established safe zones
        for (let i = 0; i < SPLASH_PARTICLE_COUNT; i++) {
            particles.push(new Particle(i < OTHER_PARTICLE_COUNT ? 1 : 1));
        }
        
        // Initialize scroll position check
        updateParticleVisibility();
    }, 500); // Slight delay to ensure DOM is fully loaded
}

// Define a safe zone around the headline, subtitle and button
function defineTextSafeZone() {
    const splash = document.getElementById('splash');
    const headline = splash.querySelector('h1');
    const subtitle = splash.querySelector('p');
    const button = splash.querySelector('button');
    
    if (headline && subtitle && button) {
        const headlineRect = headline.getBoundingClientRect();
        const subtitleRect = subtitle.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        
        // Find the bounding box that encompasses all content
        const x1 = Math.min(headlineRect.left, subtitleRect.left, buttonRect.left) - 20; // Add padding
        const y1 = headlineRect.top - 20; // Add padding
        const x2 = Math.max(headlineRect.right, subtitleRect.right, buttonRect.right) + 20; // Add padding
        const y2 = buttonRect.bottom + 20; // Add padding
        
        // Store the safe zone
        SAFE_ZONE.x1 = x1;
        SAFE_ZONE.y1 = y1;
        SAFE_ZONE.x2 = x2;
        SAFE_ZONE.y2 = y2;
        
        console.log("Safe zone defined:", SAFE_ZONE);
    }
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
    const splash = document.getElementById('splash');
    const splashRect = splash.getBoundingClientRect();
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Determine if we're in the splash section
    const inSplash = scrollPosition < splashRect.height;
    currentSection = inSplash ? 'splash' : 'other';
    
    // Update particle opacity based on section
    particles.forEach((particle, index) => {
        if (index < OTHER_PARTICLE_COUNT) {
            // These particles are always visible
            particle.setOpacity(1);
        } else {
            // These particles fade out below the splash section
            particle.setOpacity(inSplash ? 1 : 0);
        }
    });
    
    // Update glassy background visibility based on scroll position
    const glassyBg = document.querySelector('.glassy-bg');
    if (glassyBg) {
        // Create a fade effect that starts at 40% of the splash section height
        // and completes by the time we reach the bottom of the splash section
        const fadeStartPoint = splashRect.height * 0.4;
        
        if (scrollPosition <= fadeStartPoint) {
            // Fully visible when at the top
            glassyBg.style.opacity = 1;
            glassyBg.classList.remove('fade-out');
        } else if (scrollPosition >= splashRect.height) {
            // Fully transparent when past the splash section
            glassyBg.style.opacity = 0;
            glassyBg.classList.add('fade-out');
        } else {
            // Gradual fade between start and end points
            const fadeRange = splashRect.height - fadeStartPoint;
            const fadeProgress = (scrollPosition - fadeStartPoint) / fadeRange;
            const opacity = 1 - fadeProgress;
            glassyBg.style.opacity = Math.max(0, Math.min(1, opacity));
            
            // Also transform the glass shapes for a parallax-like effect
            const glassShapes = document.querySelectorAll('.glass-shape');
            glassShapes.forEach((shape, index) => {
                const translateY = scrollPosition * (0.1 + (index * 0.05));
                shape.style.transform = `translateY(${translateY}px)`;
            });
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Update content element boundaries on resize
    updateContentElementBoundaries();
    
    // Redefine safe zone
    defineTextSafeZone();
}

// Function to get and store element boundaries for collision detection
function updateContentElementBoundaries() {
    contentElements = [];
    
    // Only get elements in the splash section for better performance
    const splash = document.getElementById('splash');
    
    // Add the main headline
    const headline = splash.querySelector('h1');
    if (headline) {
        addElementToCollisionList(headline);
    }
    
    // Add the subtitle paragraph
    const subtitle = splash.querySelector('p');
    if (subtitle) {
        addElementToCollisionList(subtitle);
    }
    
    // Add the "View my work" button
    const viewButton = splash.querySelector('button');
    if (viewButton) {
        addElementToCollisionList(viewButton);
    }
    
    // Add the navigation menu items if they're visible on screen
    const navItems = document.querySelectorAll('nav ul li a');
    navItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        // Only add if visible (at the top of the page)
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
            addElementToCollisionList(item);
        }
    });
    
    console.log(`Added ${contentElements.length} elements for collision detection`);
}

// Helper function to add element to collision list with correct position adjustments
function addElementToCollisionList(element) {
    const rect = element.getBoundingClientRect();
    
    // Convert to canvas coordinates
    const x = rect.left;
    const y = rect.top;
    const width = rect.width;
    const height = rect.height;
    
    // Add padding around elements for more interesting collisions
    const padding = 10;
    
    contentElements.push({
        x: x - padding,
        y: y - padding,
        width: width + padding * 2,
        height: height + padding * 2,
        element: element
    });
}

// Add scroll event listener for particle and background updates
window.addEventListener('scroll', () => {
    updateParticleVisibility();
    
    // Update the scroll-based background transition
    requestAnimationFrame(() => {
        // Using requestAnimationFrame for smoother performance
        updateParticleVisibility();
    });
});

// Add the existing scroll to top functionality
const scrollToTopButton = document.querySelector('.scroll-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        scrollToTopButton.style.display = "block";
    } else {
        scrollToTopButton.style.display = "none";
    }
});

// Initialize the animation for the glassy background shapes
document.addEventListener('DOMContentLoaded', () => {
    const glassShapes = document.querySelectorAll('.glass-shape');
    
    // Add subtle animation to glass shapes
    glassShapes.forEach((shape, index) => {
        // Different animation for each shape
        const duration = 15 + index * 5; // Different duration for each shape
        const delay = index * 2; // Stagger the animations
        
        // Add subtle floating animation
        shape.style.transition = 'transform 0.5s ease-out';
        shape.style.animation = `float${index + 1} ${duration}s ease-in-out ${delay}s infinite alternate`;
        
        // Create unique keyframe animation for each shape
        const keyframes = `
            @keyframes float${index + 1} {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                }
                50% {
                    transform: translate(${index % 2 === 0 ? '3%' : '-3%'}, ${index % 3 === 0 ? '-2%' : '2%'}) 
                                rotate(${index % 2 === 0 ? '3' : '-3'}deg);
                }
                100% {
                    transform: translate(${index % 2 === 0 ? '-2%' : '2%'}, ${index % 3 === 0 ? '3%' : '-3%'}) 
                                rotate(${index % 2 === 0 ? '-2' : '2'}deg);
                }
            }
        `;
        
        // Add keyframes to document
        const styleSheet = document.createElement('style');
        styleSheet.textContent = keyframes;
        document.head.appendChild(styleSheet);
    });
});

scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Update content element boundaries when DOM is fully loaded
    updateContentElementBoundaries();
    
    // Update boundaries periodically to account for any dynamic changes
    setInterval(updateContentElementBoundaries, 2000);
    
    // Smooth scrolling for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId === '#home' ? '#splash' : targetId);
            const headerHeight = document.querySelector('header').offsetHeight;
            
            window.scrollTo({
                top: targetId === '#home' ? 0 : targetSection.offsetTop - headerHeight,
                behavior: 'smooth'
            });
        });
    });

    // Update active nav link on scroll
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        const headerHeight = document.querySelector('header').offsetHeight;
        const splash = document.querySelector('#splash');
        
        const scrollPosition = window.scrollY + headerHeight + 100;

        // Check if we're in the splash/home section
        if (scrollPosition < splash.offsetHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#home') {
                    link.classList.add('active');
                }
            });
            return;
        }

        // Check other sections
        sections.forEach(section => {
            if (section.id === 'splash') return; // Skip splash section as it's handled above
            
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${section.id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Add scroll event listener
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Initial call
});

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeButton = document.querySelector('.close-button');

    // Open modal when clicking Learn More
    document.querySelectorAll('.learn-more').forEach(button => {
        button.addEventListener('click', () => {
            modalTitle.textContent = button.dataset.title;
            modalDescription.textContent = button.dataset.description;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    // Close modal when clicking the close button
    closeButton.addEventListener('click', () => {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });

    document.getElementById('scroll-to-about').addEventListener('click', function() {
        document.getElementById('about').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });

    // Update scroll handler for "View my work" button
    const scrollButton = document.getElementById('scroll-to-about');
    if (scrollButton) {
        scrollButton.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            const headerHeight = document.querySelector('header').offsetHeight;
            
            window.scrollTo({
                top: aboutSection.offsetTop - headerHeight,
                behavior: 'smooth'
            });
        });
    }
});