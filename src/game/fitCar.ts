import * as THREE from "three";

/** Center on XZ, sit on y=0, make longest axis `length`, then widen/flatten. */
export function fitCar(
  root: THREE.Object3D,
  length = 3.75,
  wide = 1.22,
  low = 0.68,
): void {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
  if (size.x > size.z + 0.05) {
    root.rotation.y += Math.PI / 2;
    root.updateMatrixWorld(true);
  }
  const box2 = new THREE.Box3().setFromObject(root);
  const size2 = box2.getSize(new THREE.Vector3());
  const s = length / Math.max(size2.z, size2.x, 0.001);
  root.scale.set(s * wide, s * low, s);
  root.updateMatrixWorld(true);
  const box3 = new THREE.Box3().setFromObject(root);
  root.position.x -= (box3.min.x + box3.max.x) * 0.5;
  root.position.z -= (box3.min.z + box3.max.z) * 0.5;
  root.position.y -= box3.min.y;
}

const LIGHT_MAT = /light/i;

/** Uniform fit for a real GT40 mesh: +Z nose, y=0, keep proportions. */
export function fitMeshCar(root: THREE.Object3D, length = 3.9): void {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  if (size.x > size.z + 0.02) {
    root.rotation.y += Math.PI / 2;
    root.updateMatrixWorld(true);
  }
  const lightBox = new THREE.Box3();
  let lights = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const named = `${mesh.name} ${mats.map((m) => m?.name ?? "").join(" ")}`;
    if (LIGHT_MAT.test(named)) {
      lightBox.expandByObject(mesh);
      lights += 1;
    }
  });
  if (lights > 0) {
    const lz = lightBox.getCenter(new THREE.Vector3()).z;
    if (lz < 0) {
      root.rotation.y += Math.PI;
      root.updateMatrixWorld(true);
    }
  }
  const box2 = new THREE.Box3().setFromObject(root);
  const size2 = box2.getSize(new THREE.Vector3());
  const s = length / Math.max(size2.z, 0.001);
  root.scale.multiplyScalar(s);
  root.updateMatrixWorld(true);
  const box3 = new THREE.Box3().setFromObject(root);
  root.position.x -= (box3.min.x + box3.max.x) * 0.5;
  root.position.z -= (box3.min.z + box3.max.z) * 0.5;
  root.position.y -= box3.min.y;
}
