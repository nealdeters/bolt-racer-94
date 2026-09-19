import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { makeBoltTexture, makeNumberTexture, makeSmileTexture, makeWindshieldFace } from "../game/textures";

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
    paint: "#e10600",
    accent: "#ffe14a",
    number: "94",
    numberColor: "#ffe14a",
    pupil: "#1a1208",
  },
  ai: {
    paint: "#1f6fff",
    accent: "#ff9a2e",
    number: "7",
    numberColor: "#ffffff",
    pupil: "#102030",
  },
};

const PAINT = { metalness: 0.32, roughness: 0.34 } as const;

export function CarModel({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = LOOK[kind];
  const hull = useMemo(() => makeStockHull(), []);
  const faceMap = useMemo(() => makeWindshieldFace(look.pupil), [look.pupil]);
  const smileMap = useMemo(() => makeSmileTexture(), []);
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
        <circleGeometry args={[1.3, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>

      <mesh geometry={hull}>
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>

      <mesh position={[0, 0.62, 1.05]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.68, 0.14, 1.15]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>

      <mesh position={[0, 0.72, -0.15]}>
        <boxGeometry args={[1.62, 0.22, 1.55]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>

      <mesh position={[0, 0.98, 0.72]} rotation={[0.52, 0, 0]}>
        <planeGeometry args={[1.78, 1.02]} />
        <meshBasicMaterial map={faceMap} />
      </mesh>
      <mesh position={[0, 0.98, 0.715]} rotation={[0.52, 0, Math.PI]}>
        <planeGeometry args={[1.78, 1.02]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>

      <mesh position={[0, 0.36, 1.86]} rotation={[0.12, 0, 0]}>
        <planeGeometry args={[1.72, 0.52]} />
        <meshBasicMaterial map={smileMap} />
      </mesh>
      <mesh position={[0, 0.32, 1.78]}>
        <boxGeometry args={[1.74, 0.22, 0.16]} />
        <meshStandardMaterial color="#dfe6ee" metalness={0.9} roughness={0.14} />
      </mesh>

      <mesh position={[-0.58, 0.42, 1.68]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color="#fff3b0" emissive="#ffe08a" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.58, 0.42, 1.68]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color="#fff3b0" emissive="#ffe08a" emissiveIntensity={0.4} />
      </mesh>

      <mesh position={[0, 0.98, -1.58]}>
        <boxGeometry args={[1.58, 0.1, 0.32]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>
      <mesh position={[-0.68, 0.82, -1.46]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.68, 0.82, -1.46]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 1.08, -1.62]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[1.7, 0.08, 0.26]} />
        <meshStandardMaterial color={look.accent} metalness={0.4} roughness={0.3} />
      </mesh>

      <mesh position={[-0.66, 0.52, -1.72]}>
        <boxGeometry args={[0.16, 0.08, 0.06]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.66, 0.52, -1.72]}>
        <boxGeometry args={[0.16, 0.08, 0.06]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={0.3} />
      </mesh>

      <mesh position={[-0.92, 0.58, 0.02]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.2, 0.72]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>
      <mesh position={[0.92, 0.58, 0.02]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.2, 0.72]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>

      {kind === "player" && (
        <>
          <mesh position={[-0.93, 0.56, -0.7]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.72, 1.2]} />
            <meshBasicMaterial map={boltMap} transparent />
          </mesh>
          <mesh position={[0.93, 0.56, -0.7]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.72, 1.2]} />
            <meshBasicMaterial map={boltMap} transparent />
          </mesh>
          <mesh position={[0.0, 0.74, 0.2]}>
            <boxGeometry args={[0.16, 0.05, 1.5]} />
            <meshStandardMaterial color={look.accent} metalness={0.4} roughness={0.3} />
          </mesh>
        </>
      )}
      {kind === "ai" && (
        <mesh position={[0, 0.74, -0.1]}>
          <boxGeometry args={[1.5, 0.05, 0.2]} />
          <meshStandardMaterial color={look.accent} />
        </mesh>
      )}

      <group ref={wheels}>
        <Wheel x={-0.9} z={1.12} />
        <Wheel x={0.9} z={1.12} />
        <Wheel x={-0.9} z={-1.14} />
        <Wheel x={0.9} z={-1.14} />
      </group>
    </group>
  );
}

function makeStockHull(): THREE.BufferGeometry {
  const halfW = 0.86;
  const halfL = 1.68;
  const radius = 0.34;
  const shape = new THREE.Shape();
  shape.moveTo(-halfW + radius, -halfL);
  shape.lineTo(halfW - radius, -halfL);
  shape.quadraticCurveTo(halfW, -halfL, halfW, -halfL + radius);
  shape.lineTo(halfW, halfL - radius);
  shape.quadraticCurveTo(halfW, halfL, halfW - radius, halfL);
  shape.lineTo(-halfW + radius, halfL);
  shape.quadraticCurveTo(-halfW, halfL, -halfW, halfL - radius);
  shape.lineTo(-halfW, -halfL + radius);
  shape.quadraticCurveTo(-halfW, -halfL, -halfW + radius, -halfL);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.46,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.1,
    bevelSegments: 3,
    curveSegments: 10,
  });
  geo.rotateX(-Math.PI / 2);
  geo.rotateY(Math.PI);
  geo.translate(0, 0.24, 0);
  return geo;
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.3, z]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.31, 0.31, 0.24, 18]} />
          <meshStandardMaterial color="#141414" roughness={0.7} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.26, 12]} />
          <meshStandardMaterial color="#d5dee6" metalness={0.88} roughness={0.16} />
        </mesh>
      </group>
    </group>
  );
}
