import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh, Object3D } from "three";
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
  const { scene } = useGLTF("/models/sedan-sports.glb");
  const root = useRef<Group>(null);
  const wheels = useRef<Object3D[]>([]);
  const fronts = useRef<Object3D[]>([]);
  const roundel = useMemo(() => makeRoundelTexture(look.number), [look.number]);

  const clone = useMemo(() => {
    const next = scene.clone(true);
    next.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const mat = new THREE.MeshStandardMaterial();
      if ("map" in src && src.map) mat.map = null;
      const name = mesh.name.toLowerCase();
      if (name.includes("wheel")) {
        mat.color.set("#141414");
        mat.metalness = 0.45;
        mat.roughness = 0.45;
      } else {
        mat.color.set(look.paint);
        mat.metalness = 0.52;
        mat.roughness = 0.16;
      }
      mesh.material = mat;
      mesh.castShadow = false;
    });
    return next;
  }, [scene, look.paint]);

  useLayoutEffect(() => {
    const group = root.current;
    if (!group) return;
    fitCar(group, 3.8, 1.24, 0.66);
    const w: Object3D[] = [];
    const f: Object3D[] = [];
    group.traverse((obj) => {
      const n = obj.name.toLowerCase();
      if (!n.includes("wheel")) return;
      w.push(obj);
      if (n.includes("front")) f.push(obj);
    });
    wheels.current = w;
    fronts.current = f;
  }, [clone]);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.28;
    for (const wheel of wheels.current) wheel.rotation.x = -spin;
    for (const wheel of fronts.current) wheel.rotation.y = turn;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.4, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>

      <group ref={root}>
        <primitive object={clone} />
      </group>

      <mesh position={[0, 0.72, 0.55]} rotation={[0.55, 0, 0]}>
        <planeGeometry args={[1.05, 0.42]} />
        <meshStandardMaterial color="#3a6f86" transparent opacity={0.55} roughness={0.08} metalness={0.3} />
      </mesh>

      <mesh position={[-0.07, 0.78, 0.05]}>
        <boxGeometry args={[0.08, 0.02, 3.2]} />
        <meshStandardMaterial color="#f3f3f3" roughness={0.3} />
      </mesh>
      <mesh position={[0.07, 0.78, 0.05]}>
        <boxGeometry args={[0.08, 0.02, 3.2]} />
        <meshStandardMaterial color="#f3f3f3" roughness={0.3} />
      </mesh>

      <Headlamp x={-0.48} />
      <Headlamp x={0.48} />
      <mesh position={[-0.78, 0.38, 1.72]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshStandardMaterial color="#e39a18" roughness={0.22} metalness={0.35} />
      </mesh>
      <mesh position={[0.78, 0.38, 1.72]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshStandardMaterial color="#e39a18" roughness={0.22} metalness={0.35} />
      </mesh>

      <mesh position={[-0.92, 0.48, 0.15]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.24, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>
      <mesh position={[0.92, 0.48, 0.15]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.24, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>
    </group>
  );
}

function Headlamp({ x }: { x: number }) {
  return (
    <group position={[x, 0.42, 1.78]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.14, 0.07, 22]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.11, 22]} />
        <meshStandardMaterial color="#fff6d2" emissive="#ffe7a8" emissiveIntensity={0.45} roughness={0.12} />
      </mesh>
      <mesh position={[0, 0, 0.07]} scale={[1, 1, 0.45]}>
        <sphereGeometry args={[0.125, 16, 12]} />
        <meshStandardMaterial color="#e8f2f6" transparent opacity={0.32} roughness={0.05} metalness={0.35} />
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/sedan-sports.glb");
