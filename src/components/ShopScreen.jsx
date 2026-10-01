import { useEffect, useRef } from "react";
import { CHAR_DEFS } from "../data/character.js";
import { drawCharacter } from "../engine/drawcharacter.js";
import AudioEngine from "../engine/audio.js";

function ShopCard({
  def,
  coins,
  setCoins,
  selectedChar,
  setSelectedChar,
  ownedChars,
  setOwnedChars,
  showToast,
}) {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);

  const owned = ownedChars.includes(def.id);
  const selected = selectedChar === def.id;

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    drawCharacter(ctx, def, 56, 60, 78, 0.6, -0.05, false);
  }, [def]);

  const handleClick = () => {
    if (owned) {
      AudioEngine.click();
      setSelectedChar(def.id);
    } else {
      if (coins >= def.price) {
        setCoins((c) => c - def.price);
        setOwnedChars((prev) => [...prev, def.id]);
        setSelectedChar(def.id);
        AudioEngine.unlock();
        showToast(`${def.name} unlocked!`);
      } else {
        AudioEngine.click();
        if (cardRef.current) {
          cardRef.current.animate(
            [
              { transform: "translateX(0)" },
              { transform: "translateX(-4px)" },
              { transform: "translateX(4px)" },
              { transform: "translateX(0)" },
            ],
            { duration: 220 },
          );
        }
      }
    }
  };

  return (
    <div
      ref={cardRef}
      className={`shopcard ${selected ? "selected" : ""} ${!owned ? "locked" : ""}`}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} width={112} height={112} />
      <div className="cname">{def.name}</div>
      {!owned ? (
        <>
          <div className="cprice">
            <svg viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="#FFC857"
                stroke="#B4860B"
                strokeWidth="2"
              />
            </svg>
            {def.price}
          </div>
          <div className="lock-badge">🔒</div>
        </>
      ) : selected ? (
        <div className="cprice" style={{ color: "var(--mint)" }}>
          Selected
        </div>
      ) : null}
    </div>
  );
}

export function ShopScreen({
  coins,
  setCoins,
  selectedChar,
  setSelectedChar,
  ownedChars,
  setOwnedChars,
  setScreen,
  showToast,
}) {
  return (
    <div className="screen active" id="shopScreen">
      <div className="topbar">
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
          Shop
        </div>
        <div className="coinpill" id="coinDisplayShop">
          <svg viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="#FFC857"
              stroke="#B4860B"
              strokeWidth="2"
            />
            <text
              x="12"
              y="16"
              fontSize="11"
              textAnchor="middle"
              fill="#B4860B"
              fontWeight="800"
            >
              ¢
            </text>
          </svg>
          <span>{coins}</span>
        </div>
      </div>
      <div className="shopgrid">
        {CHAR_DEFS.map((def) => (
          <ShopCard
            key={def.id}
            def={def}
            coins={coins}
            setCoins={setCoins}
            selectedChar={selectedChar}
            setSelectedChar={setSelectedChar}
            ownedChars={ownedChars}
            setOwnedChars={setOwnedChars}
            showToast={showToast}
          />
        ))}
      </div>
    </div>
  );
}
