import * as THREE from "three";
import { makeHubTexture, makeRoundelTexture } from "./textures";

/** Tunable GT40-style homage. +Z nose, y=0 ground. Loops 41–50 edit this. */
export const ROUND = {
  paintMetal: 0.42,
  paintRough: 0.26,
  frontAxle: 1.16,
  rearAxle: -1.24,
  track: 0.78,
  wheelR: 0.325,
  tireTube: 0.075,
  hubR: 0.205,
  stripeX: 0.095,
  stripeR: 0.032,
  lampX: 0.56,
  lampY: 0.5,
  lampZ: 1.78,
  lampR: 0.11,
  amberX: 0.78,
  amberY: 0.36,
  amberZ: 1.6,
  glass: { x: 0.76, y: 0.27, z: 0.6, px: 0, py: 0.86, pz: -0.2 },
  scoopZ: -0.98,
  roundelZ: -0.06,
  roundelY: 0.5,
  roundelR: 0.22,
  hero: {
    cam: [3.12, 0.7, 3.48] as const,
    look: [0.02, 0.4, 0.18] as const,
    fov: 26,
    yaw: 0.58,
  },
};

type Station = {
  z: number;
  hw: number;
  floor: number;
  rocker: number;
  belt: number;
  hood: number;
  fender: number;
  fenderX: number;
};

const KEYS: Station[] = [
  { z: 2.1, hw: 0.16, floor: 0.18, rocker: 0.2, belt: 0.28, hood: 0.32, fender: 0.32, fenderX: 0.08 },
  { z: 1.94, hw: 0.4, floor: 0.13, rocker: 0.16, belt: 0.38, hood: 0.42, fender: 0.46, fenderX: 0.3 },
  { z: 1.74, hw: 0.76, floor: 0.11, rocker: 0.18, belt: 0.46, hood: 0.5, fender: 0.76, fenderX: 0.62 },
  { z: 1.44, hw: 0.88, floor: 0.1, rocker: 0.3, belt: 0.5, hood: 0.56, fender: 0.9, fenderX: 0.74 },
  { z: 1.16, hw: 0.92, floor: 0.12, rocker: 0.42, belt: 0.52, hood: 0.58, fender: 0.95, fenderX: 0.78 },
  { z: 0.88, hw: 0.86, floor: 0.1, rocker: 0.22, belt: 0.5, hood: 0.6, fender: 0.82, fenderX: 0.7 },
  { z: 0.48, hw: 0.8, floor: 0.1, rocker: 0.12, belt: 0.52, hood: 0.63, fender: 0.72, fenderX: 0.6 },
  { z: 0.16, hw: 0.78, floor: 0.1, rocker: 0.12, belt: 0.58, hood: 0.7, fender: 0.7, fenderX: 0.5 },
  { z: -0.16, hw: 0.8, floor: 0.1, rocker: 0.12, belt: 0.62, hood: 0.72, fender: 0.72, fenderX: 0.52 },
  { z: -0.52, hw: 0.82, floor: 0.1, rocker: 0.12, belt: 0.6, hood: 0.7, fender: 0.74, fenderX: 0.58 },
  { z: -0.88, hw: 0.88, floor: 0.1, rocker: 0.24, belt: 0.52, hood: 0.66, fender: 0.86, fenderX: 0.72 },
  { z: -1.24, hw: 0.94, floor: 0.12, rocker: 0.42, belt: 0.52, hood: 0.64, fender: 0.93, fenderX: 0.8 },
  { z: -1.54, hw: 0.86, floor: 0.13, rocker: 0.22, belt: 0.5, hood: 0.62, fender: 0.76, fenderX: 0.68 },
  { z: -1.86, hw: 0.72, floor: 0.16, rocker: 0.18, belt: 0.48, hood: 0.6, fender: 0.62, fenderX: 0.5 },
  { z: -2.0, hw: 0.58, floor: 0.18, rocker: 0.2, belt: 0.44, hood: 0.56, fender: 0.56, fenderX: 0.38 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smooth(t: number): number {
  const u = THREE.MathUtils.clamp(t, 0, 1);
  return u * u * (3 - 2 * u);
}

function lerpStation(a: Station, b: Station, t: number): Station {
  const u = smooth(t);
  return {
    z: lerp(a.z, b.z, u),
    hw: lerp(a.hw, b.hw, u),
    floor: lerp(a.floor, b.floor, u),
    rocker: lerp(a.rocker, b.rocker, u),
    belt: lerp(a.belt, b.belt, u),
    hood: lerp(a.hood, b.hood, u),
    fender: lerp(a.fender, b.fender, u),
    fenderX: lerp(a.fenderX, b.fenderX, u),
  };
}

function stationAt(z: number): Station {
  if (z >= KEYS[0].z) return KEYS[0];
  const last = KEYS[KEYS.length - 1];
  if (z <= last.z) return last;
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (z <= a.z && z >= b.z) {
      return lerpStation(a, b, (a.z - z) / Math.max(1e-6, a.z - b.z));
    }
  }
  return last;
}

type RingPt = { x: number; y: number };

function halfSection(st: Station, segs: number): RingPt[] {
  const anchors = [
    new THREE.Vector3(0, st.floor, 0),
    new THREE.Vector3(st.hw * 0.4, st.floor + 0.008, 0),
    new THREE.Vector3(st.hw * 0.78, st.rocker, 0),
    new THREE.Vector3(st.hw, (st.rocker + st.belt) * 0.48, 0),
    new THREE.Vector3(st.hw * 0.97, st.belt, 0),
    new THREE.Vector3(st.fenderX, st.fender, 0),
    new THREE.Vector3(st.fenderX * 0.4, st.hood + (st.fender - st.hood) * 0.2, 0),
    new THREE.Vector3(0, st.hood, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(anchors, false, "catmullrom", 0.18);
  return curve.getPoints(segs).map((p) => ({ x: Math.max(0, p.x), y: p.y }));
}

function closedRing(st: Station, segs: number): RingPt[] {
  const half = halfSection(st, segs);
  const ring: RingPt[] = [];
  for (let i = 0; i < half.length; i++) ring.push({ x: half[i].x, y: half[i].y });
  for (let i = half.length - 2; i >= 1; i--) ring.push({ x: -half[i].x, y: half[i].y });
  return ring;
}

export function createRoundedHull(): THREE.BufferGeometry {
  const stationCount = 56;
  const halfSegs = 18;
  const z0 = KEYS[0].z;
  const z1 = KEYS[KEYS.length - 1].z;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  const rings: RingPt[][] = [];
  for (let j = 0; j <= stationCount; j++) {
    const t = j / stationCount;
    const z = lerp(z0, z1, t);
    const ring = closedRing(stationAt(z), halfSegs);
    rings.push(ring);
    for (const p of ring) {
      positions.push(p.x, p.y, z);
      uvs.push(0.5 + 0.5 * (p.x / 0.95), t);
    }
  }
  const cols = rings[0].length;
  for (let j = 0; j < stationCount; j++) {
    for (let i = 0; i < cols; i++) {
      const i2 = (i + 1) % cols;
      const a = j * cols + i;
      const b = j * cols + i2;
      const c = (j + 1) * cols + i;
      const d = c + i2 - i;
      index.push(a, c, b, b, c, d);
    }
  }
  const cap = (ringIndex: number, zBump: number, reverse: boolean) => {
    const ring = rings[ringIndex];
    const cx = 0;
    const cy = ring.reduce((s, p) => s + p.y, 0) / ring.length;
    const cz = ringIndex === 0 ? KEYS[0].z + zBump : KEYS[KEYS.length - 1].z + zBump;
    const center = positions.length / 3;
    positions.push(cx, cy, cz);
    uvs.push(0.5, ringIndex === 0 ? 0 : 1);
    const base = ringIndex * cols;
    for (let i = 0; i < cols; i++) {
      const i2 = (i + 1) % cols;
      if (reverse) index.push(center, base + i2, base + i);
      else index.push(center, base + i, base + i2);
    }
  };
  cap(0, 0.02, false);
  cap(stationCount, -0.02, true);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

function stripeCurve(side: number): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  const z0 = 1.96;
  const z1 = -0.62;
  for (let i = 0; i < 28; i++) {
    const t = i / 27;
    const z = lerp(z0, z1, t);
    const st = stationAt(z);
    const cabin = t > 0.48 ? smooth((t - 0.48) / 0.22) * 0.28 : 0;
    pts.push(new THREE.Vector3(side, st.hood + 0.02 + cabin, z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

export type BuiltCar = {
  group: THREE.Group;
  wheels: THREE.Object3D[];
  fronts: THREE.Object3D[];
};

function paintMat(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: ROUND.paintMetal,
    roughness: ROUND.paintRough,
  });
}

export function buildRoundedGt40(paint: string, number: string): BuiltCar {
  const group = new THREE.Group();
  const body = paintMat(paint);
  const glass = new THREE.MeshStandardMaterial({
    color: "#0b1720",
    metalness: 0.35,
    roughness: 0.08,
    transparent: true,
    opacity: 0.92,
  });
  const rubber = new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.92, metalness: 0.05 });
  const chrome = new THREE.MeshStandardMaterial({ color: "#c5c5c5", metalness: 0.92, roughness: 0.18 });
  const lens = new THREE.MeshStandardMaterial({
    color: "#fff4d2",
    emissive: "#e8c56a",
    emissiveIntensity: 0.55,
    metalness: 0.25,
    roughness: 0.12,
  });
  const amber = new THREE.MeshStandardMaterial({
    color: "#e39418",
    emissive: "#c56a00",
    emissiveIntensity: 0.45,
    roughness: 0.28,
  });
  const stripe = new THREE.MeshStandardMaterial({ color: "#f3f3f3", metalness: 0.08, roughness: 0.32 });
  const hubTex = makeHubTexture();
  const hubMat = new THREE.MeshStandardMaterial({
    map: hubTex,
    color: "#2a2a2a",
    metalness: 0.55,
    roughness: 0.4,
  });
  const roundelTex = makeRoundelTexture(number);
  const roundelMat = new THREE.MeshBasicMaterial({ map: roundelTex, transparent: true });

  const hull = new THREE.Mesh(createRoundedHull(), body);
  group.add(hull);

  const add = (mesh: THREE.Mesh) => {
    group.add(mesh);
    return mesh;
  };

  // Soft nose + fender bubbles (organic, still lower at hood center).
  const nose = add(new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), body));
  nose.position.set(0, 0.38, 1.82);
  nose.scale.set(0.62, 0.26, 0.48);

  for (const x of [-1, 1]) {
    const ff = add(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), body));
    ff.position.set(x * 0.7, 0.54, 1.16);
    ff.scale.set(0.42, 0.4, 0.62);
    const rf = add(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), body));
    rf.position.set(x * 0.72, 0.54, -1.22);
    rf.scale.set(0.46, 0.4, 0.64);
  }

  const cabin = add(new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), glass));
  cabin.position.set(ROUND.glass.px, ROUND.glass.py, ROUND.glass.pz);
  cabin.scale.set(ROUND.glass.x, ROUND.glass.y, ROUND.glass.z);

  const belt = add(new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 10, 28), chrome));
  belt.position.set(0, 0.7, -0.18);
  belt.scale.set(1.12, 1, 0.78);
  belt.rotation.x = Math.PI / 2;

  for (const side of [-ROUND.stripeX, ROUND.stripeX]) {
    const tube = new THREE.TubeGeometry(stripeCurve(side), 40, ROUND.stripeR, 8, false);
    add(new THREE.Mesh(tube, stripe));
  }

  for (const x of [-1, 1]) {
    const lamp = add(new THREE.Mesh(new THREE.SphereGeometry(ROUND.lampR, 20, 16), lens));
    lamp.position.set(x * ROUND.lampX, ROUND.lampY, ROUND.lampZ);
    const bezel = add(new THREE.Mesh(new THREE.TorusGeometry(ROUND.lampR + 0.008, 0.016, 10, 22), chrome));
    bezel.position.copy(lamp.position);
    const cover = add(new THREE.Mesh(new THREE.SphereGeometry(ROUND.lampR + 0.012, 18, 14), glass));
    cover.position.copy(lamp.position);
    cover.scale.set(1, 1, 0.72);
    const mark = add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 12), amber));
    mark.position.set(x * ROUND.amberX, ROUND.amberY, ROUND.amberZ);
    mark.scale.set(1.15, 0.85, 0.9);

    const scoop = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.28, 6, 12), body));
    scoop.position.set(x * 0.46, 0.78, ROUND.scoopZ);
    scoop.rotation.set(0.55, 0, x * -0.18);

    const arch = add(new THREE.Mesh(new THREE.TorusGeometry(ROUND.wheelR + 0.06, 0.055, 10, 24, Math.PI), body));
    arch.position.set(x * ROUND.track, ROUND.wheelR + 0.02, ROUND.frontAxle);
    arch.rotation.set(0, x * 0.08, x > 0 ? -Math.PI / 2 : Math.PI / 2);
    const archR = add(new THREE.Mesh(new THREE.TorusGeometry(ROUND.wheelR + 0.07, 0.055, 10, 24, Math.PI), body));
    archR.position.set(x * ROUND.track, ROUND.wheelR + 0.02, ROUND.rearAxle);
    archR.rotation.set(0, x * 0.08, x > 0 ? -Math.PI / 2 : Math.PI / 2);

    const roundel = add(new THREE.Mesh(new THREE.CircleGeometry(ROUND.roundelR, 28), roundelMat));
    roundel.position.set(x * 0.82, ROUND.roundelY, ROUND.roundelZ);
    roundel.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
  }

  const kamm = add(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), body));
  kamm.position.set(0, 0.42, -1.86);
  kamm.scale.set(0.68, 0.38, 0.16);
  const tail = add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), rubber));
  tail.position.set(0, 0.4, -1.98);
  tail.scale.set(2.1, 1.15, 0.22);
  for (const x of [-0.28, 0.28]) {
    const tl = add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), new THREE.MeshStandardMaterial({
      color: "#8a1010",
      emissive: "#5a0000",
      emissiveIntensity: 0.4,
    })));
    tl.position.set(x, 0.42, -2.0);
  }

  const shadow = add(new THREE.Mesh(
    new THREE.CircleGeometry(1, 28),
    new THREE.MeshBasicMaterial({ color: "#3a0505", transparent: true, opacity: 0.32, depthWrite: false }),
  ));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.015, -0.05);
  shadow.scale.set(1.15, 2.05, 1);

  const wheels: THREE.Object3D[] = [];
  const fronts: THREE.Object3D[] = [];
  const tireGeo = new THREE.TorusGeometry(ROUND.wheelR - ROUND.tireTube, ROUND.tireTube, 12, 28);
  const hubGeo = new THREE.CylinderGeometry(ROUND.hubR, ROUND.hubR, 0.1, 24);
  for (const z of [ROUND.frontAxle, ROUND.rearAxle]) {
    for (const x of [-ROUND.track, ROUND.track]) {
      const wheel = new THREE.Group();
      const tire = new THREE.Mesh(tireGeo, rubber);
      tire.rotation.y = Math.PI / 2;
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.z = Math.PI / 2;
      wheel.add(tire, hub);
      const holder = new THREE.Group();
      holder.position.set(x, ROUND.wheelR, z);
      holder.add(wheel);
      group.add(holder);
      wheels.push(wheel);
      if (z === ROUND.frontAxle) fronts.push(holder);
    }
  }

  return { group, wheels, fronts };
}
