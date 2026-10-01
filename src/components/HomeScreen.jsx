import { useEffect, useRef, useState } from "react";
import { CHAR_DEFS } from "../data/character.js";
import { THEMES } from "../data/themes.js";
import { drawCharacter, drawSky } from "../engine/drawcharacter.js";
import AudioEngine from "../engine/audio.js";

export function HomeScreen({
  coins,
  selectedChar,
  setSelectedChar,
  ownedChars,
  selectedLevel,
  maxLevelUnlocked,
  setScreen,
}) {
  const canvasRef = useRef(null);
  const [previewIndex, setPreviewIndex] = useState(() => {
    const idx = CHAR_DEFS.findIndex((c) => c.id === selectedChar);
    return idx >= 0 ? idx : 0;
  });

  // Handle preview animation loop
  useEffect(() => {
    let animId;
    let previewAnim = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const wrap = canvas.parentElement;
      if (!wrap) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      previewAnim += 0.07;
      const theme = THEMES[(previewIndex * 3) % THEMES.length];
      const def = CHAR_DEFS[previewIndex] || CHAR_DEFS[0];

      drawSky(ctx, w, h, theme, previewAnim * 0.2);
      drawCharacter(
        ctx,
        def,
        w / 2,
        h / 2 + 6,
        92,
        previewAnim,
        Math.sin(previewAnim * 0.7) * 0.06,
        false,
      );

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [previewIndex]);

  const handlePrevChar = () => {
    AudioEngine.click();
    const newIdx = (previewIndex - 1 + CHAR_DEFS.length) % CHAR_DEFS.length;
    setPreviewIndex(newIdx);
    const def = CHAR_DEFS[newIdx];
    if (ownedChars.includes(def.id)) {
      setSelectedChar(def.id);
    }
  };

  const handleNextChar = () => {
    AudioEngine.click();
    const newIdx = (previewIndex + 1) % CHAR_DEFS.length;
    setPreviewIndex(newIdx);
    const def = CHAR_DEFS[newIdx];
    if (ownedChars.includes(def.id)) {
      setSelectedChar(def.id);
    }
  };

  const activeLevel = Math.min(selectedLevel || 1, maxLevelUnlocked || 1);

  return (
    <div className="screen active" id="homeScreen">
      <div className="topbar">
        <div className="coinpill" id="coinDisplayHome">
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
        <button
          className="iconbtn"
          onClick={() => {
            AudioEngine.click();
            setScreen("settingsScreen");
          }}
          aria-label="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15a3 3 0 100-6 3 3 0 000 6z"
              stroke="#FFF8EE"
              strokeWidth="2"
            />
            <path
              d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.9-2.9l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.9-2.9l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.9 2.9l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"
              stroke="#FFF8EE"
              strokeWidth="1.6"
            />
          </svg>
        </button>
      </div>
      <h1 className="title heading">Flappy Dix</h1>
      <p className="subtitle">tap your way to the top</p>
      <div className="stage-preview" id="homePreview">
        <canvas ref={canvasRef} id="previewCanvas" />
        <button
          className="arrowbtn left"
          onClick={handlePrevChar}
          aria-label="Previous Character"
        >
          ‹
        </button>
        <button
          className="arrowbtn right"
          onClick={handleNextChar}
          aria-label="Next Character"
        >
          ›
        </button>
        <div className="charname" id="previewName">
          {CHAR_DEFS[previewIndex]?.name || "Dix"}
        </div>
      </div>
      <button
        className="btn primary"
        onClick={() => {
          AudioEngine.click();
          setScreen("gameScreen");
        }}
      >
        Play — Level <span>{activeLevel}</span>
      </button>
      <div className="navgrid">
        <button
          className="btn ghost"
          onClick={() => {
            AudioEngine.click();
            setScreen("levelsScreen");
          }}
        >
          Levels
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            AudioEngine.click();
            setScreen("shopScreen");
          }}
        >
          Shop
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            AudioEngine.click();
            setScreen("rulesScreen");
          }}
        >
          How to Play
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            AudioEngine.click();
            setScreen("settingsScreen");
          }}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
