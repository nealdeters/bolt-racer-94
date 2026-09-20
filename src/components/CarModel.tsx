import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Object3D } from "three";
import { buildRoundedGt40 } from "../game/roundedGt40";

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

export function CarModel({ kind, wheelSpin = 0, steer = 0, motion }: Props) {
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
