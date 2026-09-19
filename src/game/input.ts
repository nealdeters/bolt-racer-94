import type { DriveInput } from "./types";
import { clamp } from "./math";

const keys = new Set<string>();
let touchSteer = 0;
let touchThrottle = 0;
let touchBrake = 0;
let refCount = 0;
let gestureBlocked = false;

const BLOCKED_CODES = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
]);

function onKeyDown(event: KeyboardEvent): void {
  keys.add(event.code);
  if (BLOCKED_CODES.has(event.code)) event.preventDefault();
}

function onKeyUp(event: KeyboardEvent): void {
  keys.delete(event.code);
}

function onBlur(): void {
  keys.clear();
}

function onGesture(event: Event): void {
  event.preventDefault();
}

function onTouchMove(event: TouchEvent): void {
  if (event.target instanceof HTMLElement && event.target.closest("[data-scroll]")) {
    return;
  }
  event.preventDefault();
}

export function setTouchSteer(value: number): void {
  touchSteer = clamp(value, -1, 1);
}

export function setTouchThrottle(value: number): void {
  touchThrottle = clamp(value, 0, 1);
}

export function setTouchBrake(value: number): void {
  touchBrake = clamp(value, 0, 1);
}

export function attachInput(): void {
  if (refCount++ > 0) return;
  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  if (!gestureBlocked) {
    document.addEventListener("gesturestart", onGesture, { passive: false });
    document.addEventListener("gesturechange", onGesture, { passive: false });
    gestureBlocked = true;
  }
}

export function detachInput(): void {
  if (--refCount > 0) return;
  refCount = 0;
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("blur", onBlur);
  document.removeEventListener("touchmove", onTouchMove);
  keys.clear();
  touchSteer = 0;
  touchThrottle = 0;
  touchBrake = 0;
}

export function sampleInput(): DriveInput {
  let steer = 0;
  let throttle = 0;
  let brake = 0;

  if (keys.has("ArrowLeft") || keys.has("KeyA")) steer -= 1;
  if (keys.has("ArrowRight") || keys.has("KeyD")) steer += 1;
  if (keys.has("ArrowUp") || keys.has("KeyW") || keys.has("Space")) throttle = 1;
  if (keys.has("ArrowDown") || keys.has("KeyS")) brake = 1;

  const pads = navigator.getGamepads?.() ?? [];
  for (const pad of pads) {
    if (!pad) continue;
    const axisX = pad.axes[0] ?? 0;
    const axisY = pad.axes[1] ?? 0;
    if (Math.abs(axisX) > 0.18) steer += axisX;
    if (axisY < -0.28) throttle = Math.max(throttle, -axisY);
    if (axisY > 0.4) brake = Math.max(brake, axisY);
    if (pad.buttons[14]?.pressed) steer -= 1;
    if (pad.buttons[15]?.pressed) steer += 1;
    if (pad.buttons[12]?.pressed) throttle = 1;
    if (pad.buttons[13]?.pressed) brake = 1;
    throttle = Math.max(throttle, pad.buttons[7]?.value ?? 0, pad.buttons[0]?.value ?? 0);
    brake = Math.max(brake, pad.buttons[6]?.value ?? 0, pad.buttons[1]?.value ?? 0);
  }

  steer += touchSteer;
  throttle = Math.max(throttle, touchThrottle);
  brake = Math.max(brake, touchBrake);

  return {
    steer: clamp(steer, -1, 1),
    throttle: clamp(throttle, 0, 1),
    brake: clamp(brake, 0, 1),
  };
}

export function isGamepadConnected(): boolean {
  const pads = navigator.getGamepads?.() ?? [];
  return pads.some((pad) => pad !== null && pad.connected);
}
