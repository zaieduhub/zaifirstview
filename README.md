# Facet — Designed in glass

A one-screen **WebGL hero for a fictional real-time material studio, Facet**.

The dark website is shattered into **thick smoked-glass shards** floating on black (`#050507`), with typography and UI elements printed directly onto the glass shards.

🌐 **Live Experience:** [zaieduhub.github.io/zaifirstview](https://zaieduhub.github.io/zaifirstview/)

---

## ✨ Features & Architecture

### 1. Scene & Optical Rendering
- **Perspective Camera (FOV 30°):** Calibrated so that $1\text{ world unit} = 1\text{ CSS px}$ at $z = 0$.
- **ACES Filmic Tone Mapping:** DPR capped at 2 for studio film dynamic range.
- **PMREM RoomEnvironment:** High-end studio lighting environment map (`environmentIntensity: 0.42`), complemented by a soft white-blue key light from top-left.
- **Smoked-Glass Materials (`MeshPhysicalMaterial`):**
  - Dark charcoal color (`#17171b`), roughness `0.36`, clearcoat `0.7`, clearcoatRoughness `0.12`, specularIntensity `0.7`.
  - Iridescence `0.55` (IOR 1.3, thickness 250–650 nm), ramping to `1.0` with `envMapIntensity: 1.0 → 1.9` on hover.
  - Soft lavender cursor glow injected via `onBeforeCompile`: $\text{vec3}(0.42, 0.37, 0.62) \times 0.16 \times \exp\left(-1.6 \left(\frac{d}{300 S}\right)^2\right)$.

### 2. Live Dynamic Cut Pattern
- **Five Cells (A, B, C, D, E):**
  - Edge points: top `0.22`, `0.515`, `0.84`; bottom `0.34`, `0.865`.
  - Inner junctions: $J0(0.385, 0.72)$, $J1(0.48, 0.62)$, $J2(0.716, 0.49)$.
  - Cell A (Hero), Cell B, Cell C, Cell D, Cell E.
- **Harmonic Breathing Drift:** Points drift along slow sines ($x \pm 0.03$; junctions also $y \pm 0.05$, periods 10–20s).
- **Cursor Repulsion:** Points within 0.6 of cursor are pushed away by up to 0.05, expanding the active cell.
- **Real-Time Mesh Inset & Fillet:** Inset by half the gap ($7 S$) with $20 S$ corner radius, $13 S$ extrusion depth, and $2.6 S$ triple-segment bevel.
- **Portrait Transposition:** Transposes pattern when $H > W$ so Cell A sits on top.

### 3. Printed Glass Typography & Homography
- **Double-Resolution Canvas Texture:** Whole panel rendered at high DPI and projected onto individual shard `ShapeGeometry` top faces with UV coordinates.
- **Homography Matrix3D Layer:** A real DOM copy of all text mapped onto the tilted panel with a 3x3 projective transformation translated to CSS `matrix3d`, enabling selectable text (blue selection highlight) and interactive links.

### 4. Physics & Shatter Dynamics
- **Global Tilt:** Slab rotates as if pressed at pointer ($\text{rotY} = x \cdot 7^\circ - 1.2^\circ$, $\text{rotX} = -y \cdot 5.5^\circ + 0.8^\circ$) with 0.3s exponential damping.
- **Piece Hover Spring ($k=170, c=19$):** Lifts $50 S$ ($32 S$ for nav slab) and tips up to $\pm 0.24$ rad dipping away from cursor.
- **"Read paper →" Shatter:**
  - Nav slab flies first, cells follow with 30ms stagger.
  - Outward and downward velocity + $420\text{–}800 S$ toward camera, gravity, and $2.0\text{–}3.6$ rad tumble.
  - Definitions view ("Real-time glass, in five terms.") fades in at $0.28\text{s}$.
- **"← Back" 3D Sliver:** Smoked-glass shard with $11 k$ extrusion, $0.08 / -0.16$ 3D lean, slow idle wobble ($\pm 0.035$ rad at $\approx 1$ Hz), and cursor tip reaction.
- **Reassemble (Back):** Definitions fade out in $0.25\text{s}$, pieces fly back along paths over $0.72\text{s}$ with ease-out-back overshoot.
- **Page Load:** Hero reassembles with the same fly-in animation.
- **Accessibility Fallback:** Pure static HTML view for reduced motion preferences or devices without WebGL.

---

## 🛠️ Usage

Open `index.html` directly in any modern browser. Zero build step, zero dependencies required beyond standard browser APIs and the Three.js import map.
