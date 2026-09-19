import * as THREE from "three";

type Slice = {
  z: number;
  halfW: number;
  yBot: number;
  yTop: number;
  n: number;
};

const RING = 56;

/** GT40-style hull: short nose, low belt, long rear deck, flared arches. +Z forward. */
const BODY: Slice[] = [
  { z: 1.86, halfW: 0.52, yBot: 0.16, yTop: 0.34, n: 7.2 },
  { z: 1.72, halfW: 0.74, yBot: 0.14, yTop: 0.4, n: 7.6 },
  { z: 1.52, halfW: 0.9, yBot: 0.14, yTop: 0.44, n: 8 },
  { z: 1.28, halfW: 0.98, yBot: 0.22, yTop: 0.5, n: 8.2 },
  { z: 1.1, halfW: 1.02, yBot: 0.26, yTop: 0.5, n: 8.2 },
  { z: 0.88, halfW: 0.92, yBot: 0.16, yTop: 0.48, n: 7.8 },
  { z: 0.52, halfW: 0.84, yBot: 0.15, yTop: 0.47, n: 7.6 },
  { z: 0.15, halfW: 0.82, yBot: 0.15, yTop: 0.46, n: 7.5 },
  { z: -0.25, halfW: 0.84, yBot: 0.15, yTop: 0.47, n: 7.5 },
  { z: -0.62, halfW: 0.9, yBot: 0.15, yTop: 0.5, n: 7.6 },
  { z: -0.95, halfW: 1.0, yBot: 0.2, yTop: 0.54, n: 8 },
  { z: -1.22, halfW: 1.08, yBot: 0.26, yTop: 0.56, n: 8.2 },
  { z: -1.48, halfW: 1.02, yBot: 0.18, yTop: 0.52, n: 7.8 },
  { z: -1.72, halfW: 0.92, yBot: 0.16, yTop: 0.48, n: 7.4 },
  { z: -1.96, halfW: 0.8, yBot: 0.16, yTop: 0.42, n: 7 },
];

/** Forward greenhouse / fastback bubble. */
const CABIN: Slice[] = [
  { z: 0.62, halfW: 0.5, yBot: 0.42, yTop: 0.56, n: 5.2 },
  { z: 0.42, halfW: 0.6, yBot: 0.42, yTop: 0.78, n: 5.6 },
  { z: 0.18, halfW: 0.64, yBot: 0.42, yTop: 0.9, n: 5.8 },
  { z: -0.08, halfW: 0.64, yBot: 0.42, yTop: 0.92, n: 5.8 },
  { z: -0.32, halfW: 0.6, yBot: 0.42, yTop: 0.82, n: 5.5 },
  { z: -0.52, halfW: 0.52, yBot: 0.42, yTop: 0.64, n: 5.2 },
  { z: -0.68, halfW: 0.4, yBot: 0.42, yTop: 0.52, n: 5 },
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
  if (s > 0) {
    const top = yc + b;
    y = top - (top - y) * 0.32;
  } else {
    const belly = yc - b;
    y = belly + (y - belly) * 0.38;
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

function punchIntake(geo: THREE.BufferGeometry): void {
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (z < 1.48) continue;
    if (Math.abs(x) < 0.3 && y > 0.2 && y < 0.4) {
      const wx = 1 - Math.abs(x) / 0.3;
      const wy = 1 - Math.abs(y - 0.3) / 0.1;
      pos.setZ(i, z - 0.22 * wx * wy);
    }
  }
  pos.needsUpdate = true;
}

export function createBodyHull(): THREE.BufferGeometry {
  const geo = loft(BODY);
  punchIntake(geo);
  geo.computeVertexNormals();
  return geo;
}

export function createCabinHull(): THREE.BufferGeometry {
  const geo = loft(CABIN);
  geo.computeVertexNormals();
  return geo;
}

export function createWindshield(): THREE.BufferGeometry {
  const wSeg = 22;
  const hSeg = 12;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];

  for (let j = 0; j <= hSeg; j++) {
    const v = j / hSeg;
    for (let i = 0; i <= wSeg; i++) {
      const u = i / wSeg;
      const yaw = (u - 0.5) * 1.85;
      const rad = 0.7 + v * 0.06;
      const x = Math.sin(yaw) * rad;
      const z = Math.cos(yaw) * 0.42 - v * 0.38;
      const y = 0.08 + v * 0.5;
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
