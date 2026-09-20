import { useLayoutEffect, useMemo, useRef } from "react";
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
      mat.color = new THREE.Color("#163445");
      mat.transparent = true;
      mat.opacity = Math.min(mat.opacity ?? 1, 0.82);
      mat.roughness = 0.08;
      mat.metalness = 0.22;
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

function HeroRefit() {
  const bounds = useBounds();
  useLayoutEffect(() => {
    bounds.refresh().clip().reset().fit();
  }, [bounds]);
  return null;
}

export function CarModel({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = LOOK[kind];
  const { scene } = useGLTF("/models/rx7.glb");
  const wheels = useRef<Object3D[]>([]);
  const fronts = useRef<Object3D[]>([]);
  const roundel = useMemo(() => makeRoundelTexture(look.number), [look.number]);
  const inBounds = Boolean(useBounds());

  const fitted = useMemo(() => {
    const baked = bakeGltfCar(scene);
    paintBaked(baked.root, look.paint);
    const wrapper = new THREE.Group();
    wrapper.add(baked.root);
    fitCar(wrapper, 4.05, 1.34, 0.58);
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
    const zHood = center.z + size.z * 0.16;
    const hoodY = sampleY(0, zHood, box.min.y + size.y * 0.62);
    return { wrapper, box, size, center, hoodY, zHood };
  }, [scene, look.paint]);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.22;
    for (const wheel of wheels.current) wheel.rotation.x = -spin;
    for (const front of fronts.current) front.rotation.y = turn;
  });

  const { size, center, box, hoodY, zHood } = fitted;

  return (
    <Center disableY>
      <group>
        <primitive object={fitted.wrapper} />
        <mesh position={[-0.1, hoodY, zHood]}>
          <boxGeometry args={[0.09, 0.012, size.z * 0.62]} />
          <meshStandardMaterial color="#f3f3f3" roughness={0.28} />
        </mesh>
        <mesh position={[0.1, hoodY, zHood]}>
          <boxGeometry args={[0.09, 0.012, size.z * 0.62]} />
          <meshStandardMaterial color="#f3f3f3" roughness={0.28} />
        </mesh>
        <mesh position={[-box.max.x - 0.01, box.min.y + size.y * 0.5, center.z]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[0.28, 28]} />
          <meshBasicMaterial map={roundel} transparent />
        </mesh>
        <mesh position={[box.max.x + 0.01, box.min.y + size.y * 0.5, center.z]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.28, 28]} />
          <meshBasicMaterial map={roundel} transparent />
        </mesh>
        {inBounds ? <HeroRefit /> : null}
      </group>
    </Center>
  );
}

useGLTF.preload("/models/rx7.glb");
