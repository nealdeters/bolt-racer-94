import { clamp } from "./math";
import { applyDrive, headingFromTangent, wrapHeadingError } from "./physics";
import { AI_BASE_MAX_SPEED } from "./constants";
import type { CarState } from "./types";
import type { TrackRuntime } from "./trackRuntime";

export function updateAi(ai: CarState, player: CarState, track: TrackRuntime, dt: number): void {
  const look = 0.07 + clamp(ai.speed / 80, 0, 0.06);
  const targetT = (ai.t + look) % 1;
  const idx = Math.floor(targetT * track.count) % track.count;
  const point = track.samples[idx];
  const tangent = track.tangents[idx];
  const nx = -tangent.z;
  const nz = tangent.x;
  const lane = 1.7;
  const tx = point.x + nx * lane;
  const tz = point.z + nz * lane;

  const desired = Math.atan2(tx - ai.x, tz - ai.z);
  const err = wrapHeadingError(desired, ai.heading);
  const steer = clamp(err / 0.55, -1, 1);

  const lead = ai.lapsCompleted + ai.t - (player.lapsCompleted + player.t);
  let throttle = 0.86;
  let maxSpeed = AI_BASE_MAX_SPEED;
  if (lead > 0.45) {
    throttle = 0.42;
    maxSpeed = 16;
  } else if (lead > 0.2) {
    throttle = 0.62;
    maxSpeed = 19;
  } else if (lead < -0.35) {
    throttle = 0.98;
    maxSpeed = 25.2;
  } else if (lead < -0.14) {
    throttle = 0.94;
    maxSpeed = 23.8;
  }

  const ahead = track.tangents[(idx + 18) % track.count];
  const kink = 1 - Math.max(0, tangent.dot(ahead));
  throttle *= 1 - kink * 0.55;
  maxSpeed *= 1 - kink * 0.28;

  const trackHeading = headingFromTangent(tangent.x, tangent.z);
  const offLine = Math.abs(wrapHeadingError(trackHeading, ai.heading));
  if (offLine > 0.9) throttle *= 0.55;

  applyDrive(ai, { steer, throttle, brake: 0 }, track, dt, maxSpeed);
}
