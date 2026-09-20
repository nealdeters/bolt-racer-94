/** Hero GT40 mesh. +Z nose after fit. Loops 76–85 tune these. */
export const MESH = {
  url: "/models/gt40.glb",
  length: 3.9,
  paintMetal: 0.42,
  paintRough: 0.28,
  /** Door roundel: fractions of the fitted bbox (loop 78). */
  roundelYFrac: 0.46,
  roundelZFrac: 0.2,
  roundelOut: 0.018,
  roundelRFrac: 0.17,
  hero: {
    cam: [4.05, 0.62, 3.5] as const,
    look: [0, 0.4, 0.12] as const,
    fov: 27,
    yaw: 0.46,
  },
};
