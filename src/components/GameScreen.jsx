import { useEffect, useRef, useState, useCallback } from "react";
import { CHAR_DEFS, TOTAL_LEVELS } from "../data/character.js";
import { difficultyForLevel } from "../data/difficulty.js";
import { themeForLevel } from "../data/themes.js";
import { drawCharacter, drawSky, drawPipe } from "../engine/drawcharacter.js";
import AudioEngine from "../engine/audio.js";

export function GameScreen({
  coins,
  setCoins,
  selectedChar,
  selectedLevel,
  setSelectedLevel,
  maxLevelUnlocked,
  setMaxLevelUnlocked,
  levelStars,
  setLevelStars,
  settings,
  setSettings,
  setScreen,
  toastMsg,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  const [score, setScore] = useState(0);
  const [coinsRun, setCoinsRun] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [bonusCoins, setBonusCoins] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Mutable Game Engine state reference
  const gameStateRef = useRef(null);
  const lastTapTimeRef = useRef(0);
  const animFrameIdRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  // Keep changing values (settings, callbacks) in refs so the main game-loop
  // effect never re-runs mid-game (which would reset all game state).
  const settingsRef = useRef(settings);
  const levelStarsRef = useRef(levelStars);
  const maxLevelUnlockedRef = useRef(maxLevelUnlocked);
  const handleGameOverRef = useRef(() => {});

  // Clamp played level to the highest unlocked one (same as original)
  const activeLevel = Math.min(selectedLevel || 1, maxLevelUnlocked || 1);

  // Initialize game state object
  const createFreshGameState = useCallback(
    (lvl) => {
      const diff = difficultyForLevel(lvl);
      const theme = themeForLevel(lvl);
      const charDef =
        CHAR_DEFS.find((c) => c.id === selectedChar) || CHAR_DEFS[0];

      return {
        level: lvl,
        diff,
        theme,
        running: false,
        started: false,
        gameOver: false,
        finished: false,
        charDef,
        bx: 100,
        by: 250,
        bvy: 0,
        rot: 0,
        pipes: [],
        score: 0,
        coinsThisRun: 0,
        distSinceSpawn: 0,
        t: 0,
        wingPhase: 0,
        blink: false,
        blinkTimer: 2 + Math.random() * 2,
        shake: 0,
      };
    },
    [selectedChar],
  );

  const restartGame = useCallback(
    (lvl) => {
      AudioEngine.resumeCtx();
      gameStateRef.current = createFreshGameState(lvl);
      setScore(0);
      setCoinsRun(0);
      setIsPaused(false);
      setGameOver(false);
      setLevelCleared(false);
      setStarsEarned(0);
      setBonusCoins(0);
      setGameStarted(false);

      if (settingsRef.current.musicOn) {
        AudioEngine.startMusic(settingsRef.current);
      }
    },
    [createFreshGameState],
  );

  // Flap action logic
  const handleFlap = useCallback((big) => {
    const G = gameStateRef.current;
    if (!G || G.gameOver) return;

    if (!G.running) {
      G.running = true;
      G.started = true;
      setGameStarted(true);
    }
    G.bvy = big ? -10.5 : -7.6;
    AudioEngine.flap(big);
  }, []);

  const triggerTap = useCallback(() => {
    if (isPaused) return;
    const now = performance.now();
    const big = now - lastTapTimeRef.current < 280;
    lastTapTimeRef.current = now;
    handleFlap(big);
  }, [handleFlap, isPaused]);

  // Handle Game Over logic
  const handleGameOver = useCallback(() => {
    const G = gameStateRef.current;
    if (!G || G.gameOver) return;
    G.gameOver = true;
    G.running = false;
    G.shake = 12;
    AudioEngine.crash();
    AudioEngine.stopMusic();

    const target = G.diff.target;
    const reached = G.score >= target;
    let stars = 0;
    if (reached) {
      stars = 1;
      if (G.score >= target * 1.5) stars = 2;
      if (G.score >= target * 2.5) stars = 3;
    }

    let bonus = 0;
    if (reached) {
      const lv = G.level;
      const firstTime = !(levelStarsRef.current[lv] && levelStarsRef.current[lv] > 0);
      if (firstTime) bonus = 15;

      if (lv === maxLevelUnlockedRef.current && lv < TOTAL_LEVELS) {
        setMaxLevelUnlocked(lv + 1);
      }
      setLevelStars((prev) => ({
        ...prev,
        [lv]: Math.max(prev[lv] || 0, stars),
      }));
      setCoins((c) => c + bonus);
      AudioEngine.levelup();
    }

    setTimeout(() => {
      setLevelCleared(reached);
      setStarsEarned(stars);
      setBonusCoins(bonus);
      setGameOver(true);
    }, 420);
  }, [setCoins, setLevelStars, setMaxLevelUnlocked]);

  // Sync refs after render (kept out of render to satisfy react-hooks/refs)
  useEffect(() => {
    settingsRef.current = settings;
    levelStarsRef.current = levelStars;
    maxLevelUnlockedRef.current = maxLevelUnlocked;
    handleGameOverRef.current = handleGameOver;
  }, [settings, levelStars, maxLevelUnlocked, handleGameOver]);

  // Pipe Spawning
  const spawnPipe = (GW, GH) => {
    const G = gameStateRef.current;
    if (!G) return;
    const gap = G.diff.gap;
    const margin = 60;
    const gapY = margin + Math.random() * (GH - margin * 2 - gap) + gap / 2;
    const moving = G.diff.moving && Math.random() < 0.6;

    G.pipes.push({
      x: GW + 40,
      w: 56,
      baseGapY: gapY,
      gapY: gapY,
      gap: gap,
      moving,
      phase: Math.random() * Math.PI * 2,
      amp: G.diff.moveAmp,
      passed: false,
    });
  };

  // Main Physics & Render Loop
  useEffect(() => {
    AudioEngine.resumeCtx();
    gameStateRef.current = createFreshGameState(activeLevel);
    if (settingsRef.current.musicOn) {
      AudioEngine.startMusic(settingsRef.current);
    }

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");

    const loop = (ts) => {
      const G = gameStateRef.current;
      if (!G) return;

      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = ts;
      let dt = (ts - lastFrameTimeRef.current) / 16.6667;
      dt = Math.min(dt, 2.2);
      lastFrameTimeRef.current = ts;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const GW = wrap.clientWidth;
      const GH = wrap.clientHeight;

      if (canvas.width !== GW * dpr || canvas.height !== GH * dpr) {
        canvas.width = GW * dpr;
        canvas.height = GH * dpr;
        G.bx = GW * 0.28;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // UPDATE PHYSICS
      G.t += dt;
      G.wingPhase += (G.running ? 0.35 : 0.12) * dt;
      G.blinkTimer -= dt / 60;
      if (G.blinkTimer <= 0) {
        G.blink = true;
        setTimeout(() => {
          if (G) G.blink = false;
        }, 120);
        G.blinkTimer = 2 + Math.random() * 3;
      }

      if (G.running) {
        const gravity = 0.62;
        G.bvy += gravity * dt;
        G.by += G.bvy * dt;
        G.rot = Math.max(-0.5, Math.min(1.3, G.bvy * 0.08));

        // Pipe spawning
        G.distSinceSpawn += G.diff.speed * dt;
        if (G.distSinceSpawn >= G.diff.spawnGapPx) {
          G.distSinceSpawn = 0;
          spawnPipe(GW, GH);
        }

        // Move pipes
        for (const p of G.pipes) {
          p.x -= G.diff.speed * dt;
          if (p.moving) {
            p.phase += G.diff.moveSpeed * dt;
            p.gapY = p.baseGapY + Math.sin(p.phase) * p.amp;
          }
          if (!p.passed && p.x + p.w < G.bx - 14) {
            p.passed = true;
            G.score++;
            G.coinsThisRun++;
            setScore(G.score);
            setCoinsRun(G.coinsThisRun);
            setCoins((c) => c + 1);
            AudioEngine.score();
          }
        }
        G.pipes = G.pipes.filter((p) => p.x > -80);

        // Check Collisions
        const r = 15;
        for (const p of G.pipes) {
          if (G.bx + r > p.x && G.bx - r < p.x + p.w) {
            const topH = p.gapY - p.gap / 2;
            const botY = p.gapY + p.gap / 2;
            if (G.by - r < topH || G.by + r > botY) {
              handleGameOverRef.current();
              break;
            }
          }
        }

        // Bounds check
        if (!G.gameOver && (G.by > GH + 40 || G.by < -40)) {
          handleGameOverRef.current();
        }
      }

      // RENDER CANVAS
      ctx.save();
      if (G.shake > 0) {
        const dx = (Math.random() - 0.5) * G.shake;
        const dy = (Math.random() - 0.5) * G.shake;
        ctx.translate(dx, dy);
        G.shake *= 0.85;
        if (G.shake < 0.5) G.shake = 0;
      }

      drawSky(ctx, GW, GH, G.theme, G.t);
      for (const p of G.pipes) {
        drawPipe(ctx, p, GH);
      }

      if (G.gameOver) {
        drawCharacter(
          ctx,
          G.charDef,
          G.bx,
          G.by,
          46,
          G.wingPhase,
          (Math.PI / 2) * 0.9,
          false,
        );
      } else {
        drawCharacter(
          ctx,
          G.charDef,
          G.bx,
          G.by,
          46,
          G.wingPhase,
          G.rot * 0.5,
          G.blink,
        );
      }
      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      AudioEngine.stopMusic();
    };
  }, [createFreshGameState, activeLevel, setCoins]);

  // Keyboard Spacebar input listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        triggerTap();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerTap]);

  // Pause Handlers
  const handlePause = () => {
    const G = gameStateRef.current;
    if (!G || G.gameOver) return;
    G.running = false;
    setIsPaused(true);
    AudioEngine.click();
  };

  const handleResume = () => {
    const G = gameStateRef.current;
    if (!G || G.gameOver) return;
    if (G.started) G.running = true;
    setIsPaused(false);
    lastFrameTimeRef.current = 0;
    AudioEngine.click();
  };

  const handleQuit = () => {
    AudioEngine.click();
    AudioEngine.stopMusic();
    setScreen("homeScreen");
  };

  const handleRetry = () => {
    AudioEngine.click();
    restartGame(activeLevel);
  };

  const handleNextLevel = () => {
    AudioEngine.click();
    const nextLv = activeLevel + 1;
    setSelectedLevel(nextLv);
    restartGame(nextLv);
  };

  // Audio settings within pause menu
  const safeSettings = settings || {
    musicOn: true,
    sfxOn: true,
    musicVol: 60,
    sfxVol: 80,
  };

  const updatePauseMusicToggle = () => {
    const newSettings = { ...safeSettings, musicOn: !safeSettings.musicOn };
    setSettings(newSettings);
    AudioEngine.updateSettings(newSettings);
    if (newSettings.musicOn) {
      AudioEngine.startMusic(newSettings);
    } else {
      AudioEngine.stopMusic();
    }
  };

  const updatePauseSfxToggle = () => {
    const newSettings = { ...safeSettings, sfxOn: !safeSettings.sfxOn };
    setSettings(newSettings);
    AudioEngine.updateSettings(newSettings);
  };

  return (
    <div className="screen active" id="gameScreen">
      <div ref={wrapRef} id="gameCanvasWrap">
        <canvas
          ref={canvasRef}
          id="gameCanvas"
          onPointerDown={(e) => {
            e.preventDefault();
            triggerTap();
          }}
        />

        {/* HUD */}
        <div className="hud">
          <div className="hud-left">
            <div className="hud-chip" id="hudLevel">
              Lv {activeLevel}
            </div>
          </div>
          <div className="hud-right pausebtn-wrap">
            <div className="hud-chip" id="hudCoins">
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
              <span>{coins}</span>
            </div>
            <button className="iconbtn" onClick={handlePause} id="pauseBtn">
              ❚❚
            </button>
          </div>
        </div>

        <div className="scorebig" id="scoreBig">
          {score}
        </div>

        {toastMsg && <div className="toast show">{toastMsg}</div>}

        {!gameStarted && !gameOver && !isPaused && (
          <div className="startbanner" id="startBanner">
            <div className="tapmsg">Tap to flap</div>
          </div>
        )}

        {/* PAUSE OVERLAY */}
        {isPaused && (
          <div className="overlay active" id="pauseOverlay">
            <div className="overlay-card">
              <h2 className="heading">Paused</h2>
              <div className="setting-row" style={{ textAlign: "left" }}>
                <div className="sr-top">
                  <span className="sr-label">Music</span>
                  <button
                    className={`toggle ${safeSettings.musicOn ? "on" : ""}`}
                    onClick={updatePauseMusicToggle}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={safeSettings.musicVol}
                  onChange={(e) => {
                    const ns = {
                      ...safeSettings,
                      musicVol: parseInt(e.target.value, 10),
                    };
                    setSettings(ns);
                    AudioEngine.updateSettings(ns);
                  }}
                />
              </div>

              <div className="setting-row" style={{ textAlign: "left" }}>
                <div className="sr-top">
                  <span className="sr-label">Sound effects</span>
                  <button
                    className={`toggle ${safeSettings.sfxOn ? "on" : ""}`}
                    onClick={updatePauseSfxToggle}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={safeSettings.sfxVol}
                  onChange={(e) => {
                    const ns = {
                      ...safeSettings,
                      sfxVol: parseInt(e.target.value, 10),
                    };
                    setSettings(ns);
                    AudioEngine.updateSettings(ns);
                  }}
                />
              </div>

              <button className="btn primary" onClick={handleResume}>
                Resume
              </button>
              <button
                className="btn ghost"
                onClick={handleQuit}
                style={{ margin: 0 }}
              >
                Quit to Home
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {gameOver && (
          <div className="overlay active" id="gameOverOverlay">
            <div className="overlay-card">
              <h2 className="heading" id="goTitle">
                {levelCleared ? "Level Complete!" : "Crashed!"}
              </h2>
              <div className="stars-row" id="goStars">
                {levelCleared
                  ? "★".repeat(starsEarned) + "☆".repeat(3 - starsEarned)
                  : "☆☆☆"}
              </div>
              <div className="stat-row">
                <span>Score</span>
                <span>{score}</span>
              </div>
              <div className="stat-row">
                <span>Coins earned</span>
                <span>+{coinsRun + bonusCoins}</span>
              </div>
              {levelCleared && activeLevel < TOTAL_LEVELS && (
                <button className="btn primary" onClick={handleNextLevel}>
                  Next Level
                </button>
              )}
              <button className="btn ghost" onClick={handleRetry}>
                Retry
              </button>
              <button
                className="btn ghost"
                onClick={handleQuit}
                style={{ margin: 0 }}
              >
                Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
