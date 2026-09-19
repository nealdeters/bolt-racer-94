import type { HudState } from "../game/types";

type Props = {
  hud: HudState;
};

export function Hud({ hud }: Props) {
  return (
    <div className="hud">
      <div className="hud-chip hud-lap">
        <span className="hud-label">LAP</span>
        <span className="hud-value">
          {hud.lap}/{hud.totalLaps}
        </span>
      </div>
      <div className={`hud-chip hud-place place-${hud.place}`}>
        <span className="hud-label">PLACE</span>
        <span className="hud-value">{hud.place === 1 ? "1st" : "2nd"}</span>
      </div>
      {hud.gamepad && <div className="hud-pad">Gamepad on</div>}

      {hud.phase === "countdown" && hud.countdown > 0 && (
        <div className="countdown" key={hud.countdown}>
          {hud.countdown}
        </div>
      )}
      {hud.goVisible && <div className="countdown go">GO!</div>}
      {hud.phase === "finish" && <div className="countdown finish-flash">FINISH!</div>}
    </div>
  );
}
