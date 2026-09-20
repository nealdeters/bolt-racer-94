import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { createBelly, createBodyHull, createWindshield, stripePoints } from "../game/stockCarMesh";
import { makeHubTexture, makeRoundelTexture } from "../game/textures";

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

const PAINT = { metalness: 0.58, roughness: 0.14 } as const;

export function CarModel({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = LOOK[kind];
  const body = useMemo(() => createBodyHull(), []);
  const belly = useMemo(() => createBelly(), []);
  const glass = useMemo(() => createWindshield(), []);
  const roundel = useMemo(() => makeRoundelTexture(look.number), [look.number]);
  const hubMap = useMemo(() => makeHubTexture(), []);
  const stripeL = useMemo(() => tubeFrom(stripePoints(-0.09, 0.02, 0.98, 20)), []);
  const stripeR = useMemo(() => tubeFrom(stripePoints(0.09, 0.02, 0.98, 20)), []);
  const wheels = useRef<Group>(null);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.32;
    const group = wheels.current;
    if (!group) return;
    for (let i = 0; i < 4; i++) {
      const wheel = group.children[i];
      if (!wheel) continue;
      if (i < 2) wheel.rotation.y = turn;
      wheel.children[0].rotation.x = -spin;
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.35, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} />
      </mesh>

      <mesh geometry={body}>
        <meshStandardMaterial color={look.paint} {...PAINT} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={belly}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>

      <mesh geometry={glass} position={[0, 0.5, 0.52]} scale={[1.15, 1.18, 1.1]}>
        <meshStandardMaterial color="#4e8eac" roughness={0.08} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.7, 0.55]} rotation={[0.72, 0, 0]}>
        <planeGeometry args={[1.22, 0.48]} />
        <meshStandardMaterial color="#3f7f9e" roughness={0.06} metalness={0.28} />
      </mesh>

      <mesh geometry={stripeL}>
        <meshStandardMaterial color="#f3f3f3" roughness={0.32} />
      </mesh>
      <mesh geometry={stripeR}>
        <meshStandardMaterial color="#f3f3f3" roughness={0.32} />
      </mesh>

      <group position={[0, 0.3, 1.78]}>
        <mesh>
          <boxGeometry args={[0.62, 0.18, 0.22]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.01, 0.04]}>
          <boxGeometry args={[0.56, 0.03, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.45} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.03, 0.04]}>
          <boxGeometry args={[0.56, 0.03, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.45} roughness={0.4} />
        </mesh>
      </group>

      <Headlamp x={-0.42} />
      <Headlamp x={0.42} />
      <mesh position={[-0.78, 0.42, 1.62]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial color="#e39a18" roughness={0.22} metalness={0.35} />
      </mesh>
      <mesh position={[0.78, 0.42, 1.62]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial color="#e39a18" roughness={0.22} metalness={0.35} />
      </mesh>

      <mesh position={[-0.86, 0.46, 0.18]} rotation={[0, -Math.PI / 2, 0.06]}>
        <circleGeometry args={[0.28, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>
      <mesh position={[0.86, 0.46, 0.18]} rotation={[0, Math.PI / 2, -0.06]}>
        <circleGeometry args={[0.28, 28]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>

      <mesh position={[-0.88, 0.4, -0.52]} rotation={[0, 0.18, 0]}>
        <boxGeometry args={[0.1, 0.16, 0.32]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      <mesh position={[0.88, 0.4, -0.52]} rotation={[0, -0.18, 0]}>
        <boxGeometry args={[0.1, 0.16, 0.32]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>

      <group ref={wheels}>
        <Wheel x={-0.9} z={1.12} radius={0.3} hubMap={hubMap} />
        <Wheel x={0.9} z={1.12} radius={0.3} hubMap={hubMap} />
        <Wheel x={-0.96} z={-1.2} radius={0.34} hubMap={hubMap} />
        <Wheel x={0.96} z={-1.2} radius={0.34} hubMap={hubMap} />
      </group>
    </group>
  );
}

function tubeFrom(pts: THREE.Vector3[]): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, 28, 0.038, 8, false);
}

function Headlamp({ x }: { x: number }) {
  return (
    <group position={[x, 0.46, 1.68]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.155, 0.16, 0.08, 24]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.85} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.13, 24]} />
        <meshStandardMaterial color="#fff6d2" emissive="#ffe9a0" emissiveIntensity={0.55} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.08]} scale={[1, 1, 0.48]}>
        <sphereGeometry args={[0.145, 18, 12]} />
        <meshStandardMaterial color="#e8f2f6" transparent opacity={0.35} roughness={0.04} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Wheel({
  x,
  z,
  radius,
  hubMap,
}: {
  x: number;
  z: number;
  radius: number;
  hubMap: ReturnType<typeof makeHubTexture>;
}) {
  return (
    <group position={[x, radius, z]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[radius, radius, 0.24, 26]} />
          <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[radius * 0.7, radius * 0.7, 0.12, 22]} />
          <meshStandardMaterial map={hubMap} metalness={0.55} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
