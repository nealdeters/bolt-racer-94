import * as THREE from "three";

function makeCanvas(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  return ctx;
}

export function makeRoadTexture(asphalt: string, line: string): THREE.CanvasTexture {
  const ctx = makeCanvas(128, 256);
  ctx.fillStyle = asphalt;
  ctx.fillRect(0, 0, 128, 256);
  ctx.fillStyle = "#2a2c31";
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.18;
    ctx.fillRect(Math.random() * 128, Math.random() * 256, 6, 3);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(6, 0, 8, 256);
  ctx.fillRect(114, 0, 8, 256);
  ctx.fillStyle = line;
  for (let y = 0; y < 256; y += 36) {
    ctx.fillRect(58, y, 12, 20);
  }
  const tex = new THREE.CanvasTexture(ctx.canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeNumberTexture(text: string, fill: string, stroke = "#111111"): THREE.CanvasTexture {
  const ctx = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);
  ctx.font = "900 170px Trebuchet MS, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 18;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, 128, 140);
  ctx.fillStyle = fill;
  ctx.fillText(text, 128, 140);
  const tex = new THREE.CanvasTexture(ctx.canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeBannerTexture(text: string): THREE.CanvasTexture {
  const ctx = makeCanvas(512, 128);
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = "#ffe14a";
  ctx.fillRect(0, 0, 512, 12);
  ctx.fillRect(0, 116, 512, 12);
  ctx.font = "900 64px Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, 256, 68);
  const tex = new THREE.CanvasTexture(ctx.canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeWindshieldFace(pupil = "#1a1208"): THREE.CanvasTexture {
  const ctx = makeCanvas(1024, 512);
  const glass = ctx.createLinearGradient(0, 0, 0, 512);
  glass.addColorStop(0, "#0a2c48");
  glass.addColorStop(1, "#061828");
  ctx.fillStyle = glass;
  ctx.fillRect(0, 0, 1024, 512);

  drawEye(ctx, 278, 268, 212, 198, pupil);
  drawEye(ctx, 746, 268, 212, 198, pupil);

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 10;
  ctx.strokeRect(18, 14, 988, 484);

  const tex = new THREE.CanvasTexture(ctx.canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  pupil: string,
): void {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = "#111111";
  ctx.stroke();

  ctx.fillStyle = pupil;
  ctx.beginPath();
  ctx.ellipse(cx + 8, cy + 18, rx * 0.4, ry * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(cx + rx * 0.28, cy - ry * 0.28, rx * 0.14, ry * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.18, cy + ry * 0.12, rx * 0.06, ry * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function makeSmileTexture(): THREE.CanvasTexture {
  const ctx = makeCanvas(512, 192);
  const chrome = ctx.createLinearGradient(0, 0, 0, 192);
  chrome.addColorStop(0, "#ffffff");
  chrome.addColorStop(0.45, "#d5dee6");
  chrome.addColorStop(1, "#9aa6b0");
  ctx.fillStyle = chrome;
  ctx.fillRect(0, 0, 512, 192);

  ctx.fillStyle = "#ffe14a";
  ctx.fillRect(0, 0, 512, 28);

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(70, 78);
  ctx.quadraticCurveTo(256, 168, 442, 78);
  ctx.stroke();

  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(86, 82);
  ctx.quadraticCurveTo(256, 150, 426, 82);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(ctx.canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeCurbTexture(a: string, b: string): THREE.CanvasTexture {
  const ctx = makeCanvas(64, 256);
  for (let y = 0; y < 256; y += 32) {
    ctx.fillStyle = y % 64 === 0 ? a : b;
    ctx.fillRect(0, y, 64, 32);
  }
  const tex = new THREE.CanvasTexture(ctx.canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeBoltTexture(): THREE.CanvasTexture {
  const ctx = makeCanvas(128, 256);
  ctx.clearRect(0, 0, 128, 256);
  ctx.fillStyle = "#ffe14a";
  ctx.beginPath();
  ctx.moveTo(78, 12);
  ctx.lineTo(28, 118);
  ctx.lineTo(58, 118);
  ctx.lineTo(40, 244);
  ctx.lineTo(110, 96);
  ctx.lineTo(74, 96);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 8;
  ctx.stroke();
  const tex = new THREE.CanvasTexture(ctx.canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
