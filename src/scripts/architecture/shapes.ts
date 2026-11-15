/**
 * Living Architecture — shape library.
 *
 * Every shape is a set of exactly N points (so any two shapes can morph into each
 * other) plus optional line segments that are revealed once the points settle.
 * Points are sampled along the segments, which is what makes the "assembly"
 * read as architecture rather than as a random cloud.
 */

export type ShapeName =
  | 'vision'
  | 'architecture'
  | 'ecosystem'
  | 'building'
  | 'neural'
  | 'modules'
  | 'terrain'
  | 'strata'
  | 'radiance'
  | 'beacon';

export interface Shape {
  positions: Float32Array;
  lines: Float32Array | null;
  /** 0 = crisp, 1 = drifting nebula */
  chaos: number;
}

type V3 = [number, number, number];
type Seg = [V3, V3];

/** Small deterministic PRNG so shapes are identical on every visit. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r: () => number) {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const len = (a: V3, b: V3) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);

function boxEdges(cx: number, cy: number, cz: number, w: number, h: number, d: number): Seg[] {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy, y1 = cy + h, z0 = cz - d / 2, z1 = cz + d / 2;
  const c: V3[] = [
    [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
    [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
  ];
  const idx = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return idx.map(([a, b]) => [c[a], c[b]] as Seg);
}

function rectRing(cx: number, y: number, cz: number, w: number, d: number): Seg[] {
  const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
  return [
    [[x0, y, z0], [x1, y, z0]], [[x1, y, z0], [x1, y, z1]],
    [[x1, y, z1], [x0, y, z1]], [[x0, y, z1], [x0, y, z0]],
  ];
}

function circle(cx: number, cy: number, cz: number, radius: number, steps: number, plane: 'xz' | 'xy' = 'xz'): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i < steps; i++) {
    const a0 = (i / steps) * Math.PI * 2, a1 = ((i + 1) / steps) * Math.PI * 2;
    const p = (a: number): V3 =>
      plane === 'xz' ? [cx + Math.cos(a) * radius, cy, cz + Math.sin(a) * radius] : [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, cz];
    out.push([p(a0), p(a1)]);
  }
  return out;
}

/** Distribute `count` points along segments, weighted by length, with slight jitter. */
function sampleSegments(segs: Seg[], count: number, r: () => number, jitter = 0.012, out?: Float32Array, offset = 0) {
  const arr = out ?? new Float32Array(count * 3);
  const lengths = segs.map(([a, b]) => len(a, b));
  const total = lengths.reduce((s, l) => s + l, 0);
  const cumulative: number[] = [];
  let acc = 0;
  for (const l of lengths) cumulative.push((acc += l));
  for (let i = 0; i < count; i++) {
    const target = r() * total;
    let lo = 0, hi = cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < target) lo = mid + 1; else hi = mid;
    }
    const [a, b] = segs[lo];
    const t = r();
    const k = (offset + i) * 3;
    arr[k] = a[0] + (b[0] - a[0]) * t + gauss(r) * jitter;
    arr[k + 1] = a[1] + (b[1] - a[1]) * t + gauss(r) * jitter;
    arr[k + 2] = a[2] + (b[2] - a[2]) * t + gauss(r) * jitter;
  }
  return arr;
}

function segsToLines(segs: Seg[]) {
  const arr = new Float32Array(segs.length * 6);
  segs.forEach(([a, b], i) => arr.set([...a, ...b], i * 6));
  return arr;
}

/** Fill positions with a primary set of segments + a share of points on secondary segments. */
function compose(n: number, r: () => number, primary: Seg[], secondary: Seg[] = [], secondaryShare = 0, jitter = 0.012) {
  const positions = new Float32Array(n * 3);
  const nSecondary = secondary.length ? Math.floor(n * secondaryShare) : 0;
  sampleSegments(primary, n - nSecondary, r, jitter, positions, 0);
  if (nSecondary) sampleSegments(secondary, nSecondary, r, jitter * 1.6, positions, n - nSecondary);
  return positions;
}

/* --------------------------------------------------------------------------
   Shapes
--------------------------------------------------------------------------- */

/** Vision — a wide, drifting field of potential. */
function vision(n: number): Shape {
  const r = rng(11);
  const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const stream = r() < 0.35;
    if (stream) {
      // filaments: loose arcs through space
      const arc = Math.floor(r() * 7);
      const t = r() * Math.PI * 2;
      const rad = 3 + arc * 0.55;
      p[i * 3] = Math.cos(t + arc) * rad + gauss(r) * 0.35;
      p[i * 3 + 1] = Math.sin(t * 1.3 + arc) * 1.6 + gauss(r) * 0.35;
      p[i * 3 + 2] = Math.sin(t + arc) * rad * 0.6 + gauss(r) * 0.35 - 1;
    } else {
      p[i * 3] = gauss(r) * 4.2;
      p[i * 3 + 1] = gauss(r) * 2.4;
      p[i * 3 + 2] = gauss(r) * 3 - 1;
    }
  }
  return { positions: p, lines: null, chaos: 1 };
}

/** Architecture — a precise district of towers, floor plates and a ground grid. */
function architecture(n: number): Shape {
  const r = rng(23);
  const segs: Seg[] = [];
  const cell = 0.92;
  const towers: [number, number, number, number, number][] = [];
  const g = 5;
  for (let ix = 0; ix < g; ix++) {
    for (let iz = 0; iz < g; iz++) {
      const x = (ix - (g - 1) / 2) * cell;
      const z = (iz - (g - 1) / 2) * cell;
      const distC = Math.hypot(ix - 2, iz - 2);
      if (r() < 0.18 && distC > 1) continue;
      const h = Math.max(0.35, (3.4 - distC * 0.95) * (0.65 + r() * 0.55));
      const w = cell * (0.56 + r() * 0.16);
      const d = cell * (0.56 + r() * 0.16);
      towers.push([x, z, w, d, h]);
    }
  }
  const base = -1.7;
  for (const [x, z, w, d, h] of towers) {
    segs.push(...boxEdges(x, base, z, w, h, d));
    const floors = Math.floor(h / 0.32);
    for (let f = 1; f < floors; f++) segs.push(...rectRing(x, base + f * 0.32, z, w, d));
  }
  // ground grid
  const ground: Seg[] = [];
  const ext = 3.2;
  for (let i = -6; i <= 6; i++) {
    const t = (i / 6) * ext;
    ground.push([[-ext, base, t], [ext, base, t]], [[t, base, -ext], [t, base, ext]]);
  }
  const positions = compose(n, r, segs, ground, 0.12, 0.01);
  return { positions, lines: segsToLines([...segs, ...ground]), chaos: 0.04 };
}

/** Ecosystem — five capability clusters around a central core, all interconnected. */
function ecosystem(n: number): Shape {
  const r = rng(37);
  const nodes: V3[] = [];
  const R = 2.7;
  const count = 6;
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + (i / count) * Math.PI * 2;
    // Horizontal ring (XZ plane) so the system reads clearly from every rotation angle.
    nodes.push([Math.cos(a) * R, Math.sin(a * 3) * 0.35, Math.sin(a) * R]);
  }
  const core: V3 = [0, 0, 0];
  const segs: Seg[] = [];
  for (let i = 0; i < count; i++) {
    segs.push([core, nodes[i]]);
    for (let j = i + 1; j < count; j++) segs.push([nodes[i], nodes[j]]);
  }
  const rings: Seg[] = [];
  nodes.forEach((c) => rings.push(...circle(c[0], c[1], c[2], 0.42, 28, 'xy'), ...circle(c[0], c[1], c[2], 0.42, 28, 'xz')));
  rings.push(...circle(0, 0, 0, 0.75, 40, 'xy'), ...circle(0, 0, 0, 0.75, 40, 'xz'), ...circle(0, 0, 0, 1.15, 48, 'xz'), ...circle(0, 0, 0, R, 90, 'xz'));
  const positions = compose(n, r, rings, segs, 0.42, 0.014);
  return { positions, lines: segsToLines([...segs, ...rings]), chaos: 0.05 };
}

/** Building — a single contemporary residential building for Property Technology. */
function building(n: number): Shape {
  const r = rng(53);
  const segs: Seg[] = [];
  const base = -1.9;
  // podium
  segs.push(...boxEdges(0, base, 0, 3.4, 0.7, 2.2));
  // main volume
  const mainH = 3.2;
  segs.push(...boxEdges(-0.35, base + 0.7, 0, 2.2, mainH, 1.7));
  for (let f = 1; f < 9; f++) segs.push(...rectRing(-0.35, base + 0.7 + f * (mainH / 9), 0, 2.2, 1.7));
  // window mullions on the front face
  for (let m = 1; m < 6; m++) {
    const x = -0.35 - 1.1 + m * (2.2 / 6);
    segs.push([[x, base + 0.7, 0.85], [x, base + 0.7 + mainH, 0.85]]);
  }
  // cantilevered upper volume
  segs.push(...boxEdges(0.55, base + 0.7 + mainH, -0.1, 1.9, 0.9, 1.5));
  // balconies
  for (let f = 2; f < 9; f += 2) {
    const y = base + 0.7 + f * (mainH / 9);
    segs.push(...rectRing(0.95, y, 0.95, 0.8, 0.45));
  }
  const ground: Seg[] = [];
  for (let i = -5; i <= 5; i++) {
    const t = i * 0.55;
    ground.push([[-2.8, base, t], [2.8, base, t]], [[t, base, -2.8], [t, base, 2.8]]);
  }
  const positions = compose(n, r, segs, ground, 0.12, 0.01);
  return { positions, lines: segsToLines([...segs, ...ground]), chaos: 0.04 };
}

/** Neural — interconnected nodes on nested spheres (AI). */
function neural(n: number): Shape {
  const r = rng(71);
  const nodes: V3[] = [];
  const count = 70;
  for (let i = 0; i < count; i++) {
    const shell = i % 3 === 0 ? 1.25 : 2.5;
    const y = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    nodes.push([Math.cos(th) * rad * shell, y * shell * 0.92, Math.sin(th) * rad * shell]);
  }
  const segs: Seg[] = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: len(a, b) }))
      .filter((o) => o.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3);
    near.forEach(({ j }) => j > i && segs.push([a, nodes[j]]));
  });
  const positions = new Float32Array(n * 3);
  const nodeShare = Math.floor(n * 0.35);
  for (let i = 0; i < nodeShare; i++) {
    const c = nodes[Math.floor(r() * nodes.length)];
    positions[i * 3] = c[0] + gauss(r) * 0.06;
    positions[i * 3 + 1] = c[1] + gauss(r) * 0.06;
    positions[i * 3 + 2] = c[2] + gauss(r) * 0.06;
  }
  sampleSegments(segs, n - nodeShare, r, 0.01, positions, nodeShare);
  return { positions, lines: segsToLines(segs), chaos: 0.05 };
}

/** Modules — a stacked system of engineered components (software). */
function modules(n: number): Shape {
  const r = rng(89);
  const segs: Seg[] = [];
  const s = 0.78;
  for (let x = 0; x < 4; x++)
    for (let y = 0; y < 3; y++)
      for (let z = 0; z < 4; z++) {
        if (r() < 0.32) continue;
        const size = s * (0.62 + r() * 0.2);
        segs.push(...boxEdges((x - 1.5) * s * 1.18, (y - 1.4) * s * 1.18, (z - 1.5) * s * 1.18, size, size, size));
      }
  const positions = compose(n, r, segs, [], 0, 0.01);
  return { positions, lines: segsToLines(segs), chaos: 0.04 };
}

/** Terrain — a data surface with contour structure (data & BI). */
function terrain(n: number): Shape {
  const r = rng(97);
  const f = (x: number, z: number) =>
    -0.6 + Math.sin(x * 0.9) * 0.55 + Math.cos(z * 1.1 + x * 0.4) * 0.45 + Math.exp(-((x - 0.8) ** 2 + (z + 0.4) ** 2) * 0.6) * 1.2;
  const segs: Seg[] = [];
  const ext = 3.2, steps = 22, sub = 6;
  for (let i = 0; i <= steps; i++) {
    const t = -ext + (i / steps) * ext * 2;
    for (let k = 0; k < steps * sub; k++) {
      const u0 = -ext + (k / (steps * sub)) * ext * 2;
      const u1 = -ext + ((k + 1) / (steps * sub)) * ext * 2;
      segs.push([[u0, f(u0, t), t], [u1, f(u1, t), t]]);
      if (i % 2 === 0) segs.push([[t, f(t, u0), u0], [t, f(t, u1), u1]]);
    }
  }
  // a few data columns rising from the surface
  const cols: Seg[] = [];
  for (let c = 0; c < 9; c++) {
    const x = -2.4 + r() * 4.8, z = -2.4 + r() * 4.8, y = f(x, z);
    cols.push([[x, y, z], [x, y + 0.6 + r() * 1.4, z]]);
  }
  const positions = compose(n, r, segs, cols, 0.08, 0.008);
  return { positions, lines: segsToLines(cols), chaos: 0.04 };
}

/** Strata — layered platform tiers connected by vertical services (cloud). */
function strata(n: number): Shape {
  const r = rng(101);
  const segs: Seg[] = [];
  const layers = 4;
  for (let l = 0; l < layers; l++) {
    const y = -1.6 + l * 1.05;
    const w = 4.2 - l * 0.55;
    segs.push(...rectRing(0, y, 0, w, w * 0.72));
    segs.push(...rectRing(0, y, 0, w * 0.72, w * 0.5));
    for (let g = 1; g < 6; g++) {
      const t = -w / 2 + (g / 6) * w;
      segs.push([[t, y, -w * 0.36], [t, y, w * 0.36]]);
    }
  }
  const conns: Seg[] = [];
  for (let c = 0; c < 14; c++) {
    const x = (r() - 0.5) * 2.2, z = (r() - 0.5) * 1.4, l = Math.floor(r() * (layers - 1));
    conns.push([[x, -1.6 + l * 1.05, z], [x, -1.6 + (l + 1) * 1.05, z]]);
  }
  const positions = compose(n, r, segs, conns, 0.12, 0.01);
  return { positions, lines: segsToLines([...segs, ...conns]), chaos: 0.04 };
}

/** Radiance — expanding rings and spiral arms (growth & brand). */
function radiance(n: number): Shape {
  const r = rng(113);
  const tilt = 0.5;
  const tf = (x: number, y: number, z: number): V3 => [x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)];
  const rings: Seg[] = [];
  for (let k = 1; k <= 6; k++) {
    const rad = k * 0.52;
    const steps = 24 + k * 10;
    for (let i = 0; i < steps; i++) {
      const a0 = (i / steps) * Math.PI * 2, a1 = ((i + 1) / steps) * Math.PI * 2;
      rings.push([tf(Math.cos(a0) * rad, 0, Math.sin(a0) * rad), tf(Math.cos(a1) * rad, 0, Math.sin(a1) * rad)]);
    }
  }
  const arms: Seg[] = [];
  for (let a = 0; a < 5; a++) {
    for (let i = 0; i < 40; i++) {
      const t0 = i / 40, t1 = (i + 1) / 40;
      const p = (t: number): V3 => {
        const rad = 0.2 + t * 3.1, ang = a * ((Math.PI * 2) / 5) + t * 2.4;
        return tf(Math.cos(ang) * rad, t * 1.4, Math.sin(ang) * rad);
      };
      arms.push([p(t0), p(t1)]);
    }
  }
  const positions = compose(n, r, rings, arms, 0.45, 0.012);
  return { positions, lines: segsToLines(rings), chaos: 0.05 };
}

/** Beacon — a signal spire broadcasting rings of visibility (search & AI visibility). */
function beacon(n: number): Shape {
  const r = rng(131);
  const segs: Seg[] = [];
  // spire
  const base = -1.9, top = 1.6;
  const legs: V3[] = [[-0.55, base, -0.55], [0.55, base, -0.55], [0.55, base, 0.55], [-0.55, base, 0.55]];
  const apex: V3 = [0, top, 0];
  legs.forEach((l) => segs.push([l, apex]));
  for (let k = 1; k < 7; k++) {
    const t = k / 7;
    const y = base + (top - base) * t, w = 1.1 * (1 - t);
    segs.push(...rectRing(0, y, 0, w, w));
  }
  // broadcast rings around the apex, tilted
  const rings: Seg[] = [];
  for (let k = 1; k <= 5; k++) {
    const rad = 0.45 + k * 0.5;
    rings.push(...circle(0, top - 0.2 - k * 0.12, 0, rad, 32 + k * 10, 'xz'));
  }
  // signal rays
  for (let a = 0; a < 12; a++) {
    const ang = (a / 12) * Math.PI * 2;
    rings.push([[Math.cos(ang) * 0.3, top, Math.sin(ang) * 0.3], [Math.cos(ang) * 3.1, top - 0.9, Math.sin(ang) * 3.1]]);
  }
  const ground: Seg[] = circle(0, base, 0, 2.6, 60, 'xz').concat(circle(0, base, 0, 1.6, 44, 'xz'));
  const positions = compose(n, r, [...segs, ...ground], rings, 0.45, 0.012);
  return { positions, lines: segsToLines([...segs, ...ground]), chaos: 0.05 };
}

const builders: Record<ShapeName, (n: number) => Shape> = {
  vision, architecture, ecosystem, building, neural, modules, terrain, strata, radiance, beacon,
};

const cache = new Map<string, Shape>();
export function getShape(name: ShapeName, n: number): Shape {
  const key = `${name}:${n}`;
  let s = cache.get(key);
  if (!s) {
    s = builders[name](n);
    cache.set(key, s);
  }
  return s;
}
