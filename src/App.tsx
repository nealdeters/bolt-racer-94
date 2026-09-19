import { useState } from "react";
import { Menu } from "./components/Menu";
import { Race } from "./components/Race";
import { Results } from "./components/Results";
import { CarHero } from "./components/CarHero";
import type { RaceResult, TrackId } from "./game/types";

type Screen = "menu" | "race" | "results";

export default function App() {
  const shot = new URLSearchParams(window.location.search).has("shot");
  const [screen, setScreen] = useState<Screen>("menu");
  const [trackId, setTrackId] = useState<TrackId>("oval");
  const [result, setResult] = useState<RaceResult | null>(null);
  const [raceKey, setRaceKey] = useState(0);

  const startRace = (id: TrackId) => {
    setTrackId(id);
    setResult(null);
    setRaceKey((n) => n + 1);
    setScreen("race");
  };

  if (shot) {
    return (
      <div className="app shot-app">
        <CarHero />
      </div>
    );
  }

  return (
    <div className="app">
      {screen === "menu" && <Menu onPick={startRace} />}
      {screen === "race" && (
        <Race
          key={raceKey}
          trackId={trackId}
          onFinish={(next) => {
            setResult(next);
            setScreen("results");
          }}
        />
      )}
      {screen === "results" && result && (
        <Results result={result} onAgain={() => startRace(trackId)} onMenu={() => setScreen("menu")} />
      )}
    </div>
  );
}
