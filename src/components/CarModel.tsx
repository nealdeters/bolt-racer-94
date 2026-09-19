import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import {
  createBodyHull,
  createCabinHull,
  createSmileLip,
  createSpoilerWing,
  createWindshield,
} from "../game/stockCarMesh";
import {
  makeBoltTexture,
  makeHeadlightDecal,
  makeHubTexture,
  makeNumberTexture,
  makeWindshieldFace,
} from "../game/textures";

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
    iris: "#3b86c4",
  },
  ai: {
    paint: "#1f6fff",
    accent: "#ff9a2e",
    number: "7",
    iris: "#2f6f9a",
  },
};

const PAINT = { metalness: 0.48, roughness: 0.18 } as const;

export function CarModel({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = LOOK[kind];
  const body = useMemo(() => createBodyHull(), []);
  const cabin = useMemo(() => createCabinHull(), []);
  const wing = useMemo(() => createSpoilerWing(), []);
  const glass = useMemo(() => createWindshield(), []);
  const lip = useMemo(() => createSmileLip(), []);
  const faceMap = useMemo(() => makeWindshieldFace(look.iris), [look.iris]);
  const numberMap = useMemo(() => makeNumberTexture(look.number, look.accent), [look.number, look.accent]);
  const boltMap = useMemo(() => makeBoltTexture(), []);
  const lampMap = useMemo(() => makeHeadlightDecal(), []);
  const hubMap = useMemo(() => makeHubTexture(), []);
  const wheels = useRef<Group>(null);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.35;
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.25, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} />
      </mesh>

      <mesh geometry={body}>
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>
      <mesh geometry={cabin}>
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>

      <mesh geometry={glass} position={[0, 0.8, 0.2]} rotation={[0.48, 0, 0]}>
        <meshBasicMaterial map={faceMap} />
      </mesh>

      <group position={[0, 0.3, 1.58]}>
        <mesh scale={[1.05, 0.72, 0.85]}>
          <sphereGeometry args={[0.34, 20, 14]} />
          <meshStandardMaterial color="#141414" roughness={0.7} />
        </mesh>
        <mesh geometry={lip} position={[0, 0.02, 0.08]}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.01, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.034, 0.72, 6, 12]} />
          <meshStandardMaterial color="#f6f6f6" roughness={0.28} />
        </mesh>
      </group>

      <mesh position={[-0.78, 0.46, 1.4]} rotation={[0.12, 0.42, 0]}>
        <planeGeometry args={[0.3, 0.17]} />
        <meshBasicMaterial map={lampMap} transparent />
      </mesh>
      <mesh position={[0.78, 0.46, 1.4]} rotation={[0.12, -0.42, 0]}>
        <planeGeometry args={[0.3, 0.17]} />
        <meshBasicMaterial map={lampMap} transparent />
      </mesh>

      <mesh geometry={wing} position={[0, 1.28, -1.6]} rotation={[0.08, 0, 0]}>
        <meshStandardMaterial color={look.paint} {...PAINT} />
      </mesh>
      <mesh position={[-0.46, 0.9, -1.54]} rotation={[0.12, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.72, 10]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.46, 0.9, -1.54]} rotation={[0.12, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.72, 10]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      <mesh position={[-0.88, 0.52, -0.42]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.95, 0.62]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>
      <mesh position={[0.88, 0.52, -0.42]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.95, 0.62]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>
      <mesh position={[0, 1.105, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.48]} />
        <meshBasicMaterial map={numberMap} transparent />
      </mesh>

      {kind === "player" && (
        <>
          <mesh position={[-0.9, 0.48, 0.22]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.05, 1.15]} />
            <meshBasicMaterial map={boltMap} transparent />
          </mesh>
          <mesh position={[0.9, 0.48, 0.22]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.05, 1.15]} />
            <meshBasicMaterial map={boltMap} transparent />
          </mesh>
        </>
      )}

      <group ref={wheels}>
        <Wheel x={-0.98} z={1.08} hubMap={hubMap} />
        <Wheel x={0.98} z={1.08} hubMap={hubMap} />
        <Wheel x={-0.98} z={-1.1} hubMap={hubMap} />
        <Wheel x={0.98} z={-1.1} hubMap={hubMap} />
      </group>
    </group>
  );
}

function Wheel({
  x,
  z,
  hubMap,
}: {
  x: number;
  z: number;
  hubMap: ReturnType<typeof makeHubTexture>;
}) {
  return (
    <group position={[x, 0.32, z]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.32, 0.32, 0.24, 24]} />
          <meshStandardMaterial color="#111111" roughness={0.72} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.26, 16]} />
          <meshStandardMaterial map={hubMap} roughness={0.4} metalness={0.25} />
        </mesh>
      </group>
    </group>
  );
}
