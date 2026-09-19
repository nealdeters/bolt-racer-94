import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense } from "react";
import { CarModel } from "./CarModel";

type Props = {
  className?: string;
};

export function CarHero({ className }: Props) {
  return (
    <Canvas
      className={className}
      camera={{ position: [2.15, 0.82, 2.45], fov: 30 }}
      dpr={[1, 1.4]}
      gl={{ antialias: true, powerPreference: "default" }}
    >
      <color attach="background" args={["#b01010"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3.5, 4.5, 5]} intensity={1.65} />
      <directionalLight position={[-3, 1.8, 3.2]} intensity={0.5} />
      <hemisphereLight args={["#ffe8e0", "#401010", 0.35]} />
      <Suspense fallback={null}>
        <LockedThreeQuarter />
      </Suspense>
    </Canvas>
  );
}

function LockedThreeQuarter() {
  useFrame((state) => {
    state.camera.lookAt(0, 0.3, 0.12);
  });
  return (
    <group rotation={[0, 0.52, 0]}>
      <CarModel kind="player" wheelSpin={2.2} steer={0.04} />
    </group>
  );
}
