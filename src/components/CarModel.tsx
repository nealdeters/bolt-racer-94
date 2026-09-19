import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { makeBoltTexture, makeNumberTexture } from "../game/textures";

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

const BODY = {
  player: {
    paint: "#e10600",
    accent: "#ffe14a",
    glass: "#0b3a58",
    number: "94",
    numberColor: "#ffe14a",
    pupil: "#1a1208",
  },
  ai: {
    paint: "#1f6fff",
    accent: "#ff9a2e",
    glass: "#12324a",
    number: "7",
    numberColor: "#ffffff",
    pupil: "#102030",
  },
};

const PAINT = { metalness: 0.34, roughness: 0.32 } as const;
const CHROME = { color: "#eef3f7", metalness: 0.96, roughness: 0.1 } as const;

export function CarModel({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = BODY[kind];
  const numberMap = useMemo(
    () => makeNumberTexture(look.number, look.numberColor),
    [look.number, look.numberColor],
  );
  const boltMap = useMemo(() => makeBoltTexture(), []);
  const wheels = useRef<Group>(null);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.42;
    const group = wheels.current;
    if (!group) return;
    const [fl, fr, rl, rr] = group.children;
    if (fl) {
      fl.rotation.y = turn;
      fl.children[0].rotation.x = -spin;
    }
    if (fr) {
      fr.rotation.y = turn;
      fr.children[0].rotation.x = -spin;
    }
    if (rl) rl.children[0].rotation.x = -spin;
    if (rr) rr.children[0].rotation.x = -spin;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.35, 22]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>

      <mesh position={[0, 0.5, 0.04]} rotation={[Math.PI / 2, 0, 0]} scale={[1.18, 1, 0.62]}>
        <capsuleGeometry args={[0.74, 2.05, 10, 22]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>

      <mesh position={[0, 0.52, 0.95]} scale={[1.12, 0.58, 0.95]}>
        <sphereGeometry args={[0.82, 22, 16]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>

      <mesh position={[0, 0.5, -1.15]} scale={[1.1, 0.56, 0.82]}>
        <sphereGeometry args={[0.8, 22, 16]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>

      <Fender x={-0.78} z={1.12} color={look.paint} />
      <Fender x={0.78} z={1.12} color={look.paint} />
      <Fender x={-0.78} z={-1.15} color={look.paint} />
      <Fender x={0.78} z={-1.15} color={look.paint} />

      <mesh position={[0, 0.98, 0.62]} scale={[1.22, 0.95, 0.82]} rotation={[0.38, 0, 0]}>
        <sphereGeometry args={[0.72, 26, 18, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
        <meshStandardMaterial color={look.glass} metalness={0.18} roughness={0.12} />
      </mesh>

      <mesh position={[0, 1.18, 0.28]} rotation={[0.55, 0, 0]}>
        <capsuleGeometry args={[0.08, 1.15, 6, 10]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>

      <Eyes kind={kind} />
      <Smile accent={look.accent} />

      <mesh position={[-0.62, 0.42, 1.72]} rotation={[0, 0.35, 0]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color="#fff4b8" emissive="#fff0a0" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0.62, 0.42, 1.72]} rotation={[0, -0.35, 0]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color="#fff4b8" emissive="#fff0a0" emissiveIntensity={0.45} />
      </mesh>

      <mesh position={[0, 0.98, -1.52]}>
        <boxGeometry args={[1.55, 0.1, 0.34]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>
      <mesh position={[-0.7, 0.82, -1.4]}>
        <boxGeometry args={[0.1, 0.32, 0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.7, 0.82, -1.4]}>
        <boxGeometry args={[0.1, 0.32, 0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 1.08, -1.58]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[1.72, 0.08, 0.28]} />
        <meshStandardMaterial color={look.accent} metalness={0.4} roughness={0.3} />
      </mesh>

      <mesh position={[-0.7, 0.58, -1.72]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.7, 0.58, -1.72]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={0.35} />
      </mesh>

      <mesh position={[-0.98, 0.62, -0.05]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.15, 0.7]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>
      <mesh position={[0.98, 0.62, -0.05]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.15, 0.7]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>

      {kind === "player" ? (
        <>
          <mesh position={[-0.99, 0.58, -0.72]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.7, 1.15]} />
            <meshBasicMaterial map={boltMap} transparent />
          </mesh>
          <mesh position={[0.99, 0.58, -0.72]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.7, 1.15]} />
            <meshBasicMaterial map={boltMap} transparent />
          </mesh>
          <mesh position={[0, 0.78, 0.15]} rotation={[0.08, 0, 0]}>
            <capsuleGeometry args={[0.055, 1.55, 4, 8]} />
            <meshStandardMaterial color={look.accent} metalness={0.45} roughness={0.28} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 0.78, -0.15]}>
          <capsuleGeometry args={[0.06, 1.4, 4, 8]} />
          <meshStandardMaterial color={look.accent} metalness={0.4} roughness={0.3} />
        </mesh>
      )}

      <group ref={wheels}>
        <Wheel x={-0.88} z={1.14} />
        <Wheel x={0.88} z={1.14} />
        <Wheel x={-0.88} z={-1.16} />
        <Wheel x={0.88} z={-1.16} />
      </group>
    </group>
  );
}

function Fender({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <mesh position={[x, 0.4, z]} scale={[0.58, 0.52, 0.72]}>
      <sphereGeometry args={[0.55, 16, 12]} />
      <meshStandardMaterial color={color} {...PAINT} />
    </mesh>
  );
}

function Eyes({ kind }: { kind: CarKind }) {
  const big = kind === "player";
  return (
    <group position={[0, 1.02, 0.95]} rotation={[0.42, 0, 0]}>
      <Eye x={big ? -0.34 : -0.3} size={big ? 0.4 : 0.34} pupil={BODY[kind].pupil} />
      <Eye x={big ? 0.34 : 0.3} size={big ? 0.4 : 0.34} pupil={BODY[kind].pupil} />
    </group>
  );
}

function Eye({ x, size, pupil }: { x: number; size: number; pupil: string }) {
  return (
    <group position={[x, 0, 0.02]}>
      <mesh scale={[1, 1.08, 0.55]}>
        <sphereGeometry args={[size, 22, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.22} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.03, size * 0.42]} scale={[1, 1.05, 0.7]}>
        <sphereGeometry args={[size * 0.42, 18, 14]} />
        <meshStandardMaterial color={pupil} roughness={0.35} />
      </mesh>
      <mesh position={[size * 0.16, size * 0.18, size * 0.55]}>
        <sphereGeometry args={[size * 0.11, 10, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-size * 0.12, -size * 0.08, size * 0.5]}>
        <sphereGeometry args={[size * 0.05, 8, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Smile({ accent }: { accent: string }) {
  return (
    <group position={[0, 0.34, 1.88]}>
      <mesh rotation={[0.15, 0, 0]} scale={[1.15, 0.55, 0.55]}>
        <capsuleGeometry args={[0.22, 1.15, 8, 16]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh rotation={[0.05, 0, Math.PI]} position={[0, -0.02, 0.1]}>
        <torusGeometry args={[0.5, 0.09, 12, 28, Math.PI]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh position={[0, -0.08, 0.14]} scale={[0.85, 0.16, 0.12]}>
        <sphereGeometry args={[0.42, 16, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.16, 0.08]} scale={[1.05, 0.18, 0.2]}>
        <capsuleGeometry args={[0.1, 0.9, 6, 12]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.3, z]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.32, 0.32, 0.26, 18]} />
          <meshStandardMaterial color="#141414" roughness={0.72} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, 0.28, 14]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
      </group>
    </group>
  );
}
