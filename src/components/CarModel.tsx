import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { createBodyHull, createCabinHull, createWindshield } from "../game/stockCarMesh";
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
  player: {
    paint: "#cc1010",
    number: "94",
  },
  ai: {
    paint: "#1a4db8",
    number: "7",
  },
};

const PAINT = { metalness: 0.55, roughness: 0.16 } as const;

export function CarModel({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = LOOK[kind];
  const body = useMemo(() => createBodyHull(), []);
  const cabin = useMemo(() => createCabinHull(), []);
  const glass = useMemo(() => createWindshield(), []);
  const roundel = useMemo(() => makeRoundelTexture(look.number), [look.number]);
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[1.3, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>

      <mesh geometry={body}>
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>
      <mesh geometry={cabin}>
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>

      <mesh geometry={glass} position={[0, 0.44, 0.38]}>
        <meshStandardMaterial
          color="#9ec4d8"
          transparent
          opacity={0.42}
          metalness={0.7}
          roughness={0.06}
          envMapIntensity={1.2}
        />
      </mesh>
      <mesh position={[-0.62, 0.66, -0.08]} rotation={[0, -1.25, 0]}>
        <planeGeometry args={[0.55, 0.28]} />
        <meshStandardMaterial color="#7aa8bc" transparent opacity={0.38} metalness={0.65} roughness={0.08} />
      </mesh>
      <mesh position={[0.62, 0.66, -0.08]} rotation={[0, 1.25, 0]}>
        <planeGeometry args={[0.55, 0.28]} />
        <meshStandardMaterial color="#7aa8bc" transparent opacity={0.38} metalness={0.65} roughness={0.08} />
      </mesh>

      <group position={[0, 0.29, 1.7]}>
        <mesh>
          <boxGeometry args={[0.56, 0.15, 0.18]} />
          <meshStandardMaterial color="#111111" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.5, 0.04, 0.02]} />
          <meshStandardMaterial color="#333" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.04, 0.02]}>
          <boxGeometry args={[0.5, 0.04, 0.02]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      <Headlamp x={-0.4} />
      <Headlamp x={0.4} />
      <mesh position={[-0.7, 0.33, 1.52]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#e8a020" roughness={0.25} metalness={0.3} />
      </mesh>
      <mesh position={[0.7, 0.33, 1.52]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#e8a020" roughness={0.25} metalness={0.3} />
      </mesh>

      <Stripe y={0.505} z={1.05} len={1.15} x={-0.075} />
      <Stripe y={0.505} z={1.05} len={1.15} x={0.075} />
      <Stripe y={0.925} z={0.02} len={0.62} x={-0.075} />
      <Stripe y={0.925} z={0.02} len={0.62} x={0.075} />
      <Stripe y={0.53} z={-1.22} len={1.35} x={-0.075} />
      <Stripe y={0.53} z={-1.22} len={1.35} x={0.075} />

      <mesh position={[-0.86, 0.42, 0.02]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.2, 24]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>
      <mesh position={[0.86, 0.42, 0.02]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.2, 24]} />
        <meshBasicMaterial map={roundel} transparent />
      </mesh>

      <mesh position={[-0.86, 0.38, -0.55]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.08, 0.14, 0.28]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      <mesh position={[0.86, 0.38, -0.55]} rotation={[0, -0.15, 0]}>
        <boxGeometry args={[0.08, 0.14, 0.28]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>

      <group ref={wheels}>
        <Wheel x={-0.88} z={1.1} radius={0.29} />
        <Wheel x={0.88} z={1.1} radius={0.29} />
        <Wheel x={-0.94} z={-1.22} radius={0.33} />
        <Wheel x={0.94} z={-1.22} radius={0.33} />
      </group>
    </group>
  );
}

function Stripe({ x, y, z, len }: { x: number; y: number; z: number; len: number }) {
  return (
    <mesh position={[x, y, z]}>
      <boxGeometry args={[0.07, 0.012, len]} />
      <meshStandardMaterial color="#f4f4f4" roughness={0.35} metalness={0.05} />
    </mesh>
  );
}

function Headlamp({ x }: { x: number }) {
  return (
    <group position={[x, 0.36, 1.58]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.115, 0.12, 0.06, 20]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 20]} />
        <meshStandardMaterial color="#f3eed4" emissive="#bba86a" emissiveIntensity={0.25} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.05]} scale={[1, 1, 0.45]}>
        <sphereGeometry args={[0.112, 16, 12]} />
        <meshStandardMaterial color="#d8e8f0" transparent opacity={0.28} roughness={0.05} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Wheel({ x, z, radius }: { x: number; z: number; radius: number }) {
  const spokes = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);
  return (
    <group position={[x, radius, z]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[radius, radius, 0.22, 24]} />
          <meshStandardMaterial color="#111111" roughness={0.78} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[radius * 0.62, radius * 0.62, 0.16, 20]} />
          <meshStandardMaterial color="#1c1c1c" metalness={0.65} roughness={0.28} />
        </mesh>
        {spokes.map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 10) * Math.PI]}>
            <boxGeometry args={[radius * 1.05, 0.03, 0.04]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.25} />
          </mesh>
        ))}
        <mesh>
          <cylinderGeometry args={[0.055, 0.055, 0.18, 12]} />
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
