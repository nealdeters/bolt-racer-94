import type { DriveInput, HudState, RaceResult, RacePhase, TrackId } from "./types";
import { TOTAL_LAPS, COUNTDOWN_SECONDS } from "./constants";
import { getTrack } from "./tracks";
import { buildTrackRuntime, nearestIndex, sampleT, type TrackRuntime } from "./trackRuntime";
import { applyDrive, createCar, headingFromTangent, progressOf, separateCars, updateProgress } from "./physics";
import { updateAi } from "./ai";
import { isGamepadConnected } from "./input";

export class RaceEngine {
  readonly track: TrackRuntime;
  readonly player;
  readonly ai;
  time = 0;
  phase: RacePhase = "countdown";
  private finishWait = 0;
  private reported = false;
  readonly trackId: TrackId;
  readonly trackName: string;

  constructor(trackId: TrackId) {
    const def = getTrack(trackId);
    this.trackId = def.id;
    this.trackName = def.name;
    this.track = buildTrackRuntime(def);

    const pIdx = 0;
    const aIdx = this.track.count - 8;
    const p = this.track.samples[pIdx];
    const a = this.track.samples[aIdx];
    const pTan = this.track.tangents[pIdx];
    const aTan = this.track.tangents[aIdx];
    const pN = { x: -pTan.z, z: pTan.x };
    const aN = { x: -aTan.z, z: aTan.x };

    this.player = createCar(p.x + pN.x * -3.1, p.z + pN.z * -3.1, headingFromTangent(pTan.x, pTan.z), sampleT(this.track, pIdx));
    this.ai = createCar(a.x + aN.x * 3.1, a.z + aN.z * 3.1, headingFromTangent(aTan.x, aTan.z), sampleT(this.track, aIdx));
  }

  update(dt: number, input: DriveInput): RaceResult | null {
    const step = Math.min(dt, 0.05);
    this.time += step;

    if (this.phase === "countdown" && this.time >= COUNTDOWN_SECONDS) {
      this.phase = "racing";
    }

    const prevPlayerT = this.player.t;
    const prevAiT = this.ai.t;
    const canDrive = this.phase !== "countdown";

    if (!this.player.finished && canDrive) {
      applyDrive(this.player, input, this.track, step);
    } else if (this.player.finished) {
      applyDrive(this.player, { steer: 0, throttle: 0, brake: 0.25 }, this.track, step);
    } else {
      applyDrive(this.player, { steer: input.steer * 0.35, throttle: 0, brake: 0 }, this.track, step);
    }

    if (!this.ai.finished && canDrive) {
      updateAi(this.ai, this.player, this.track, step);
    } else if (this.ai.finished) {
      applyDrive(this.ai, { steer: 0, throttle: 0, brake: 0.25 }, this.track, step);
    }

    separateCars(this.player, this.ai);
    this.player.t = sampleT(this.track, nearestIndex(this.track, this.player.x, this.player.z));
    this.ai.t = sampleT(this.track, nearestIndex(this.track, this.ai.x, this.ai.z));

    if (canDrive) {
      if (!this.player.finished) {
        updateProgress(this.player, this.track, prevPlayerT);
        if (this.player.lapsCompleted >= TOTAL_LAPS) {
          this.player.finished = true;
          this.player.finishTime = this.time - COUNTDOWN_SECONDS;
        }
      }
      if (!this.ai.finished) {
        updateProgress(this.ai, this.track, prevAiT);
        if (this.ai.lapsCompleted >= TOTAL_LAPS) {
          this.ai.finished = true;
          this.ai.finishTime = this.time - COUNTDOWN_SECONDS;
        }
      }
    }

    if (this.player.finished && this.phase !== "finish") {
      this.phase = "finish";
    }
    if (this.phase === "finish") {
      this.finishWait += step;
      if (this.finishWait > 1.15 && !this.reported) {
        this.reported = true;
        return this.result();
      }
    }
    return null;
  }

  place(): 1 | 2 {
    if (this.player.finished && this.ai.finished) {
      return this.player.finishTime <= this.ai.finishTime ? 1 : 2;
    }
    if (this.player.finished && !this.ai.finished) return 1;
    if (!this.player.finished && this.ai.finished) return 2;
    return progressOf(this.player) >= progressOf(this.ai) ? 1 : 2;
  }

  hud(): HudState {
    const remain = COUNTDOWN_SECONDS - this.time;
    const countdown = remain > 0 ? Math.ceil(remain) : 0;
    return {
      phase: this.phase,
      countdown,
      lap: Math.min(TOTAL_LAPS, this.player.lapsCompleted + 1),
      totalLaps: TOTAL_LAPS,
      place: this.place(),
      goVisible: this.phase === "racing" && this.time < COUNTDOWN_SECONDS + 0.7,
      gamepad: isGamepadConnected(),
    };
  }

  private result(): RaceResult {
    return {
      place: this.place(),
      trackId: this.trackId,
      trackName: this.trackName,
      playerTime: this.player.finishTime,
      aiFinished: this.ai.finished,
    };
  }
}
