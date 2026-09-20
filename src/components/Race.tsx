import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { attachInput, detachInput } from "../game/input";
import type { HudState, RaceResult, TrackId } from "../game/types";
import { TOTAL_LAPS } from "../game/constants";
import { Hud } from "./Hud";
import { RaceScene } from "./RaceScene";
import { TouchControls } from "./TouchControls";

type Props = {
  trackId: TrackId;
  onFinish: (result: RaceResult) => void;
};

const INITIAL_HUD: HudState = {
  phase: "countdown",
  countdown: 3,
  lap: 1,
  totalLaps: TOTAL_LAPS,
  place: 1,
  goVisible: false,
  gamepad: false,
};

export function Race({ trackId, onFinish }: Props) {
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const done = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    attachInput();
    rootRef.current?.focus();
    return () => detachInput();
  }, []);

  const handleFinish = useCallback(
    (result: RaceResult) => {
      if (done.current) return;
      done.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  return (
    <div className="race-root" ref={rootRef} tabIndex={0}>
      <Canvas
        className="race-canvas"
        dpr={[1, 1.25]}
        camera={{ fov: 50, position: [0, 8, 16], near: 0.1, far: 280 }}
        gl={{ antialias: false, powerPreference: "default", failIfMajorPerformanceCaveat: false }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => event.preventDefault());
        }}
      >
        <RaceScene trackId={trackId} onHud={setHud} onFinish={handleFinish} />
      </Canvas>
      <Hud hud={hud} />
      <TouchControls />
      <p className="desktop-hint">Arrows or WASD to drive · Tap GO to zoom</p>
    </div>
  );
}
