// Particle system background
let particles = [];
const SPLASH_PARTICLE_COUNT = 200;  // Number of particles in splash section
const OTHER_PARTICLE_COUNT = 50;    // Reduced number for other sections
let currentSection = 'splash';
const INTERACTION_RADIUS = 200;  // How close the cursor needs to be to affect particles

class Particle {
    constructor(opacity = 1) {
        this.position = createVector(random(width), random(height));
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.size = random(2, 5);
        this.baseColor = color(71, 75, 255);
        this.highlightColor = color(218, 177, 218); // Purple highlight color
        this.currentColor = this.baseColor;
        this.opacity = opacity;
        this.targetOpacity = opacity;
    }

    update() {
        // Update position
        this.position.add(this.velocity);
        
        // Bounce off edges
        if (this.position.x < 0 || this.position.x > width) this.velocity.x *= -1;
        if (this.position.y < 0 || this.position.y > height) this.velocity.y *= -1;
        
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

    display() {
        noStroke();
        const particleColor = color(
            red(this.currentColor), 
            green(this.currentColor), 
            blue(this.currentColor), 
            this.opacity * 150
        );
        fill(particleColor);
        ellipse(this.position.x, this.position.y, this.size);
    }

    setOpacity(newOpacity) {
        this.targetOpacity = newOpacity;
    }
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('animated-bg');
    
    // Initialize with maximum particles
    for (let i = 0; i < SPLASH_PARTICLE_COUNT; i++) {
        particles.push(new Particle(i < OTHER_PARTICLE_COUNT ? 1 : 1));
    }

    // Initialize scroll position check
    updateParticleVisibility();
}

function draw() {
    clear();
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
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Add scroll event listener for particle updates
window.addEventListener('scroll', () => {
    updateParticleVisibility();
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

scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});