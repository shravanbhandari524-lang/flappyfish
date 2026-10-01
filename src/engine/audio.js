/* ============ AUDIO ENGINE ============ */

let ctx = null;
let musicTimer = null;
let musicStep = 0;
const scale = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3]; // C major pentatonic

let currentSettings = {
  musicOn: true,
  sfxOn: true,
  musicVol: 60,
  sfxVol: 80,
};

export function updateAudioSettings(settings) {
  if (settings) {
    currentSettings = { ...currentSettings, ...settings };
  }
}

function ensureCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function getSfxGain() {
  return currentSettings.sfxOn ? currentSettings.sfxVol / 100 : 0;
}

function getMusicGain() {
  return currentSettings.musicOn ? (currentSettings.musicVol / 100) * 0.18 : 0;
}

function tone(freq, dur, type = "sine", gainMul = 1, glideTo = null) {
  const sg = getSfxGain();
  if (sg <= 0) return;
  try {
    const c = ensureCtx();
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) {
      osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(gainMul * sg, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch {
    // Audio Context play before gesture ignored
  }
}

function noiseBurst(dur, gainMul = 1) {
  const sg = getSfxGain();
  if (sg <= 0) return;
  try {
    const c = ensureCtx();
    const bufferSize = c.sampleRate * dur;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const gain = c.createGain();
    gain.gain.setValueAtTime(gainMul * sg, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    const filt = c.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 900;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(c.destination);
    src.start();
  } catch {
    // Silently ignore audio context errors
  }
}

export const AudioEngine = {
  flap(big) {
    tone(big ? 520 : 420, big ? 0.16 : 0.11, "square", 0.5, big ? 880 : 640);
  },
  coin() {
    tone(880, 0.08, "triangle", 0.5, 1320);
    setTimeout(() => tone(1320, 0.09, "triangle", 0.4), 60);
  },
  score() {
    tone(700, 0.09, "sine", 0.35, 1000);
  },
  crash() {
    noiseBurst(0.35, 0.7);
    tone(160, 0.3, "sawtooth", 0.4, 60);
  },
  click() {
    tone(500, 0.05, "square", 0.3);
  },
  unlock() {
    tone(523, 0.1, "triangle", 0.5);
    setTimeout(() => tone(659, 0.1, "triangle", 0.5), 90);
    setTimeout(() => tone(784, 0.16, "triangle", 0.5), 180);
  },
  levelup() {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => tone(f, 0.14, "triangle", 0.45), i * 90),
    );
  },
  startMusic(settings) {
    if (settings) updateAudioSettings(settings);
    if (musicTimer) return;
    try {
      ensureCtx();
    } catch {
      // Ignored
    }
    musicStep = 0;
    musicTimer = setInterval(() => {
      if (!currentSettings.musicOn) return;
      const g = getMusicGain();
      if (g <= 0.0005) return;
      try {
        const c = ensureCtx();
        const note =
          scale[Math.floor(Math.random() * scale.length)] *
          (musicStep % 8 === 0 ? 0.5 : 1);
        const t0 = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(note, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(g, t0 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t0);
        osc.stop(t0 + 0.55);
        musicStep++;
      } catch {
        // Ignored
      }
    }, 380);
  },
  stopMusic() {
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
  },
  resumeCtx() {
    try {
      ensureCtx();
    } catch {
      // Ignored
    }
  },
  updateSettings: updateAudioSettings,
};

export default AudioEngine;
