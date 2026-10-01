import { TOTAL_LEVELS } from "../data/character.js";
import AudioEngine from "../engine/audio.js";

export function LevelsScreen({
  maxLevelUnlocked,
  selectedLevel,
  setSelectedLevel,
  levelStars,
  setScreen,
}) {
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  const handleLevelClick = (lv) => {
    AudioEngine.click();
    setSelectedLevel(lv);
    setScreen("gameScreen");
  };

  return (
    <div className="screen active" id="levelsScreen">
      <div className="screen-title heading">
        <button
          className="backbtn"
          onClick={() => {
            AudioEngine.click();
            setScreen("homeScreen");
          }}
        >
          ‹
        </button>
        Levels
      </div>
      <div className="levelsgrid">
        {levels.map((lv) => {
          const locked = lv > maxLevelUnlocked;
          const current = lv === selectedLevel;
          const stars = levelStars[lv] || 0;

          return (
            <div
              key={lv}
              className={`levelcell ${locked ? "locked" : ""} ${current ? "current" : ""}`}
              onClick={() => !locked && handleLevelClick(lv)}
            >
              {locked ? "🔒" : lv}
              {!locked && stars > 0 && (
                <div className="stars">
                  {"★".repeat(stars) + "☆".repeat(3 - stars)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
