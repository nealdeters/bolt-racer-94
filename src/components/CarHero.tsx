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
      camera={{ position: [2.85, 1.05, 3.85], fov: 26 }}
      dpr={[1, 1.4]}
      gl={{ antialias: true, powerPreference: "default" }}
    >
      <color attach="background" args={["#b01010"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3.4, 4.0, 5.2]} intensity={1.75} />
      <directionalLight position={[-2.8, 1.4, 3.2]} intensity={0.55} />
      <directionalLight position={[0.2, 1.6, 4.6]} intensity={0.95} />
      <hemisphereLight args={["#ffe8e0", "#401010", 0.3]} />
      <Suspense fallback={null}>
        <LockedThreeQuarter />
      </Suspense>
    </Canvas>
  );
}

function LockedThreeQuarter() {
  useFrame((state) => {
    state.camera.lookAt(0, 0.38, 0.28);
  });
  return (
    <group rotation={[0, 0.22, 0]}>
      <CarModel kind="player" wheelSpin={1.6} steer={0.05} />
    </group>
  );
}
