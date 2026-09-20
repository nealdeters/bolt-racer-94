import * as THREE from "three";

/** Purpose-built GT40 envelope. +Z nose, y=0 ground. */
export const GT40 = {
  length: 4.12,
  frontAxle: 1.28,
  rearAxle: -1.12,
  wheelR: 0.31,
  wheelHalfW: 0.15,
  track: 0.74,
  hoodTop: 0.58,
  archTop: 0.8,
};

export const AXLES = {
  front: new THREE.Vector3(GT40.track, GT40.wheelR, GT40.frontAxle),
  rear: new THREE.Vector3(GT40.track, GT40.wheelR, GT40.rearAxle),
};

export const PAINT = {
  metalness: 0.46,
  roughness: 0.2,
  clearcoat: 0.62,
  clearcoatRoughness: 0.1,
};
