/**
 * Living Architecture — WebGL engine.
 *
 * A single point system morphs through a sequence of shapes. The morph value `v`
 * is a float index into the sequence (e.g. 0.4 = 40% from shape 0 to shape 1).
 * Each point has its own delay, so structures assemble gradually rather than
 * all at once. Line segments of a shape fade in as its points settle.
 */
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, LineBasicMaterial,
  LineSegments, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer,
} from 'three';
import { getShape, type ShapeName } from './shapes';

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  sequence: ShapeName[];
  reducedMotion?: boolean;
  /** Initial morph value. */
  initial?: number;
  /** Camera distance multiplier (smaller containers can sit closer). */
  zoom?: number;
  /** Horizontal offset of the structure in world units (to make room for text). */
  offsetX?: number;
  /** Vertical lift applied on portrait screens. */
  portraitLift?: number;
}

export interface EngineController {
  setTarget(v: number, dim?: number): void;
  setOffset(x: number): void;
  renderOnce(): void;
  destroy(): void;
}

const vertex = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aSeed;
  uniform float uMix;
  uniform float uTime;
  uniform float uChaosFrom;
  uniform float uChaosTo;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uColVision;
  uniform vec3 uColSignal;
  uniform vec3 uColReality;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float delay = fract(aSeed * 7.31) * 0.45;
    float m = smoothstep(delay, delay + 0.55, uMix);
    vec3 p = mix(aFrom, aTo, m);

    // Drift: strong while scattered (vision), subtle once settled.
    float chaos = mix(uChaosFrom, uChaosTo, m);
    // Points in transit get an extra lift so the assembly feels like travel, not a cross-fade.
    float transit = sin(m * 3.14159);
    float s = aSeed * 43.0;
    p += vec3(
      sin(uTime * 0.35 + s) * 0.22,
      cos(uTime * 0.28 + s * 1.3) * 0.22,
      sin(uTime * 0.31 + s * 0.7) * 0.22
    ) * (chaos + transit * 0.35);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = uSize * (0.55 + fract(aSeed * 13.7) * 0.9) * (1.0 + (1.0 - chaos) * 0.25);
    gl_PointSize = size * uPixelRatio * (34.0 / -mv.z);

    // Colour narrative: vision (violet) -> structure (cyan) -> reality (emerald accents).
    float settled = 1.0 - chaos;
    vec3 base = mix(uColVision, uColSignal, smoothstep(0.15, 0.95, fract(aSeed * 3.17)) * (0.35 + settled * 0.65));
    float accent = step(0.9, fract(aSeed * 5.93)) * settled;
    vColor = mix(base, uColReality, accent);
    vColor += transit * 0.25;
    vColor *= 1.0 + settled * 0.6;
    // Neon sparks: a few points flare in magenta/white at random moments.
    float spark = smoothstep(0.965, 1.0, fract(aSeed * 17.0 + uTime * 0.12));
    vColor = mix(vColor, vec3(1.0, 0.45, 0.9) * 2.2, spark * 0.85);
    gl_PointSize *= 1.0 + spark * 1.6;
    vAlpha = 0.55 + 0.45 * fract(aSeed * 9.1);
  }
`;

const fragment = /* glsl */ `
  uniform float uFade;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, 1.5);
    gl_FragColor = vec4(vColor, a * vAlpha * uFade);
  }
`;

export function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

export function createEngine(opts: EngineOptions): EngineController {
  const { canvas, sequence, reducedMotion = false } = opts;
  const isSmall = window.matchMedia('(max-width: 768px)').matches;
  const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
  const N = isSmall || lowPower ? 6500 : 14000;
  const dprCap = isSmall ? 1.5 : 1.75;

  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 100);
  const baseDistance = 11 * (opts.zoom ?? 1);
  camera.position.set(0, 1.4, baseDistance);
  camera.lookAt(0, 0, 0);

  const group = new Group();
  scene.add(group);

  // Geometry: the 'position' attribute is required by three.js for bounding volumes.
  const geo = new BufferGeometry();
  const seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) seeds[i] = Math.random();
  // Shapes are generated lazily, the first time the sequence reaches them (keeps start-up cheap).
  const shapeAt = (i: number) => getShape(sequence[Math.max(0, Math.min(sequence.length - 1, i))], N);
  const fromAttr = new BufferAttribute(new Float32Array(N * 3), 3);
  const toAttr = new BufferAttribute(new Float32Array(N * 3), 3);
  geo.setAttribute('position', fromAttr);
  geo.setAttribute('aFrom', fromAttr);
  geo.setAttribute('aTo', toAttr);
  geo.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  geo.computeBoundingSphere();
  geo.boundingSphere!.radius = 20; // generous bounds: points travel between shapes

  const uniforms = {
    uMix: { value: 0 },
    uTime: { value: 0 },
    uChaosFrom: { value: 1 },
    uChaosTo: { value: 0 },
    uSize: { value: isSmall ? 1.5 : 1.25 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uFade: { value: 1 },
    uColVision: { value: new Color('#8b6cff') },
    uColSignal: { value: new Color('#5fe3f5') },
    uColReality: { value: new Color('#2fe0a2') },
  };
  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const points = new Points(geo, material);
  group.add(points);

  // Line overlays per unique shape, created when the shape is first used.
  const lineObjects = new Map<ShapeName, LineSegments>();
  const ensureLines = (name: ShapeName) => {
    const l = getShape(name, N).lines;
    if (!l || lineObjects.has(name)) return;
    const lg = new BufferGeometry();
    lg.setAttribute('position', new BufferAttribute(l, 3));
    const lm = new LineBasicMaterial({ color: new Color('#6fd8ef'), transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false });
    const obj = new LineSegments(lg, lm);
    obj.visible = false;
    lineObjects.set(name, obj);
    group.add(obj);
  };

  // State
  let target = opts.initial ?? 0;
  let current = target;
  let dimTarget = 1;
  let dim = 1;
  let loadedPair = -1;
  let offsetTarget = opts.offsetX ?? 0;
  let offset = offsetTarget;
  let lift = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let raf = 0;
  let running = false;
  let visible = true;
  let last = performance.now();
  let elapsed = 0;

  const maxV = sequence.length - 1;

  function loadPair(i: number) {
    if (i === loadedPair) return;
    const a = shapeAt(i);
    const b = shapeAt(i + 1);
    ensureLines(sequence[i]);
    ensureLines(sequence[Math.min(i + 1, maxV)]);
    (fromAttr.array as Float32Array).set(a.positions);
    (toAttr.array as Float32Array).set(b.positions);
    fromAttr.needsUpdate = true;
    toAttr.needsUpdate = true;
    uniforms.uChaosFrom.value = a.chaos;
    uniforms.uChaosTo.value = b.chaos;
    loadedPair = i;
  }

  function applyState() {
    const v = Math.max(0, Math.min(maxV, current));
    let i = Math.floor(v);
    let f = v - i;
    if (i >= maxV) { i = Math.max(0, maxV - 1); f = maxV === 0 ? 0 : 1; }
    loadPair(i);
    uniforms.uMix.value = f;
    uniforms.uFade.value = dim;

    // Line weights: a shape's lines appear as its points settle.
    lineObjects.forEach((obj, name) => {
      let w = 0;
      if (sequence[i] === name) w += 1 - f;
      if (sequence[Math.min(i + 1, maxV)] === name) w += f;
      w = Math.min(1, w);
      const o = Math.pow(Math.max(0, (w - 0.55) / 0.45), 2) * 0.3 * dim;
      (obj.material as LineBasicMaterial).opacity = o;
      obj.visible = o > 0.003;
    });
  }

  function resize() {
    const parent = canvas.parentElement ?? canvas;
    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the structure fully visible on narrow (portrait) screens.
    const portrait = w / h < 1;
    // On portrait screens the structure sits in the upper half, leaving room for text below.
    lift = portrait ? (opts.portraitLift ?? 0) : 0;
    camera.position.z = baseDistance * (portrait ? 1.0 + (1 - w / h) * 1.1 : 1);
    camera.updateProjectionMatrix();
    uniforms.uPixelRatio.value = renderer.getPixelRatio();
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += dt;
    uniforms.uTime.value = elapsed;

    const ease = 1 - Math.pow(0.0025, dt); // frame-rate independent smoothing
    current += (target - current) * ease;
    dim += (dimTarget - dim) * ease;
    offset += (offsetTarget - offset) * ease;
    pointer.x += (pointer.tx - pointer.x) * ease;
    pointer.y += (pointer.ty - pointer.y) * ease;

    group.rotation.y = elapsed * 0.05 + pointer.x * 0.25 + current * 0.55;
    group.rotation.x = pointer.y * 0.08;
    group.position.x = offset;
    group.position.y = lift;

    applyState();
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reducedMotion || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function renderStatic() {
    current = target;
    dim = dimTarget;
    offset = offsetTarget;
    group.rotation.y = 0.6 + current * 0.55;
    group.position.x = offset;
    group.position.y = lift;
    applyState();
    renderer.render(scene, camera);
  }

  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onVisibility = () => (document.hidden ? stop() : start());
  const ro = new ResizeObserver(() => { resize(); if (reducedMotion) renderStatic(); });
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  });

  resize();
  ro.observe(canvas.parentElement ?? canvas);
  io.observe(canvas);
  if (!reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  if (reducedMotion) renderStatic(); else start();

  return {
    setTarget(v, d = 1) {
      target = Math.max(0, Math.min(maxV, v));
      dimTarget = d;
      if (reducedMotion) renderStatic();
    },
    setOffset(x) {
      offsetTarget = x;
      if (reducedMotion) renderStatic();
    },
    renderOnce: renderStatic,
    destroy() {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      geo.dispose();
      material.dispose();
      lineObjects.forEach((o) => { o.geometry.dispose(); (o.material as LineBasicMaterial).dispose(); });
      renderer.dispose();
    },
  };
}
