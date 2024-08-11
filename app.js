// Particle system background
let particles = [];

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('animated-bg');
    // Increase the number of particles to fill the screen
    for (let i = 0; i < 200; i++) {
        particles.push(new Particle());
    }
}

function draw() {
    clear();
    for (let particle of particles) {
        particle.update();
        particle.display();
    }
}

class Particle {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.size = random(2, 5);
        this.color = color(71, 75, 255, 150);
    }

    update() {
        this.position.add(this.velocity);
        if (this.position.x < 0 || this.position.x > width) this.velocity.x *= -1;
        if (this.position.y < 0 || this.position.y > height) this.velocity.y *= -1;
    }

    display() {
        noStroke();
        fill(this.color);
        ellipse(this.position.x, this.position.y, this.size);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Scroll to top functionality
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

// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    const splash = document.getElementById('splash');
    const viewWorkBtn = document.getElementById('view-work');
    const navLinks = document.querySelectorAll('nav ul li a');
    const aboutSection = document.getElementById('about');

    // Smooth scroll to sections when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            const headerHeight = header.offsetHeight;
            window.scrollTo({
                top: targetId === '#home' ? 0 : targetSection.offsetTop - headerHeight,
                behavior: 'smooth'
            });
        });
    });

    viewWorkBtn.addEventListener('click', () => {
        const headerHeight = header.offsetHeight;
        window.scrollTo({
            top: aboutSection.offsetTop - headerHeight,
            behavior: 'smooth'
        });
    });

    function updateActiveLink() {
        const scrollPosition = window.scrollY;
        const headerHeight = header.offsetHeight;

        if (scrollPosition < splash.offsetHeight - headerHeight) {
            setActiveLink('#home');
        } else {
            document.querySelectorAll('section').forEach(section => {
                if (scrollPosition >= section.offsetTop - headerHeight) {
                    setActiveLink(`#${section.id}`);
                }
            });
        }
    }

    function setActiveLink(id) {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === id);
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
});