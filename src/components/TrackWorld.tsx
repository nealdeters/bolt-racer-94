import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { Sky } from "@react-three/drei";
import type { TrackRuntime } from "../game/trackRuntime";
import { makeBannerTexture, makeRoadTexture } from "../game/textures";
import { Building, Buoy, Cactus, Grandstand, Palm, Rock, Tree } from "./Decor";

type Props = {
  track: TrackRuntime;
};

export function TrackWorld({ track }: Props) {
  const { def } = track;
  const theme = def.theme;
  const road = useMemo(() => buildRoad(track), [track]);
  const walls = useMemo(() => buildWalls(track), [track]);
  const roadMap = useMemo(() => makeRoadTexture(theme.road, theme.roadLine), [theme.road, theme.roadLine]);
  const banner = useMemo(() => makeBannerTexture("START"), []);
  const start = track.samples[0];
  const startTan = track.tangents[0];
  const startHeading = Math.atan2(startTan.x, startTan.z);
  const props = useMemo(() => placeProps(track), [track]);

  roadMap.repeat.set(1, Math.max(18, Math.round(track.curve.getLength() / 10)));

  return (
    <group>
      <color attach="background" args={[theme.sky]} />
      <fog attach="fog" args={[theme.sky, 55, theme.fogFar]} />
      {theme.useSky && <Sky sunPosition={theme.sun} turbidity={6} rayleigh={1.4} />}
      <ambientLight intensity={theme.useSky ? 0.55 : 0.4} />
      <hemisphereLight args={[theme.sky, theme.ground, 0.75]} />
      <directionalLight
        position={theme.sun}
        intensity={def.id === "city" ? 0.9 : 1.35}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={140}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[220, 48]} />
        <meshStandardMaterial color={theme.ground} />
      </mesh>

      {theme.water && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[70, -0.02, 10]} receiveShadow>
          <circleGeometry args={[90, 40]} />
          <meshStandardMaterial color={theme.water} metalness={0.35} roughness={0.25} />
        </mesh>
      )}

      <mesh geometry={road} receiveShadow>
        <meshStandardMaterial map={roadMap} roughness={0.85} />
      </mesh>

      <mesh geometry={walls}>
        <meshStandardMaterial vertexColors roughness={0.55} />
      </mesh>

      <group position={[start.x, 0, start.z]} rotation={[0, startHeading, 0]}>
        <mesh position={[-def.width / 2 - 0.6, 2.2, 0]}>
          <boxGeometry args={[0.2, 4.4, 0.2]} />
          <meshStandardMaterial color="#f2f2f2" />
        </mesh>
        <mesh position={[def.width / 2 + 0.6, 2.2, 0]}>
          <boxGeometry args={[0.2, 4.4, 0.2]} />
          <meshStandardMaterial color="#f2f2f2" />
        </mesh>
        <mesh position={[0, 4.3, 0]}>
          <planeGeometry args={[def.width + 1.6, 1.1]} />
          <meshBasicMaterial map={banner} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <planeGeometry args={[def.width * 0.92, 1.4]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
      </group>

      {props}
    </group>
  );
}

function buildRoad(track: TrackRuntime): THREE.BufferGeometry {
  const segments = 200;
  const half = track.halfWidth;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = track.curve.getPointAt(t);
    const tan = track.curve.getTangentAt(t);
    const nx = -tan.z;
    const nz = tan.x;
    const len = Math.hypot(nx, nz) || 1;
    const lx = p.x + (nx / len) * half;
    const lz = p.z + (nz / len) * half;
    const rx = p.x - (nx / len) * half;
    const rz = p.z - (nz / len) * half;
    positions.push(lx, 0.03, lz, rx, 0.03, rz);
    uvs.push(0, t * 8, 1, t * 8);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

function buildWalls(track: TrackRuntime): THREE.BufferGeometry {
  const segments = 180;
  const positions: number[] = [];
  const colors: number[] = [];
  const index: number[] = [];
  const colorA = new THREE.Color(track.def.theme.barrierA);
  const colorB = new THREE.Color(track.def.theme.barrierB);
  const offset = track.halfWidth + 0.45;
  const height = 0.85;

  const addSide = (sign: number) => {
    const base = positions.length / 3;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = track.curve.getPointAt(t);
      const tan = track.curve.getTangentAt(t);
      const nx = -tan.z;
      const nz = tan.x;
      const len = Math.hypot(nx, nz) || 1;
      const x = p.x + sign * (nx / len) * offset;
      const z = p.z + sign * (nz / len) * offset;
      positions.push(x, 0, z, x, height, z);
      const stripe = i % 6 < 3 ? colorA : colorB;
      colors.push(stripe.r, stripe.g, stripe.b, stripe.r, stripe.g, stripe.b);
    }
    for (let i = 0; i < segments; i++) {
      const a = base + i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  };

  addSide(1);
  addSide(-1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

function placeProps(track: TrackRuntime): ReactNode[] {
  const id = track.def.id;
  const items: ReactNode[] = [];
  const count = id === "city" ? 22 : 18;

  for (let i = 0; i < count; i++) {
    const t = (i + 0.15) / count;
    const p = track.curve.getPointAt(t);
    const tan = track.curve.getTangentAt(t);
    const nx = -tan.z;
    const nz = tan.x;
    const outward = p.x * nx + p.z * nz >= 0 ? 1 : -1;
    const dist = track.halfWidth + 7 + (i % 3) * 2.4;
    const x = p.x + nx * outward * dist;
    const z = p.z + nz * outward * dist;
    const key = `${id}-p-${i}`;
    const pos: [number, number, number] = [x, 0, z];

    if (id === "oval") {
      if (i % 3 === 0) items.push(<Grandstand key={key} position={pos} />);
      else items.push(<Tree key={key} position={pos} scale={0.85 + (i % 3) * 0.15} />);
    } else if (id === "park") {
      items.push(<Tree key={key} position={pos} scale={0.9 + (i % 4) * 0.18} />);
    } else if (id === "desert") {
      if (i % 2 === 0) items.push(<Cactus key={key} position={pos} scale={1 + (i % 3) * 0.2} />);
      else items.push(<Rock key={key} position={pos} scale={0.7 + (i % 3) * 0.25} />);
    } else if (id === "seaside") {
      if (i % 2 === 0) items.push(<Palm key={key} position={pos} scale={0.95} />);
      else items.push(<Buoy key={key} position={[x * 0.25 + 62, 0.2, z * 0.4 + 8]} />);
    } else {
      const colors = ["#7b6cff", "#ff5ca8", "#6ecbff", "#ffd84d", "#ff8a1e"];
      items.push(
        <Building
          key={key}
          position={pos}
          size={[3.5 + (i % 3), 4 + (i % 5) * 1.4, 3.2]}
          color={colors[i % colors.length]}
        />,
      );
    }
  }
  return items;
}
