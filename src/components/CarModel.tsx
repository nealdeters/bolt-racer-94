import { useMemo, useRef } from "react";
import { Center, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Object3D } from "three";
import { fitCar } from "../game/fitCar";
import { makeRoundelTexture } from "../game/textures";

export type CarKind = "player" | "ai";

type Motion = {
  wheelSpin: number;
  steer: number;
};

type Props = {
  kind: CarKind;
  wheelSpin?: number;
  steer?: number;
  motion?: Motion;
};

const LOOK = {
  player: { paint: "#c81010", number: "94" },
  ai: { paint: "#1a4db8", number: "7" },
};

export function CarModel({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = LOOK[kind];
  const { scene } = useGLTF("/models/rx7.glb");
  const wheels = useRef<Object3D[]>([]);
  const fronts = useRef<Object3D[]>([]);
  const roundel = useMemo(() => makeRoundelTexture(look.number), [look.number]);

  const fitted = useMemo(() => {
    const wrapper = new THREE.Group();
    const next = scene.clone(true);
    const w: Object3D[] = [];
    const f: Object3D[] = [];
    next.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const mat = (src as THREE.MeshStandardMaterial).clone();
      const name = `${mesh.name} ${mat.name ?? ""}`.toLowerCase();
      const isGlass = /glass|window|wind|screen|canopy/.test(name);
      const isLight = /lamp|light|head|emit/.test(name);
      const isWheel = /wheel|tire|tyre|rim/.test(name);
      if (isWheel) {
        w.push(mesh);
        if (/front|fl|fr/.test(name)) f.push(mesh);
      } else if (isGlass) {
        mat.color = new THREE.Color("#163445");
        mat.transparent = true;
        mat.opacity = Math.min(mat.opacity ?? 1, 0.82);
        mat.roughness = 0.08;
        mat.metalness = 0.22;
      } else if (!isLight) {
        mat.color = new THREE.Color(look.paint);
        mat.metalness = 0.46;
        mat.roughness = 0.22;
        if ("map" in mat && mat.map) {
          mat.map = mat.map; // keep texture, tint over it
        }
      }
      mesh.material = mat;
    });
    wrapper.add(next);
    fitCar(wrapper, 3.9, 1.16, 0.78);
    wheels.current = w;
    fronts.current = f;
    const box = new THREE.Box3().setFromObject(wrapper);
    return { wrapper, box, size: box.getSize(new THREE.Vector3()), center: box.getCenter(new THREE.Vector3()) };
  }, [scene, look.paint]);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.22;
    for (const wheel of wheels.current) wheel.rotation.x = -spin;
    for (const front of fronts.current) front.rotation.y = turn;
  });

  const { size, center, box } = fitted;

  return (
    <group>
      <Center disableY>
        <primitive object={fitted.wrapper} />
      </Center>
      <mesh position={[-0.07, box.max.y + 0.012, center.z]}>
        <boxGeometry args={[0.07, 0.014, size.z * 0.82]} />
        <meshStandardMaterial color="#f3f3f3" roughness={0.28} />
      </mesh>
      <mesh position={[0.07, box.max.y + 0.012, center.z]}>
        <boxGeometry args={[0.07, 0.014, size.z * 0.82]} />
        <meshStandardMaterial color="#f3f3f3" roughness={0.28} />
      </mesh>
      <mesh position={[-box.max.x - 0.01, box.min.y + size.y * 0.48, center.z + size.z * 0.02]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.2, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>
      <mesh position={[box.max.x + 0.01, box.min.y + size.y * 0.48, center.z + size.z * 0.02]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.2, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/rx7.glb");
