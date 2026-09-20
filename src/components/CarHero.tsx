import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useLayoutEffect } from "react";
import type { PerspectiveCamera } from "three";
import { MESH } from "../game/gt40Hero";
import { CarModel } from "./CarModel";

function HeroCam() {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const [x, y, z] = MESH.hero.cam;
    const [lx, ly, lz] = MESH.hero.look;
    camera.position.set(x, y, z);
    camera.lookAt(lx, ly, lz);
    const persp = camera as PerspectiveCamera;
    if (persp.isPerspectiveCamera) {
      persp.fov = MESH.hero.fov;
      persp.updateProjectionMatrix();
    }
  }, [camera]);
  return null;
}

type Props = {
  className?: string;
};

export function CarHero({ className }: Props) {
  return (
    <Canvas
      className={className}
      camera={{ position: [...MESH.hero.cam], fov: MESH.hero.fov }}
      dpr={[1, 1.4]}
      gl={{ antialias: true, powerPreference: "default" }}
    >
      <color attach="background" args={["#b01010"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3.4, 3.8, 4.6]} intensity={1.75} />
      <directionalLight position={[-2.8, 1.4, 2.6]} intensity={0.5} />
      <directionalLight position={[0.6, 1.5, 4.4]} intensity={0.95} />
      <hemisphereLight args={["#ffe8e0", "#401010", 0.3]} />
      <HeroCam />
      <Suspense fallback={null}>
        <group rotation={[0, MESH.hero.yaw, 0]}>
          <CarModel kind="player" wheelSpin={1.6} steer={0.05} />
        </group>
      </Suspense>
    </Canvas>
  );
}
