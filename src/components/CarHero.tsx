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
      camera={{ position: [2.7, 1.15, 3.15], fov: 28 }}
      dpr={[1, 1.4]}
      gl={{ antialias: true, powerPreference: "default" }}
    >
      <color attach="background" args={["#b01010"]} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[3.2, 4.2, 5]} intensity={1.7} />
      <directionalLight position={[-3, 1.6, 3]} intensity={0.5} />
      <hemisphereLight args={["#ffe8e0", "#401010", 0.32]} />
      <Suspense fallback={null}>
        <LockedThreeQuarter />
      </Suspense>
    </Canvas>
  );
}

function LockedThreeQuarter() {
  useFrame((state) => {
    state.camera.lookAt(0, 0.42, 0.1);
  });
  return (
    <group rotation={[0, 0.55, 0]}>
      <CarModel kind="player" wheelSpin={1.8} steer={0.06} />
    </group>
  );
}
