import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Object3D } from "three";
import { AXLES, GT40, PAINT } from "../game/gt40Mesh";
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
  const wheels = useRef<Object3D[]>([]);
  const fronts = useRef<Object3D[]>([]);
  const roundel = useMemo(() => makeRoundelTexture(look.number), [look.number]);
  const paint = look.paint;

  const wheelSet = useMemo(() => {
    const group = new THREE.Group();
    const w: Object3D[] = [];
    const f: Object3D[] = [];
    const places = [
      { x: -AXLES.front.x, z: AXLES.front.z, front: true },
      { x: AXLES.front.x, z: AXLES.front.z, front: true },
      { x: -AXLES.rear.x, z: AXLES.rear.z, front: false },
      { x: AXLES.rear.x, z: AXLES.rear.z, front: false },
    ];
    const tireMat = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.82 });
    const rimMat = new THREE.MeshStandardMaterial({ color: "#2a2a2a", metalness: 0.62, roughness: 0.32 });
    const spokeMat = new THREE.MeshStandardMaterial({ color: "#3d3d3d", metalness: 0.7, roughness: 0.28 });
    for (const place of places) {
      const holder = new THREE.Group();
      holder.position.set(place.x, GT40.wheelR, place.z);
      const tire = new THREE.Mesh(
        new THREE.CylinderGeometry(GT40.wheelR, GT40.wheelR, GT40.wheelHalfW * 2, 24),
        tireMat,
      );
      tire.rotation.z = Math.PI / 2;
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(GT40.wheelR * 0.58, GT40.wheelR * 0.58, GT40.wheelHalfW * 2.05, 20),
        rimMat,
      );
      rim.rotation.z = Math.PI / 2;
      holder.add(tire, rim);
      for (let i = 0; i < 12; i++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.022, GT40.wheelR * 1.02, 0.03), spokeMat);
        spoke.rotation.z = (i / 12) * Math.PI;
        holder.add(spoke);
      }
      group.add(holder);
      w.push(holder);
      if (place.front) f.push(holder);
    }
    wheels.current = w;
    fronts.current = f;
    return group;
  }, []);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.28;
    for (const wheel of wheels.current) wheel.rotation.x = -spin;
    for (const wheel of fronts.current) wheel.rotation.y = turn;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.5, 22]} />
        <meshBasicMaterial color="#000" transparent opacity={0.16} />
      </mesh>

      {/* Low center tub — sits below the flared arches */}
      <Painted scale={[1.02, 0.34, 1.85]} position={[0, 0.36, -0.05]} color={paint} />

      {/* Long low hood — shorter than the fender peaks */}
      <Painted scale={[0.78, 0.2, 0.95]} position={[0, 0.48, 1.18]} color={paint} />
      <Painted scale={[0.58, 0.18, 0.42]} position={[0, 0.42, 1.82]} color={paint} />

      {/* Nose cap */}
      <Painted scale={[0.52, 0.2, 0.28]} position={[0, 0.4, 2.02]} color={paint} />

      {/* Front arches: taller than the hood */}
      <Arch side={-1} z={GT40.frontAxle} color={paint} wide={0.5} />
      <Arch side={1} z={GT40.frontAxle} color={paint} wide={0.5} />

      {/* Rear haunches */}
      <Arch side={-1} z={GT40.rearAxle} color={paint} wide={0.62} rear />
      <Arch side={1} z={GT40.rearAxle} color={paint} wide={0.62} rear />

      {/* Fastback deck */}
      <Painted scale={[0.82, 0.16, 0.85]} position={[0, 0.52, -0.85]} color={paint} />
      <Painted scale={[0.7, 0.14, 0.42]} position={[0, 0.42, -1.72]} color={paint} />

      {/* Wrap windshield + side glass */}
      <mesh position={[0, 0.68, 0.38]} rotation={[0.48, 0, 0]} scale={[1.18, 0.42, 0.72]}>
        <sphereGeometry args={[0.7, 22, 14, 0, Math.PI * 2, 0.15, 1.15]} />
        <meshStandardMaterial color="#153544" metalness={0.28} roughness={0.07} transparent opacity={0.88} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.86, -0.05]} scale={[0.95, 0.22, 0.55]}>
        <sphereGeometry args={[0.62, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#163445" metalness={0.24} roughness={0.08} transparent opacity={0.86} side={THREE.DoubleSide} />
      </mesh>

      {/* Rectangular intake */}
      <mesh position={[0, 0.3, 2.08]}>
        <boxGeometry args={[0.62, 0.15, 0.1]} />
        <meshStandardMaterial color="#111111" roughness={0.88} />
      </mesh>

      {/* Rear side scoops */}
      <mesh position={[-0.58, 0.48, -0.22]} rotation={[0, 0.18, 0]}>
        <boxGeometry args={[0.1, 0.18, 0.34]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0.58, 0.48, -0.22]} rotation={[0, -0.18, 0]}>
        <boxGeometry args={[0.1, 0.18, 0.34]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* Dual Le Mans stripes: hood + roof + deck */}
      <Stripe pos={[-0.075, 0.595, 1.15]} size={[0.07, 0.012, 1.55]} />
      <Stripe pos={[0.075, 0.595, 1.15]} size={[0.07, 0.012, 1.55]} />
      <Stripe pos={[-0.075, 0.98, 0.05]} size={[0.07, 0.012, 0.85]} rot={[0.35, 0, 0]} />
      <Stripe pos={[0.075, 0.98, 0.05]} size={[0.07, 0.012, 0.85]} rot={[0.35, 0, 0]} />
      <Stripe pos={[-0.075, 0.62, -0.95]} size={[0.07, 0.012, 1.15]} rot={[-0.22, 0, 0]} />
      <Stripe pos={[0.075, 0.62, -0.95]} size={[0.07, 0.012, 1.15]} rot={[-0.22, 0, 0]} />

      <Headlamp x={-0.38} y={0.4} z={1.92} />
      <Headlamp x={0.38} y={0.4} z={1.92} />
      <mesh position={[-0.62, 0.38, 1.82]}>
        <sphereGeometry args={[0.042, 12, 10]} />
        <meshStandardMaterial color="#e39a18" roughness={0.22} metalness={0.35} />
      </mesh>
      <mesh position={[0.62, 0.38, 1.82]}>
        <sphereGeometry args={[0.042, 12, 10]} />
        <meshStandardMaterial color="#e39a18" roughness={0.22} metalness={0.35} />
      </mesh>

      <mesh position={[-0.78, 0.5, 0.12]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.2, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>
      <mesh position={[0.78, 0.5, 0.12]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.2, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>

      <primitive object={wheelSet} />
    </group>
  );
}

function Painted({
  position,
  scale,
  color,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[0.72, 22, 16]} />
      <meshPhysicalMaterial color={color} {...PAINT} />
    </mesh>
  );
}

function Arch({
  side,
  z,
  color,
  wide,
  rear = false,
}: {
  side: number;
  z: number;
  color: string;
  wide: number;
  rear?: boolean;
}) {
  const peak = rear ? 0.22 : 0.28;
  return (
    <mesh position={[side * 0.58, GT40.hoodTop + peak * 0.15, z]} scale={[wide, rear ? 0.36 : 0.4, rear ? 0.62 : 0.52]}>
      <sphereGeometry args={[0.72, 18, 14]} />
      <meshPhysicalMaterial color={color} {...PAINT} />
    </mesh>
  );
}

function Stripe({
  pos,
  size,
  rot = [0, 0, 0],
}: {
  pos: [number, number, number];
  size: [number, number, number];
  rot?: [number, number, number];
}) {
  return (
    <mesh position={pos} rotation={rot}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#f3f3f3" roughness={0.28} />
    </mesh>
  );
}

function Headlamp({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.095, 0.016, 10, 22]} />
        <meshStandardMaterial color="#d8dde2" metalness={0.78} roughness={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.082, 16, 12]} />
        <meshStandardMaterial color="#f3edd4" emissive="#e6d48a" emissiveIntensity={0.42} roughness={0.14} />
      </mesh>
      <mesh position={[0, 0, 0.028]} scale={[1.08, 1.08, 0.4]}>
        <sphereGeometry args={[0.095, 16, 12]} />
        <meshPhysicalMaterial color="#dce8ee" transparent opacity={0.34} roughness={0.04} metalness={0.35} />
      </mesh>
    </group>
  );
}
