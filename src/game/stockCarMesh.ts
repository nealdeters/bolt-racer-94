import * as THREE from "three";

type Slice = {
  z: number;
  halfW: number;
  yBot: number;
  yTop: number;
  n: number;
};

const RING = 48;

/** Low wide diecast hull — long hood, blunt nose, flared fenders. +Z is forward. */
const BODY: Slice[] = [
  { z: 1.78, halfW: 0.62, yBot: 0.2, yTop: 0.4, n: 5.6 },
  { z: 1.66, halfW: 0.82, yBot: 0.17, yTop: 0.46, n: 6.2 },
  { z: 1.48, halfW: 0.96, yBot: 0.17, yTop: 0.52, n: 6.4 },
  { z: 1.22, halfW: 1.08, yBot: 0.26, yTop: 0.6, n: 6.6 },
  { z: 1.02, halfW: 1.04, yBot: 0.28, yTop: 0.58, n: 6.4 },
  { z: 0.72, halfW: 0.9, yBot: 0.19, yTop: 0.56, n: 6.2 },
  { z: 0.38, halfW: 0.84, yBot: 0.19, yTop: 0.55, n: 6.1 },
  { z: 0.08, halfW: 0.82, yBot: 0.2, yTop: 0.54, n: 6 },
  { z: -0.28, halfW: 0.84, yBot: 0.2, yTop: 0.54, n: 6 },
  { z: -0.62, halfW: 0.9, yBot: 0.19, yTop: 0.56, n: 6.1 },
  { z: -0.95, halfW: 1.02, yBot: 0.26, yTop: 0.6, n: 6.4 },
  { z: -1.18, halfW: 1.1, yBot: 0.28, yTop: 0.62, n: 6.6 },
  { z: -1.42, halfW: 0.98, yBot: 0.2, yTop: 0.56, n: 6.2 },
  { z: -1.62, halfW: 0.8, yBot: 0.19, yTop: 0.5, n: 5.8 },
  { z: -1.74, halfW: 0.58, yBot: 0.22, yTop: 0.44, n: 5.4 },
];

/** Cabin greenhouse, set far back on the hull. */
const CABIN: Slice[] = [
  { z: 0.3, halfW: 0.58, yBot: 0.5, yTop: 0.72, n: 4.6 },
  { z: 0.16, halfW: 0.64, yBot: 0.5, yTop: 0.98, n: 4.8 },
  { z: -0.02, halfW: 0.66, yBot: 0.5, yTop: 1.08, n: 5 },
  { z: -0.22, halfW: 0.66, yBot: 0.5, yTop: 1.1, n: 5 },
  { z: -0.42, halfW: 0.64, yBot: 0.5, yTop: 1.02, n: 4.8 },
  { z: -0.6, halfW: 0.6, yBot: 0.5, yTop: 0.86, n: 4.6 },
  { z: -0.74, halfW: 0.5, yBot: 0.5, yTop: 0.68, n: 4.4 },
];

const WING: Slice[] = [
  { z: -0.16, halfW: 0.72, yBot: -0.03, yTop: 0.03, n: 5 },
  { z: 0, halfW: 0.78, yBot: -0.045, yTop: 0.045, n: 5.4 },
  { z: 0.16, halfW: 0.7, yBot: -0.03, yTop: 0.03, n: 5 },
];

function ringPoint(slice: Slice, i: number): THREE.Vector3 {
  const t = (i / RING) * Math.PI * 2;
  const a = slice.halfW;
  const b = (slice.yTop - slice.yBot) * 0.5;
  const yc = (slice.yTop + slice.yBot) * 0.5;
  const n = slice.n;
  const c = Math.cos(t);
  const s = Math.sin(t);
  const x = a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
  let y = yc + b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
  if (s < 0) {
    const belly = yc - b;
    y = belly + (y - belly) * 0.42;
  }
  if (s > 0.25 && Math.abs(x) < 0.18) {
    y += 0.028 * (1 - Math.abs(x) / 0.18);
  }
  return new THREE.Vector3(x, y, slice.z);
}

function loft(slices: Slice[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const rings = slices.map((slice) => {
    const ring: THREE.Vector3[] = [];
    for (let i = 0; i < RING; i++) {
      const p = ringPoint(slice, i);
      ring.push(p);
      positions.push(p.x, p.y, p.z);
    }
    return ring;
  });

  const index: number[] = [];
  for (let s = 0; s < slices.length - 1; s++) {
    for (let i = 0; i < RING; i++) {
      const n = (i + 1) % RING;
      const a = s * RING + i;
      const b = s * RING + n;
      const c = (s + 1) * RING + i;
      const d = (s + 1) * RING + n;
      index.push(a, c, b, b, c, d);
    }
  }

  capRing(rings[0], 0, true, positions, index);
  capRing(rings[rings.length - 1], (slices.length - 1) * RING, false, positions, index);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(index);
  return geo;
}

function capRing(
  ring: THREE.Vector3[],
  start: number,
  front: boolean,
  positions: number[],
  index: number[],
): void {
  const center = new THREE.Vector3();
  ring.forEach((p) => center.add(p));
  center.multiplyScalar(1 / ring.length);
  const ci = positions.length / 3;
  positions.push(center.x, center.y, center.z);
  for (let i = 0; i < RING; i++) {
    const a = start + i;
    const b = start + ((i + 1) % RING);
    if (front) index.push(ci, b, a);
    else index.push(ci, a, b);
  }
}

function punchSmile(geo: THREE.BufferGeometry): void {
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (z < 1.38) continue;
    const nx = x / 0.64;
    const ny = (y - 0.31) / 0.15;
    const d = nx * nx + ny * ny;
    if (d < 1 && y < 0.5) {
      const w = 1 - d;
      pos.setZ(i, z - 0.34 * w * w);
    }
  }
  pos.needsUpdate = true;
}

export function createBodyHull(): THREE.BufferGeometry {
  const geo = loft(BODY);
  punchSmile(geo);
  geo.computeVertexNormals();
  return geo;
}

export function createCabinHull(): THREE.BufferGeometry {
  const geo = loft(CABIN);
  geo.computeVertexNormals();
  return geo;
}

export function createSpoilerWing(): THREE.BufferGeometry {
  const geo = loft(WING);
  geo.computeVertexNormals();
  return geo;
}

export function createWindshield(): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(1.3, 0.8, 16, 10);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, -0.16 * (x * x) - 0.04 * (y * y));
  }
  geo.computeVertexNormals();
  return geo;
}

export function createSmileLip(): THREE.BufferGeometry {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.6, 0.08, 0),
    new THREE.Vector3(0, -0.1, 0.05),
    new THREE.Vector3(0.6, 0.08, 0),
  );
  return new THREE.TubeGeometry(curve, 28, 0.055, 12, false);
}
