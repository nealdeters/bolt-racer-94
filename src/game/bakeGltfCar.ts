import * as THREE from "three";
import type { Mesh, Object3D } from "three";

export type BakedCar = {
  root: THREE.Group;
  wheels: Object3D[];
  fronts: Object3D[];
  box: THREE.Box3;
  size: THREE.Vector3;
  center: THREE.Vector3;
};

const WHEEL_NAME = /wheel|tire|tyre|rim|circle\.\d+/i;
const SKIP_NAME = /plane\.\d+|shadow|ground|polysurface5|polysurface6|polysurface7|polysurface11|wing|mirror/i;
const LIGHT_NAME = /frontlights|white_light|head/i;

function meshBox(mesh: Mesh): { box: THREE.Box3; size: THREE.Vector3; center: THREE.Vector3; vol: number } {
  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  return { box, size, center, vol: size.x * size.y * size.z };
}

function wheelKey(name: string): string | null {
  const circle = name.match(/circle\.\d+/i);
  if (circle) return circle[0].toLowerCase();
  if (WHEEL_NAME.test(name)) return name.toLowerCase();
  return null;
}

/**
 * Bake Sketchfab/FBX world matrices into geometry so Bounds.fit sees the
 * actual coupe instead of the exploded node graph.
 */
export function bakeGltfCar(scene: Object3D): BakedCar {
  const src = scene.clone(true);
  src.updateMatrixWorld(true);

  const baked: Mesh[] = [];
  src.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    if (SKIP_NAME.test(mesh.name) && !WHEEL_NAME.test(mesh.name)) return;
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    const next = new THREE.Mesh(geo, mesh.material);
    next.name = mesh.name;
    next.castShadow = true;
    next.receiveShadow = true;
    baked.push(next);
  });

  // Keep the coupe shell. Only drop runaway helpers (already skipped by name);
  // volume medians previously discarded the single large Car_paint body.
  const kept = baked.map((m) => ({ m, ...meshBox(m) })).filter((x) => x.size.length() < 80);

  const loose: Mesh[] = [];
  const wheelParts = new Map<string, Mesh[]>();
  for (const { m } of kept) {
    const key = wheelKey(m.name);
    if (key) {
      const list = wheelParts.get(key) ?? [];
      list.push(m);
      wheelParts.set(key, list);
    } else {
      loose.push(m);
    }
  }

  const root = new THREE.Group();
  root.name = "baked-car";
  for (const mesh of loose) root.add(mesh);

  const wheels: Object3D[] = [];
  for (const parts of wheelParts.values()) {
    const group = new THREE.Group();
    const tmp = new THREE.Group();
    for (const part of parts) tmp.add(part);
    const box = new THREE.Box3().setFromObject(tmp);
    const center = box.getCenter(new THREE.Vector3());
    for (const part of parts) {
      part.geometry.translate(-center.x, -center.y, -center.z);
      group.add(part);
    }
    group.position.copy(center);
    root.add(group);
    wheels.push(group);
  }

  // Point headlights / nose toward +Z so a front-ish 3/4 is stable.
  const lightBox = new THREE.Box3();
  let lights = 0;
  root.traverse((obj) => {
    if (LIGHT_NAME.test(obj.name)) {
      lightBox.expandByObject(obj);
      lights += 1;
    }
  });
  if (lights > 0 && lightBox.getCenter(new THREE.Vector3()).z < 0) {
    root.rotation.y += Math.PI;
    root.updateMatrixWorld(true);
  }

  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const fronts = wheels
    .map((w) => ({ w, z: w.getWorldPosition(new THREE.Vector3()).z }))
    .sort((a, b) => b.z - a.z)
    .slice(0, 2)
    .map((x) => x.w);

  return { root, wheels, fronts, box, size, center };
}
