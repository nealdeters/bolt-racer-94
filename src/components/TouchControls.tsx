import { useRef, type PointerEvent } from "react";
import { setTouchBrake, setTouchSteer, setTouchThrottle } from "../game/input";

const steerHeld = { left: false, right: false };

function syncSteer(): void {
  setTouchSteer((steerHeld.right ? 1 : 0) - (steerHeld.left ? 1 : 0));
}

export function TouchControls() {
  return (
    <div className="touch-controls" aria-hidden="false">
      <div className="steer-cluster">
        <HoldButton
          className="touch-btn steer-btn"
          label="◀"
          onHold={(down) => {
            steerHeld.left = down;
            syncSteer();
          }}
        />
        <HoldButton
          className="touch-btn steer-btn"
          label="▶"
          onHold={(down) => {
            steerHeld.right = down;
            syncSteer();
          }}
        />
      </div>
      <div className="pedal-cluster">
        <HoldButton
          className="touch-btn brake-btn"
          label="STOP"
          onHold={(down) => {
            if (down) {
              setTouchThrottle(0);
              setTouchBrake(1);
            } else {
              setTouchBrake(0);
            }
          }}
        />
        <HoldButton
          className="touch-btn go-btn"
          label="GO"
          onHold={(down) => {
            if (down) {
              setTouchBrake(0);
              setTouchThrottle(1);
            }
          }}
        />
      </div>
    </div>
  );
}

function HoldButton({
  label,
  className,
  onHold,
}: {
  label: string;
  className: string;
  onHold: (down: boolean) => void;
}) {
  const holding = useRef(false);

  const press = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    holding.current = true;
    onHold(true);
  };

  const release = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!holding.current) return;
    holding.current = false;
    onHold(false);
  };

  return (
    <button
      type="button"
      className={className}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
}
