import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. Three.js Anti-Gravity Background (Home Only)
// ==========================================
const initThreeBackground = () => {
    const canvas = document.querySelector('#bg-canvas');
    if (!canvas) return; // Only run on pages with this canvas

    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true, // Transparent background to let CSS gradient show
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Objects Group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // 1.1 Wireframe Globe
    const globeGeometry = new THREE.IcosahedronGeometry(10, 2);
    const globeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00BFFF, // Blue
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    objectsGroup.add(globe);

    // 1.2 Floating Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        // Spread particles
        posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xFFD700, // Gold
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // 1.3 Floating Abstract Business Shapes (Futuristic Icons)
    const shapes = [];
    const shapeGeometries = [
        new THREE.TetrahedronGeometry(1.5), // Pyramid/Growth
        new THREE.BoxGeometry(1.5, 2, 0.2), // Document/Tablet
        new THREE.TorusGeometry(1, 0.3, 16, 50), // Unity/Ring
        new THREE.OctahedronGeometry(1.5) // Diamond/Premium
    ];

    const shapeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x1a237e,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8
    });

    const light = new THREE.PointLight(0xFFD700, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
    scene.add(ambientLight);

    // Create 5 floating shapes
    for (let i = 0; i < 5; i++) {
        const geom = shapeGeometries[i % shapeGeometries.length];
        const mesh = new THREE.Mesh(geom, shapeMaterial);

        // Random position around the globe
        const angle = (i / 5) * Math.PI * 2;
        const radius = 15 + Math.random() * 5;
        mesh.position.set(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 10,
            Math.sin(angle) * radius
        );

        // Store initial position for floating animation
        mesh.userData = {
            initialY: mesh.position.y,
            speed: 0.5 + Math.random() * 0.5,
            offset: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02
        };

        objectsGroup.add(mesh);
        shapes.push(mesh);
    }

    // Animation Loop
    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // Rotate globe slowly
        globe.rotation.y = elapsedTime * 0.05;

        // Rotate particles slowly
        particlesMesh.rotation.y = -elapsedTime * 0.02;
        particlesMesh.rotation.x = elapsedTime * 0.01;

        // Animate Shapes (Anti-Gravity Float)
        shapes.forEach(shape => {
            const { initialY, speed, offset, rotSpeed } = shape.userData;
            // Float up and down
            shape.position.y = initialY + Math.sin(elapsedTime * speed + offset) * 1.5;
            // Rotate shape
            shape.rotation.x += rotSpeed;
            shape.rotation.y += rotSpeed;
        });

        // Mouse Parallax effect (Ease towards mouse)
        // camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        // camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// ==========================================
// 2. DOM Animations & Interactivity
// ==========================================

const initDOMAnimations = () => {
    // 2.1 Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // 2.2 Stats Counter Animation (Intersection Observer)
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));

    function animateCounter(el, target) {
        let current = 0;
        const increment = target / 50; // Speed
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.innerText = target;
                clearInterval(timer);
            } else {
                el.innerText = Math.ceil(current);
            }
        }, 30);
    }

    // 2.3 Populate Service Cards and Animate
    const servicesContainer = document.querySelector('.services-arc-container');
    const services = [
        { title: "Business Formation", icon: "🏢" },
        { title: "Legal Structuring", icon: "⚖️" },
        { title: "Banking Solutions", icon: "🏦" },
        { title: "Growth Strategy", icon: "📈" },
        { title: "Visa Services", icon: "🛂" }
    ];

    if (servicesContainer) {
        servicesContainer.innerHTML = ''; // Clear loading
        services.forEach((service, index) => {
            const card = document.createElement('div');
            card.classList.add('service-card');
            card.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 1rem;">${service.icon}</div>
                <h3 style="margin-bottom: 0.5rem;">${service.title}</h3>
                <p>Comprehensive solutions.</p>
            `;
            // Initial style for animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            servicesContainer.appendChild(card);

            // Staggered Animation with GSAP
            gsap.to(card, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.2 + (index * 0.2),
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: servicesContainer,
                    start: "top 80%"
                }
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initThreeBackground();
    initDOMAnimations();
});
