import * as THREE from "three";

function makeCanvas(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  return ctx;
}

export function makeGt40Paint(base: string): THREE.CanvasTexture {
  const ctx = makeCanvas(512, 1024);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 1024);
  ctx.fillStyle = "#f4f4f4";
  ctx.fillRect(210, 0, 28, 1024);
  ctx.fillRect(274, 0, 28, 1024);
  const tex = new THREE.CanvasTexture(ctx.canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
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

export function makeRoundelTexture(text: string): THREE.CanvasTexture {
  const ctx = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fillStyle = "#f5f5f5";
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#111111";
  ctx.stroke();
  ctx.font = "900 118px Trebuchet MS, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#111111";
  ctx.fillText(text, 128, 138);
  const tex = new THREE.CanvasTexture(ctx.canvas);
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

export function makeWindshieldFace(iris = "#3b86c4"): THREE.CanvasTexture {
  const ctx = makeCanvas(1024, 560);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1024, 560);
  ctx.fillStyle = "#e8eaee";
  ctx.fillRect(0, 0, 1024, 18);
  ctx.fillRect(0, 542, 1024, 18);
  drawToyEye(ctx, 278, 292, 248, 248, iris);
  drawToyEye(ctx, 746, 292, 248, 248, iris);
  const tex = new THREE.CanvasTexture(ctx.canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawToyEye(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  iris: string,
): void {
  ctx.save();
  ctx.fillStyle = "#f4f6f8";
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#b8bcc2";
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, rx * 0.5, ry * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0d0d0d";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, rx * 0.22, ry * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.16, cy - ry * 0.1, rx * 0.11, ry * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function makeHubTexture(): THREE.CanvasTexture {
  const ctx = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 10;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(128 + Math.cos(a) * 118, 128 + Math.sin(a) * 118);
    ctx.stroke();
  }
  ctx.fillStyle = "#2c2c2c";
  ctx.beginPath();
  ctx.arc(128, 128, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(128, 128, 118, 0, Math.PI * 2);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(ctx.canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeHeadlightDecal(): THREE.CanvasTexture {
  const ctx = makeCanvas(128, 80);
  ctx.clearRect(0, 0, 128, 80);
  ctx.fillStyle = "#fff6c8";
  ctx.beginPath();
  ctx.ellipse(64, 40, 52, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a84a";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = "#fffdf4";
  ctx.beginPath();
  ctx.ellipse(54, 32, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
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
