/** Hero GT40 mesh. +Z nose after fit. Loops 76–85 tune these. */
export const MESH = {
  url: "/models/gt40.glb",
  length: 3.9,
  paintMetal: 0.42,
  paintRough: 0.28,
  roundelY: 0.38,
  roundelZ: 0.04,
  roundelX: 0.84,
  roundelR: 0.2,
  hero: {
    cam: [4.05, 0.62, 3.5] as const,
    look: [0, 0.4, 0.12] as const,
    fov: 27,
    yaw: 0.46,
  },
};
