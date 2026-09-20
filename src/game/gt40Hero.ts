/** Hero GT40 mesh. +Z nose after fit. Loops 76–85 tune these. */
export const MESH = {
  url: "/models/gt40.glb",
  length: 3.9,
  paintMetal: 0.5,
  paintRough: 0.24,
  /** Door roundel: fractions of the fitted bbox (loop 78). */
  roundelYFrac: 0.46,
  roundelZFrac: 0.2,
  roundelOut: 0.018,
  roundelRFrac: 0.17,
  stripeWFrac: 0.048,
  stripeGapFrac: 0.028,
  stripeLenFrac: 0.3,
  stripeYFrac: 0.585,
  stripeZFrac: 0.28,
  hero: {
    cam: [4.15, 0.34, 1.9] as const,
    look: [0.02, 0.28, 0.22] as const,
    fov: 30,
    yaw: 0.68,
  },
};
