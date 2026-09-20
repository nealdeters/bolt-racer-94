import { Bounds } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { CarModel } from "./CarModel";

type Props = {
  className?: string;
};

export function CarHero({ className }: Props) {
  return (
    <Canvas
      className={className}
      camera={{ position: [4.0, 0.88, 3.15], fov: 30 }}
      dpr={[1, 1.4]}
      gl={{ antialias: true, powerPreference: "default" }}
    >
      <color attach="background" args={["#b01010"]} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[3.2, 4.2, 5]} intensity={1.7} />
      <directionalLight position={[-3, 1.6, 3]} intensity={0.55} />
      <directionalLight position={[0.4, 1.8, 4.2]} intensity={0.9} />
      <hemisphereLight args={["#ffe8e0", "#401010", 0.32]} />
      <Suspense fallback={null}>
        <Bounds clip margin={0.7} maxDuration={0.01}>
          <group rotation={[0, 0.62, 0]}>
            <CarModel kind="player" wheelSpin={1.6} steer={0.05} />
          </group>
        </Bounds>
      </Suspense>
    </Canvas>
  );
}
