import { useState, useEffect } from "react";
import { STORAGE_KEY } from "./data/character.js";
import { HomeScreen } from "./components/HomeScreen.jsx";
import { ShopScreen } from "./components/ShopScreen.jsx";
import { LevelsScreen } from "./components/LevelsScreen.jsx";
import { RulesScreen } from "./components/RulesScreen.jsx";
import { SettingsScreen } from "./components/SettingsScreen.jsx";
import { GameScreen } from "./components/GameScreen.jsx";
import AudioEngine from "./engine/audio.js";
import "./index.css";

const defaultState = () => ({
  coins: 0,
  maxLevelUnlocked: 1,
  selectedLevel: 1,
  ownedChars: ["bird"],
  selectedChar: "bird",
  levelStars: {},
  settings: { musicOn: true, sfxOn: true, musicVol: 60, sfxVol: 80 },
});

function loadInitialState() {
  const def = defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return def;
    const p = JSON.parse(raw);
    // Sanitize: only accept saved values of the expected type, so a corrupt or
    // outdated save can never crash the app on startup (blank page).
    return {
      coins: Number.isFinite(p.coins) ? p.coins : def.coins,
      maxLevelUnlocked:
        Number.isFinite(p.maxLevelUnlocked) && p.maxLevelUnlocked > 0
          ? p.maxLevelUnlocked
          : def.maxLevelUnlocked,
      selectedLevel:
        Number.isFinite(p.selectedLevel) && p.selectedLevel > 0
          ? p.selectedLevel
          : def.selectedLevel,
      ownedChars: Array.isArray(p.ownedChars)
        ? p.ownedChars.filter((c) => typeof c === "string")
        : def.ownedChars,
      selectedChar:
        typeof p.selectedChar === "string" ? p.selectedChar : def.selectedChar,
      levelStars:
        p.levelStars && typeof p.levelStars === "object"
          ? p.levelStars
          : def.levelStars,
      settings:
        p.settings && typeof p.settings === "object"
          ? { ...def.settings, ...p.settings }
          : def.settings,
    };
  } catch {
    return def;
  }
}

export function App() {
  const [initial] = useState(loadInitialState);

  const [coins, setCoins] = useState(initial.coins);
  const [maxLevelUnlocked, setMaxLevelUnlocked] = useState(
    initial.maxLevelUnlocked,
  );
  const [selectedLevel, setSelectedLevel] = useState(initial.selectedLevel);
  const [ownedChars, setOwnedChars] = useState(initial.ownedChars);
  const [selectedChar, setSelectedChar] = useState(initial.selectedChar);
  const [levelStars, setLevelStars] = useState(initial.levelStars);
  const [settings, setSettings] = useState(initial.settings);

  const [currentScreen, setCurrentScreen] = useState("homeScreen");
  const [previousScreen, setPreviousScreen] = useState("homeScreen");
  const [toastMsg, setToastMsg] = useState("");

  // Sync settings with AudioEngine
  useEffect(() => {
    AudioEngine.updateSettings(settings);
  }, [settings]);

  // Persist State to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        coins,
        maxLevelUnlocked,
        selectedLevel,
        ownedChars,
        selectedChar,
        levelStars,
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // Ignore write storage error
    }
  }, [
    coins,
    maxLevelUnlocked,
    selectedLevel,
    ownedChars,
    selectedChar,
    levelStars,
    settings,
  ]);

  const changeScreen = (screenId) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screenId);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg("");
    }, 1800);
  };

  const resetProgress = () => {
    const def = defaultState();
    setCoins(def.coins);
    setMaxLevelUnlocked(def.maxLevelUnlocked);
    setSelectedLevel(def.selectedLevel);
    setOwnedChars(def.ownedChars);
    setSelectedChar(def.selectedChar);
    setLevelStars(def.levelStars);
    setSettings(def.settings);
    AudioEngine.updateSettings(def.settings);
  };

  return (
    <div id="app">
      {currentScreen === "homeScreen" && (
        <HomeScreen
          coins={coins}
          selectedChar={selectedChar}
          setSelectedChar={setSelectedChar}
          ownedChars={ownedChars}
          selectedLevel={selectedLevel}
          maxLevelUnlocked={maxLevelUnlocked}
          setScreen={changeScreen}
        />
      )}
      {currentScreen === "shopScreen" && (
        <ShopScreen
          coins={coins}
          setCoins={setCoins}
          selectedChar={selectedChar}
          setSelectedChar={setSelectedChar}
          ownedChars={ownedChars}
          setOwnedChars={setOwnedChars}
          setScreen={changeScreen}
          showToast={showToast}
        />
      )}
      {currentScreen === "levelsScreen" && (
        <LevelsScreen
          maxLevelUnlocked={maxLevelUnlocked}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          levelStars={levelStars}
          setScreen={changeScreen}
        />
      )}
      {currentScreen === "rulesScreen" && (
        <RulesScreen setScreen={changeScreen} />
      )}
      {currentScreen === "settingsScreen" && (
        <SettingsScreen
          settings={settings}
          setSettings={setSettings}
          setScreen={changeScreen}
          previousScreen={previousScreen}
          resetProgress={resetProgress}
        />
      )}
      {currentScreen === "gameScreen" && (
        <GameScreen
          coins={coins}
          setCoins={setCoins}
          selectedChar={selectedChar}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          maxLevelUnlocked={maxLevelUnlocked}
          setMaxLevelUnlocked={setMaxLevelUnlocked}
          levelStars={levelStars}
          setLevelStars={setLevelStars}
          settings={settings}
          setSettings={setSettings}
          setScreen={changeScreen}
          toastMsg={toastMsg}
        />
      )}
    </div>
  );
}

export default App;
