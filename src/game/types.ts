export type TrackId = "oval" | "park" | "desert" | "seaside" | "city";

export type DriveInput = {
  steer: number;
  throttle: number;
  brake: number;
};

export type CarState = {
  x: number;
  z: number;
  heading: number;
  speed: number;
  steer: number;
  t: number;
  lapsCompleted: number;
  passedHalf: boolean;
  finished: boolean;
  finishTime: number;
  wheelSpin: number;
};

export type RacePhase = "countdown" | "racing" | "finish";

export type HudState = {
  phase: RacePhase;
  countdown: number;
  lap: number;
  totalLaps: number;
  place: 1 | 2;
  goVisible: boolean;
  gamepad: boolean;
};

export type RaceResult = {
  place: 1 | 2;
  trackId: TrackId;
  trackName: string;
  playerTime: number;
  aiFinished: boolean;
};

export type TrackTheme = {
  sky: string;
  ground: string;
  road: string;
  roadLine: string;
  barrierA: string;
  barrierB: string;
  fogFar: number;
  sun: [number, number, number];
  useSky: boolean;
  water?: string;
};

export type TrackDef = {
  id: TrackId;
  name: string;
  blurb: string;
  emoji: string;
  width: number;
  points: [number, number][];
  theme: TrackTheme;
  menuColor: string;
};
