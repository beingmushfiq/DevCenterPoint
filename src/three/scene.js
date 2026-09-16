import * as THREE from 'three';

const TAU = Math.PI * 2;

function rand(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/* Soft radial glow texture, generated once on a canvas.
   Used for the ignition singularity and the orbiting team-nodes so we
   get a real bloom-like falloff with zero post-processing cost. */
function glowTexture(size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  /* Electric cobalt falloff — matches the brand signal of the UI. */
  g.addColorStop(0.0, 'rgba(240,248,255,1)');
  g.addColorStop(0.18, 'rgba(96,165,250,0.85)');
  g.addColorStop(0.45, 'rgba(37,99,235,0.32)');
  g.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export class Scene {
  /* profile: 'full' for the homepage, 'calm' for index pages.
     The calm profile reduces the particle count and slows the
     autonomous drift, so a listing page carries the same visual
     identity without competing with the content on top of it. */
  constructor(canvas, { profile = 'full' } = {}) {
    this.canvas = canvas;
    this.profile = profile;
    this.calm = profile === 'calm';
    this.progress = 0;
    this.targetProgress = 0;
    this.velocity = 0;        // smoothed scroll velocity (-1..1-ish)
    this.targetVelocity = 0;
    this.ignite = 0;          // 0 = unformed, 1 = fully assembled
    this.igniteTarget = 1;
    this.pointer = new THREE.Vector2(0, 0);
    this.pointerTarget = new THREE.Vector2(0, 0);

    this.clock = new THREE.Clock();
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.dpr = Math.min(window.devicePixelRatio, 2);

    this.renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true, powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(this.dpr);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07090e, 0.05);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 0, 14);

    this.glowTex = glowTexture();

    this.buildCore();
    this.buildCage();
    this.buildSingularity();
    this.buildOrbits();
    this.buildAurora();
    this.buildStars();
    this.bindEvents();

    this.onResize();
    this.loop();
  }

  /* ---------- MORPH STATE DEFINITIONS ----------
     Each chapter defines how the whole system is shaped.

     NOTE ON `hue`: values stay inside the cool electric cobalt
     and cyan band (~0.58–0.63). The loop interpolates hue linearly
     so the aesthetic remains cohesive with the brand system. */
  get shapeStates() {
    return [
      { name: 'shards',   spread: 3.4, radius: 2.0, wire: 0.0, swarm: 0.9, hue: 0.600, spin: 0.10, cage: 0.10, orbit: 3.6, bond: 0.10 },
      { name: 'scatter',  spread: 6.5, radius: 1.6, wire: 0.0, swarm: 1.6, hue: 0.620, spin: 0.16, cage: 0.06, orbit: 3.9, bond: 0.16 },
      { name: 'converge', spread: 2.2, radius: 2.4, wire: 0.2, swarm: 0.7, hue: 0.590, spin: 0.20, cage: 0.22, orbit: 3.3, bond: 0.30 },
      { name: 'build',    spread: 1.4, radius: 2.7, wire: 1.0, swarm: 0.5, hue: 0.580, spin: 0.24, cage: 0.62, orbit: 3.0, bond: 0.52 },
      { name: 'name',     spread: 1.0, radius: 2.9, wire: 0.7, swarm: 0.4, hue: 0.610, spin: 0.28, cage: 0.44, orbit: 2.8, bond: 0.42 },
      { name: 'leap',     spread: 3.0, radius: 2.2, wire: 0.4, swarm: 1.0, hue: 0.590, spin: 0.34, cage: 0.30, orbit: 3.4, bond: 0.28 },
      { name: 'merge',    spread: 0.7, radius: 3.1, wire: 0.3, swarm: 0.3, hue: 0.600, spin: 0.30, cage: 0.78, orbit: 1.4, bond: 0.90 },
      { name: 'expand',   spread: 9.0, radius: 3.4, wire: 0.0, swarm: 1.2, hue: 0.630, spin: 0.14, cage: 0.20, orbit: 4.4, bond: 0.14 },
    ];
  }

  /* ---------- PARTICLE CORE ----------
     A single point cloud morphed between chapters. ---------------- */
  buildCore() {
    const base = window.innerWidth < 760 ? 9000 : 22000;
    this.count = this.calm ? Math.round(base * 0.45) : base;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.count * 3);
    const aSphere = new Float32Array(this.count * 3);
    const aScatter = new Float32Array(this.count * 3);
    const aRandom = new Float32Array(this.count);
    const aSize = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      const u = rand(i + 1);
      const v = rand(i + 2);
      const theta = u * TAU;
      const phi = Math.acos(2 * v - 1);
      const sr = 2.0 + rand(i + 3) * 0.18;
      aSphere[i3] = sr * Math.sin(phi) * Math.cos(theta);
      aSphere[i3 + 1] = sr * Math.sin(phi) * Math.sin(theta);
      aSphere[i3 + 2] = sr * Math.cos(phi);

      const sc = 3.2 + rand(i + 4) * 5.5;
      const st = rand(i + 5) * TAU;
      const sp = Math.acos(2 * rand(i + 6) - 1);
      aScatter[i3] = sc * Math.sin(sp) * Math.cos(st);
      aScatter[i3 + 1] = sc * Math.cos(sp) * 0.7;
      aScatter[i3 + 2] = sc * Math.sin(sp) * Math.sin(st);

      pos[i3] = aSphere[i3]; pos[i3 + 1] = aSphere[i3 + 1]; pos[i3 + 2] = aSphere[i3 + 2];
      aRandom[i] = rand(i + 7);
      aSize[i] = 0.5 + rand(i + 8) * 2.2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSphere', new THREE.BufferAttribute(aSphere, 3));
    geo.setAttribute('aScatter', new THREE.BufferAttribute(aScatter, 3));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(aRandom, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uSpread: { value: 1 },
      uRadius: { value: 2 },
      uSwarm: { value: 0.5 },
      uWire: { value: 0 },
      uHue: { value: 0.60 },
      uPixel: { value: 700 },
      uPointScale: { value: 0.012 },
      uVelocity: { value: 0 },   // scroll velocity → turbulence + stretch
      uIgnite: { value: 0 },     // 0 = unformed void, 1 = assembled
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aSphere;
        attribute vec3 aScatter;
        attribute float aRandom;
        attribute float aSize;
        uniform float uTime;
        uniform float uSpread;
        uniform float uRadius;
        uniform float uSwarm;
        uniform float uWire;
        uniform float uPixel;
        uniform float uPointScale;
        uniform float uVelocity;
        uniform float uIgnite;
        uniform float uHue;
        varying float vAlpha;
        varying float vHue;

        void main() {
          float t = uTime * 0.35 + aRandom * 6.28318;

          // organic swirl
          vec3 swirl = vec3(
            sin(t * 0.7 + aSphere.y * 1.2),
            cos(t * 0.6 + aSphere.x * 1.1),
            sin(t * 0.5 + aSphere.z)
          ) * uSwarm * 0.35;

          vec3 sphere = normalize(aSphere) * (length(aSphere) * uRadius) + swirl;

          // lattice snap: pull points toward a quantised shell
          vec3 lat = floor(sphere * 2.0 + 0.5) / 2.0;
          sphere = mix(sphere, lat, uWire * 0.5);

          vec3 p = mix(sphere, aScatter + swirl * 2.0, uSpread);

          // ---- Scroll velocity: turbulence that stretches the form.
          // Fast scrolling smears the cloud along its radial axis and
          // injects curl, so the page feels physically connected to
          // the hand on the wheel.
          float vAmt = abs(uVelocity);
          vec3 radial = normalize(p + 1e-4);
          vec3 curl = vec3(
            sin(p.y * 2.1 + uTime * 1.2),
            cos(p.z * 2.3 + uTime * 1.4),
            sin(p.x * 2.0 + uTime * 1.1)
          );
          p += radial * vAmt * 1.15 + curl * vAmt * 0.55;

          // ---- Ignition: the assembly-from-nothing intro.
          // At uIgnite = 0 every point is flung far out and dark; as it
          // rises to 1 the cloud collapses into its true form.
          float born = 1.0 - uIgnite;
          vec3 birthDir = normalize(aScatter + aRandom + 1e-4);
          p += birthDir * born * 34.0;

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;

          // Perspective-correct size, clamped so 22k points read as a
          // form and never bloom into a white smear.
          float perspective = uPixel / max(-mv.z, 0.1);
          gl_PointSize = clamp(aSize * uPointScale * perspective, 1.0, 4.5);

          // Twinkle keeps the field alive without flicker.
          float twinkle = 0.78 + 0.22 * sin(uTime * 1.6 + aRandom * 40.0);
          vAlpha = mix(0.18, 0.9, 1.0 - uSpread * 0.5)
                 * (0.35 + aRandom * 0.65) * twinkle
                 * smoothstep(0.0, 0.35, uIgnite);   // fade in during ignition
          vHue = fract(uHue + (aRandom - 0.5) * 0.10 + uSpread * 0.02 + vAmt * 0.04);
        }
      `,
      fragmentShader: `
        uniform float uHue;
        varying float vAlpha;
        varying float vHue;

        vec3 hsl2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
        }

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float soft = smoothstep(0.5, 0.05, d);
          vec3 col = hsl2rgb(vec3(vHue, 0.88, 0.58));
          gl_FragColor = vec4(col, soft * vAlpha);
        }
      `,
    });

    this.core = new THREE.Points(geo, mat);
    this.scene.add(this.core);
  }

  /* ---------- ARCHITECTURE CAGE ----------
     A wireframe icosahedron framing the cloud — the "scalable
     architecture" metaphor made literal. Two nested shells counter-
     rotate so the structure feels engineered, not decorative. */
  buildCage() {
    this.cages = [];
    const specs = [
      { r: 3.15, detail: 1, color: 0x2563eb, op: 0.26, speed: 0.10 },
      { r: 3.95, detail: 0, color: 0x38bdf8, op: 0.16, speed: -0.07 },
    ];
    specs.forEach((s) => {
      const geo = new THREE.IcosahedronGeometry(s.r, s.detail);
      const mat = new THREE.MeshBasicMaterial({
        color: s.color, wireframe: true, transparent: true,
        opacity: s.op, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.speed = s.speed;
      this.scene.add(mesh);
      this.cages.push(mesh);
    });
  }

  /* ---------- IGNITION SINGULARITY ----------
     The bright heart of the system. It breathes, and it flares on
     velocity — the visual "spark" from the story. */
  buildSingularity() {
    const mat = new THREE.SpriteMaterial({
      map: this.glowTex, color: 0x60a5fa, transparent: true,
      opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.singularity = new THREE.Sprite(mat);
    this.singularity.scale.set(3.2, 3.2, 1);
    this.scene.add(this.singularity);

    // A tighter, brighter inner core for a two-layer bloom feel.
    const inner = new THREE.SpriteMaterial({
      map: this.glowTex, color: 0xffffff, transparent: true,
      opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.singularityInner = new THREE.Sprite(inner);
    this.singularityInner.scale.set(1.1, 1.1, 1);
    this.scene.add(this.singularityInner);
  }

  /* ---------- ORBITING TEAM-NODES + ENERGY FILAMENTS ----------
     Six nodes orbit the core; the filaments bind them to the centre.
     At the "merge" chapter the orbits collapse inward — the visual
     rendering of "there is no I or me from now on; it's ours." ----- */
  buildOrbits() {
    this.nodeCount = 6;
    this.nodes = [];
    this.nodeBase = [];

    const nodeMat = new THREE.SpriteMaterial({
      map: this.glowTex, color: 0x38bdf8, transparent: true,
      opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false,
    });

    for (let i = 0; i < this.nodeCount; i++) {
      const s = new THREE.Sprite(nodeMat.clone());
      const a = (i / this.nodeCount) * TAU;
      s.userData = {
        angle: a,
        speed: 0.18 + rand(i + 40) * 0.16,
        tilt: (rand(i + 41) - 0.5) * 1.1,
        bob: rand(i + 42) * TAU,
        scale: 0.42 + rand(i + 43) * 0.3,
      };
      s.scale.setScalar(s.userData.scale);
      this.scene.add(s);
      this.nodes.push(s);
      this.nodeBase.push(a);
    }

    // Filaments: one line per node, centre → node, redrawn each frame.
    this.filamentGeo = new THREE.BufferGeometry();
    const fPos = new Float32Array(this.nodeCount * 2 * 3);
    this.filamentGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
    // Per-vertex alpha so bonds can fade independently.
    const fAlpha = new Float32Array(this.nodeCount * 2);
    this.filamentGeo.setAttribute('aAlpha', new THREE.BufferAttribute(fAlpha, 1));

    const fMat = new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aAlpha;
        varying float vA;
        void main() {
          vA = aAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying float vA;
        void main() {
          vec3 col = mix(vec3(0.14, 0.38, 0.96), vec3(0.22, 0.74, 0.96), vA);
          gl_FragColor = vec4(col, vA * uOpacity);
        }
      `,
    });

    this.filaments = new THREE.LineSegments(this.filamentGeo, fMat);
    this.scene.add(this.filaments);
    this.filamentMat = fMat;
    this.filamentAlpha = this.filamentGeo.attributes.aAlpha;
  }

  /* ---------- AURORA RIBBONS ---------- */
  buildAurora() {
    this.ribbons = [];
    const colors = [0x1d4ed8, 0x2563eb, 0x06b6d4];
    for (let r = 0; r < 3; r++) {
      const geo = new THREE.PlaneGeometry(26, 240, 12, 120);
      const pos = geo.attributes.position;
      const base = new Float32Array(pos.count);
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        base[i] = Math.sin(y * 0.08) * 2.4 + Math.sin(y * 0.31) * 0.7;
        pos.setZ(i, base[i]);
      }
      geo.rotateX(-Math.PI / 2);
      geo.rotateZ(r * 1.9);

      const mat = new THREE.MeshBasicMaterial({
        color: colors[r], transparent: true, opacity: 0.05,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { base, geo, speed: 0.5 + r * 0.25 };
      mesh.position.set((r - 1) * 2.4, -10, -6 - r * 3);
      this.scene.add(mesh);
      this.ribbons.push(mesh);
    }
  }

  /* ---------- STARFIELD ---------- */
  buildStars() {
    const n = 2600;
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 30 + rand(i + 20) * 70;
      const t = rand(i + 21) * TAU;
      const ph = Math.acos(2 * rand(i + 22) - 1);
      p[i * 3] = r * Math.sin(ph) * Math.cos(t);
      p[i * 3 + 1] = r * Math.cos(ph);
      p[i * 3 + 2] = r * Math.sin(ph) * Math.sin(t);
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    this.stars = new THREE.Points(g, new THREE.PointsMaterial({
      size: 0.22, color: 0x94a3b8, transparent: true, opacity: 0.45,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.scene.add(this.stars);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize(), { passive: true });
    window.addEventListener('pointermove', (e) => {
      this.pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointerTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    if (this.uniforms) {
      const projY = this.camera.projectionMatrix.elements[5]; // 1 / tan(fov/2)
      this.uniforms.uPixel.value = (h * this.dpr * projY) / 2;
    }
  }

  /* progress: 0..1 across the whole page */
  setProgress(p) { this.targetProgress = THREE.MathUtils.clamp(p, 0, 1); }

  /* scroll velocity, normalised. Positive = scrolling down. */
  setVelocity(v) { this.targetVelocity = THREE.MathUtils.clamp(v, -1, 1); }

  /* ignition: 0 = void, 1 = assembled. Driven by the intro timeline. */
  setIgnite(v) { this.igniteTarget = THREE.MathUtils.clamp(v, 0, 1); }

  sampleStates() {
    const states = this.shapeStates;
    const scaled = this.targetProgress * (states.length - 1);
    const i = Math.floor(scaled);
    const f = scaled - i;
    const a = states[Math.min(i, states.length - 1)];
    const b = states[Math.min(i + 1, states.length - 1)];
    return { a, b, f };
  }

  loop() {
    this.raf = requestAnimationFrame(() => this.loop());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    const ease = this.reduced ? 1 : 0.09;
    this.progress += (this.targetProgress - this.progress) * ease;
    this.velocity += (this.targetVelocity - this.velocity) * (this.reduced ? 1 : 0.08);
    this.ignite += (this.igniteTarget - this.ignite) * (this.reduced ? 1 : 0.045);

    const { a, b, f } = this.sampleStates();
    const mix = (k) => a[k] + (b[k] - a[k]) * f;
    const u = this.uniforms;

    u.uTime.value = this.reduced ? 0 : t;
    u.uProgress.value = this.progress;
    u.uVelocity.value = this.reduced ? 0 : this.velocity;
    u.uIgnite.value = this.ignite;
    u.uSpread.value += ((mix('spread') / 9.0) - u.uSpread.value) * 0.08;
    u.uRadius.value += ((mix('radius') / 2.0) - u.uRadius.value) * 0.08;
    u.uSwarm.value += (mix('swarm') - u.uSwarm.value) * 0.08;
    u.uWire.value += (mix('wire') - u.uWire.value) * 0.08;
    u.uHue.value += (mix('hue') - u.uHue.value) * 0.08;

    const spin = mix('spin');
    const vAmt = Math.abs(this.velocity);
    /* The calm profile drifts at roughly half speed. Same identity,
       but it no longer pulls the eye away from the listing on top. */
    const rate = this.calm ? 0.5 : 1;
    if (!this.reduced) {
      this.core.rotation.y += dt * (spin * 0.5 + vAmt * 0.9) * rate;
      this.core.rotation.x = Math.sin(t * 0.1) * 0.15;
    }

    /* ---- Architecture cage: opacity breathes with the chapter,
       flares with velocity, and spins on its own axis. ---- */
    const cageOp = mix('cage') * this.ignite;
    this.cages.forEach((c, i) => {
      c.material.opacity += ((cageOp * (i === 0 ? 1 : 0.7)) - c.material.opacity) * 0.06;
      if (!this.reduced) {
        c.rotation.y += dt * (c.userData.speed + vAmt * 0.4) * (i === 0 ? 1 : 1.6);
        c.rotation.x += dt * c.userData.speed * 0.6;
      }
      c.scale.setScalar(1 + this.progress * 0.12 + vAmt * 0.06);
    });

    /* ---- Singularity: breathes, flares on velocity, blooms at merge. */
    const breathe = 1 + Math.sin(t * 1.35) * 0.10;
    const ignitePulse = this.ignite;
    const flare = 1 + vAmt * 0.9;
    const mergeBloom = mix('bond');
    if (this.singularity) {
      const s = 3.0 * breathe * flare * (0.55 + ignitePulse * 0.45) * (1 + mergeBloom * 0.35);
      this.singularity.scale.set(s, s, 1);
      this.singularity.material.opacity +=
        ((0.30 + vAmt * 0.35 + mergeBloom * 0.25) * ignitePulse - this.singularity.material.opacity) * 0.06;
    }
    if (this.singularityInner) {
      const s = 0.85 * breathe * flare * ignitePulse;
      this.singularityInner.scale.set(s, s, 1);
      this.singularityInner.material.opacity += ((0.55 + vAmt * 0.3) * ignitePulse - this.singularityInner.material.opacity) * 0.08;
    }

    /* ---- Orbits: nodes swing around the core; radius collapses at
       the merge chapter. Filaments are rebuilt in place each frame. */
    const orbitR = mix('orbit');
    const bondOpacity = mix('bond') * this.ignite;
    const fPos = this.filamentGeo.attributes.position;
    const fA = this.filamentAlpha;

    this.nodes.forEach((s, i) => {
      const d = s.userData;
      const ang = d.angle + t * d.speed * (this.reduced ? 0 : 1) + this.progress * 2.2;
      const cosT = Math.cos(d.tilt);
      const sinT = Math.sin(d.tilt);
      const x = Math.cos(ang) * orbitR;
      const z = Math.sin(ang) * orbitR;
      const y = Math.sin(t * 0.6 + d.bob) * 0.55 + Math.sin(ang) * sinT * 1.1;
      const px = x;
      const py = y + Math.cos(ang) * 0.0;
      const pz = z * cosT;

      s.position.set(px, py, pz);
      const pulse = 1 + Math.sin(t * 2.0 + d.bob) * 0.18 + vAmt * 0.4;
      s.scale.setScalar(d.scale * pulse * (0.6 + this.ignite * 0.4));
      s.material.opacity += ((0.5 + vAmt * 0.4) * this.ignite - s.material.opacity) * 0.08;

      const o = i * 6;
      fPos.array[o] = 0; fPos.array[o + 1] = 0; fPos.array[o + 2] = 0;
      fPos.array[o + 3] = px; fPos.array[o + 4] = py; fPos.array[o + 5] = pz;
      fA.array[i * 2] = 0.15;
      fA.array[i * 2 + 1] = 1.0;
    });
    fPos.needsUpdate = true;
    fA.needsUpdate = true;
    this.filamentMat.uniforms.uOpacity.value += (bondOpacity * 0.55 - this.filamentMat.uniforms.uOpacity.value) * 0.06;
    this.filaments.visible = this.filamentMat.uniforms.uOpacity.value > 0.01;

    /* ---- Aurora ribbons undulate; velocity tilts the whole field. */
    this.ribbons.forEach((m, i) => {
      if (this.reduced) return;
      const p = m.userData.geo.attributes.position;
      const base = m.userData.base;
      for (let k = 0; k < p.count; k++) {
        const y = p.getY(k);
        const z = base[k] + Math.sin(y * 0.06 + t * m.userData.speed) * 1.4;
        p.setZ(k, z);
      }
      p.needsUpdate = true;
      m.material.opacity = 0.035 + vAmt * 0.05;
      m.rotation.z += dt * 0.012 * (i % 2 ? -1 : 1);
    });

    /* ---- Camera: dolly on progress, parallax on pointer, kick on
       velocity so fast scrolling physically moves the viewer. ---- */
    const camZ = 14 - this.progress * 3.2 + vAmt * 0.8;
    this.pointer.lerp(this.pointerTarget, 0.04);
    this.camera.position.x += (this.pointer.x * 1.4 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.pointer.y * 0.9 - this.camera.position.y) * 0.05;
    this.camera.position.z += (camZ - this.camera.position.z) * 0.05;
    this.camera.lookAt(0, 0, 0);

    if (this.stars && !this.reduced) {
      this.stars.rotation.y = t * 0.012;
      this.stars.rotation.x = this.pointer.y * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
