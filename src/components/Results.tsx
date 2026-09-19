import type { RaceResult } from "../game/types";

type Props = {
  result: RaceResult;
  onAgain: () => void;
  onMenu: () => void;
};

export function Results({ result, onAgain, onMenu }: Props) {
  const win = result.place === 1;
  return (
    <div className={`screen results-screen ${win ? "win" : "place-two"}`}>
      <p className="eyebrow">{result.trackName}</p>
      <h1>{win ? "You win!" : "Nice race!"}</h1>
      <p className="place-line">{result.place === 1 ? "1st place" : "2nd place"}</p>
      <p className="time-line">Time {formatTime(result.playerTime)}</p>
      <p className="cheer">{win ? "Red Bolt #94 zoomed to the finish!" : "So close! Race again?"}</p>
      <div className="result-actions">
        <button type="button" className="btn primary" onClick={onAgain}>
          Race again
        </button>
        <button type="button" className="btn" onClick={onMenu}>
          Tracks
        </button>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
}
