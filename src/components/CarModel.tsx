import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { makeBoltTexture, makeNumberTexture, makeWindshieldFace } from "../game/textures";

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

const PAINT = { metalness: 0.38, roughness: 0.3 } as const;
const CHROME = { color: "#e8eef4", metalness: 0.96, roughness: 0.08 } as const;
const WHEEL_R = 0.46;

export function CarModel({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = LOOK[kind];
  const hull = useMemo(() => makeWedgeHull(), []);
  const smile = useMemo(() => makeSmileTube(), []);
  const faceMap = useMemo(() => makeWindshieldFace(look.pupil), [look.pupil]);
  const numberMap = useMemo(
    () => makeNumberTexture(look.number, look.numberColor),
    [look.number, look.numberColor],
  );
  const boltMap = useMemo(() => makeBoltTexture(), []);
  const wheels = useRef<Group>(null);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.4;
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.15]}>
        <circleGeometry args={[1.45, 22]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>

      <mesh geometry={hull}>
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>

      <mesh position={[0, 0.96, 0.18]} rotation={[0.32, 0, 0]}>
        <planeGeometry args={[1.72, 1.12]} />
        <meshBasicMaterial map={faceMap} />
      </mesh>
      <mesh position={[0, 0.96, 0.15]} rotation={[0.32, 0, Math.PI]}>
        <planeGeometry args={[1.72, 1.12]} />
        <meshStandardMaterial color="#06343c" metalness={0.2} roughness={0.18} />
      </mesh>

      <mesh geometry={smile}>
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh position={[0, 0.24, 2.02]} scale={[0.95, 0.22, 0.18]}>
        <sphereGeometry args={[0.42, 16, 12]} />
        <meshStandardMaterial color="#141414" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.4, 2.0]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[1.15, 0.06, 0.1]} />
        <meshStandardMaterial color={look.accent} metalness={0.45} roughness={0.28} />
      </mesh>

      <mesh position={[-0.82, 0.4, 1.78]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color="#fff3b0" emissive="#ffe08a" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0.82, 0.4, 1.78]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color="#fff3b0" emissive="#ffe08a" emissiveIntensity={0.45} />
      </mesh>

      <mesh position={[-0.62, 1.18, -1.88]}>
        <boxGeometry args={[0.08, 0.55, 0.08]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.62, 1.18, -1.88]}>
        <boxGeometry args={[0.08, 0.55, 0.08]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 1.5, -1.92]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[1.82, 0.12, 0.38]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>
      <mesh position={[-0.9, 1.48, -1.92]}>
        <boxGeometry args={[0.08, 0.28, 0.4]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>
      <mesh position={[0.9, 1.48, -1.92]}>
        <boxGeometry args={[0.08, 0.28, 0.4]} />
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>
      <mesh position={[0, 1.58, -1.92]}>
        <boxGeometry args={[1.7, 0.05, 0.22]} />
        <meshStandardMaterial color={look.accent} metalness={0.4} roughness={0.28} />
      </mesh>

      <mesh position={[-0.7, 0.58, -2.0]}>
        <boxGeometry args={[0.16, 0.08, 0.06]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.7, 0.58, -2.0]}>
        <boxGeometry args={[0.16, 0.08, 0.06]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={0.3} />
      </mesh>

      <mesh position={[-0.98, 0.72, -0.85]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.35, 0.95]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>
      <mesh position={[0.98, 0.72, -0.85]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.35, 0.95]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>

      {kind === "player" ? (
        <>
          <mesh position={[-0.99, 0.62, -0.05]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.15, 1.35]} />
            <meshBasicMaterial map={boltMap} transparent />
          </mesh>
          <mesh position={[0.99, 0.62, -0.05]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.15, 1.35]} />
            <meshBasicMaterial map={boltMap} transparent />
          </mesh>
          <mesh position={[0, 0.58, 0.85]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.2, 0.05, 1.9]} />
            <meshStandardMaterial color={look.accent} metalness={0.45} roughness={0.28} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 0.72, -0.55]}>
          <boxGeometry args={[1.55, 0.06, 0.22]} />
          <meshStandardMaterial color={look.accent} />
        </mesh>
      )}

      <group ref={wheels}>
        <Wheel x={-1.02} z={1.28} />
        <Wheel x={1.02} z={1.28} />
        <Wheel x={-1.02} z={-1.32} />
        <Wheel x={1.02} z={-1.32} />
      </group>
    </group>
  );
}

function makeWedgeHull(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(-2.08, 0.22);
  s.lineTo(-2.12, 0.68);
  s.quadraticCurveTo(-2.02, 1.0, -1.62, 1.02);
  s.lineTo(-1.28, 1.2);
  s.quadraticCurveTo(-0.85, 1.34, -0.42, 1.3);
  s.lineTo(-0.12, 1.24);
  s.lineTo(0.22, 0.58);
  s.quadraticCurveTo(1.15, 0.46, 1.92, 0.4);
  s.lineTo(2.16, 0.34);
  s.quadraticCurveTo(2.26, 0.24, 2.14, 0.17);
  s.lineTo(1.55, 0.16);
  s.lineTo(-1.55, 0.16);
  s.quadraticCurveTo(-2.02, 0.16, -2.08, 0.22);

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 1.88,
    bevelEnabled: true,
    bevelThickness: 0.13,
    bevelSize: 0.11,
    bevelSegments: 4,
    curveSegments: 14,
  });
  geo.translate(0, 0, -0.94);
  geo.rotateY(-Math.PI / 2);
  return geo;
}

function makeSmileTube(): THREE.TubeGeometry {
  const pts = [
    new THREE.Vector3(-1.05, 0.5, 1.52),
    new THREE.Vector3(-0.96, 0.38, 1.86),
    new THREE.Vector3(-0.58, 0.26, 2.08),
    new THREE.Vector3(0, 0.21, 2.16),
    new THREE.Vector3(0.58, 0.26, 2.08),
    new THREE.Vector3(0.96, 0.38, 1.86),
    new THREE.Vector3(1.05, 0.5, 1.52),
  ];
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.08, 12, false);
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, WHEEL_R, z]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.32, 22]} />
          <meshStandardMaterial color="#141414" roughness={0.68} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.34, 14]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
      </group>
    </group>
  );
}
