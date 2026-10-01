import AudioEngine from "../engine/audio.js";

export function RulesScreen({ setScreen }) {
  return (
    <div className="screen active" id="rulesScreen">
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
        How to Play
      </div>
      <div className="rulesbox">
        <div className="rule-row">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#43D9A3" />
            <path
              d="M12 6v6l4 2"
              stroke="#0E3B2E"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div>
            <div className="rt">Tap to flap</div>
            <div className="rd">
              One quick tap gives a small flap. Tap twice fast for a bigger flap
              that lifts you higher.
            </div>
          </div>
        </div>
        <div className="rule-row">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="4" y="3" width="6" height="18" rx="1.5" fill="#43D9A3" />
            <rect x="14" y="3" width="6" height="18" rx="1.5" fill="#43D9A3" />
          </svg>
          <div>
            <div className="rt">Dodge the obstacles</div>
            <div className="rd">
              Slip through the gaps. From level 4 onward, some obstacles drift up
              and down — time your flaps.
            </div>
          </div>
        </div>
        <div className="rule-row">
          <svg viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="8"
              fill="#FFC857"
              stroke="#B4860B"
              strokeWidth="2"
            />
          </svg>
          <div>
            <div className="rt">Collect coins</div>
            <div className="rd">
              Every obstacle you clear earns a coin. Spend coins in the Shop to
              unlock new characters.
            </div>
          </div>
        </div>
        <div className="rule-row">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 18c4-10 12-10 16 0"
              stroke="#FF6B5B"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="12" cy="8" r="3" fill="#FF6B5B" />
          </svg>
          <div>
            <div className="rt">Climb the levels</div>
            <div className="rd">
              Clear a level's target to unlock the next. The sky changes every 3
              levels, and things get faster and tighter as you climb — 500
              levels in all.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
