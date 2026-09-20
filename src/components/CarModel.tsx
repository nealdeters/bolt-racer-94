import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh, Object3D } from "three";
import { AXLES, createGt40Canopy, createGt40Hull, GT40, stripePath } from "../game/gt40Mesh";
import { makeGt40Paint, makeRoundelTexture } from "../game/textures";

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
  const paint = useMemo(() => makeGt40Paint(look.paint), [look.paint]);
  const roundel = useMemo(() => makeRoundelTexture(look.number), [look.number]);
  const hull = useMemo(() => createGt40Hull(), []);
  const canopy = useMemo(() => createGt40Canopy(), []);

  const wheelSet = useMemo(() => {
    const found: Mesh[] = [];
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      if (mesh.name.toLowerCase().includes("wheel")) found.push(mesh);
    });
    const src = found[0];
    const group = new THREE.Group();
    const w: Object3D[] = [];
    const f: Object3D[] = [];
    const places: Array<{ x: number; z: number; front: boolean }> = [
      { x: -AXLES.front.x, z: AXLES.front.z, front: true },
      { x: AXLES.front.x, z: AXLES.front.z, front: true },
      { x: -AXLES.rear.x, z: AXLES.rear.z, front: false },
      { x: AXLES.rear.x, z: AXLES.rear.z, front: false },
    ];
    for (const place of places) {
      const holder = new THREE.Group();
      holder.position.set(place.x, GT40.wheelR, place.z);
      if (src) {
        const wheel = src.clone(true);
        wheel.traverse((obj: Object3D) => {
          const mesh = obj as Mesh;
          if (!mesh.isMesh) return;
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;
          mat.color = new THREE.Color("#1a1a1a");
          mat.map = null;
          mat.metalness = 0.45;
          mat.roughness = 0.42;
          mesh.material = mat;
        });
        const box = new THREE.Box3().setFromObject(wheel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        wheel.position.sub(center);
        const s = (GT40.wheelR * 2) / Math.max(size.y, size.x, 0.01);
        wheel.scale.setScalar(s);
        holder.add(wheel);
      } else {
        const tire = new THREE.Mesh(
          new THREE.CylinderGeometry(GT40.wheelR, GT40.wheelR, GT40.wheelHalfW * 2, 20),
          new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.7 }),
        );
        tire.rotation.z = Math.PI / 2;
        holder.add(tire);
      }
      group.add(holder);
      w.push(holder);
      if (place.front) f.push(holder);
    }
    wheels.current = w;
    fronts.current = f;
    return group;
  }, [scene]);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.28;
    for (const wheel of wheels.current) wheel.rotation.x = -spin;
    for (const wheel of fronts.current) wheel.rotation.y = turn;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.45, 22]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} />
      </mesh>

      <mesh geometry={hull} castShadow>
        <meshPhysicalMaterial
          map={paint}
          color={look.paint}
          metalness={0.42}
          roughness={0.22}
          clearcoat={0.65}
          clearcoatRoughness={0.12}
        />
      </mesh>

      <mesh geometry={canopy}>
        <meshPhysicalMaterial
          color="#1c3d4c"
          metalness={0.2}
          roughness={0.06}
          transparent
          opacity={0.78}
          transmission={0.18}
          thickness={0.08}
        />
      </mesh>

      <mesh position={[0, 0.22, 0.18]}>
        <boxGeometry args={[0.9, 0.28, 1.35]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.24, 1.94]}>
        <boxGeometry args={[0.58, 0.14, 0.1]} />
        <meshStandardMaterial color="#111111" roughness={0.85} />
      </mesh>
      <mesh position={[-0.42, 0.4, 0.08]} rotation={[0, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.16, 0.32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0.42, 0.4, 0.08]} rotation={[0, -0.08, 0]}>
        <boxGeometry args={[0.06, 0.16, 0.32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      <StripeRibbon side={-0.075} />
      <StripeRibbon side={0.075} />

      <Headlamp x={-0.4} y={0.38} z={1.82} />
      <Headlamp x={0.4} y={0.38} z={1.82} />
      <mesh position={[-0.62, 0.36, 1.74]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#e39a18" roughness={0.22} metalness={0.35} />
      </mesh>
      <mesh position={[0.62, 0.36, 1.74]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#e39a18" roughness={0.22} metalness={0.35} />
      </mesh>

      <mesh position={[-0.84, 0.46, 0.22]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.2, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>
      <mesh position={[0.84, 0.46, 0.22]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.2, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>

      <primitive object={wheelSet} />
    </group>
  );
}

function StripeRibbon({ side }: { side: number }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(stripePath(side));
    return new THREE.TubeGeometry(curve, 40, 0.032, 6, false);
  }, [side]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#f4f4f4" roughness={0.28} />
    </mesh>
  );
}

function Headlamp({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.016, 10, 22]} />
        <meshStandardMaterial color="#d8dde2" metalness={0.75} roughness={0.22} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.088, 16, 12]} />
        <meshStandardMaterial color="#f3edd4" emissive="#e6d48a" emissiveIntensity={0.4} roughness={0.14} />
      </mesh>
      <mesh position={[0, 0, 0.03]} scale={[1.08, 1.08, 0.42]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshPhysicalMaterial color="#dce8ee" transparent opacity={0.32} roughness={0.04} metalness={0.35} />
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/sedan-sports.glb");
