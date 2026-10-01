/* ============ CHARACTER & ENVIRONMENT DRAWING HELPERS ============ */

export function drawCharacter(ctx, def, x, y, size, wingPhase, tilt, blink) {
  if (!def || !ctx) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt || 0);
  const s = size / 40; // base unit scale (design at 40px)
  ctx.scale(s, s);
  const alpha = def.translucent ? 0.85 : 1;
  ctx.globalAlpha = alpha;

  // tail (back)
  ctx.fillStyle = def.accent || "#E4503F";
  ctx.beginPath();
  ctx.moveTo(-16, -2);
  ctx.lineTo(-26, -8);
  ctx.lineTo(-24, 2);
  ctx.lineTo(-26, 10);
  ctx.lineTo(-16, 4);
  ctx.closePath();
  ctx.fill();

  // wing (flaps)
  const wingLift = Math.sin(wingPhase || 0) * 14;
  ctx.fillStyle = def.accent || "#E4503F";
  ctx.beginPath();
  ctx.ellipse(
    -4,
    2 + wingLift * 0.2,
    15,
    9,
    -0.5 - wingLift * 0.02,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ears/extras behind head
  if (def.ears === "round") {
    ctx.fillStyle = def.earColor || def.accent;
    ctx.beginPath();
    ctx.arc(-10, -20, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(10, -20, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (def.ears === "tri") {
    ctx.fillStyle = def.earColor || def.accent;
    ctx.beginPath();
    ctx.moveTo(-14, -16);
    ctx.lineTo(-7, -28);
    ctx.lineTo(-2, -15);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14, -16);
    ctx.lineTo(7, -28);
    ctx.lineTo(2, -15);
    ctx.closePath();
    ctx.fill();
  } else if (def.ears === "long") {
    ctx.fillStyle = def.earColor || def.accent;
    ctx.beginPath();
    ctx.ellipse(-8, -28, 5, 16, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -28, 5, 16, 0.15, 0, Math.PI * 2);
    ctx.fill();
  } else if (def.ears === "tuft") {
    ctx.strokeStyle = def.earColor || def.accent;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8, -18);
    ctx.lineTo(-11, -27);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -18);
    ctx.lineTo(11, -27);
    ctx.stroke();
  } else if (def.ears === "spikes") {
    ctx.fillStyle = def.earColor || def.accent;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 7 - 3, -15);
      ctx.lineTo(i * 7, -27);
      ctx.lineTo(i * 7 + 3, -15);
      ctx.closePath();
      ctx.fill();
    }
  } else if (def.ears === "antenna") {
    ctx.strokeStyle = "#7d8bb5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, -29);
    ctx.stroke();
    ctx.fillStyle = def.earColor || def.accent;
    ctx.beginPath();
    ctx.arc(0, -31, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (def.ears === "antennaBall") {
    ctx.strokeStyle = "#7d8bb5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-6, -18);
    ctx.lineTo(-9, -29);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6, -18);
    ctx.lineTo(9, -29);
    ctx.stroke();
    ctx.fillStyle = def.earColor || def.accent;
    ctx.beginPath();
    ctx.arc(-9, -31, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(9, -31, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (def.crest) {
    ctx.fillStyle = def.crest;
    ctx.beginPath();
    ctx.moveTo(-6, -20);
    ctx.lineTo(0, -31);
    ctx.lineTo(6, -20);
    ctx.closePath();
    ctx.fill();
  }

  // body
  ctx.fillStyle = def.body || "#FF6B5B";
  ctx.beginPath();
  ctx.ellipse(0, 0, 19, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  // belly
  ctx.fillStyle = def.belly || "#FFE3D6";
  ctx.beginPath();
  ctx.ellipse(3, 6, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // eye patch / face
  const blinkAmt = blink ? 0.15 : 1;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(11, -4, 6, 6 * blinkAmt, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1c1c";
  ctx.beginPath();
  ctx.arc(13, -4, 2.6 * blinkAmt, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(13.9, -5, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // beak
  if (def.beak) {
    ctx.fillStyle = def.beak;
    ctx.beginPath();
    ctx.moveTo(17, -1);
    ctx.lineTo(27, 2);
    ctx.lineTo(17, 5);
    ctx.closePath();
    ctx.fill();
  } else {
    // small nose/mouth for mammals
    ctx.fillStyle = def.accent || "#E4503F";
    ctx.beginPath();
    ctx.arc(19, 2, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawSky(ctx, w, h, theme, t) {
  if (!ctx || !theme) return;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, theme.sky[0]);
  g.addColorStop(1, theme.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  if (theme.stars) {
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    for (let i = 0; i < 24; i++) {
      const sx = (i * 53 + ((t * 6) % w)) % w;
      const sy = ((i * 37) % h) * 0.7;
      ctx.globalAlpha = 0.3 + ((i * 13) % 7) / 10;
      ctx.fillRect(sx, sy, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = theme.cloud;
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 130 + t * 10) % (w + 80)) - 40;
    const cy = 20 + i * 26;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 26, 11, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 18, cy + 4, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = theme.hill;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.quadraticCurveTo(w * 0.25, h - 38, w * 0.5, h - 16);
  ctx.quadraticCurveTo(w * 0.75, h + 6, w, h - 26);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
}

export function drawPipe(ctx, p, GH) {
  if (!ctx || !p) return;
  const topH = p.gapY - p.gap / 2;
  const botY = p.gapY + p.gap / 2;
  const grad = ctx.createLinearGradient(p.x, 0, p.x + p.w, 0);
  grad.addColorStop(0, "#3FA84A");
  grad.addColorStop(1, "#2E7E39");
  ctx.fillStyle = grad;

  roundRectBottom(ctx, p.x, 0, p.w, topH, 10);
  roundRectTop(ctx, p.x, botY, p.w, GH - botY, 10);

  // caps
  ctx.fillStyle = "#4FC15C";
  if (topH > 18) ctx.fillRect(p.x - 4, topH - 18, p.w + 8, 18);
  if (GH - botY > 0) ctx.fillRect(p.x - 4, botY, p.w + 8, 18);
}

export function roundRectBottom(ctx, x, y, w, h, r) {
  if (h <= 0) return;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.closePath();
  ctx.fill();
}

export function roundRectTop(ctx, x, y, w, h, r) {
  if (h <= 0) return;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + r);
  ctx.arcTo(x + w, y, x + w - r, y, r);
  ctx.lineTo(x + r, y);
  ctx.arcTo(x, y, x, y + r, r);
  ctx.closePath();
  ctx.fill();
}
