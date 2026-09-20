import { Component, Suspense, type ErrorInfo, type ReactNode, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Object3D } from "three";
import { fitMeshCar } from "../game/fitCar";
import { MESH } from "../game/gt40Hero";
import { buildRoundedGt40 } from "../game/roundedGt40";
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
  player: { paint: "#c21014", number: "94" },
  ai: { paint: "#1a4db8", number: "7" },
};

function matName(mesh: Mesh): string {
  const src = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return `${mesh.name} ${src.map((m) => (m && "name" in m ? String(m.name) : "")).join(" ")}`.toLowerCase();
}

function ProceduralFallback({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = LOOK[kind];
  const wheels = useRef<Object3D[]>([]);
  const fronts = useRef<Object3D[]>([]);
  const group = useMemo(() => {
    const built = buildRoundedGt40(look.paint, look.number);
    wheels.current = built.wheels;
    fronts.current = built.fronts;
    return built.group;
  }, [look.paint, look.number]);
  useFrame(() => {
    const spin = motion?.wheelSpin ?? wheelSpin;
    const turn = (motion?.steer ?? steer) * 0.22;
    for (const wheel of wheels.current) wheel.rotation.x = -spin;
    for (const front of fronts.current) front.rotation.y = turn;
  });
  return <primitive object={group} />;
}

class MeshErrorBoundary extends Component<Props & { children?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("GT40 mesh failed; using rounded fallback", error, info);
  }
  render(): ReactNode {
    if (this.state.failed) return <ProceduralFallback {...this.props} />;
    return this.props.children ?? null;
  }
}

function Gt40MeshCar({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
  const look = LOOK[kind];
  const gltf = useGLTF(MESH.url);
  const wheels = useRef<Object3D[]>([]);
  const fronts = useRef<Object3D[]>([]);

  const root = useMemo(() => {
    const wrapper = new THREE.Group();
    const scene = gltf.scene.clone(true);
    const wheelNodes: Object3D[] = [];
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const src = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const next = src.map((m) => (m as THREE.Material).clone());
      mesh.material = next.length === 1 ? next[0] : next;
      const name = matName(mesh);
      const isGlass = /window_glass/.test(name);
      const isLight = /lights_/.test(name);
      const isTyre = /tyre|tire/.test(name);
      const isWheel = /tarmac_wheel|discs|caliper/.test(name);
      const keepStock = isGlass || isLight || isTyre || isWheel || /suspension|cabin/.test(name);
      for (const mat of next) {
        const std = mat as THREE.MeshStandardMaterial;
        if (!("color" in std)) continue;
        if (isGlass) {
          std.color = new THREE.Color("#101c28");
          std.transparent = true;
          std.opacity = 0.78;
          if ("roughness" in std) std.roughness = 0.05;
          if ("metalness" in std) std.metalness = 0.55;
          if ("envMapIntensity" in std) std.envMapIntensity = 1.35;
          if ("emissive" in std) {
            std.emissive = new THREE.Color("#0c1a28");
            std.emissiveIntensity = 0.18;
          }
        } else if (isLight) {
          if (/glass/.test(name) && "emissive" in std) {
            std.emissive = new THREE.Color("#e8c56a");
            std.emissiveIntensity = 0.55;
          }
        } else if (isTyre) {
          std.color = new THREE.Color("#1a1a1a");
          if ("roughness" in std) std.roughness = 0.92;
          if ("metalness" in std) std.metalness = 0.04;
        } else if (isWheel) {
          if ("metalness" in std) std.metalness = Math.max(std.metalness ?? 0, 0.55);
          if ("roughness" in std) std.roughness = Math.min(std.roughness ?? 1, 0.4);
        } else if (!keepStock) {
          std.color = new THREE.Color(look.paint);
          if ("metalness" in std) std.metalness = MESH.paintMetal;
          if ("roughness" in std) std.roughness = MESH.paintRough;
        }
      }
      if (isTyre || isWheel) wheelNodes.push(mesh);
    });
    const fitted = new THREE.Group();
    fitted.add(scene);
    wrapper.add(fitted);
    fitMeshCar(fitted, MESH.length);

    fitted.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(fitted);
    const size = box.getSize(new THREE.Vector3());
    const y = box.min.y + size.y * MESH.roundelYFrac;
    const z = (box.min.z + box.max.z) * 0.5 + size.z * MESH.roundelZFrac;
    const radius = size.y * MESH.roundelRFrac;
    const roundelTex = makeRoundelTexture(look.number);
    const roundelMat = new THREE.MeshBasicMaterial({
      map: roundelTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    for (const side of [-1, 1] as const) {
      const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 28), roundelMat);
      disc.position.set(
        side > 0 ? box.max.x + MESH.roundelOut : box.min.x - MESH.roundelOut,
        y,
        z,
      );
      disc.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      wrapper.add(disc);
    }

    wheels.current = wheelNodes;
    fronts.current = [];
    return wrapper;
  }, [gltf.scene, look.paint, look.number]);

  useFrame(() => {
    void (motion?.wheelSpin ?? wheelSpin);
    void (motion?.steer ?? steer);
  });

  return <primitive object={root} />;
}

export function CarModel(props: Props) {
  return (
    <MeshErrorBoundary {...props}>
      <Suspense fallback={null}>
        <Gt40MeshCar {...props} />
      </Suspense>
    </MeshErrorBoundary>
  );
}

useGLTF.preload(MESH.url);
