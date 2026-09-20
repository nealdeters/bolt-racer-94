import * as THREE from "three";

/** s: 0 nose → 1 tail. Length ~4.0m, +Z forward. */
const LEN = 3.95;
const Z0 = 1.92;

function lerpKeys(keys: number[][], s: number): number {
  const t = THREE.MathUtils.clamp(s, 0, 1);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b[0]) {
      const u = (t - a[0]) / Math.max(1e-6, b[0] - a[0]);
      const e = u * u * (3 - 2 * u);
      return a[1] + (b[1] - a[1]) * e;
    }
  }
  return keys[keys.length - 1][1];
}

const WIDTH: number[][] = [
  [0, 0.5],
  [0.05, 0.74],
  [0.1, 0.9],
  [0.2, 1.04],
  [0.28, 0.93],
  [0.4, 0.82],
  [0.52, 0.8],
  [0.64, 0.9],
  [0.76, 1.08],
  [0.88, 1.0],
  [1, 0.84],
];

const CENTER_Y: number[][] = [
  [0, 0.28],
  [0.06, 0.4],
  [0.14, 0.45],
  [0.3, 0.46],
  [0.34, 0.48],
  [0.37, 0.78],
  [0.42, 0.96],
  [0.48, 0.97],
  [0.54, 0.9],
  [0.6, 0.56],
  [0.68, 0.5],
  [0.86, 0.48],
  [1, 0.38],
];

const EDGE_Y: number[][] = [
  [0, 0.26],
  [0.1, 0.4],
  [0.2, 0.5],
  [0.32, 0.43],
  [0.5, 0.4],
  [0.76, 0.54],
  [0.9, 0.46],
  [1, 0.34],
];

export function halfWidth(s: number): number {
  return lerpKeys(WIDTH, s);
}

export function surfacePoint(s: number, t: number): THREE.Vector3 {
  const z = Z0 - s * LEN;
  const hw = halfWidth(s);
  const x = t * hw;
  const cy = lerpKeys(CENTER_Y, s);
  const ey = lerpKeys(EDGE_Y, s);
  const side = Math.min(1, Math.abs(t) / 0.92);
  let y = THREE.MathUtils.lerp(cy, ey, side * side);
  if (s > 0.335 && s < 0.425 && Math.abs(t) < 0.58) {
    y = Math.min(y, 0.5);
  }
  return new THREE.Vector3(x, y, z);
}

function bellyPoint(s: number, t: number): THREE.Vector3 {
  const z = Z0 - s * LEN;
  const hw = halfWidth(s) * 0.96;
  const x = t * hw;
  let y = 0.15;
  const wells: [number, number][] = [
    [0.2, 0.28],
    [0.76, 0.28],
  ];
  for (const [ws, wr] of wells) {
    const ds = (s - ws) / wr;
    const dt = (Math.abs(t) - 0.45) / 0.55;
    if (ds * ds < 1 && t * t > 0.16) {
      const arch = Math.sqrt(Math.max(0, 1 - ds * ds)) * Math.max(0, dt);
      y = Math.max(y, 0.15 + arch * 0.22);
    }
  }
  return new THREE.Vector3(x, y, z);
}

function buildGrid(
  segsS: number,
  segsT: number,
  point: (s: number, t: number) => THREE.Vector3,
  flip: boolean,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  for (let j = 0; j <= segsS; j++) {
    const s = j / segsS;
    for (let i = 0; i <= segsT; i++) {
      const t = (i / segsT) * 2 - 1;
      const p = point(s, t);
      positions.push(p.x, p.y, p.z);
      uvs.push(i / segsT, s);
    }
  }
  const cols = segsT + 1;
  for (let j = 0; j < segsS; j++) {
    for (let i = 0; i < segsT; i++) {
      const a = j * cols + i;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      if (flip) index.push(a, b, c, b, d, c);
      else index.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

export function createBodyHull(): THREE.BufferGeometry {
  return buildGrid(48, 28, surfacePoint, false);
}

export function createBelly(): THREE.BufferGeometry {
  return buildGrid(36, 18, bellyPoint, true);
}

export function createWindshield(): THREE.BufferGeometry {
  const wSeg = 24;
  const hSeg = 12;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  for (let j = 0; j <= hSeg; j++) {
    const v = j / hSeg;
    for (let i = 0; i <= wSeg; i++) {
      const u = i / wSeg;
      const yaw = (u - 0.5) * 2.05;
      const rad = 0.68 + v * 0.08;
      const x = Math.sin(yaw) * rad;
      const z = Math.cos(yaw) * 0.4 - v * 0.42;
      const y = 0.06 + v * 0.52;
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

export function stripePoints(t: number, s0: number, s1: number, count: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const s = s0 + ((s1 - s0) * i) / (count - 1);
    const p = surfacePoint(s, t);
    p.y += 0.012;
    pts.push(p);
  }
  return pts;
}
