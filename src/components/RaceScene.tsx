import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RaceEngine } from "../game/raceEngine";
import { sampleInput } from "../game/input";
import type { HudState, RaceResult, TrackId } from "../game/types";
import { CarModel } from "./CarModel";
import { TrackWorld } from "./TrackWorld";

type Props = {
  trackId: TrackId;
  onHud: (hud: HudState) => void;
  onFinish: (result: RaceResult) => void;
};

export function RaceScene({ trackId, onHud, onFinish }: Props) {
  const engine = useMemo(() => new RaceEngine(trackId), [trackId]);
  const playerRef = useRef<THREE.Group>(null);
  const aiRef = useRef<THREE.Group>(null);
  const look = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const hudAcc = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    onHud(engine.hud());
  }, [engine, onHud]);

  useFrame((_, delta) => {
    const result = engine.update(delta, sampleInput());
    const { player, ai } = engine;

    if (playerRef.current) {
      playerRef.current.position.set(player.x, 0, player.z);
      playerRef.current.rotation.y = player.heading;
    }
    if (aiRef.current) {
      aiRef.current.position.set(ai.x, 0, ai.z);
      aiRef.current.rotation.y = ai.heading;
    }

    const behind = 12.2;
    const height = 6.1;
    desired.current.set(
      player.x - Math.sin(player.heading) * behind,
      height,
      player.z - Math.cos(player.heading) * behind,
    );
    camera.position.lerp(desired.current, 1 - Math.exp(-3.2 * delta));
    look.current.set(
      player.x + Math.sin(player.heading) * 4.2,
      0.7,
      player.z + Math.cos(player.heading) * 4.2,
    );
    camera.lookAt(look.current);

    hudAcc.current += delta;
    if (hudAcc.current > 0.08 || engine.phase !== "racing" || result) {
      hudAcc.current = 0;
      onHud(engine.hud());
    }
    if (result) onFinish(result);
  });

  return (
    <>
      <TrackWorld track={engine.track} />
      <group ref={playerRef}>
        <CarModel kind="player" motion={engine.player} />
      </group>
      <group ref={aiRef}>
        <CarModel kind="ai" motion={engine.ai} />
      </group>
    </>
  );
}
