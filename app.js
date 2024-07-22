// Particle system background
let particles = [];

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('animated-bg');
    for (let i = 0; i < 100; i++) {
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

// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    const splash = document.getElementById('splash');
    const viewWorkBtn = document.getElementById('view-work');
    const navLinks = document.querySelectorAll('nav ul li a');

    viewWorkBtn.addEventListener('click', () => {
        window.scrollTo({
            top: splash.offsetHeight,
            behavior: 'smooth'
        });
    });

    function updateHeaderVisibility() {
        if (window.scrollY > splash.offsetHeight - 100) {
            header.classList.add('visible');
        } else {
            header.classList.remove('visible');
        }
    }

    function updateActiveLink() {
        const scrollPosition = window.scrollY;

        document.querySelectorAll('section').forEach(section => {
            if (scrollPosition >= section.offsetTop - 100) {
                const currentId = section.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
                });
            }
        });
    }

    window.addEventListener('scroll', () => {
        updateHeaderVisibility();
        updateActiveLink();
    });

    updateHeaderVisibility();
    updateActiveLink();
});