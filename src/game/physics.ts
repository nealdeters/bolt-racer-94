import type { DriveInput, CarState } from "./types";
import { clamp, damp, lerpAngle, wrapAngle } from "./math";
import { ACCEL, BRAKE, CAR_RADIUS, DRAG, EDGE_NUDGE, EDGE_SOFT, PLAYER_MAX_SPEED, TURN_RATE } from "./constants";
import { nearestIndex, sampleT, type TrackRuntime } from "./trackRuntime";

export function createCar(x: number, z: number, heading: number, t: number): CarState {
  return {
    x,
    z,
    heading,
    speed: 0,
    steer: 0,
    t,
    lapsCompleted: 0,
    passedHalf: false,
    finished: false,
    finishTime: 0,
    wheelSpin: 0,
  };
}

export function applyDrive(
  car: CarState,
  input: DriveInput,
  track: TrackRuntime,
  dt: number,
  maxSpeed = PLAYER_MAX_SPEED,
): void {
  const steerTarget = input.steer;
  car.steer = damp(car.steer, steerTarget, 10, dt);

  if (input.throttle > 0) car.speed += ACCEL * input.throttle * dt;
  if (input.brake > 0) car.speed -= BRAKE * input.brake * dt;

  const drag = DRAG + Math.abs(car.speed) * 0.055;
  car.speed -= Math.sign(car.speed) * drag * dt;
  if (Math.abs(car.speed) < 0.08 && input.throttle <= 0) car.speed = 0;
  car.speed = clamp(car.speed, -maxSpeed * 0.28, maxSpeed);

  const speedFactor = 0.42 + 0.58 * clamp(Math.abs(car.speed) / maxSpeed, 0, 1);
  const lowSpeedHelp = car.speed > 1.2 || input.throttle > 0.15 ? 1 : 0.25;
  car.heading += car.steer * TURN_RATE * speedFactor * lowSpeedHelp * dt;

  car.x += Math.sin(car.heading) * car.speed * dt;
  car.z += Math.cos(car.heading) * car.speed * dt;
  car.wheelSpin += car.speed * dt * 1.6;

  constrainToTrack(car, track, dt);
}

function constrainToTrack(car: CarState, track: TrackRuntime, dt: number): void {
  const index = nearestIndex(track, car.x, car.z);
  const point = track.samples[index];
  const tangent = track.tangents[index];
  const nx = -tangent.z;
  const nz = tangent.x;
  const lateral = (car.x - point.x) * nx + (car.z - point.z) * nz;
  const absLat = Math.abs(lateral);
  const sign = Math.sign(lateral) || 1;
  const softStart = track.halfWidth * EDGE_SOFT;
  const hardLimit = track.halfWidth - CAR_RADIUS * 0.25;
  const trackHeading = Math.atan2(tangent.x, tangent.z);

  if (absLat > softStart) {
    const t = clamp((absLat - softStart) / Math.max(0.01, hardLimit - softStart), 0, 1);
    const pull = EDGE_NUDGE * t * t * (8 + Math.abs(car.speed) * 0.35) * dt;
    car.x -= nx * sign * pull;
    car.z -= nz * sign * pull;
    car.heading = lerpAngle(car.heading, trackHeading, 0.035 * t);
    car.speed *= 1 - 0.03 * t * dt * 8;
  }

  const later = (car.x - point.x) * nx + (car.z - point.z) * nz;
  if (Math.abs(later) > hardLimit) {
    const extra = Math.abs(later) - hardLimit;
    const s = Math.sign(later) || 1;
    car.x -= nx * s * extra;
    car.z -= nz * s * extra;
    car.heading = lerpAngle(car.heading, trackHeading, 0.06);
    car.speed *= 0.97;
  }

  const afterDx = car.x - point.x;
  const afterDz = car.z - point.z;
  if (afterDx * afterDx + afterDz * afterDz > (track.halfWidth + 10) ** 2) {
    car.x = point.x;
    car.z = point.z;
    car.heading = trackHeading;
    car.speed *= 0.7;
  }
}

export function updateProgress(car: CarState, track: TrackRuntime, prevT: number): void {
  const index = nearestIndex(track, car.x, car.z);
  car.t = sampleT(track, index);
  if (!car.passedHalf && car.t > 0.42 && car.t < 0.72) {
    car.passedHalf = true;
  }
  if (car.passedHalf && prevT > 0.78 && car.t < 0.22) {
    car.lapsCompleted += 1;
    car.passedHalf = false;
  }
}

export function progressOf(car: CarState): number {
  if (car.finished) return 5 + 0.001;
  return car.lapsCompleted + car.t;
}

export function separateCars(a: CarState, b: CarState): void {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  const dist = Math.hypot(dx, dz);
  const min = 2.35;
  if (dist < 0.001 || dist >= min) return;
  const push = (min - dist) * 0.5;
  const nx = dx / dist;
  const nz = dz / dist;
  a.x += nx * push;
  a.z += nz * push;
  b.x -= nx * push;
  b.z -= nz * push;
  a.speed *= 0.92;
  b.speed *= 0.92;
}

export function headingFromTangent(tx: number, tz: number): number {
  return Math.atan2(tx, tz);
}

export function wrapHeadingError(desired: number, current: number): number {
  return wrapAngle(desired - current);
}
