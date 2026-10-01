import AudioEngine from "../engine/audio.js";

export function SettingsScreen({
  settings,
  setSettings,
  setScreen,
  previousScreen,
  resetProgress,
}) {
  const handleToggleMusic = () => {
    AudioEngine.click();
    const nextState = !settings.musicOn;
    const newSettings = { ...settings, musicOn: nextState };
    setSettings(newSettings);
    AudioEngine.updateSettings(newSettings);
    if (nextState) {
      AudioEngine.startMusic(newSettings);
    } else {
      AudioEngine.stopMusic();
    }
  };

  const handleToggleSfx = () => {
    AudioEngine.click();
    const newSettings = { ...settings, sfxOn: !settings.sfxOn };
    setSettings(newSettings);
    AudioEngine.updateSettings(newSettings);
  };

  const handleMusicVol = (e) => {
    const val = parseInt(e.target.value, 10);
    const newSettings = { ...settings, musicVol: val };
    setSettings(newSettings);
    AudioEngine.updateSettings(newSettings);
  };

  const handleSfxVol = (e) => {
    const val = parseInt(e.target.value, 10);
    const newSettings = { ...settings, sfxVol: val };
    setSettings(newSettings);
    AudioEngine.updateSettings(newSettings);
  };

  const handleReset = () => {
    AudioEngine.click();
    if (window.confirm("Reset all progress?")) {
      resetProgress();
      setScreen("homeScreen");
    }
  };

  return (
    <div className="screen active" id="settingsScreen">
      <div className="screen-title heading">
        <button
          className="backbtn"
          id="settingsBackBtn"
          onClick={() => {
            AudioEngine.click();
            setScreen(previousScreen || "homeScreen");
          }}
        >
          ‹
        </button>
        Settings
      </div>

      <div className="setting-row">
        <div className="sr-top">
          <span className="sr-label">Music</span>
          <button
            className={`toggle ${settings.musicOn ? "on" : ""}`}
            onClick={handleToggleMusic}
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.musicVol}
          onChange={handleMusicVol}
        />
      </div>

      <div className="setting-row">
        <div className="sr-top">
          <span className="sr-label">Sound effects</span>
          <button
            className={`toggle ${settings.sfxOn ? "on" : ""}`}
            onClick={handleToggleSfx}
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.sfxVol}
          onChange={handleSfxVol}
        />
      </div>

      <div className="setting-row">
        <div className="sr-top">
          <span className="sr-label">Reset progress</span>
        </div>
        <div style={{ fontSize: "12px", color: "#b7bbdd", marginBottom: "10px" }}>
          Erases coins, unlocked characters and level progress.
        </div>
        <button
          className="btn ghost"
          onClick={handleReset}
          style={{ margin: 0 }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
