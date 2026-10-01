export function difficultyForLevel(level) {
  const gap = Math.max(118, 190 - level * 0.55);
  const speed = Math.min(6.8, 2.5 + level * 0.028);
  const spawnGapPx = Math.max(210, 320 - level * 0.5);
  const moving = level >= 4;
  const moveAmp = moving ? Math.min(46, (level - 3) * 1.6) : 0;
  const moveSpeed = 0.02 + Math.min(0.02, level * 0.00006);
  const target = 10; // pipes to clear to "complete" the level
  return { gap, speed, spawnGapPx, moving, moveAmp, moveSpeed, target };
}
