import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
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
  const { scene } = useGLTF("/models/sedan-sports.glb");
  const wheels = useRef<Object3D[]>([]);
  const fronts = useRef<Object3D[]>([]);
  const roundel = useMemo(() => makeRoundelTexture(look.number), [look.number]);

  const fitted = useMemo(() => {
    const wrapper = new THREE.Group();
    const next = scene.clone(true);
    next.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const mat = src.clone() as THREE.MeshStandardMaterial;
      const name = mesh.name.toLowerCase();
      if (name.includes("spoiler")) {
        mesh.visible = false;
        return;
      }
      if (name.includes("wheel")) {
        mat.color = new THREE.Color("#1a1a1a");
        mat.metalness = 0.4;
        mat.roughness = 0.5;
      } else {
        mat.color = new THREE.Color(look.paint);
        mat.metalness = 0.48;
        mat.roughness = 0.2;
      }
      mesh.material = mat;
    });
    wrapper.add(next);
    fitCar(wrapper, 3.8, 1.26, 0.58);
    const w: Object3D[] = [];
    const f: Object3D[] = [];
    wrapper.traverse((obj) => {
      const n = obj.name.toLowerCase();
      if (!n.includes("wheel")) return;
      w.push(obj);
      if (n.includes("front")) f.push(obj);
    });
    wheels.current = w;
    fronts.current = f;
    const bodyBox = new THREE.Box3();
    let foundBody = false;
    wrapper.traverse((obj) => {
      if (obj.name.toLowerCase() === "body") {
        bodyBox.setFromObject(obj);
        foundBody = true;
      }
    });
    const box = foundBody ? bodyBox : new THREE.Box3().setFromObject(wrapper);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return { wrapper, box, size, center };
  }, [scene, look.paint]);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.28;
    for (const wheel of wheels.current) wheel.rotation.x = -spin;
    for (const wheel of fronts.current) wheel.rotation.y = turn;
  });

  const { size, center, box } = fitted;
  const lampY = box.min.y + size.y * 0.38;
  const lampZ = box.max.z - 0.04;
  const lampX = size.x * 0.28;
  const stripeY = box.max.y + 0.012;
  const doorX = box.max.x + 0.01;
  const doorY = box.min.y + size.y * 0.48;
  const doorZ = center.z + size.z * 0.05;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.4, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} />
      </mesh>

      <primitive object={fitted.wrapper} />

      <mesh position={[0, box.min.y + size.y * 0.68, center.z + size.z * 0.16]} rotation={[0.58, 0, 0]}>
        <planeGeometry args={[size.x * 0.72, size.y * 0.55]} />
        <meshStandardMaterial color="#2f6d86" roughness={0.08} metalness={0.28} transparent opacity={0.85} />
      </mesh>
      <mesh position={[-size.x * 0.28, box.min.y + size.y * 0.7, center.z + size.z * 0.02]} rotation={[0.1, -1.15, 0]}>
        <planeGeometry args={[size.z * 0.28, size.y * 0.28]} />
        <meshStandardMaterial color="#2a6078" roughness={0.1} metalness={0.25} transparent opacity={0.72} />
      </mesh>
      <mesh position={[size.x * 0.28, box.min.y + size.y * 0.7, center.z + size.z * 0.02]} rotation={[0.1, 1.15, 0]}>
        <planeGeometry args={[size.z * 0.28, size.y * 0.28]} />
        <meshStandardMaterial color="#2a6078" roughness={0.1} metalness={0.25} transparent opacity={0.72} />
      </mesh>

      <mesh position={[0, box.min.y + size.y * 0.28, box.max.z - 0.02]}>
        <boxGeometry args={[size.x * 0.34, size.y * 0.16, 0.08]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>

      <mesh position={[-0.075, stripeY - 0.03, center.z]}>
        <boxGeometry args={[0.07, 0.018, size.z * 0.78]} />
        <meshStandardMaterial color="#f4f4f4" roughness={0.28} />
      </mesh>
      <mesh position={[0.075, stripeY - 0.03, center.z]}>
        <boxGeometry args={[0.07, 0.018, size.z * 0.78]} />
        <meshStandardMaterial color="#f4f4f4" roughness={0.28} />
      </mesh>

      <Headlamp x={-lampX} y={lampY} z={lampZ} />
      <Headlamp x={lampX} y={lampY} z={lampZ} />
      <mesh position={[-lampX - 0.22, lampY - 0.02, lampZ - 0.04]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#e39a18" roughness={0.22} metalness={0.35} />
      </mesh>
      <mesh position={[lampX + 0.22, lampY - 0.02, lampZ - 0.04]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#e39a18" roughness={0.22} metalness={0.35} />
      </mesh>

      <mesh position={[-doorX, doorY, doorZ]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.22, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>
      <mesh position={[doorX, doorY, doorZ]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.22, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>
    </group>
  );
}

function Headlamp({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color="#f3edd4" emissive="#e6d48a" emissiveIntensity={0.35} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.02]} scale={[1.05, 1.05, 0.55]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color="#dce8ee" transparent opacity={0.3} roughness={0.05} metalness={0.4} />
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/sedan-sports.glb");
