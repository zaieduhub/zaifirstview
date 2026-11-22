import * as THREE from 'three';

// ============================================================
// 1. Three.js Scene Setup
// ============================================================
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ============================================================
// 2. Particle System (Main Background)
// ============================================================
const PARTICLE_COUNT = 2000;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
const particleVelocities = new Float32Array(PARTICLE_COUNT * 3);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const i3 = i * 3;
  particlePositions[i3]     = (Math.random() - 0.5) * 100;
  particlePositions[i3 + 1] = (Math.random() - 0.5) * 100;
  particlePositions[i3 + 2] = (Math.random() - 0.5) * 100;

  particleVelocities[i3]     = (Math.random() - 0.5) * 0.005;
  particleVelocities[i3 + 1] = Math.random() * 0.01 + 0.005;
  particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.005;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particleMaterial = new THREE.PointsMaterial({
  size: 0.08,
  color: 0x6c63ff,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// ============================================================
// 3. Wireframe Geometric Objects
// ============================================================
const geometricObjects = [];

function createWireframeObject(geometry, color, position, rotSpeeds, floatSpeed, floatOffset, opacity) {
  const material = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);
  scene.add(mesh);
  geometricObjects.push({
    mesh,
    rotSpeeds,
    floatSpeed,
    floatOffset,
    baseY: position.y,
  });
  return mesh;
}

createWireframeObject(
  new THREE.IcosahedronGeometry(3),
  0x6c63ff,
  { x: -12, y: 5, z: -10 },
  { x: 0.003, y: 0.005, z: 0.001 },
  0.4,
  0,
  0.35
);

createWireframeObject(
  new THREE.TorusGeometry(2.5, 0.5, 16, 100),
  0x00d9ff,
  { x: 15, y: -3, z: -8 },
  { x: 0.004, y: 0.002, z: 0.003 },
  0.5,
  1.2,
  0.4
);

createWireframeObject(
  new THREE.OctahedronGeometry(2),
  0xff6b6b,
  { x: -8, y: -8, z: -12 },
  { x: 0.002, y: 0.006, z: 0.004 },
  0.6,
  2.5,
  0.3
);

createWireframeObject(
  new THREE.TorusKnotGeometry(2, 0.4, 100, 16),
  0x00ff88,
  { x: 10, y: 8, z: -15 },
  { x: 0.005, y: 0.003, z: 0.002 },
  0.35,
  3.8,
  0.5
);

// ============================================================
// 4. Mouse Interaction
// ============================================================
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

document.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
  targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

// ============================================================
// 5. Star Field Background
// ============================================================
const STAR_COUNT = 500;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(STAR_COUNT * 3);

for (let i = 0; i < STAR_COUNT; i++) {
  const i3 = i * 3;
  starPositions[i3]     = (Math.random() - 0.5) * 200;
  starPositions[i3 + 1] = (Math.random() - 0.5) * 200;
  starPositions[i3 + 2] = (Math.random() - 0.5) * 200;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

const starMaterial = new THREE.PointsMaterial({
  size: 0.03,
  color: 0xffffff,
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// ============================================================
// 6. Connection Lines
// ============================================================
const MAX_LINE_SEGMENTS = 200;
const CONNECTION_DISTANCE = 3;
const linePositions = new Float32Array(MAX_LINE_SEGMENTS * 6);
const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
lineGeometry.setDrawRange(0, 0);

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x6c63ff,
  transparent: true,
  opacity: 0.05,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const connectionLines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(connectionLines);

let frameCounter = 0;

function updateConnectionLines() {
  const positions = particleGeometry.attributes.position.array;
  let lineIndex = 0;
  const distSq = CONNECTION_DISTANCE * CONNECTION_DISTANCE;

  for (let i = 0; i < PARTICLE_COUNT && lineIndex < MAX_LINE_SEGMENTS; i++) {
    const ix = positions[i * 3];
    const iy = positions[i * 3 + 1];
    const iz = positions[i * 3 + 2];

    for (let j = i + 1; j < PARTICLE_COUNT && lineIndex < MAX_LINE_SEGMENTS; j++) {
      const jx = positions[j * 3];
      const jy = positions[j * 3 + 1];
      const jz = positions[j * 3 + 2];

      const dx = ix - jx;
      const dy = iy - jy;
      const dz = iz - jz;
      const d = dx * dx + dy * dy + dz * dz;

      if (d < distSq) {
        const li = lineIndex * 6;
        linePositions[li]     = ix;
        linePositions[li + 1] = iy;
        linePositions[li + 2] = iz;
        linePositions[li + 3] = jx;
        linePositions[li + 4] = jy;
        linePositions[li + 5] = jz;
        lineIndex++;
      }
    }
  }

  lineGeometry.setDrawRange(0, lineIndex * 2);
  lineGeometry.attributes.position.needsUpdate = true;
}

// ============================================================
// 7. Scroll-Based Parallax
// ============================================================
let scrollY = 0;

window.addEventListener('scroll', () => {
  scrollY = window.pageYOffset || document.documentElement.scrollTop;
});

// ============================================================
// 8. Custom Cursor
// ============================================================
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

if (cursor && cursorFollower) {
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursorFollower.style.left = e.clientX + 'px';
    cursorFollower.style.top = e.clientY + 'px';
  });

  const interactiveElements = document.querySelectorAll('a, button, .nav-toggle, .btn, input, textarea, .project-card, .social-link');

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
      cursorFollower.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
      cursorFollower.classList.remove('active');
    });
  });
}

// ============================================================
// 9. Preloader
// ============================================================
const preloader = document.getElementById('preloader');

window.addEventListener('load', () => {
  const minDelay = 1500;
  const loadTime = performance.now();
  const remaining = Math.max(0, minDelay - loadTime);

  setTimeout(() => {
    if (preloader) {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }
  }, remaining);
});

// ============================================================
// 10. Navigation
// ============================================================
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navLinkItems = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

// Scroll detection — add scrolled class
window.addEventListener('scroll', () => {
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// Active link tracking with IntersectionObserver
if (sections.length > 0 && navLinkItems.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinkItems.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

// Mobile toggle
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
}

// Smooth scroll
navLinkItems.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
    if (navToggle && navLinks) {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });
});

// ============================================================
// 11. Typing Animation
// ============================================================
const typedTextEl = document.getElementById('typed-text');
const typingStrings = [
  'Full-Stack Developer',
  'Creative Designer',
  'IT Professional',
  'Web Developer',
  'AI Enthusiast',
  'Network Specialist',
  'Graphic Designer',
];

let stringIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
  if (!typedTextEl) return;

  const currentString = typingStrings[stringIndex];

  if (!isDeleting) {
    typedTextEl.textContent = currentString.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentString.length) {
      isDeleting = true;
      setTimeout(typeWriter, 2000);
      return;
    }
    setTimeout(typeWriter, 50);
  } else {
    typedTextEl.textContent = currentString.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      isDeleting = false;
      stringIndex = (stringIndex + 1) % typingStrings.length;
      setTimeout(typeWriter, 500);
      return;
    }
    setTimeout(typeWriter, 30);
  }
}

typeWriter();

// ============================================================
// 12. Scroll Animations (Intersection Observer)
// ============================================================
const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');

if (animateOnScrollElements.length > 0) {
  const scrollAnimObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  animateOnScrollElements.forEach((el) => scrollAnimObserver.observe(el));
}

// ============================================================
// 13. Skill Circle Animation
// ============================================================
const skillCircles = document.querySelectorAll('.skill-circle');

if (skillCircles.length > 0) {
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const circle = entry.target;
          const percentage = parseInt(circle.getAttribute('data-percentage'), 10) || 0;
          const progressEl = circle.querySelector('.skill-progress');
          const percentageEl = circle.querySelector('.skill-percentage');

          // Animate the CSS variable for conic-gradient
          if (progressEl) {
            progressEl.style.setProperty('--progress', '0');
            let currentProgress = 0;
            const duration = 1500;
            const startTime = performance.now();

            function animateProgress(now) {
              const elapsed = now - startTime;
              const t = Math.min(elapsed / duration, 1);
              // Ease out cubic
              const eased = 1 - Math.pow(1 - t, 3);
              currentProgress = eased * percentage;
              progressEl.style.setProperty('--progress', currentProgress.toFixed(1));

              if (percentageEl) {
                percentageEl.textContent = Math.round(currentProgress) + '%';
              }

              if (t < 1) {
                requestAnimationFrame(animateProgress);
              }
            }

            requestAnimationFrame(animateProgress);
          }

          skillObserver.unobserve(circle);
        }
      });
    },
    { threshold: 0.3 }
  );

  skillCircles.forEach((circle) => skillObserver.observe(circle));
}

// ============================================================
// 14. Stats Counter Animation
// ============================================================
const statNumbers = document.querySelectorAll('.stat-number');

if (statNumbers.length > 0) {
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10) || 0;
          const duration = 2000;
          const startTime = performance.now();

          function animateCount(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            // Ease out quad
            const eased = 1 - (1 - t) * (1 - t);
            const current = Math.round(eased * target);
            el.textContent = current + '+';

            if (t < 1) {
              requestAnimationFrame(animateCount);
            }
          }

          requestAnimationFrame(animateCount);
          statsObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.3 }
  );

  statNumbers.forEach((el) => statsObserver.observe(el));
}

// ============================================================
// 15. Contact Form
// ============================================================
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    let isValid = true;

    for (const [, value] of formData.entries()) {
      if (!value.toString().trim()) {
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
    contactForm.reset();
  });
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    padding: '16px 28px',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: '500',
    zIndex: '10000',
    transform: 'translateY(100px)',
    opacity: '0',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    backdropFilter: 'blur(12px)',
    background: type === 'success'
      ? 'rgba(0, 255, 136, 0.15)'
      : 'rgba(255, 107, 107, 0.15)',
    border: `1px solid ${type === 'success' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 107, 107, 0.3)'}`,
    boxShadow: type === 'success'
      ? '0 8px 32px rgba(0, 255, 136, 0.2)'
      : '0 8px 32px rgba(255, 107, 107, 0.2)',
  });

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400);
  }, 3000);
}

// ============================================================
// 16. Animation Loop
// ============================================================
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;
  frameCounter++;

  // --- Smooth mouse tracking ---
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;

  // --- Particle system update ---
  const pPositions = particleGeometry.attributes.position.array;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    // Upward drift
    pPositions[i3 + 1] += particleVelocities[i3 + 1];

    // Gentle sine wave on X and Z
    pPositions[i3] += Math.sin(time * 0.3 + i * 0.01) * 0.002;
    pPositions[i3 + 2] += Math.cos(time * 0.2 + i * 0.015) * 0.002;

    // Reset if too far
    if (pPositions[i3 + 1] > 50) {
      pPositions[i3 + 1] = -50;
      pPositions[i3] = (Math.random() - 0.5) * 100;
      pPositions[i3 + 2] = (Math.random() - 0.5) * 100;
    }
  }
  particleGeometry.attributes.position.needsUpdate = true;

  // --- Wireframe objects ---
  geometricObjects.forEach((obj) => {
    obj.mesh.rotation.x += obj.rotSpeeds.x;
    obj.mesh.rotation.y += obj.rotSpeeds.y;
    obj.mesh.rotation.z += obj.rotSpeeds.z;
    obj.mesh.position.y = obj.baseY + Math.sin(time * obj.floatSpeed + obj.floatOffset) * 1.5;
  });

  // --- Star field rotation ---
  stars.rotation.y += 0.0001;

  // --- Connection lines (throttled) ---
  if (frameCounter % 5 === 0) {
    updateConnectionLines();
  }

  // --- Mouse parallax ---
  camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;

  // --- Scroll parallax ---
  scene.rotation.y = scrollY * 0.001;
  particles.position.y = scrollY * -0.0005;
  geometricObjects.forEach((obj) => {
    obj.mesh.position.z = obj.mesh.position.z + Math.sin(scrollY * 0.0003) * 0.001;
  });

  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}

animate();
