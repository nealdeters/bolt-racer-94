import { useMemo, useRef } from "react";
import { Center, useBounds, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Object3D } from "three";
import { bakeGltfCar } from "../game/bakeGltfCar";
import { fitCar } from "../game/fitCar";
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
  player: { paint: "#b10d0d", number: "94" },
  ai: { paint: "#1a4db8", number: "7" },
};

useGLTF.setDecoderPath("/draco/");

function paintBaked(root: Object3D, paint: string): void {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const mat = (src as THREE.MeshStandardMaterial).clone();
    const name = `${mesh.name} ${mat.name ?? ""}`.toLowerCase();
    const isGlass = /glass|window|wind|screen|canopy/.test(name);
    const isLight = /lamp|light|head|emit/.test(name);
    const isWheel = /wheel|tire|tyre|rim|circle\.\d+/.test(name);
    const isBlack = /pure_black|black/.test(name) && !/car_paint/.test(name);
    if (isGlass) {
      mat.color = new THREE.Color("#0c1a24");
      mat.transparent = true;
      mat.opacity = Math.min(mat.opacity ?? 1, 0.92);
      mat.roughness = 0.06;
      mat.metalness = 0.28;
    } else if (isLight || isWheel || isBlack) {
      // keep trim, lamps, and tires
    } else {
      mat.color = new THREE.Color(paint);
      mat.metalness = 0.58;
      mat.roughness = 0.18;
    }
    mesh.material = mat;
  });
}

function FillHero() {
  const bounds = useBounds();
  const done = useRef(false);
  useFrame(() => {
    if (!bounds || done.current) return;
    bounds.refresh();
    const { center, size } = bounds.getSize();
    if (size.y < 0.25) return;
    const fit = new THREE.Box3().setFromCenterAndSize(
      center,
      new THREE.Vector3(size.x * 0.92, size.y * 1.18, size.z * 0.52),
    );
    bounds.refresh(fit).clip().reset().fit();
    done.current = true;
  });
  return null;
}

export function CarModel({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = LOOK[kind];
  const { scene } = useGLTF("/models/rx7.glb");
  const wheels = useRef<Object3D[]>([]);
  const fronts = useRef<Object3D[]>([]);
  const roundel = useMemo(() => makeRoundelTexture(look.number), [look.number]);
  const inHero = Boolean(useBounds());

  const fitted = useMemo(() => {
    const baked = bakeGltfCar(scene);
    paintBaked(baked.root, look.paint);
    const wrapper = new THREE.Group();
    wrapper.add(baked.root);
    fitCar(wrapper, 4.05, 1.42, 0.48);
    wheels.current = baked.wheels;
    fronts.current = baked.fronts;
    const box = new THREE.Box3().setFromObject(wrapper);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const paints: Mesh[] = [];
    wrapper.traverse((obj) => {
      const mesh = obj as Mesh;
      if (mesh.isMesh && /car_paint/i.test(mesh.name)) paints.push(mesh);
    });
    const ray = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);
    const sampleY = (x: number, z: number, fallback: number) => {
      ray.set(new THREE.Vector3(x, box.max.y + 2, z), down);
      const hit = ray.intersectObjects(paints, true)[0];
      return hit ? hit.point.y + 0.014 : fallback;
    };
    const zStations = [0.34, 0.22, 0.1, -0.02].map((t) => center.z + size.z * t);
    const stripeSegs = zStations.map((z) => ({
      z,
      y: sampleY(0.1, z, box.min.y + size.y * 0.55),
    }));
    const lights: { x: number; y: number; z: number }[] = [];
    wrapper.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh || !/white_light|side_lights/i.test(mesh.name)) return;
      const c = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
      lights.push({ x: c.x, y: c.y, z: c.z });
    });
    return { wrapper, box, size, center, stripeSegs, lights };
  }, [scene, look.paint]);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.22;
    for (const wheel of wheels.current) wheel.rotation.x = -spin;
    for (const front of fronts.current) front.rotation.y = turn;
  });

  const { size, center, box, stripeSegs, lights } = fitted;
  const stripeLen = size.z * 0.14;
  const leftLamp = lights.filter((l) => l.x < 0).sort((a, b) => b.z - a.z)[0];
  const rightLamp = lights.filter((l) => l.x > 0).sort((a, b) => b.z - a.z)[0];
  const lampPair = [leftLamp, rightLamp].filter(
    (l): l is { x: number; y: number; z: number } => Boolean(l) && Math.abs(l.x) > 0.25,
  );

  return (
    <Center disableY>
      <group>
        <primitive object={fitted.wrapper} />
        {stripeSegs.map((seg, i) => (
          <group key={`stripe-${i}`}>
            <mesh position={[-0.1, seg.y, seg.z]}>
              <boxGeometry args={[0.09, 0.01, stripeLen]} />
              <meshStandardMaterial color="#f4f4f4" roughness={0.28} />
            </mesh>
            <mesh position={[0.1, seg.y, seg.z]}>
              <boxGeometry args={[0.09, 0.01, stripeLen]} />
              <meshStandardMaterial color="#f4f4f4" roughness={0.28} />
            </mesh>
          </group>
        ))}
        {lampPair.map((lamp, i) => (
          <group key={`lamp-${i}`} position={[lamp.x, lamp.y, lamp.z]}>
            <mesh>
              <sphereGeometry args={[0.07, 20, 16]} />
              <meshStandardMaterial color="#d8c48a" emissive="#b8923a" emissiveIntensity={0.45} metalness={0.6} roughness={0.16} />
            </mesh>
          </group>
        ))}
        <mesh position={[-box.max.x - 0.01, box.min.y + size.y * 0.5, center.z]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[0.28, 28]} />
          <meshBasicMaterial map={roundel} transparent />
        </mesh>
        <mesh position={[box.max.x + 0.01, box.min.y + size.y * 0.5, center.z]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.28, 28]} />
          <meshBasicMaterial map={roundel} transparent />
        </mesh>
        {inHero ? <FillHero /> : null}
      </group>
    </Center>
  );
}

useGLTF.preload("/models/rx7.glb");
