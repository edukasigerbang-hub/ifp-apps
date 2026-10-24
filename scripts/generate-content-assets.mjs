import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const W = 800;
const H = 600;

const colors = {
  white: [255, 255, 255, 255],
  navy: [15, 23, 42, 255],
  teal: [15, 118, 110, 255],
  tealLight: [94, 234, 212, 255],
  sky: [224, 242, 254, 255],
  sun: [250, 204, 21, 255],
  green: [22, 163, 74, 255],
  greenDark: [21, 128, 61, 255],
  soil: [146, 64, 14, 255],
  sand: [254, 243, 199, 255],
  orange: [245, 158, 11, 255],
  red: [220, 38, 38, 255],
  blue: [37, 99, 235, 255],
  skin1: [245, 200, 160, 255],
  skin2: [224, 172, 128, 255],
  skin3: [196, 140, 96, 255]
};

function canvas() {
  return new Uint8Array(W * H * 4);
}

function set(px, x, y, color) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  px[i] = color[0];
  px[i + 1] = color[1];
  px[i + 2] = color[2];
  px[i + 3] = color[3];
}

function rect(px, x, y, width, height, color) {
  for (let dy = 0; dy < height; dy += 1) {
    for (let dx = 0; dx < width; dx += 1) set(px, x + dx, y + dy, color);
  }
}

function circle(px, cx, cy, r, color) {
  for (let y = -r; y <= r; y += 1) {
    for (let x = -r; x <= r; x += 1) {
      if (x * x + y * y <= r * r) set(px, cx + x, cy + y, color);
    }
  }
}

function ellipse(px, cx, cy, rx, ry, color) {
  for (let y = -ry; y <= ry; y += 1) {
    for (let x = -rx; x <= rx; x += 1) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) set(px, cx + x, cy + y, color);
    }
  }
}

function line(px, x1, y1, x2, y2, color, thickness = 3) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(x1 + (x2 - x1) * t);
    const y = Math.round(y1 + (y2 - y1) * t);
    circle(px, x, y, Math.floor(thickness / 2), color);
  }
}

function fill(px, color) {
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) set(px, x, y, color);
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let k = 0; k < 8; k += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuffer, data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

function toPng(px) {
  const raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y += 1) {
    const rowStart = y * (W * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < W * 4; x += 1) {
      raw[rowStart + 1 + x] = px[y * W * 4 + x];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function write(relativePath, px) {
  const target = path.resolve(relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, toPng(px));
  console.log("wrote", relativePath);
}

function mathFractionBars() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 70, colors.greenDark);
  const bars = [
    { y: 130, parts: 2, filled: 1 },
    { y: 285, parts: 4, filled: 2 },
    { y: 440, parts: 8, filled: 4 }
  ];
  for (const bar of bars) {
    const left = 90;
    const width = 620;
    const height = 90;
    rect(px, left, bar.y, width, height, colors.sky);
    const partWidth = width / bar.parts;
    for (let i = 0; i < bar.parts; i += 1) {
      const x = Math.round(left + i * partWidth);
      const next = Math.round(left + (i + 1) * partWidth);
      if (i < bar.filled) rect(px, x, bar.y, next - x, height, colors.teal);
      line(px, x, bar.y, x, bar.y + height, colors.navy, 4);
    }
    line(px, left + width, bar.y, left + width, bar.y + height, colors.navy, 4);
    line(px, left, bar.y, left + width, bar.y, colors.navy, 4);
    line(px, left, bar.y + height, left + width, bar.y + height, colors.navy, 4);
  }
  return px;
}

function ipasHabitat() {
  const px = canvas();
  fill(px, colors.sky);
  circle(px, 670, 90, 55, colors.sun);
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    line(px, 670 + Math.cos(rad) * 70, 90 + Math.sin(rad) * 70, 670 + Math.cos(rad) * 95, 90 + Math.sin(rad) * 95, colors.sun, 6);
  }
  rect(px, 0, 430, W, 170, colors.green);
  rect(px, 0, 500, W, 100, colors.soil);
  // pohon
  rect(px, 110, 300, 28, 150, colors.soil);
  circle(px, 124, 270, 78, colors.greenDark);
  circle(px, 80, 300, 52, colors.green);
  circle(px, 170, 300, 48, colors.green);
  // tanaman kecil
  rect(px, 350, 360, 14, 110, colors.greenDark);
  ellipse(px, 320, 390, 34, 18, colors.green);
  ellipse(px, 394, 410, 34, 18, colors.green);
  ellipse(px, 326, 440, 30, 16, colors.green);
  for (let i = 0; i < 4; i += 1) line(px, 357 + i * 4, 470, 330 + i * 18, 520, colors.soil, 4);
  // kupu-kupu
  ellipse(px, 560, 230, 34, 24, colors.teal);
  ellipse(px, 616, 230, 34, 24, colors.tealLight);
  rect(px, 584, 210, 8, 52, colors.navy);
  line(px, 588, 210, 570, 190, colors.navy, 3);
  line(px, 588, 210, 606, 190, colors.navy, 3);
  // burung
  ellipse(px, 270, 150, 38, 26, colors.blue);
  circle(px, 300, 138, 16, colors.blue);
  line(px, 314, 138, 332, 134, colors.orange, 5);
  ellipse(px, 250, 145, 26, 14, colors.navy);
  // siput
  circle(px, 630, 500, 34, colors.orange);
  circle(px, 630, 500, 20, colors.sand);
  circle(px, 630, 500, 9, colors.orange);
  ellipse(px, 590, 515, 30, 14, colors.sand);
  line(px, 575, 505, 560, 480, colors.sand, 4);
  // tetes air
  for (const [x, y] of [[450, 180], [490, 210], [430, 230]]) {
    ellipse(px, x, y, 9, 13, colors.blue);
    line(px, x, y - 18, x, y - 30, colors.blue, 4);
  }
  return px;
}

function schoolYard() {
  const px = canvas();
  fill(px, colors.sky);
  circle(px, 690, 90, 48, colors.sun);
  rect(px, 0, 380, W, 220, colors.green);
  rect(px, 0, 470, W, 130, colors.greenDark);
  // gedung sekolah
  rect(px, 250, 210, 300, 180, colors.sand);
  rect(px, 230, 170, 340, 45, colors.red);
  rect(px, 300, 250, 60, 55, colors.white);
  rect(px, 440, 250, 60, 55, colors.white);
  rect(px, 370, 320, 60, 70, colors.teal);
  // bendera
  rect(px, 620, 220, 8, 220, colors.navy);
  rect(px, 628, 225, 70, 24, colors.red);
  rect(px, 628, 249, 70, 24, colors.white);
  // pohon
  for (const [x, y] of [[120, 300], [700, 340]]) {
    rect(px, x - 10, y, 20, 120, colors.soil);
    circle(px, x, y - 30, 55, colors.green);
    circle(px, x - 35, y, 38, colors.greenDark);
    circle(px, x + 35, y, 38, colors.greenDark);
  }
  // bangku
  rect(px, 560, 430, 120, 14, colors.orange);
  rect(px, 570, 444, 10, 40, colors.navy);
  rect(px, 660, 444, 10, 40, colors.navy);
  // jalan
  rect(px, 330, 430, 90, 170, colors.sand);
  return px;
}

function gotongRoyong() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 400, colors.sky);
  rect(px, 0, 400, W, 200, colors.sand);
  rect(px, 60, 80, 280, 170, colors.greenDark);
  rect(px, 480, 110, 260, 140, colors.white);
  line(px, 480, 110, 740, 110, colors.navy, 4);
  // anak 1 menyapu
  circle(px, 230, 250, 38, colors.skin1);
  rect(px, 195, 288, 70, 100, colors.teal);
  rect(px, 195, 330, 18, 70, colors.navy);
  rect(px, 247, 330, 18, 70, colors.navy);
  line(px, 270, 300, 340, 430, colors.orange, 8);
  rect(px, 320, 420, 60, 18, colors.orange);
  // anak 2 buku
  circle(px, 400, 240, 38, colors.skin2);
  rect(px, 365, 278, 70, 100, colors.orange);
  rect(px, 365, 320, 18, 70, colors.navy);
  rect(px, 417, 320, 18, 70, colors.navy);
  rect(px, 360, 280, 40, 26, colors.red);
  rect(px, 360, 306, 40, 26, colors.blue);
  // anak 3 menyiram
  circle(px, 570, 245, 38, colors.skin3);
  rect(px, 535, 283, 70, 100, colors.blue);
  rect(px, 535, 325, 18, 70, colors.navy);
  rect(px, 587, 325, 18, 70, colors.navy);
  rect(px, 600, 320, 46, 34, colors.green);
  line(px, 646, 330, 670, 350, colors.green, 6);
  for (const [x, y] of [[676, 365], [686, 385], [666, 390]]) ellipse(px, x, y, 6, 9, colors.blue);
  // pot tanaman
  rect(px, 680, 410, 60, 50, colors.orange);
  rect(px, 700, 360, 10, 60, colors.greenDark);
  ellipse(px, 690, 375, 22, 12, colors.green);
  ellipse(px, 720, 385, 22, 12, colors.green);
  return px;
}

write("content/packages/kelas4-matematika-b03-pecahan/assets/pecahan-senilai.png", mathFractionBars());
write("content/packages/kelas4-ipas-b01-makhluk-hidup/assets/habitat-makhluk-hidup.png", ipasHabitat());
write("content/packages/kelas4-bahasa-indonesia-b01-teks-deskripsi/assets/halaman-sekolah.png", schoolYard());
write("content/packages/kelas4-pendidikan-pancasila-b01-pancasila/assets/gotong-royong.png", gotongRoyong());
