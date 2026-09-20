import * as THREE from "three";
import type { TrackDef } from "./types";

const SAMPLE_COUNT = 260;

export type TrackRuntime = {
  def: TrackDef;
  curve: THREE.CatmullRomCurve3;
  samples: THREE.Vector3[];
  tangents: THREE.Vector3[];
  count: number;
  halfWidth: number;
};

export function buildTrackRuntime(def: TrackDef): TrackRuntime {
  const pts = def.points.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const curve = new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.3);
  const samples: THREE.Vector3[] = [];
  const tangents: THREE.Vector3[] = [];
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const t = i / SAMPLE_COUNT;
    samples.push(curve.getPointAt(t));
    tangents.push(curve.getTangentAt(t).normalize());
  }
  return {
    def,
    curve,
    samples,
    tangents,
    count: SAMPLE_COUNT,
    halfWidth: def.width / 2,
  };
}

export function nearestIndex(track: TrackRuntime, x: number, z: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < track.count; i++) {
    const p = track.samples[i];
    const dx = p.x - x;
    const dz = p.z - z;
    const d = dx * dx + dz * dz;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

export function sampleT(track: TrackRuntime, index: number): number {
  return index / track.count;
}
