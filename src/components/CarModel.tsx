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
  player: { paint: "#c81010", number: "94" },
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
    const isBlack = /pure_black|black(?!_0_car)/.test(name) && !/car_paint/.test(name);
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
      mat.metalness = 0.46;
      mat.roughness = 0.22;
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
    fitCar(wrapper, 3.9, 1.16, 0.78);
    wheels.current = baked.wheels;
    fronts.current = baked.fronts;
    const box = new THREE.Box3().setFromObject(wrapper);
    return {
      wrapper,
      box,
      size: box.getSize(new THREE.Vector3()),
      center: box.getCenter(new THREE.Vector3()),
    };
  }, [scene, look.paint]);

  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.22;
    for (const wheel of wheels.current) wheel.rotation.x = -spin;
    for (const front of fronts.current) front.rotation.y = turn;
  });

  const { size, center, box } = fitted;

  return (
    <Center disableY>
      <group>
        <primitive object={fitted.wrapper} />
        <mesh position={[-0.07, box.max.y + 0.01, center.z]}>
          <boxGeometry args={[0.07, 0.012, size.z * 0.78]} />
          <meshStandardMaterial color="#f3f3f3" roughness={0.28} />
        </mesh>
        <mesh position={[0.07, box.max.y + 0.01, center.z]}>
          <boxGeometry args={[0.07, 0.012, size.z * 0.78]} />
          <meshStandardMaterial color="#f3f3f3" roughness={0.28} />
        </mesh>
        <mesh position={[-box.max.x - 0.01, box.min.y + size.y * 0.48, center.z]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[0.2, 28]} />
          <meshBasicMaterial map={roundel} transparent />
        </mesh>
        <mesh position={[box.max.x + 0.01, box.min.y + size.y * 0.48, center.z]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.2, 28]} />
          <meshBasicMaterial map={roundel} transparent />
        </mesh>
        {inBounds ? <HeroRefit /> : null}
      </group>
    </Center>
  );
}

useGLTF.preload("/models/rx7.glb");
