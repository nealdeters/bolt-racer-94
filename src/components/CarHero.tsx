import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
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
      <color attach="background" args={["#8f0e11"]} />
      <ambientLight intensity={0.58} />
      <directionalLight position={[4.2, 3.4, 5.0]} intensity={2.2} />
      <directionalLight position={[-3.4, 1.6, 1.4]} intensity={0.85} color="#ffd4c4" />
      <directionalLight position={[5.6, 0.9, 1.8]} intensity={1.25} />
      <directionalLight position={[0.4, 2.2, -3.4]} intensity={0.65} color="#ffe6dc" />
      <hemisphereLight args={["#ffe8de", "#3a0808", 0.4]} />
      <ContactShadows opacity={0.38} scale={10} blur={2.5} far={3.2} />
      <HeroCam />
      <Suspense fallback={null}>
        <group rotation={[0, MESH.hero.yaw, 0]}>
          <CarModel kind="player" wheelSpin={1.6} steer={0.05} />
        </group>
      </Suspense>
    </Canvas>
  );
}
