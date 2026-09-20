import * as THREE from "three";

/** Loop-14 frozen GT40 loft. +Z nose, y=0 ground. */
export const GT40 = {
  length: 4.05,
  zNose: 2.02,
  frontAxle: 1.18,
  rearAxle: -1.22,
  wheelR: 0.34,
  wheelHalfW: 0.16,
  track: 0.72,
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
  { s: 0.0, hw: 0.28, rocker: 0.18, belt: 0.32, roof: 0.34, rhw: 0.16 },
  { s: 0.04, hw: 0.5, rocker: 0.14, belt: 0.38, roof: 0.4, rhw: 0.3 },
  { s: 0.09, hw: 0.72, rocker: 0.12, belt: 0.44, roof: 0.48, rhw: 0.48 },
  { s: 0.15, hw: 0.84, rocker: 0.11, belt: 0.48, roof: 0.52, rhw: 0.58 },
  { s: 0.22, hw: 0.88, rocker: 0.1, belt: 0.5, roof: 0.52, rhw: 0.56 },
  { s: 0.3, hw: 0.8, rocker: 0.12, belt: 0.52, roof: 0.54, rhw: 0.5 },
  { s: 0.35, hw: 0.8, rocker: 0.11, belt: 0.48, roof: 0.72, rhw: 0.48 },
  { s: 0.4, hw: 0.81, rocker: 0.11, belt: 0.5, roof: 1.02, rhw: 0.42 },
  { s: 0.42, hw: 0.81, rocker: 0.11, belt: 0.5, roof: 1.03, rhw: 0.41 },
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

type RingPt = { x: number; y: number; u: number };

function halfSection(st: Station, t: number): { x: number; y: number } {
  const roof = st.roof;
  const rhw = st.rhw;
  const hw = st.hw;
  const pts: [number, number][] = [
    [0, 0.05],
    [hw * 0.38, 0.048],
    [hw * 0.68, st.rocker],
    [hw * 0.86, lerp(st.rocker, st.belt, 0.4)],
    [hw * 1.0, st.belt],
    [hw * 0.92, lerp(st.belt, roof, 0.35)],
    [rhw, lerp(st.belt, roof, 0.9)],
    [rhw * 0.4, roof],
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

function zOf(s: number): number {
  return GT40.zNose - s * GT40.length;
}

function closedRing(st: Station, segs: number): RingPt[] {
  const ring: RingPt[] = [];
  const total = segs * 2;
  for (let i = 0; i < total; i++) {
    const t = i <= segs ? i / segs : (total - i) / segs;
    const sign = i <= segs ? 1 : -1;
    const h = halfSection(st, t);
    ring.push({ x: sign * h.x, y: h.y, u: 0.5 + 0.5 * ((sign * h.x) / Math.max(st.hw, 0.2)) });
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
    const ring = closedRing(st, halfSegs);
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
  return loftClosed(64, 18);
}

export function createGt40Canopy(): THREE.BufferGeometry {
  const wSeg = 32;
  const hSeg = 16;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  for (let j = 0; j <= hSeg; j++) {
    const v = j / hSeg;
    for (let i = 0; i <= wSeg; i++) {
      const u = i / wSeg;
      const yaw = (u - 0.5) * 2.42;
      const rise = v * v * (3 - 2 * v);
      const x = Math.sin(yaw) * (0.7 + rise * 0.04);
      const z = 0.72 - rise * 1.05 + Math.cos(yaw) * 0.16 * (1 - rise);
      const y = 0.5 + rise * 0.56 + Math.cos(yaw) * 0.03;
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
    const s = 0.02 + (0.96 * i) / (count - 1);
    const st = sampleStation(s);
    pts.push(new THREE.Vector3(side, st.roof + 0.018, zOf(s)));
  }
  return pts;
}

export const AXLES = {
  front: new THREE.Vector3(GT40.track, GT40.wheelR, GT40.frontAxle),
  rear: new THREE.Vector3(GT40.track, GT40.wheelR, GT40.rearAxle),
};
