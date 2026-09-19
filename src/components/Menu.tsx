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
          camera={{ position: [2.5, 1.15, 3.9], fov: 30 }}
          dpr={[1, 1.25]}
          gl={{ antialias: false, powerPreference: "default" }}
        >
          <color attach="background" args={["#f7d35a"]} />
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 5, 6]} intensity={1.35} />
          <Suspense fallback={null}>
            <HeroThreeQuarter />
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

function HeroThreeQuarter() {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    state.camera.lookAt(0, 0.5, 0.45);
    if (ref.current) ref.current.rotation.y = 0.5;
  });
  return (
    <Float speed={1.1} rotationIntensity={0.04} floatIntensity={0.12}>
      <group ref={ref} position={[0, 0, 0]}>
        <CarModel kind="player" wheelSpin={4} steer={0.08} />
      </group>
    </Float>
  );
}
