import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import confetti from 'canvas-confetti';

// ============================================================
// 1. Scene, Camera & ACES Filmic Renderer Setup
// ============================================================
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030308, 0.012);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 24);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

// ============================================================
// 2. Post-Processing: Cinematic Unreal Bloom
// ============================================================
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.65, // strength
  0.4,  // radius
  0.78  // threshold
);
const outputPass = new OutputPass();

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

// Resize handler
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(width, height);
  bloomPass.resolution.set(width, height);
});

// ============================================================
// 3. Procedural Cinematic Studio Environment Map
// ============================================================
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

function createCinematicEnvMap() {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x020206);

  // Softbox 1: Warm key light
  const keySoftboxGeo = new THREE.PlaneGeometry(16, 8);
  const keySoftboxMat = new THREE.MeshBasicMaterial({ color: 0xffe2b8, side: THREE.DoubleSide });
  const keySoftbox = new THREE.Mesh(keySoftboxGeo, keySoftboxMat);
  keySoftbox.position.set(12, 10, 10);
  keySoftbox.lookAt(0, 0, 0);
  envScene.add(keySoftbox);

  // Softbox 2: Cool cyan rim light
  const rimSoftboxGeo = new THREE.PlaneGeometry(14, 10);
  const rimSoftboxMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
  const rimSoftbox = new THREE.Mesh(rimSoftboxGeo, rimSoftboxMat);
  rimSoftbox.position.set(-14, 8, -10);
  rimSoftbox.lookAt(0, 0, 0);
  envScene.add(rimSoftbox);

  // Softbox 3: Deep violet bottom accent
  const violetSoftboxGeo = new THREE.PlaneGeometry(20, 6);
  const violetSoftboxMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, side: THREE.DoubleSide });
  const violetSoftbox = new THREE.Mesh(violetSoftboxGeo, violetSoftboxMat);
  violetSoftbox.position.set(0, -12, 5);
  violetSoftbox.lookAt(0, 0, 0);
  envScene.add(violetSoftbox);

  const envTexture = pmremGenerator.fromScene(envScene).texture;
  scene.environment = envTexture;
}
createCinematicEnvMap();

// ============================================================
// 4. Cinematic Lighting Rig
// ============================================================
const ambientLight = new THREE.AmbientLight(0x090a16, 1.2);
scene.add(ambientLight);

// Key warm directional light
const keyLight = new THREE.DirectionalLight(0xfff0db, 3.2);
keyLight.position.set(15, 12, 15);
scene.add(keyLight);

// Cool cyan rim light (Teal & Orange contrast)
const rimLight = new THREE.DirectionalLight(0x00e1ff, 3.8);
rimLight.position.set(-15, 8, -12);
scene.add(rimLight);

// Bottom magenta/violet fill light
const fillLight = new THREE.DirectionalLight(0xa855f7, 2.0);
fillLight.position.set(0, -15, 8);
scene.add(fillLight);

// Interactive mouse spotlight (moves in 3D world space)
const mouseLight = new THREE.PointLight(0x00f0ff, 6.0, 35, 1.8);
mouseLight.position.set(0, 0, 8);
scene.add(mouseLight);

// ============================================================
// 5. The Cinematic Centerpiece: The Quantum Chrono Artifact
// ============================================================
const artifactGroup = new THREE.Group();
scene.add(artifactGroup);
artifactGroup.position.set(0, 0, 0);

// Outer High-Refraction Crystal Glass Shell
const glassGeometry = new THREE.IcosahedronGeometry(4.2, 3);
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transmission: 0.94,
  opacity: 1,
  transparent: true,
  roughness: 0.05,
  metalness: 0.08,
  ior: 1.62,
  thickness: 2.4,
  clearcoat: 1.0,
  clearcoatRoughness: 0.04,
  specularIntensity: 1.0,
  specularColor: new THREE.Color(0xffffff),
  attenuationColor: new THREE.Color(0x00e5ff),
  attenuationDistance: 2.2,
});
const glassShell = new THREE.Mesh(glassGeometry, glassMaterial);
artifactGroup.add(glassShell);

// Faceted Wireframe Overlay for Glass Shell
const wireframeGlassGeo = new THREE.IcosahedronGeometry(4.24, 1);
const wireframeGlassMat = new THREE.MeshBasicMaterial({
  color: 0x00f0ff,
  wireframe: true,
  transparent: true,
  opacity: 0.22,
  blending: THREE.AdditiveBlending,
});
const wireframeGlass = new THREE.Mesh(wireframeGlassGeo, wireframeGlassMat);
artifactGroup.add(wireframeGlass);

// Inner Glowing Core (Metallic Titanium + Pulsing Emissive Core)
const coreGeometry = new THREE.OctahedronGeometry(2.2, 2);
const coreMaterial = new THREE.MeshStandardMaterial({
  color: 0x0a0d18,
  metalness: 0.95,
  roughness: 0.12,
  emissive: 0x00f0ff,
  emissiveIntensity: 1.4,
});
const innerCore = new THREE.Mesh(coreGeometry, coreMaterial);
artifactGroup.add(innerCore);

// Golden Gyroscope Ring 1
const ring1Geometry = new THREE.TorusGeometry(3.0, 0.09, 24, 120);
const ring1Material = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  metalness: 0.98,
  roughness: 0.15,
  emissive: 0xf59e0b,
  emissiveIntensity: 0.35,
});
const gyroRing1 = new THREE.Mesh(ring1Geometry, ring1Material);
artifactGroup.add(gyroRing1);

// Titanium Cyan Gyroscope Ring 2
const ring2Geometry = new THREE.TorusGeometry(3.5, 0.07, 24, 120);
const ring2Material = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  metalness: 0.96,
  roughness: 0.1,
  emissive: 0x0284c7,
  emissiveIntensity: 0.45,
});
const gyroRing2 = new THREE.Mesh(ring2Geometry, ring2Material);
gyroRing2.rotation.x = Math.PI / 3;
artifactGroup.add(gyroRing2);

// Violet Orbit Ring 3
const ring3Geometry = new THREE.TorusGeometry(4.8, 0.05, 20, 140);
const ring3Material = new THREE.MeshStandardMaterial({
  color: 0xc084fc,
  metalness: 0.95,
  roughness: 0.2,
  emissive: 0x9333ea,
  emissiveIntensity: 0.5,
});
const gyroRing3 = new THREE.Mesh(ring3Geometry, ring3Material);
gyroRing3.rotation.y = Math.PI / 4;
artifactGroup.add(gyroRing3);

// Floating Orbiting Monoliths / Prisms
const monoliths = [];
const monolithGeometry = new THREE.BoxGeometry(0.35, 1.8, 0.15);
const monolithMaterial = new THREE.MeshStandardMaterial({
  color: 0x111625,
  metalness: 0.98,
  roughness: 0.08,
  emissive: 0x00e5ff,
  emissiveIntensity: 0.25,
});

for (let i = 0; i < 6; i++) {
  const monolith = new THREE.Mesh(monolithGeometry, monolithMaterial);
  const angle = (i / 6) * Math.PI * 2;
  const radius = 6.2;
  monolith.position.set(
    Math.cos(angle) * radius,
    (Math.sin(i * 1.5) * 1.2),
    Math.sin(angle) * radius
  );
  monolith.rotation.set(angle, angle * 0.5, 0);
  artifactGroup.add(monolith);
  monoliths.push({
    mesh: monolith,
    angle,
    speed: 0.25 + (i % 2) * 0.15,
    radius,
    yOffset: monolith.position.y,
  });
}

// Secondary Floating Satellite Artifacts in Deep Space
const floatingObjects = [];

function createFloatingArtifact(geometry, material, pos, rotSpeeds, floatSpeed, offset) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);
  floatingObjects.push({
    mesh,
    rotSpeeds,
    floatSpeed,
    offset,
    baseY: pos.y,
  });
  return mesh;
}

// 1. Crystal Diamond Torus Knot
createFloatingArtifact(
  new THREE.TorusKnotGeometry(2.0, 0.45, 120, 24),
  new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    metalness: 0.92,
    roughness: 0.18,
    emissive: 0x006688,
    emissiveIntensity: 0.4,
  }),
  { x: -16, y: 7, z: -12 },
  { x: 0.004, y: 0.006, z: 0.002 },
  0.6,
  0
);

// 2. Obsidian Gold Ring
createFloatingArtifact(
  new THREE.TorusGeometry(3.2, 0.35, 24, 80),
  new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.96,
    roughness: 0.1,
    emissive: 0x78350f,
    emissiveIntensity: 0.5,
  }),
  { x: 18, y: -6, z: -10 },
  { x: 0.003, y: 0.004, z: 0.005 },
  0.5,
  1.8
);

// 3. Icosahedron Star
createFloatingArtifact(
  new THREE.IcosahedronGeometry(2.4, 0),
  new THREE.MeshPhysicalMaterial({
    color: 0xa855f7,
    transmission: 0.88,
    opacity: 0.9,
    transparent: true,
    roughness: 0.1,
    metalness: 0.3,
    ior: 1.5,
    thickness: 1.8,
  }),
  { x: -14, y: -9, z: -14 },
  { x: 0.005, y: 0.002, z: 0.004 },
  0.7,
  3.2
);

// ============================================================
// 6. Cinematic Soft Bokeh Particles (Procedural Texture)
// ============================================================
function createBokehTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(200, 240, 255, 0.8)');
  gradient.addColorStop(0.6, 'rgba(56, 189, 248, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const bokehTexture = createBokehTexture();

// Cinematic Floating Dust Motes & Bokeh Particles
const BOKEH_COUNT = 1400;
const bokehGeometry = new THREE.BufferGeometry();
const bokehPositions = new Float32Array(BOKEH_COUNT * 3);
const bokehScales = new Float32Array(BOKEH_COUNT);
const bokehSpeeds = new Float32Array(BOKEH_COUNT);

for (let i = 0; i < BOKEH_COUNT; i++) {
  const i3 = i * 3;
  bokehPositions[i3]     = (Math.random() - 0.5) * 80;
  bokehPositions[i3 + 1] = (Math.random() - 0.5) * 70;
  bokehPositions[i3 + 2] = (Math.random() - 0.5) * 60;

  bokehScales[i] = 0.5 + Math.random() * 1.5;
  bokehSpeeds[i] = 0.004 + Math.random() * 0.008;
}

bokehGeometry.setAttribute('position', new THREE.BufferAttribute(bokehPositions, 3));
bokehGeometry.setAttribute('scale', new THREE.BufferAttribute(bokehScales, 1));

const bokehMaterial = new THREE.PointsMaterial({
  size: 0.85,
  map: bokehTexture,
  transparent: true,
  opacity: 0.55,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  color: 0x93c5fd,
});

const bokehSystem = new THREE.Points(bokehGeometry, bokehMaterial);
scene.add(bokehSystem);

// Distant Deep Cosmic Stars
const STAR_COUNT = 600;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(STAR_COUNT * 3);

for (let i = 0; i < STAR_COUNT; i++) {
  const i3 = i * 3;
  starPositions[i3]     = (Math.random() - 0.5) * 200;
  starPositions[i3 + 1] = (Math.random() - 0.5) * 200;
  starPositions[i3 + 2] = -50 - Math.random() * 100;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({
  size: 0.25,
  color: 0xffffff,
  transparent: true,
  opacity: 0.4,
});
const starSystem = new THREE.Points(starGeometry, starMaterial);
scene.add(starSystem);

// ============================================================
// 7. Mouse & Cinematic Camera Damping
// ============================================================
let mouseX = 0;
let mouseY = 0;
let targetCamX = 0;
let targetCamY = 0;
let targetArtifactX = 0;
let targetArtifactY = 0;
let scrollY = 0;
let targetScrollY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

  // Move dynamic mouse spotlight
  mouseLight.position.x = mouseX * 12;
  mouseLight.position.y = mouseY * 8;
});

window.addEventListener('scroll', () => {
  targetScrollY = window.scrollY;
}, { passive: true });

// ============================================================
// 8. Cinematic Audio Engine (Web Audio API)
// ============================================================
let audioCtx = null;
let isAudioActive = false;
let droneOsc1 = null;
let droneOsc2 = null;
let droneGain = null;

function initAudioEngine() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  // Create deep cinematic ambient drone
  droneGain = audioCtx.createGain();
  droneGain.gain.setValueAtTime(0.001, audioCtx.currentTime);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(140, audioCtx.currentTime);

  droneOsc1 = audioCtx.createOscillator();
  droneOsc1.type = 'sawtooth';
  droneOsc1.frequency.setValueAtTime(55, audioCtx.currentTime); // A1

  droneOsc2 = audioCtx.createOscillator();
  droneOsc2.type = 'sine';
  droneOsc2.frequency.setValueAtTime(110.2, audioCtx.currentTime); // A2 slight detune

  droneOsc1.connect(filter);
  droneOsc2.connect(filter);
  filter.connect(droneGain);
  droneGain.connect(audioCtx.destination);

  droneOsc1.start();
  droneOsc2.start();
}

function playUiSound(freq = 880, type = 'sine', duration = 0.08, vol = 0.04) {
  if (!isAudioActive || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    // Audio safe fallback
  }
}

// Audio Toggle Button Setup
const audioToggleBtn = document.getElementById('audio-toggle-btn');
if (audioToggleBtn) {
  audioToggleBtn.addEventListener('click', () => {
    if (!audioCtx) initAudioEngine();

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isAudioActive = !isAudioActive;
    if (isAudioActive) {
      droneGain.gain.setTargetAtTime(0.06, audioCtx.currentTime, 0.5);
      audioToggleBtn.classList.add('playing');
      audioToggleBtn.querySelector('.audio-text').textContent = 'AUDIO: ON';
      playUiSound(587.33, 'triangle', 0.15, 0.08); // D5
    } else {
      droneGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.3);
      audioToggleBtn.classList.remove('playing');
      audioToggleBtn.querySelector('.audio-text').textContent = 'AUDIO: MUTED';
    }
  });
}

// Attach hover sound to all interactive buttons & links
document.querySelectorAll('a, button, .project-card, .design-card, .skill-card').forEach((el) => {
  el.addEventListener('mouseenter', () => playUiSound(1174.66, 'sine', 0.04, 0.02)); // D6 chime
});

// ============================================================
// 9. Custom Precision Cinematic Cursor
// ============================================================
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

if (cursor && follower) {
  let curX = -100;
  let curY = -100;
  let folX = -100;
  let folY = -100;

  window.addEventListener('mousemove', (e) => {
    curX = e.clientX;
    curY = e.clientY;
    cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
  });

  function updateFollower() {
    folX += (curX - folX) * 0.15;
    folY += (curY - folY) * 0.15;
    follower.style.transform = `translate3d(${folX}px, ${folY}px, 0)`;
    requestAnimationFrame(updateFollower);
  }
  updateFollower();

  const interactiveElements = document.querySelectorAll(
    'a, button, input, textarea, .nav-toggle, .btn-primary, .btn-secondary, .project-card, .design-card, .skill-card, .cert-card'
  );

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
      follower.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
      follower.classList.remove('active');
    });
  });
}

// ============================================================
// 10. Preloader Dismissal
// ============================================================
const preloader = document.getElementById('preloader');
window.addEventListener('load', () => {
  setTimeout(() => {
    if (preloader) {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 700);
    }
  }, 1200);
});

// ============================================================
// 11. Cinematic Navbar & Mobile Menu
// ============================================================
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navLinkItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    playUiSound(784, 'square', 0.05, 0.03);
  });
}

// Smooth scroll & active state
navLinkItems.forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        if (navToggle && navLinks) {
          navToggle.classList.remove('active');
          navLinks.classList.remove('active');
        }
      }
    }
  });
});

// Section observer for active nav links
const sections = document.querySelectorAll('section[id]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinkItems.forEach((l) => {
        l.classList.remove('active');
        if (l.getAttribute('href') === `#${id}`) {
          l.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach((sec) => sectionObserver.observe(sec));

// ============================================================
// 12. Dynamic Cinematic Typing Animation
// ============================================================
const typedTextEl = document.getElementById('typed-text');
const phrases = [
  'Creative Graphic Designer (1 Yr Exp)',
  'Full-Stack Web Developer',
  '3D & WebGL Interactive Creator',
  'Visual Branding & Identity Specialist',
  'AI Systems Developer (Zai Neo)',
  'ICT Infrastructure & Lab Head',
];

if (typedTextEl) {
  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function type() {
    const currentPhrase = phrases[phraseIdx];

    if (isDeleting) {
      typedTextEl.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;
    } else {
      typedTextEl.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = isDeleting ? 28 : 55;

    if (!isDeleting && charIdx === currentPhrase.length) {
      delay = 2200;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 450;
    }

    setTimeout(type, delay);
  }
  setTimeout(type, 900);
}

// ============================================================
// 13. Scroll Reveal & Intersection Animations
// ============================================================
const scrollElements = document.querySelectorAll('.animate-on-scroll');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

scrollElements.forEach((el) => revealObserver.observe(el));

// ============================================================
// 14. Animated Stats Counters
// ============================================================
const statNumbers = document.querySelectorAll('.stat-number');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const targetCount = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(targetCount) || el.dataset.counted) return;

      el.dataset.counted = 'true';
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(ease * targetCount);

        el.textContent = `${current}+`;
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = `${targetCount}+`;
        }
      }
      requestAnimationFrame(updateCounter);
    }
  });
}, { threshold: 0.4 });

statNumbers.forEach((st) => statObserver.observe(st));

// ============================================================
// 15. Animated Circular Skill Progress Gauges
// ============================================================
const skillCards = document.querySelectorAll('.skill-card');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const card = entry.target;
      const circle = card.querySelector('.skill-circle');
      if (!circle || card.dataset.animated) return;

      card.dataset.animated = 'true';
      const targetPct = parseInt(circle.getAttribute('data-percentage'), 10);
      const strokeCircle = circle.querySelector('.progress-ring-circle');
      const pctText = circle.querySelector('.skill-percentage');

      if (strokeCircle) {
        const radius = strokeCircle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        strokeCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        strokeCircle.style.strokeDashoffset = `${circumference}`;

        const offset = circumference - (targetPct / 100) * circumference;
        setTimeout(() => {
          strokeCircle.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)';
          strokeCircle.style.strokeDashoffset = `${offset}`;
        }, 150);
      }

      if (pctText) {
        let curVal = 0;
        const interval = setInterval(() => {
          curVal++;
          pctText.textContent = `${curVal}%`;
          if (curVal >= targetPct) clearInterval(interval);
        }, 16);
      }
    }
  });
}, { threshold: 0.3 });

skillCards.forEach((card) => skillObserver.observe(card));

// ============================================================
// 16. Interactive 3D Card Tilt with Specular Glare (Graphic Design & Projects)
// ============================================================
const tiltCards = document.querySelectorAll('.tilt-card, .design-card, .education-card, .cert-card');

tiltCards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 7;
    const rotY = ((x - centerX) / centerX) * 7;

    card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-6px)`;

    const glare = card.querySelector('.card-glare');
    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)`;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    const glare = card.querySelector('.card-glare');
    if (glare) {
      glare.style.background = 'transparent';
    }
  });
});

// ============================================================
// 17. Contact Form Handling with Confetti & Toast Notification
// ============================================================
const contactForm = document.getElementById('contact-form');

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-notice ${type}`;
  toast.innerHTML = `
    <div class="toast-indicator"></div>
    <div class="toast-message">${message}</div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('visible'), 50);
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name')?.value.trim();
    const email = document.getElementById('form-email')?.value.trim();
    const message = document.getElementById('form-message')?.value.trim();

    if (!name || !email || !message) {
      showToast('Please fill out all required fields.', 'error');
      playUiSound(220, 'sawtooth', 0.15, 0.05);
      return;
    }

    playUiSound(880, 'sine', 0.2, 0.08);

    // Launch celebratory cinematic confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#00f0ff', '#f59e0b', '#a855f7', '#ffffff'],
    });

    showToast(`Transmission received, ${name}! I will respond shortly.`);
    contactForm.reset();
  });
}

// ============================================================
// 18. Master Cinematic Render Loop
// ============================================================
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Smooth LERP camera parallax
  targetCamX = mouseX * 2.5;
  targetCamY = mouseY * 1.8;
  camera.position.x += (targetCamX - camera.position.x) * 0.035;
  camera.position.y += (targetCamY - camera.position.y) * 0.035;

  // Smooth scroll translation for 3D camera
  scrollY += (targetScrollY - scrollY) * 0.06;
  const scrollOffset = scrollY * 0.003;
  camera.position.z = 24 + Math.sin(scrollOffset * 0.8) * 4;

  // Centerpiece Core Choreography
  artifactGroup.rotation.y = time * 0.18 + scrollOffset;
  artifactGroup.rotation.x = Math.sin(time * 0.22) * 0.15 + (mouseY * 0.15);
  artifactGroup.rotation.z = Math.cos(time * 0.16) * 0.1;

  // Gentle breathing float on Y
  artifactGroup.position.y = Math.sin(time * 0.7) * 0.5 - (scrollY * 0.004);

  // Rotate individual components
  glassShell.rotation.y = -time * 0.1;
  wireframeGlass.rotation.y = time * 0.08;
  innerCore.rotation.x = time * 0.35;
  innerCore.rotation.y = time * 0.45;
  gyroRing1.rotation.x = time * 0.4;
  gyroRing1.rotation.y = time * 0.25;
  gyroRing2.rotation.y = -time * 0.35;
  gyroRing2.rotation.z = time * 0.2;
  gyroRing3.rotation.z = time * 0.18;

  // Pulse inner core emissive intensity
  coreMaterial.emissiveIntensity = 1.0 + Math.sin(time * 2.5) * 0.6;

  // Orbit floating monoliths
  monoliths.forEach((m) => {
    const curAngle = m.angle + time * m.speed;
    m.mesh.position.x = Math.cos(curAngle) * m.radius;
    m.mesh.position.z = Math.sin(curAngle) * m.radius;
    m.mesh.position.y = m.yOffset + Math.sin(time * 1.4 + m.angle) * 0.6;
    m.mesh.rotation.x += 0.01;
    m.mesh.rotation.y += 0.015;
  });

  // Float satellite artifacts
  floatingObjects.forEach((obj) => {
    obj.mesh.rotation.x += obj.rotSpeeds.x;
    obj.mesh.rotation.y += obj.rotSpeeds.y;
    obj.mesh.rotation.z += obj.rotSpeeds.z;
    obj.mesh.position.y = obj.baseY + Math.sin(time * obj.floatSpeed + obj.offset) * 0.8;
  });

  // Slowly drift bokeh particles upward with sine wave
  const positions = bokehGeometry.attributes.position.array;
  for (let i = 0; i < BOKEH_COUNT; i++) {
    const i3 = i * 3;
    positions[i3 + 1] += bokehSpeeds[i] * 18 * delta;
    positions[i3] += Math.sin(time * 0.5 + i) * 0.01;

    // Reset when moving out of view
    if (positions[i3 + 1] > 35) {
      positions[i3 + 1] = -35;
      positions[i3] = (Math.random() - 0.5) * 80;
    }
  }
  bokehGeometry.attributes.position.needsUpdate = true;

  // Slowly rotate distant star field
  starSystem.rotation.y = time * 0.008;

  // Render through UnrealBloomPass post-processing pipeline
  composer.render();
}

animate();
