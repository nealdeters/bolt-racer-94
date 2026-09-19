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
    cabin: "#7ad7ff",
    number: "94",
    numberColor: "#ffe14a",
    smile: true,
  },
  ai: {
    paint: "#1e6dff",
    accent: "#ff8a1e",
    cabin: "#c9ecff",
    number: "7",
    numberColor: "#ffffff",
    smile: false,
  },
};

export function CarModel({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = BODY[kind];
  const numberMap = useMemo(() => makeNumberTexture(look.number, look.numberColor), [look.number, look.numberColor]);
  const boltMap = useMemo(() => makeBoltTexture(), []);
  const wheels = useRef<Group>(null);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.45;
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[1.25, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} />
      </mesh>

      <mesh position={[0, 0.42, 0.05]} castShadow>
        <boxGeometry args={[1.86, 0.4, 3.55]} />
        <meshStandardMaterial color={look.paint} metalness={0.42} roughness={0.32} />
      </mesh>

      <mesh position={[0, 0.52, 1.05]} rotation={[0.16, 0, 0]} castShadow>
        <boxGeometry args={[1.78, 0.16, 1.25]} />
        <meshStandardMaterial color={look.paint} metalness={0.42} roughness={0.32} />
      </mesh>

      <mesh position={[0, 0.48, -1.45]} castShadow>
        <boxGeometry args={[1.82, 0.34, 0.7]} />
        <meshStandardMaterial color={look.paint} metalness={0.4} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.78, -0.15]} castShadow>
        <boxGeometry args={[1.55, 0.38, 1.45]} />
        <meshStandardMaterial color={look.paint} metalness={0.35} roughness={0.38} />
      </mesh>

      <mesh position={[0, 0.86, 0.58]} rotation={[0.48, 0, 0]}>
        <boxGeometry args={[1.5, 0.08, 1.05]} />
        <meshStandardMaterial color="#15324d" metalness={0.15} roughness={0.2} />
      </mesh>

      <Eyes kind={kind} />

      {look.smile ? <ChromeSmile /> : <FriendlyGrill color="#cfd8e3" />}

      <mesh position={[0, 0.28, 1.82]}>
        <boxGeometry args={[1.7, 0.14, 0.16]} />
        <meshStandardMaterial color={look.accent} metalness={0.3} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.86, -1.55]} castShadow>
        <boxGeometry args={[1.7, 0.1, 0.28]} />
        <meshStandardMaterial color={look.paint} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[-0.78, 0.72, -1.42]}>
        <boxGeometry args={[0.1, 0.28, 0.1]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[0.78, 0.72, -1.42]}>
        <boxGeometry args={[0.1, 0.28, 0.1]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      <mesh position={[0, 0.64, 0.72]} rotation={[-0.55, 0, 0]}>
        <planeGeometry args={[0.7, 0.42]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>
      <mesh position={[-0.94, 0.56, 0.05]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.05, 0.55]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>
      <mesh position={[0.94, 0.56, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.05, 0.55]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>

      {kind === "player" && (
        <>
          <mesh position={[-0.935, 0.5, -0.55]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.55, 1.05]} />
            <meshBasicMaterial map={boltMap} transparent />
          </mesh>
          <mesh position={[0.935, 0.5, -0.55]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.55, 1.05]} />
            <meshBasicMaterial map={boltMap} transparent />
          </mesh>
          <mesh position={[0, 0.63, -0.55]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.18, 0.05, 1.4]} />
            <meshStandardMaterial color="#ffe14a" metalness={0.4} roughness={0.3} />
          </mesh>
        </>
      )}

      {kind === "ai" && (
        <mesh position={[0, 0.64, -0.2]}>
          <boxGeometry args={[1.6, 0.06, 0.22]} />
          <meshStandardMaterial color={look.accent} />
        </mesh>
      )}

      <group ref={wheels}>
        <Wheel x={-0.82} z={1.15} />
        <Wheel x={0.82} z={1.15} />
        <Wheel x={-0.82} z={-1.2} />
        <Wheel x={0.82} z={-1.2} />
      </group>

      <mesh position={[-0.72, 0.62, 1.55]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.16, 0.1, 0.22]} />
        <meshStandardMaterial color="#fff4b0" emissive="#fff4b0" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.72, 0.62, 1.55]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.16, 0.1, 0.22]} />
        <meshStandardMaterial color="#fff4b0" emissive="#fff4b0" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[-0.7, 0.58, -1.78]}>
        <boxGeometry args={[0.18, 0.1, 0.08]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.7, 0.58, -1.78]}>
        <boxGeometry args={[0.18, 0.1, 0.08]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function Eyes({ kind }: { kind: CarKind }) {
  const gap = kind === "player" ? 0.32 : 0.26;
  const size = kind === "player" ? 0.3 : 0.24;
  return (
    <group position={[0, 0.98, 0.72]} rotation={[0.22, 0, 0]}>
      <Eye x={-gap} size={size} />
      <Eye x={gap} size={size} />
    </group>
  );
}

function Eye({ x, size }: { x: number; size: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh>
        <circleGeometry args={[size, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.02, 0.02]}>
        <circleGeometry args={[size * 0.42, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[size * 0.16, size * 0.16, 0.03]}>
        <circleGeometry args={[size * 0.12, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function ChromeSmile() {
  return (
    <group position={[0, 0.3, 1.92]}>
      <mesh>
        <boxGeometry args={[1.55, 0.22, 0.18]} />
        <meshStandardMaterial color="#e8eef4" metalness={0.92} roughness={0.14} />
      </mesh>
      <mesh position={[0, -0.02, 0.06]}>
        <boxGeometry args={[1.15, 0.08, 0.08]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[-0.58, 0.02, 0.05]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.28, 0.08, 0.08]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.58, 0.02, 0.05]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.28, 0.08, 0.08]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0, 0.16, 0.01]}>
        <boxGeometry args={[1.4, 0.07, 0.1]} />
        <meshStandardMaterial color="#ffe14a" />
      </mesh>
    </group>
  );
}

function FriendlyGrill({ color }: { color: string }) {
  return (
    <group position={[0, 0.34, 1.84]}>
      <mesh>
        <boxGeometry args={[1.15, 0.2, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.02, 0.03]}>
        <boxGeometry args={[0.7, 0.06, 0.06]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.28, z]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.22, 16]} />
          <meshStandardMaterial color="#161616" roughness={0.7} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.24, 12]} />
          <meshStandardMaterial color="#c5ced6" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}
