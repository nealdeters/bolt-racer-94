import { Suspense, type CSSProperties } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
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
        <Canvas
          camera={{ position: [0.55, 1.15, 3.15], fov: 34 }}
          dpr={[1, 1.25]}
          gl={{ antialias: false, powerPreference: "default" }}
        >
          <color attach="background" args={["#f7d35a"]} />
          <ambientLight intensity={0.85} />
          <directionalLight position={[4, 6, 5]} intensity={1.3} />
          <Suspense fallback={null}>
            <SpinningHero />
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
  useFrame((state, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.32;
    state.camera.lookAt(0, 0.62, 0.7);
  });
  return (
    <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.15}>
      <group ref={ref} position={[0, 0.02, 0]} rotation={[0, 0.08, 0]}>
        <CarModel kind="player" wheelSpin={5} steer={0.06} />
      </group>
    </Float>
  );
}
