import { Suspense, type CSSProperties } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";
import { TRACKS } from "../game/tracks";
import type { TrackId } from "../game/types";
import { CarModel } from "./CarModel";

type Props = {
  onPick: (id: TrackId) => void;
};

export function Menu({ onPick }: Props) {
  return (
    <div className="screen menu-screen">
      <div className="menu-hero">
        <Canvas camera={{ position: [3.2, 2.1, 5.2], fov: 40 }} dpr={[1, 1.5]}>
          <color attach="background" args={["#f7d35a"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 3]} intensity={1.4} />
          <Suspense fallback={null}>
            <SpinningHero />
            <ContactShadows opacity={0.45} scale={10} blur={2.2} far={4} />
          </Suspense>
        </Canvas>
      </div>

      <div className="menu-copy">
        <p className="eyebrow">Kid race</p>
        <h1>
          Bolt Racer
          <span>#94</span>
        </h1>
        <p className="tagline">Pick a track. Drive the red bolt. Beat blue #7!</p>
      </div>

      <div className="track-grid">
        {TRACKS.map((track) => (
          <button
            key={track.id}
            type="button"
            className="track-card"
            style={{ "--accent": track.menuColor } as CSSProperties}
            onClick={() => onPick(track.id)}
          >
            <span className="track-emoji">{track.emoji}</span>
            <span className="track-name">{track.name}</span>
            <span className="track-blurb">{track.blurb}</span>
            <span className="track-go">RACE</span>
          </button>
        ))}
      </div>

      <p className="disclaimer">
        Fan-made homage look only. Not affiliated with Disney or Pixar. No official characters,
        names, or logos.
      </p>
    </div>
  );
}

function SpinningHero() {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.55;
  });
  return (
    <group ref={ref} position={[0, 0.05, 0]}>
      <CarModel kind="player" wheelSpin={8} steer={0.15} />
    </group>
  );
}
