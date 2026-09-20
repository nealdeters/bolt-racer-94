import * as THREE from "three";

/** Classic GT40-ish envelope: ~4.05m long, ~1.78m wide, ~1.02m tall. +Z nose. */
export const GT40 = {
  length: 4.05,
  zNose: 2.02,
  frontAxle: 1.18,
  rearAxle: -1.22,
  wheelR: 0.33,
  wheelHalfW: 0.14,
  track: 0.78,
};

type Station = {
  s: number;
  hw: number;
  rocker: number;
  belt: number;
  roof: number;
  rhw: number;
};

const KEYS: Station[] = [
  { s: 0.0, hw: 0.3, rocker: 0.16, belt: 0.3, roof: 0.34, rhw: 0.18 },
  { s: 0.04, hw: 0.52, rocker: 0.12, belt: 0.36, roof: 0.4, rhw: 0.32 },
  { s: 0.09, hw: 0.74, rocker: 0.1, belt: 0.4, roof: 0.46, rhw: 0.5 },
  { s: 0.15, hw: 0.86, rocker: 0.09, belt: 0.43, roof: 0.5, rhw: 0.6 },
  { s: 0.22, hw: 0.9, rocker: 0.08, belt: 0.44, roof: 0.5, rhw: 0.58 },
  { s: 0.3, hw: 0.82, rocker: 0.1, belt: 0.46, roof: 0.56, rhw: 0.5 },
  { s: 0.36, hw: 0.8, rocker: 0.11, belt: 0.48, roof: 0.82, rhw: 0.46 },
  { s: 0.42, hw: 0.81, rocker: 0.11, belt: 0.5, roof: 1.01, rhw: 0.42 },
  { s: 0.48, hw: 0.83, rocker: 0.11, belt: 0.5, roof: 1.0, rhw: 0.43 },
  { s: 0.55, hw: 0.86, rocker: 0.1, belt: 0.48, roof: 0.86, rhw: 0.5 },
  { s: 0.62, hw: 0.92, rocker: 0.09, belt: 0.47, roof: 0.66, rhw: 0.62 },
  { s: 0.7, hw: 0.98, rocker: 0.08, belt: 0.46, roof: 0.56, rhw: 0.72 },
  { s: 0.78, hw: 0.99, rocker: 0.08, belt: 0.46, roof: 0.52, rhw: 0.74 },
  { s: 0.86, hw: 0.93, rocker: 0.1, belt: 0.44, roof: 0.48, rhw: 0.68 },
  { s: 0.93, hw: 0.8, rocker: 0.12, belt: 0.4, roof: 0.43, rhw: 0.58 },
  { s: 1.0, hw: 0.64, rocker: 0.16, belt: 0.34, roof: 0.38, rhw: 0.46 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smooth(t: number): number {
  const u = THREE.MathUtils.clamp(t, 0, 1);
  return u * u * (3 - 2 * u);
}

function sampleStation(s: number): Station {
  const t = THREE.MathUtils.clamp(s, 0, 1);
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (t <= b.s) {
      const u = smooth((t - a.s) / Math.max(1e-6, b.s - a.s));
      return {
        s: t,
        hw: lerp(a.hw, b.hw, u),
        rocker: lerp(a.rocker, b.rocker, u),
        belt: lerp(a.belt, b.belt, u),
        roof: lerp(a.roof, b.roof, u),
        rhw: lerp(a.rhw, b.rhw, u),
      };
    }
  }
  return { ...KEYS[KEYS.length - 1], s: t };
}

/** Cabin bathtub: keep roof rails, drop the center so glass can sit in a hole. */
function cabinDrop(s: number): number {
  if (s < 0.33 || s > 0.56) return 0;
  const mid = 0.445;
  const w = s < mid ? (s - 0.33) / 0.115 : (0.56 - s) / 0.115;
  return smooth(w);
}

type RingPt = { x: number; y: number; u: number };

function halfSection(st: Station, t: number): { x: number; y: number } {
  const drop = cabinDrop(st.s);
  const roof = lerp(st.roof, st.belt + 0.13, drop * 0.82);
  const rhw = lerp(st.rhw, st.hw * 0.72, drop * 0.25);
  const hw = st.hw;
  const pts: [number, number][] = [
    [0, 0.055],
    [hw * 0.42, 0.05],
    [hw * 0.78, st.rocker],
    [hw * 0.97, lerp(st.rocker, st.belt, 0.45)],
    [hw * 1.01, st.belt],
    [hw * 0.9, lerp(st.belt, roof, 0.4)],
    [rhw, lerp(st.belt, roof, 0.88)],
    [rhw * 0.45, roof],
    [0, roof],
  ];
  const scaled = t * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(scaled));
  const u = scaled - i;
  const e = smooth(u);
  return {
    x: lerp(pts[i][0], pts[i + 1][0], e),
    y: lerp(pts[i][1], pts[i + 1][1], e),
  };
}

function notchWheel(x: number, y: number, z: number): { x: number; y: number } {
  if (y > 0.58) return { x, y };
  let ox = x;
  let oy = y;
  for (const axle of [GT40.frontAxle, GT40.rearAxle]) {
    const dz = z - axle;
    const wellR = GT40.wheelR + 0.055;
    if (Math.abs(dz) > wellR) continue;
    const rr = Math.sqrt(Math.max(0, wellR * wellR - dz * dz));
    const cx = Math.sign(x || 1) * GT40.track;
    const cy = GT40.wheelR;
    const dx = ox - cx;
    const dy = oy - cy;
    const d = Math.hypot(dx, dy);
    if (d < rr && oy < cy + rr * 0.92) {
      const k = rr / Math.max(d, 1e-4);
      ox = cx + dx * k;
      oy = cy + dy * k;
    }
  }
  return { x: ox, y: oy };
}

function zOf(s: number): number {
  return GT40.zNose - s * GT40.length;
}

function closedRing(st: Station, z: number, segs: number): RingPt[] {
  const ring: RingPt[] = [];
  const total = segs * 2;
  for (let i = 0; i < total; i++) {
    const t = i <= segs ? i / segs : (total - i) / segs;
    const sign = i <= segs ? 1 : -1;
    const h = halfSection(st, t);
    const n = notchWheel(sign * h.x, h.y, z);
    ring.push({ x: n.x, y: n.y, u: 0.5 + 0.5 * (n.x / Math.max(st.hw, 0.2)) });
  }
  return ring;
}

function loftClosed(stationCount: number, halfSegs: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  const rings: RingPt[][] = [];
  for (let j = 0; j <= stationCount; j++) {
    const s = j / stationCount;
    const st = sampleStation(s);
    const z = zOf(s);
    const ring = closedRing(st, z, halfSegs);
    rings.push(ring);
    for (const p of ring) {
      positions.push(p.x, p.y, z);
      uvs.push(p.u, s);
    }
  }
  const cols = rings[0].length;
  for (let j = 0; j < stationCount; j++) {
    for (let i = 0; i < cols; i++) {
      const i2 = (i + 1) % cols;
      const a = j * cols + i;
      const b = j * cols + i2;
      const c = (j + 1) * cols + i;
      const d = (j + 1) * cols + i2;
      index.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

export function createGt40Hull(): THREE.BufferGeometry {
  return loftClosed(56, 16);
}

export function createGt40Canopy(): THREE.BufferGeometry {
  const wSeg = 28;
  const hSeg = 14;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  for (let j = 0; j <= hSeg; j++) {
    const v = j / hSeg;
    for (let i = 0; i <= wSeg; i++) {
      const u = i / wSeg;
      const yaw = (u - 0.5) * 2.28;
      const rise = v * v * (3 - 2 * v);
      const x = Math.sin(yaw) * (0.62 + rise * 0.06);
      const z = 0.62 - rise * 0.95 + Math.cos(yaw) * 0.12 * (1 - rise);
      const y = 0.52 + rise * 0.5 + Math.cos(yaw) * 0.02;
      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }
  for (let j = 0; j < hSeg; j++) {
    for (let i = 0; i < wSeg; i++) {
      const a = j * (wSeg + 1) + i;
      const b = a + 1;
      const c = a + (wSeg + 1);
      const d = c + 1;
      index.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

export function stripePath(side: number, count = 32): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const s = 0.015 + (0.97 * i) / (count - 1);
    const st = sampleStation(s);
    const z = zOf(s);
    const drop = cabinDrop(s);
    const y = lerp(st.roof, 1.03, drop * 0.92) + 0.014;
    pts.push(new THREE.Vector3(side, y, z));
  }
  return pts;
}

export const AXLES = {
  front: new THREE.Vector3(GT40.track, GT40.wheelR, GT40.frontAxle),
  rear: new THREE.Vector3(GT40.track, GT40.wheelR, GT40.rearAxle),
};
