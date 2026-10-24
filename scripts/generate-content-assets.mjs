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

function placeValueChart() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.navy);
  const panels = [60, 245, 430, 615];
  for (const x of panels) {
    rect(px, x, 100, 130, 400, colors.sky);
    rect(px, x, 100, 130, 8, colors.navy);
    rect(px, x, 492, 130, 8, colors.navy);
    rect(px, x, 100, 8, 400, colors.navy);
    rect(px, x + 122, 100, 8, 400, colors.navy);
  }
  // ribuan: 1 blok besar
  rect(px, 75, 240, 100, 120, colors.teal);
  circle(px, 125, 230, 22, colors.tealLight);
  // ratusan: 2 blok
  rect(px, 265, 200, 90, 80, colors.tealLight);
  rect(px, 265, 300, 90, 80, colors.tealLight);
  // puluhan: 3 batang
  for (let i = 0; i < 3; i += 1) rect(px, 450 + i * 35, 200, 24, 180, colors.orange);
  // satuan: 4 kotak
  for (let i = 0; i < 4; i += 1) {
    const cx = 635 + (i % 2) * 50;
    const cy = 220 + Math.floor(i / 2) * 60;
    rect(px, cx, cy, 40, 40, colors.blue);
  }
  return px;
}

function statesOfMatter() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [40, 290, 540];
  for (const x of panels) {
    rect(px, x, 100, 220, 400, colors.sky);
    rect(px, x, 100, 220, 6, colors.navy);
    rect(px, x, 494, 220, 6, colors.navy);
    rect(px, x, 100, 6, 400, colors.navy);
    rect(px, x + 214, 100, 6, 400, colors.navy);
  }
  // padat: gelas + es
  rect(px, 95, 330, 110, 140, colors.white);
  rect(px, 95, 330, 8, 140, colors.navy);
  rect(px, 197, 330, 8, 140, colors.navy);
  rect(px, 95, 462, 110, 8, colors.navy);
  rect(px, 120, 360, 55, 55, colors.tealLight);
  rect(px, 140, 390, 55, 55, colors.tealLight);
  rect(px, 110, 405, 45, 45, colors.tealLight);
  // cair: gelas + air
  rect(px, 345, 330, 110, 140, colors.white);
  rect(px, 345, 330, 8, 140, colors.navy);
  rect(px, 447, 330, 8, 140, colors.navy);
  rect(px, 345, 462, 110, 8, colors.navy);
  rect(px, 353, 380, 94, 82, colors.blue);
  line(px, 353, 380, 447, 380, colors.blue, 6);
  // gas: panci + uap
  rect(px, 590, 380, 120, 70, colors.navy);
  rect(px, 580, 375, 140, 12, colors.navy);
  rect(px, 600, 450, 100, 18, colors.orange);
  circle(px, 620, 330, 18, colors.white);
  circle(px, 660, 300, 22, colors.white);
  circle(px, 700, 260, 26, colors.white);
  circle(px, 650, 250, 16, colors.white);
  circle(px, 690, 210, 18, colors.white);
  return px;
}

function readingCorner() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 70, colors.teal);
  // jendela
  rect(px, 560, 120, 170, 150, colors.sky);
  rect(px, 560, 120, 170, 10, colors.white);
  rect(px, 560, 260, 170, 10, colors.white);
  rect(px, 560, 120, 10, 150, colors.white);
  rect(px, 635, 120, 10, 150, colors.white);
  // rak buku
  rect(px, 80, 150, 300, 320, colors.soil);
  for (let shelf = 0; shelf < 3; shelf += 1) {
    rect(px, 95, 210 + shelf * 85, 270, 12, colors.sand);
    for (let i = 0; i < 7; i += 1) {
      const palette = [colors.teal, colors.orange, colors.red, colors.blue, colors.green];
      rect(px, 105 + i * 37, 165 + shelf * 85, 26, 45, palette[(i + shelf) % palette.length]);
    }
  }
  // meja + kursi
  rect(px, 430, 390, 150, 16, colors.orange);
  rect(px, 445, 406, 12, 70, colors.navy);
  rect(px, 553, 406, 12, 70, colors.navy);
  rect(px, 610, 410, 60, 12, colors.teal);
  rect(px, 620, 422, 10, 55, colors.navy);
  rect(px, 650, 422, 10, 55, colors.navy);
  // tanaman
  rect(px, 720, 440, 36, 45, colors.orange);
  rect(px, 732, 380, 12, 70, colors.greenDark);
  ellipse(px, 720, 395, 22, 12, colors.green);
  ellipse(px, 756, 405, 22, 12, colors.green);
  return px;
}

function queueScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.sky);
  rect(px, 0, 460, W, 140, colors.sand);
  // pintu
  rect(px, 620, 130, 120, 340, colors.teal);
  rect(px, 610, 120, 140, 14, colors.navy);
  circle(px, 720, 320, 7, colors.sun);
  // papan aturan
  rect(px, 80, 140, 230, 150, colors.white);
  rect(px, 80, 140, 230, 12, colors.navy);
  rect(px, 80, 278, 230, 12, colors.navy);
  rect(px, 80, 140, 12, 150, colors.navy);
  rect(px, 298, 140, 12, 150, colors.navy);
  for (let i = 0; i < 3; i += 1) rect(px, 110, 175 + i * 30, 170, 8, colors.sky);
  // anak mengantre
  const kids = [
    { x: 380, shirt: colors.teal, skin: colors.skin1 },
    { x: 460, shirt: colors.orange, skin: colors.skin2 },
    { x: 540, shirt: colors.blue, skin: colors.skin3 },
    { x: 600, shirt: colors.red, skin: colors.skin1 }
  ];
  for (const kid of kids) {
    circle(px, kid.x, 280, 32, kid.skin);
    rect(px, kid.x - 28, 314, 56, 100, kid.shirt);
    rect(px, kid.x - 26, 414, 18, 50, colors.navy);
    rect(px, kid.x + 8, 414, 18, 50, colors.navy);
  }
  line(px, 340, 490, 620, 490, colors.navy, 6);
  return px;
}

write("content/packages/kelas4-matematika-b03-pecahan/assets/pecahan-senilai.png", mathFractionBars());
write("content/packages/kelas4-ipas-b01-makhluk-hidup/assets/habitat-makhluk-hidup.png", ipasHabitat());
write("content/packages/kelas4-bahasa-indonesia-b01-teks-deskripsi/assets/halaman-sekolah.png", schoolYard());
write("content/packages/kelas4-pendidikan-pancasila-b01-pancasila/assets/gotong-royong.png", gotongRoyong());
function factorVenn() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const left = { x: 300, y: 330, r: 180 };
  const right = { x: 500, y: 330, r: 180 };
  circle(px, left.x, left.y, left.r, colors.tealLight);
  circle(px, right.x, right.y, right.r, colors.sand);
  for (let y = -left.r; y <= left.r; y += 1) {
    for (let x = -left.r; x <= left.r; x += 1) {
      if (x * x + y * y <= left.r * left.r) {
        const pxX = left.x + x;
        const pxY = left.y + y;
        if ((pxX - right.x) ** 2 + (pxY - right.y) ** 2 <= right.r * right.r) {
          set(px, pxX, pxY, colors.orange);
        }
      }
    }
  }
  for (let angle = 0; angle < 360; angle += 2) {
    const rad = (angle * Math.PI) / 180;
    circle(px, Math.round(left.x + Math.cos(rad) * 180), Math.round(left.y + Math.sin(rad) * 180), 2, colors.navy);
    circle(px, Math.round(right.x + Math.cos(rad) * 180), Math.round(right.y + Math.sin(rad) * 180), 2, colors.navy);
  }
  // titik faktor: 12 (kiri) dan 18 (kanan), irisan = faktor bersama
  const leftDots = [[230, 250], [210, 330], [240, 405], [290, 440]];
  const commonDots = [[370, 300], [400, 350], [420, 260]];
  const rightDots = [[560, 250], [590, 330], [560, 405], [520, 440]];
  for (const [x, y] of [...leftDots, ...commonDots, ...rightDots]) circle(px, x, y, 12, colors.navy);
  return px;
}

function forceMotion() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 450, W, 150, colors.green);
  line(px, 400, 60, 400, 600, colors.navy, 4);
  line(px, 0, 300, 800, 300, colors.navy, 4);
  // Q1 kiri-bawah: gaya dorong
  circle(px, 170, 345, 32, colors.skin1);
  rect(px, 140, 379, 60, 80, colors.teal);
  rect(px, 138, 459, 18, 50, colors.navy);
  rect(px, 184, 459, 18, 50, colors.navy);
  rect(px, 225, 420, 120, 70, colors.orange);
  line(px, 200, 420, 240, 445, colors.navy, 6);
  line(px, 345, 455, 390, 455, colors.red, 8);
  line(px, 390, 455, 370, 440, colors.red, 8);
  line(px, 390, 455, 370, 470, colors.red, 8);
  // Q2 kanan-bawah: bola menggelinding
  rect(px, 450, 550, 310, 12, colors.navy);
  circle(px, 650, 520, 30, colors.red);
  line(px, 560, 505, 610, 505, colors.navy, 5);
  line(px, 540, 535, 610, 535, colors.navy, 5);
  // Q3 kiri-atas: apel jatuh
  circle(px, 130, 80, 55, colors.green);
  rect(px, 118, 100, 24, 60, colors.soil);
  circle(px, 130, 185, 16, colors.red);
  line(px, 130, 210, 130, 270, colors.red, 7);
  line(px, 130, 270, 116, 250, colors.red, 7);
  line(px, 130, 270, 144, 250, colors.red, 7);
  // Q4 kanan-atas: magnet
  rect(px, 520, 90, 40, 100, colors.navy);
  rect(px, 620, 90, 40, 100, colors.navy);
  rect(px, 520, 90, 140, 40, colors.red);
  for (const [x, y] of [[540, 210], [580, 220], [620, 210]]) circle(px, x, y, 10, colors.sand);
  return px;
}

function storyListening() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 420, colors.sky);
  rect(px, 0, 420, W, 180, colors.sand);
  // guru
  circle(px, 180, 170, 42, colors.skin2);
  rect(px, 130, 214, 100, 150, colors.teal);
  rect(px, 140, 270, 18, 80, colors.navy);
  rect(px, 202, 270, 18, 80, colors.navy);
  rect(px, 230, 240, 90, 60, colors.orange);
  rect(px, 236, 246, 78, 48, colors.white);
  // siswa
  for (const [x, skin, shirt] of [[420, colors.skin1, colors.orange], [540, colors.skin3, colors.blue], [660, colors.skin2, colors.red]]) {
    circle(px, x, 280, 34, skin);
    rect(px, x - 34, 316, 68, 90, shirt);
    rect(px, x - 40, 406, 80, 14, colors.orange);
  }
  // balon percakapan
  for (const [x, y] of [[300, 110], [340, 80], [380, 115]]) {
    ellipse(px, x, y, 16, 11, colors.white);
    circle(px, x, y + 14, 4, colors.white);
  }
  return px;
}

function rightsDuties() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  line(px, 400, 60, 400, 600, colors.navy, 5);
  // kiri: belajar
  rect(px, 70, 400, 260, 18, colors.orange);
  rect(px, 90, 418, 14, 80, colors.navy);
  rect(px, 296, 418, 14, 80, colors.navy);
  circle(px, 160, 300, 36, colors.skin1);
  rect(px, 124, 340, 72, 90, colors.teal);
  rect(px, 210, 350, 90, 60, colors.white);
  rect(px, 220, 360, 70, 8, colors.sky);
  rect(px, 220, 380, 55, 8, colors.sky);
  // kanan: menyapu
  circle(px, 560, 290, 36, colors.skin3);
  rect(px, 524, 330, 72, 100, colors.orange);
  rect(px, 520, 430, 18, 70, colors.navy);
  rect(px, 582, 430, 18, 70, colors.navy);
  line(px, 590, 360, 680, 470, colors.soil, 8);
  rect(px, 660, 460, 70, 20, colors.orange);
  rect(px, 700, 420, 40, 45, colors.sky);
  return px;
}

write("content/packages/kelas4-matematika-b01-bilangan-cacah/assets/nilai-tempat.png", placeValueChart());
write("content/packages/kelas4-ipas-b02-wujud-zat/assets/wujud-zat.png", statesOfMatter());
write("content/packages/kelas4-bahasa-indonesia-b02-kalimat-efektif/assets/sudut-baca.png", readingCorner());
write("content/packages/kelas4-pendidikan-pancasila-b02-norma-aturan/assets/antrean-kelas.png", queueScene());
function measurementScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  line(px, 400, 60, 400, 600, colors.navy, 5);
  // penggaris + pensil
  rect(px, 50, 320, 300, 70, colors.sand);
  for (let i = 0; i <= 10; i += 1) {
    const x = 50 + i * 30;
    line(px, x, 320, x, i % 5 === 0 ? 355 : 340, colors.navy, 3);
  }
  rect(px, 90, 230, 210, 26, colors.sun);
  for (let i = 0; i < 3; i += 1) circle(px, 300 + i * 4, 243 - i * 6, 8 - i * 2, colors.orange);
  // timbangan + buah
  rect(px, 500, 400, 160, 60, colors.navy);
  rect(px, 470, 370, 220, 30, colors.teal);
  circle(px, 580, 320, 45, colors.white);
  circle(px, 580, 320, 34, colors.sky);
  line(px, 580, 320, 580, 295, colors.navy, 4);
  circle(px, 510, 345, 24, colors.red);
  circle(px, 570, 340, 26, colors.orange);
  circle(px, 630, 345, 22, colors.green);
  return px;
}

function energyScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [40, 290, 540];
  for (const x of panels) {
    rect(px, x, 100, 220, 420, colors.sky);
    rect(px, x, 100, 220, 5, colors.navy);
    rect(px, x, 515, 220, 5, colors.navy);
    rect(px, x, 100, 5, 420, colors.navy);
    rect(px, x + 215, 100, 5, 420, colors.navy);
  }
  // matahari + tanaman
  circle(px, 150, 180, 45, colors.sun);
  for (let a = 0; a < 360; a += 45) {
    const r = (a * Math.PI) / 180;
    line(px, 150 + Math.cos(r) * 55, 180 + Math.sin(r) * 55, 150 + Math.cos(r) * 75, 180 + Math.sin(r) * 75, colors.sun, 5);
  }
  rect(px, 144, 330, 12, 120, colors.greenDark);
  ellipse(px, 120, 360, 30, 16, colors.green);
  ellipse(px, 180, 390, 30, 16, colors.green);
  // lampu
  circle(px, 400, 220, 55, colors.sun);
  rect(px, 388, 270, 24, 40, colors.sand);
  rect(px, 370, 310, 60, 14, colors.navy);
  for (let a = 0; a < 360; a += 45) {
    const r = (a * Math.PI) / 180;
    line(px, 400 + Math.cos(r) * 70, 220 + Math.sin(r) * 70, 400 + Math.cos(r) * 92, 220 + Math.sin(r) * 92, colors.sun, 5);
  }
  // anak berlari
  circle(px, 650, 250, 32, colors.skin2);
  rect(px, 620, 284, 60, 90, colors.blue);
  line(px, 620, 330, 590, 370, colors.skin2, 10);
  line(px, 680, 330, 710, 370, colors.skin2, 10);
  line(px, 640, 374, 610, 450, colors.navy, 12);
  line(px, 660, 374, 690, 450, colors.navy, 12);
  line(px, 560, 250, 610, 250, colors.orange, 5);
  line(px, 550, 290, 610, 290, colors.orange, 5);
  return px;
}

function writingScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 420, colors.sand);
  rect(px, 0, 420, W, 180, colors.greenDark);
  rect(px, 560, 100, 170, 140, colors.sky);
  rect(px, 560, 100, 170, 8, colors.white);
  rect(px, 560, 232, 170, 8, colors.white);
  rect(px, 640, 100, 8, 140, colors.white);
  // meja + anak
  rect(px, 80, 400, 360, 20, colors.orange);
  rect(px, 100, 420, 16, 90, colors.navy);
  rect(px, 404, 420, 16, 90, colors.navy);
  circle(px, 210, 300, 40, colors.skin1);
  rect(px, 170, 340, 80, 90, colors.teal);
  rect(px, 300, 380, 110, 70, colors.white);
  line(px, 310, 400, 400, 400, colors.sky, 4);
  line(px, 310, 420, 390, 420, colors.sky, 4);
  line(px, 270, 400, 320, 380, colors.navy, 8);
  // kucing
  circle(px, 520, 430, 32, colors.orange);
  circle(px, 505, 405, 10, colors.orange);
  circle(px, 535, 405, 10, colors.orange);
  line(px, 550, 440, 580, 470, colors.orange, 8);
  return px;
}

function discussionScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 400, colors.sky);
  rect(px, 0, 400, W, 200, colors.sand);
  // meja oval
  ellipse(px, 400, 380, 190, 60, colors.orange);
  rect(px, 330, 430, 140, 80, colors.soil);
  // siswa mengelilingi meja
  const kids = [
    [200, 300, colors.skin1, colors.teal],
    [330, 250, colors.skin2, colors.orange],
    [470, 250, colors.skin3, colors.blue],
    [600, 300, colors.skin1, colors.red],
    [400, 500, colors.skin2, colors.green]
  ];
  for (const [x, y, skin, shirt] of kids) {
    circle(px, x, y, 30, skin);
    rect(px, x - 28, y + 32, 56, 80, shirt);
  }
  // balon bicara + buku catatan
  ellipse(px, 330, 190, 42, 24, colors.white);
  circle(px, 330, 218, 6, colors.white);
  line(px, 300, 190, 360, 190, colors.navy, 4);
  line(px, 300, 202, 345, 202, colors.navy, 4);
  rect(px, 470, 300, 60, 45, colors.white);
  line(px, 480, 315, 520, 315, colors.sky, 3);
  line(px, 480, 328, 515, 328, colors.sky, 3);
  return px;
}

write("content/packages/kelas4-matematika-b02-faktor-kelipatan/assets/faktor-kelipatan.png", factorVenn());
write("content/packages/kelas4-ipas-b03-gaya-gerak/assets/gaya-gerak.png", forceMotion());
write("content/packages/kelas4-bahasa-indonesia-b03-ide-pokok/assets/mendengarkan-cerita.png", storyListening());
write("content/packages/kelas4-pendidikan-pancasila-b03-hak-kewajiban/assets/belajar-dan-bertugas.png", rightsDuties());
function triangle(px, x1, y1, x2, y2, x3, y3, color) {
  const minX = Math.floor(Math.min(x1, x2, x3));
  const maxX = Math.ceil(Math.max(x1, x2, x3));
  const minY = Math.floor(Math.min(y1, y2, y3));
  const maxY = Math.ceil(Math.max(y1, y2, y3));
  const area = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const w1 = ((x2 - x) * (y3 - y) - (x3 - x) * (y2 - y)) / area;
      const w2 = ((x3 - x) * (y1 - y) - (x1 - x) * (y3 - y)) / area;
      const w3 = 1 - w1 - w2;
      if (w1 >= 0 && w2 >= 0 && w3 >= 0) set(px, x, y, color);
    }
  }
}

function star(px, cx, cy, outer, inner, color) {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  for (let i = 0; i < 10; i += 1) {
    const next = (i + 1) % 10;
    triangle(px, cx, cy, points[i][0], points[i][1], points[next][0], points[next][1], color);
  }
}

function collageScene() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 60, colors.teal);
  // kertas kolase
  rect(px, 70, 110, 520, 380, colors.white);
  triangle(px, 110, 200, 260, 180, 180, 330, colors.teal);
  circle(px, 370, 250, 80, colors.orange);
  rect(px, 430, 330, 120, 100, colors.sun);
  for (let i = 0; i < 4; i += 1) rect(px, 120 + i * 30, 360, 18, 90, colors.red);
  // lem dan gunting
  rect(px, 620, 240, 60, 160, colors.white);
  rect(px, 630, 220, 40, 30, colors.blue);
  line(px, 620, 470, 680, 410, colors.navy, 6);
  circle(px, 610, 480, 12, colors.navy);
  circle(px, 690, 400, 12, colors.navy);
  return px;
}

function bigBallScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [40, 290, 540];
  for (const x of panels) {
    rect(px, x, 100, 220, 420, colors.sky);
    rect(px, x, 100, 220, 5, colors.navy);
    rect(px, x, 515, 220, 5, colors.navy);
    rect(px, x, 100, 5, 420, colors.navy);
    rect(px, x + 215, 100, 5, 420, colors.navy);
  }
  // sepak bola
  circle(px, 150, 300, 80, colors.white);
  for (const [x, y] of [[120, 260], [180, 260], [150, 315], [110, 330], [190, 330]]) {
    circle(px, x, y, 16, colors.navy);
  }
  // basket
  circle(px, 400, 300, 80, colors.orange);
  line(px, 320, 300, 480, 300, colors.navy, 5);
  line(px, 400, 220, 400, 380, colors.navy, 5);
  arc(px, 400, 300, 55, 30, 150, colors.navy, 4);
  // voli
  circle(px, 650, 300, 80, colors.white);
  arc(px, 650, 300, 55, -60, 60, colors.blue, 4);
  arc(px, 650, 300, 55, 120, 240, colors.blue, 4);
  return px;
}

function problemSolvingScene() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 60, colors.teal);
  // lapak
  rect(px, 80, 160, 260, 20, colors.red);
  rect(px, 90, 180, 240, 140, colors.white);
  for (let i = 0; i < 3; i += 1) rect(px, 110 + i * 70, 220, 50, 70, [colors.teal, colors.orange, colors.blue][i]);
  // keranjang dan uang
  ellipse(px, 480, 420, 100, 40, colors.soil);
  rect(px, 440, 400, 80, 20, colors.soil);
  for (const [x, y, c] of [[600, 380, colors.sun], [650, 400, colors.sun], [700, 370, colors.sun]]) circle(px, x, y, 26, c);
  rect(px, 590, 440, 120, 50, colors.teal);
  rect(px, 590, 440, 120, 50, colors.tealLight);
  // gelembung berpikir
  ellipse(px, 200, 360, 70, 40, colors.white);
  for (let i = 0; i < 3; i += 1) circle(px, 190 + i * 18, 350, 5, colors.navy);
  return px;
}

function economyScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 0, W, 60, colors.teal);
  line(px, 400, 60, 400, 600, colors.navy, 4);
  line(px, 0, 330, 800, 330, colors.navy, 4);
  // petani
  rect(px, 0, 400, 400, 200, colors.green);
  circle(px, 120, 250, 28, colors.skin1);
  rect(px, 96, 278, 48, 90, colors.orange);
  line(px, 144, 300, 190, 340, colors.navy, 6);
  rect(px, 80, 360, 80, 40, colors.sun);
  // nelayan
  rect(px, 400, 420, 400, 180, colors.blue);
  ellipse(px, 580, 440, 100, 24, colors.soil);
  line(px, 580, 430, 580, 330, colors.navy, 4);
  triangle(px, 580, 340, 580, 420, 660, 400, colors.white);
  circle(px, 500, 360, 26, colors.skin3);
  rect(px, 476, 386, 48, 70, colors.teal);
  // pasar + tanam pohon
  rect(px, 430, 80, 340, 220, colors.sand);
  rect(px, 450, 120, 300, 20, colors.red);
  rect(px, 470, 140, 100, 100, colors.white);
  rect(px, 590, 140, 100, 100, colors.white);
  circle(px, 660, 280, 26, colors.skin2);
  rect(px, 636, 306, 48, 70, colors.green);
  rect(px, 690, 330, 10, 40, colors.greenDark);
  ellipse(px, 680, 320, 22, 12, colors.green);
  return px;
}

function literatureScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 430, W, 170, colors.green);
  circle(px, 680, 90, 45, colors.sun);
  rect(px, 120, 250, 30, 190, colors.soil);
  circle(px, 135, 220, 90, colors.greenDark);
  circle(px, 90, 260, 60, colors.green);
  circle(px, 180, 260, 60, colors.green);
  // anak membaca
  circle(px, 420, 330, 34, colors.skin1);
  rect(px, 386, 364, 68, 100, colors.teal);
  rect(px, 370, 400, 100, 60, colors.white);
  line(px, 380, 420, 460, 420, colors.sky, 3);
  line(px, 380, 438, 450, 438, colors.sky, 3);
  line(px, 386, 400, 370, 380, colors.skin1, 7);
  line(px, 454, 400, 470, 380, colors.skin1, 7);
  // burung
  line(px, 560, 160, 580, 145, colors.navy, 4);
  line(px, 580, 145, 600, 160, colors.navy, 4);
  return px;
}

function civicProjectScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  rect(px, 0, 430, W, 170, colors.sand);
  // papan proyek
  rect(px, 120, 150, 260, 180, colors.white);
  rect(px, 120, 150, 260, 12, colors.navy);
  for (let i = 0; i < 3; i += 1) rect(px, 145, 185 + i * 35, 200, 10, colors.sky);
  circle(px, 160, 320, 8, colors.red);
  // anak-anak
  const kids = [[460, colors.teal], [540, colors.orange], [620, colors.blue]];
  for (const [x, shirt] of kids) {
    circle(px, x, 270, 30, colors.skin1);
    rect(px, x - 26, 302, 52, 90, shirt);
    rect(px, x - 24, 392, 18, 60, colors.navy);
    rect(px, x + 6, 392, 18, 60, colors.navy);
  }
  line(px, 490, 310, 560, 260, colors.navy, 4);
  rect(px, 680, 360, 50, 70, colors.green);
  line(px, 700, 330, 700, 370, colors.greenDark, 6);
  ellipse(px, 690, 340, 18, 10, colors.green);
  ellipse(px, 712, 350, 18, 10, colors.green);
  return px;
}

function timeVolumeData() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [40, 290, 540];
  for (const x of panels) {
    rect(px, x, 100, 220, 420, colors.sky);
    rect(px, x, 100, 220, 5, colors.navy);
    rect(px, x, 515, 220, 5, colors.navy);
    rect(px, x, 100, 5, 420, colors.navy);
    rect(px, x + 215, 100, 5, 420, colors.navy);
  }
  // jam
  circle(px, 150, 300, 80, colors.white);
  circle(px, 150, 300, 72, colors.sand);
  line(px, 150, 300, 150, 245, colors.navy, 5);
  line(px, 150, 300, 190, 325, colors.navy, 5);
  circle(px, 150, 300, 6, colors.navy);
  for (let a = 0; a < 360; a += 30) {
    const r = (a * Math.PI) / 180;
    circle(px, Math.round(150 + Math.cos(r) * 64), Math.round(300 + Math.sin(r) * 64), 3, colors.navy);
  }
  // gelas ukur
  rect(px, 340, 220, 120, 240, colors.white);
  rect(px, 340, 220, 8, 240, colors.navy);
  rect(px, 452, 220, 8, 240, colors.navy);
  rect(px, 340, 452, 120, 8, colors.navy);
  rect(px, 348, 340, 104, 112, colors.blue);
  for (let i = 0; i < 5; i += 1) line(px, 348, 250 + i * 40, 380, 250 + i * 40, colors.navy, 3);
  // diagram batang
  line(px, 580, 460, 740, 460, colors.navy, 5);
  line(px, 580, 460, 580, 240, colors.navy, 5);
  rect(px, 600, 400, 30, 60, colors.teal);
  rect(px, 640, 340, 30, 120, colors.orange);
  rect(px, 680, 280, 30, 180, colors.red);
  return px;
}

function kingdomScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 440, W, 160, colors.green);
  // candi bertingkat
  rect(px, 260, 360, 220, 80, colors.soil);
  rect(px, 290, 300, 160, 60, colors.soil);
  rect(px, 320, 250, 100, 50, colors.soil);
  triangle(px, 300, 250, 440, 250, 370, 190, colors.navy);
  rect(px, 350, 400, 40, 40, colors.navy);
  // kapal
  ellipse(px, 120, 450, 90, 22, colors.soil);
  line(px, 120, 430, 120, 300, colors.navy, 5);
  triangle(px, 120, 310, 120, 420, 200, 400, colors.white);
  // prasasti
  rect(px, 610, 350, 100, 120, colors.sand);
  for (let i = 0; i < 5; i += 1) line(px, 625, 370 + i * 20, 695, 370 + i * 20, colors.soil, 3);
  return px;
}

function interviewScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  line(px, 400, 60, 400, 600, colors.navy, 4);
  rect(px, 0, 450, 400, 150, colors.sand);
  rect(px, 400, 450, 400, 150, colors.sand);
  // wawancara
  circle(px, 130, 260, 34, colors.skin1);
  rect(px, 96, 294, 68, 110, colors.teal);
  circle(px, 290, 260, 34, colors.skin3);
  rect(px, 256, 294, 68, 110, colors.orange);
  line(px, 175, 320, 230, 300, colors.navy, 4);
  circle(px, 235, 298, 10, colors.navy);
  rect(px, 170, 350, 60, 45, colors.white);
  line(px, 180, 365, 220, 365, colors.sky, 3);
  // presentasi
  rect(px, 460, 160, 280, 160, colors.white);
  rect(px, 460, 160, 280, 12, colors.navy);
  line(px, 500, 300, 720, 300, colors.navy, 5);
  rect(px, 530, 260, 30, 40, colors.teal);
  rect(px, 580, 230, 30, 70, colors.orange);
  rect(px, 630, 200, 30, 100, colors.red);
  circle(px, 510, 420, 32, colors.skin2);
  rect(px, 478, 452, 64, 100, colors.blue);
  line(px, 542, 460, 600, 380, colors.navy, 5);
  return px;
}

function communityScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 430, W, 170, colors.green);
  rect(px, 60, 220, 180, 210, colors.sand);
  triangle(px, 50, 220, 250, 220, 150, 150, colors.red);
  rect(px, 300, 240, 160, 190, colors.sand);
  triangle(px, 290, 240, 470, 240, 380, 175, colors.teal);
  // warga kerja bakti
  const people = [[520, colors.teal], [580, colors.orange], [640, colors.blue], [700, colors.red]];
  for (const [x, shirt] of people) {
    circle(px, x, 330, 28, colors.skin1);
    rect(px, x - 24, 360, 48, 90, shirt);
    rect(px, x - 22, 450, 16, 60, colors.navy);
    rect(px, x + 6, 450, 16, 60, colors.navy);
  }
  line(px, 500, 400, 740, 400, colors.soil, 8);
  rect(px, 560, 420, 40, 20, colors.orange);
  return px;
}

function arc(px, cx, cy, r, startDeg, endDeg, color, thickness = 4) {
  for (let angle = startDeg; angle <= endDeg; angle += 2) {
    const rad = (angle * Math.PI) / 180;
    circle(px, Math.round(cx + Math.cos(rad) * r), Math.round(cy + Math.sin(rad) * r), thickness, color);
  }
}

function geometryScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  // garis sejajar dan transversal
  line(px, 60, 170, 360, 170, colors.navy, 6);
  line(px, 60, 270, 360, 270, colors.navy, 6);
  line(px, 140, 110, 260, 330, colors.red, 6);
  // sudut lancip
  line(px, 460, 420, 620, 420, colors.navy, 6);
  line(px, 460, 420, 590, 300, colors.blue, 6);
  arc(px, 460, 420, 70, -60, 0, colors.orange, 4);
  // sudut siku-siku
  line(px, 460, 180, 620, 180, colors.navy, 6);
  line(px, 460, 180, 460, 340, colors.blue, 6);
  rect(px, 460, 220, 40, 40, colors.tealLight);
  // sudut tumpul
  line(px, 650, 480, 760, 480, colors.navy, 6);
  line(px, 650, 480, 570, 370, colors.blue, 6);
  arc(px, 650, 480, 70, -115, 0, colors.red, 4);
  return px;
}

function cultureScene() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 60, colors.teal);
  line(px, 400, 60, 400, 600, colors.navy, 4);
  line(px, 0, 330, 800, 330, colors.navy, 4);
  // rumah gadang
  triangle(px, 80, 300, 320, 300, 200, 180, colors.red);
  rect(px, 110, 300, 180, 20, colors.soil);
  // penari
  circle(px, 550, 160, 30, colors.skin1);
  rect(px, 520, 190, 60, 90, colors.orange);
  line(px, 520, 220, 470, 180, colors.skin1, 8);
  line(px, 580, 220, 630, 180, colors.skin1, 8);
  line(px, 540, 280, 520, 320, colors.navy, 8);
  line(px, 560, 280, 580, 320, colors.navy, 8);
  // rendang
  ellipse(px, 200, 470, 100, 60, colors.white);
  for (const [x, y] of [[160, 450], [200, 440], [240, 455], [180, 480], [220, 485]]) circle(px, x, y, 22, colors.soil);
  // ulos
  rect(px, 480, 430, 240, 120, colors.navy);
  for (let i = 0; i < 6; i += 1) rect(px, 490 + i * 38, 440, 18, 100, i % 2 ? colors.red : colors.white);
  return px;
}

function narrativeScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [30, 280, 530];
  for (const x of panels) {
    rect(px, x, 100, 230, 420, colors.sky);
    rect(px, x, 100, 230, 5, colors.navy);
    rect(px, x, 515, 230, 5, colors.navy);
    rect(px, x, 100, 5, 420, colors.navy);
    rect(px, x + 225, 100, 5, 420, colors.navy);
  }
  // panel 1: anak melihat kucing
  circle(px, 100, 260, 28, colors.skin1);
  rect(px, 76, 288, 48, 90, colors.teal);
  circle(px, 210, 430, 30, colors.orange);
  circle(px, 210, 410, 10, colors.orange);
  circle(px, 230, 410, 10, colors.orange);
  // panel 2: hujan, kucing di bawah pohon
  for (let i = 0; i < 5; i += 1) line(px, 300 + i * 30, 140, 290 + i * 30, 200, colors.blue, 4);
  rect(px, 340, 330, 18, 120, colors.soil);
  circle(px, 350, 320, 50, colors.green);
  circle(px, 420, 440, 24, colors.orange);
  circle(px, 412, 428, 8, colors.orange);
  circle(px, 428, 428, 8, colors.orange);
  // panel 3: anak menolong dengan payung
  circle(px, 620, 260, 28, colors.skin2);
  rect(px, 596, 288, 48, 90, colors.blue);
  ellipse(px, 620, 210, 90, 30, colors.red);
  line(px, 620, 240, 620, 330, colors.navy, 4);
  circle(px, 690, 440, 24, colors.orange);
  return px;
}

function flagCeremonyScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 430, W, 170, colors.green);
  rect(px, 80, 220, 260, 210, colors.sand);
  triangle(px, 70, 220, 350, 220, 210, 150, colors.red);
  rect(px, 120, 260, 50, 60, colors.white);
  rect(px, 240, 260, 50, 60, colors.white);
  rect(px, 400, 150, 8, 280, colors.navy);
  rect(px, 408, 155, 100, 32, colors.red);
  rect(px, 408, 187, 100, 32, colors.white);
  const kids = [[500, colors.teal], [570, colors.orange], [640, colors.blue], [710, colors.red]];
  for (const [x, shirt] of kids) {
    circle(px, x, 330, 28, colors.skin1);
    rect(px, x - 24, 360, 48, 100, shirt);
    rect(px, x - 22, 460, 16, 60, colors.navy);
    rect(px, x + 6, 460, 16, 60, colors.navy);
  }
  return px;
}

function planeShapes() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  // grid
  for (let x = 0; x <= W; x += 40) line(px, x, 60, x, 600, colors.sky, 1);
  for (let y = 60; y <= 600; y += 40) line(px, 0, y, W, y, colors.sky, 1);
  rect(px, 80, 120, 160, 160, colors.orange);
  rect(px, 300, 160, 220, 120, colors.teal);
  triangle(px, 560, 280, 700, 280, 630, 140, colors.sun);
  circle(px, 180, 430, 90, colors.red);
  return px;
}

function waterCycle() {
  const px = canvas();
  fill(px, colors.sky);
  circle(px, 680, 100, 55, colors.sun);
  for (let a = 0; a < 360; a += 45) {
    const r = (a * Math.PI) / 180;
    line(px, 680 + Math.cos(r) * 65, 100 + Math.sin(r) * 65, 680 + Math.cos(r) * 88, 100 + Math.sin(r) * 88, colors.sun, 5);
  }
  // tanah, gunung, lalu laut
  rect(px, 0, 420, W, 180, colors.green);
  triangle(px, 380, 420, 700, 420, 540, 220, colors.greenDark);
  rect(px, 0, 380, 420, 80, colors.blue);
  rect(px, 0, 380, 420, 12, colors.teal);
  // awan
  for (const [x, y] of [[220, 180], [280, 170], [340, 185], [260, 200]]) circle(px, x, y, 36, colors.white);
  // hujan
  for (let i = 0; i < 6; i += 1) line(px, 230 + i * 24, 230, 215 + i * 24, 280, colors.blue, 4);
  // panah penguapan dan hujan
  line(px, 120, 390, 160, 250, colors.red, 6);
  line(px, 160, 250, 145, 275, colors.red, 6);
  line(px, 160, 250, 180, 270, colors.red, 6);
  line(px, 420, 250, 420, 380, colors.red, 6);
  line(px, 420, 380, 405, 355, colors.red, 6);
  line(px, 420, 380, 435, 355, colors.red, 6);
  return px;
}

function plantingSteps() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [40, 290, 540];
  for (const x of panels) {
    rect(px, x, 100, 220, 420, colors.sky);
    rect(px, x, 100, 220, 5, colors.navy);
    rect(px, x, 515, 220, 5, colors.navy);
    rect(px, x, 100, 5, 420, colors.navy);
    rect(px, x + 215, 100, 5, 420, colors.navy);
  }
  // panci pot + tanah
  rect(px, 90, 380, 120, 100, colors.orange);
  rect(px, 100, 380, 100, 30, colors.soil);
  // biji
  rect(px, 340, 390, 120, 90, colors.orange);
  rect(px, 350, 390, 100, 30, colors.soil);
  circle(px, 400, 380, 14, colors.soil);
  // tunas + penyiram
  rect(px, 590, 380, 120, 90, colors.orange);
  rect(px, 600, 380, 100, 30, colors.soil);
  rect(px, 645, 300, 10, 60, colors.greenDark);
  ellipse(px, 630, 320, 24, 12, colors.green);
  ellipse(px, 670, 340, 24, 12, colors.green);
  rect(px, 560, 220, 70, 40, colors.blue);
  line(px, 630, 240, 660, 260, colors.blue, 6);
  for (const [x, y] of [[665, 280], [675, 300], [655, 305]]) ellipse(px, x, y, 5, 8, colors.blue);
  return px;
}

function bhinnekaScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 440, W, 160, colors.green);
  rect(px, 380, 140, 8, 300, colors.navy);
  rect(px, 388, 145, 80, 26, colors.red);
  rect(px, 388, 171, 80, 26, colors.white);
  circle(px, 680, 100, 40, colors.sun);
  const kids = [
    [120, colors.teal], [240, colors.orange], [480, colors.blue], [600, colors.red], [360, colors.green]
  ];
  for (const [x, shirt] of kids) {
    circle(px, x, 300, 32, colors.skin1);
    rect(px, x - 28, 334, 56, 100, shirt);
    rect(px, x - 26, 434, 18, 60, colors.navy);
    rect(px, x + 8, 434, 18, 60, colors.navy);
    line(px, x - 28, 360, x - 60, 390, colors.skin1, 8);
    line(px, x + 28, 360, x + 60, 390, colors.skin1, 8);
  }
  return px;
}

function exhibitionScene() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 60, colors.teal);
  rect(px, 0, 470, W, 130, colors.tealLight);
  // karya di dinding
  const frames = [
    [80, 120, 150, 120, colors.teal],
    [280, 100, 180, 150, colors.orange],
    [520, 130, 160, 110, colors.red]
  ];
  for (const [x, y, w, h, c] of frames) {
    rect(px, x - 8, y - 8, w + 16, h + 16, colors.navy);
    rect(px, x, y, w, h, colors.white);
    circle(px, x + w / 2, y + h / 2, Math.min(w, h) / 3, c);
    line(px, x + 10, y + h - 15, x + w - 10, y + 20, colors.sky, 3);
  }
  // meja karya
  rect(px, 250, 390, 300, 16, colors.orange);
  rect(px, 270, 406, 14, 70, colors.navy);
  rect(px, 516, 406, 14, 70, colors.navy);
  circle(px, 310, 360, 26, colors.teal);
  rect(px, 370, 340, 50, 50, colors.sun);
  rect(px, 460, 345, 40, 45, colors.red);
  // pengunjung
  for (const [x, c] of [[660, colors.blue], [720, colors.green]]) {
    circle(px, x, 260, 28, colors.skin1);
    rect(px, x - 24, 290, 48, 110, c);
  }
  return px;
}

function hygieneScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [40, 240, 440, 640];
  for (const x of panels) {
    rect(px, x, 100, 150, 420, colors.sky);
    rect(px, x, 100, 150, 5, colors.navy);
    rect(px, x, 515, 150, 5, colors.navy);
    rect(px, x, 100, 5, 420, colors.navy);
    rect(px, x + 145, 100, 5, 420, colors.navy);
  }
  // cuci tangan
  rect(px, 75, 390, 90, 40, colors.white);
  rect(px, 110, 330, 14, 60, colors.navy);
  rect(px, 90, 320, 50, 14, colors.navy);
  circle(px, 105, 440, 16, colors.skin1);
  circle(px, 135, 440, 16, colors.skin1);
  for (const [x, y] of [[100, 370], [120, 380], [140, 370]]) ellipse(px, x, y, 6, 9, colors.blue);
  // sikat gigi
  rect(px, 275, 360, 80, 16, colors.blue);
  rect(px, 345, 352, 24, 32, colors.white);
  line(px, 350, 352, 350, 340, colors.navy, 3);
  line(px, 358, 352, 358, 340, colors.navy, 3);
  rect(px, 270, 420, 60, 40, colors.white);
  line(px, 280, 440, 320, 440, colors.sky, 3);
  // buah
  circle(px, 500, 380, 30, colors.red);
  circle(px, 545, 395, 26, colors.orange);
  ellipse(px, 590, 385, 30, 14, colors.sun);
  // tidur
  rect(px, 660, 400, 120, 40, colors.teal);
  rect(px, 660, 380, 30, 20, colors.white);
  ellipse(px, 740, 310, 22, 22, colors.sun);
  circle(px, 755, 300, 18, colors.sky);
  for (const [x, y] of [[700, 300], [720, 280], [680, 280]]) circle(px, x, y, 3, colors.sun);
  return px;
}

function prayerScene() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 60, colors.teal);
  // siluet masjid
  rect(px, 80, 280, 260, 120, colors.navy);
  ellipse(px, 210, 280, 70, 60, colors.navy);
  rect(px, 330, 240, 20, 160, colors.navy);
  ellipse(px, 340, 240, 20, 26, colors.navy);
  // sajadah
  rect(px, 200, 430, 400, 130, colors.teal);
  rect(px, 220, 450, 360, 90, colors.tealLight);
  // lentera
  rect(px, 650, 120, 60, 90, colors.sun);
  circle(px, 680, 200, 16, colors.white);
  // jam
  circle(px, 600, 300, 40, colors.white);
  line(px, 600, 300, 600, 272, colors.navy, 4);
  line(px, 600, 300, 622, 310, colors.navy, 4);
  return px;
}

function colorTexture() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const wheel = [
    [400, 180, colors.red],
    [490, 240, colors.orange],
    [490, 330, colors.sun],
    [400, 390, colors.green],
    [310, 330, colors.blue],
    [310, 240, [128, 90, 213, 255]]
  ];
  for (const [x, y, c] of wheel) circle(px, x, y, 46, c);
  circle(px, 400, 285, 32, colors.white);
  // tekstur: titik, garis, halus
  rect(px, 80, 330, 130, 130, colors.sky);
  for (let y = 0; y < 5; y += 1) for (let x = 0; x < 5; x += 1) circle(px, 100 + x * 24, 350 + y * 24, 6, colors.greenDark);
  rect(px, 240, 330, 130, 130, colors.sand);
  for (let i = 0; i < 6; i += 1) line(px, 255, 345 + i * 20, 355, 345 + i * 20, colors.soil, 6);
  rect(px, 400, 470, 300, 90, colors.tealLight);
  return px;
}

function fitnessScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [40, 240, 440, 640];
  for (const x of panels) {
    rect(px, x, 100, 150, 420, colors.sky);
    rect(px, x, 100, 150, 5, colors.navy);
    rect(px, x, 515, 150, 5, colors.navy);
    rect(px, x, 100, 5, 420, colors.navy);
    rect(px, x + 145, 100, 5, 420, colors.navy);
  }
  // push-up
  circle(px, 100, 330, 22, colors.skin1);
  line(px, 100, 352, 170, 380, colors.teal, 14);
  line(px, 110, 370, 90, 440, colors.navy, 9);
  line(px, 160, 378, 150, 445, colors.navy, 9);
  line(px, 170, 380, 200, 380, colors.skin1, 8);
  // lari
  circle(px, 315, 240, 22, colors.skin2);
  line(px, 315, 262, 315, 350, colors.orange, 12);
  line(px, 315, 290, 285, 330, colors.navy, 8);
  line(px, 315, 290, 345, 330, colors.navy, 8);
  line(px, 315, 350, 285, 420, colors.navy, 8);
  line(px, 315, 350, 350, 415, colors.navy, 8);
  line(px, 260, 280, 295, 280, colors.navy, 4);
  line(px, 250, 310, 290, 310, colors.navy, 4);
  // duduk menjangkau
  circle(px, 515, 300, 22, colors.skin3);
  line(px, 515, 322, 515, 400, colors.blue, 14);
  line(px, 515, 400, 470, 450, colors.navy, 9);
  line(px, 515, 400, 560, 450, colors.navy, 9);
  line(px, 515, 350, 580, 400, colors.skin3, 8);
  rect(px, 580, 390, 40, 15, colors.orange);
  // lari cepat
  circle(px, 715, 240, 22, colors.skin1);
  line(px, 715, 262, 715, 350, colors.red, 12);
  line(px, 715, 290, 680, 320, colors.navy, 8);
  line(px, 715, 290, 750, 320, colors.navy, 8);
  line(px, 715, 350, 680, 420, colors.navy, 8);
  line(px, 715, 350, 750, 415, colors.navy, 8);
  line(px, 660, 270, 695, 270, colors.orange, 4);
  line(px, 650, 300, 690, 300, colors.orange, 4);
  return px;
}

function akhlakScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  line(px, 400, 60, 400, 600, colors.navy, 4);
  rect(px, 0, 450, 400, 150, colors.sand);
  rect(px, 400, 450, 400, 150, colors.sand);
  // panel 1: mengembalikan buku
  circle(px, 120, 250, 34, colors.skin1);
  rect(px, 86, 284, 68, 110, colors.teal);
  circle(px, 280, 250, 34, colors.skin3);
  rect(px, 246, 284, 68, 110, colors.orange);
  rect(px, 178, 312, 68, 54, colors.navy);
  rect(px, 183, 317, 58, 44, colors.sun);
  line(px, 190, 330, 234, 330, colors.navy, 4);
  line(px, 190, 344, 228, 344, colors.navy, 4);
  line(px, 150, 330, 178, 330, colors.skin1, 8);
  // panel 2: menolong teman
  circle(px, 520, 240, 34, colors.skin2);
  rect(px, 486, 274, 68, 110, colors.blue);
  circle(px, 620, 290, 34, colors.skin1);
  rect(px, 586, 324, 68, 100, colors.green);
  line(px, 554, 300, 600, 340, colors.skin2, 10);
  line(px, 600, 420, 620, 470, colors.navy, 9);
  line(px, 650, 424, 660, 470, colors.navy, 9);
  return px;
}

function drawingShapes() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 90, 100, 38, colors.sun);
  for (let a = 0; a < 360; a += 45) {
    const r = (a * Math.PI) / 180;
    line(px, 90 + Math.cos(r) * 48, 100 + Math.sin(r) * 48, 90 + Math.cos(r) * 66, 100 + Math.sin(r) * 66, colors.sun, 4);
  }
  rect(px, 60, 470, 680, 24, colors.soil);
  rect(px, 110, 300, 140, 170, colors.orange);
  rect(px, 130, 270, 140, 30, colors.sun);
  line(px, 250, 300, 270, 270, colors.navy, 3);
  line(px, 250, 470, 270, 440, colors.navy, 3);
  line(px, 110, 300, 130, 270, colors.navy, 3);
  circle(px, 390, 380, 90, colors.teal);
  circle(px, 360, 345, 20, colors.white);
  line(px, 480, 470, 590, 470, colors.soil, 8);
  rect(px, 500, 280, 100, 170, colors.tealLight);
  ellipse(px, 550, 280, 50, 18, colors.teal);
  ellipse(px, 550, 450, 50, 18, colors.teal);
  return px;
}

function manipulativeScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [40, 240, 440, 640];
  for (const x of panels) {
    rect(px, x, 100, 150, 420, colors.sky);
    rect(px, x, 100, 150, 5, colors.navy);
    rect(px, x, 515, 150, 5, colors.navy);
    rect(px, x, 100, 5, 420, colors.navy);
    rect(px, x + 145, 100, 5, 420, colors.navy);
  }
  const kid = (cx, cy, shirt) => {
    circle(px, cx, cy, 24, colors.skin1);
    rect(px, cx - 14, cy + 24, 28, 90, shirt);
    line(px, cx - 10, cy + 114, cx - 24, cy + 170, colors.navy, 9);
    line(px, cx + 10, cy + 114, cx + 24, cy + 170, colors.navy, 9);
  };
  // lempar
  kid(115, 200, colors.teal);
  line(px, 115, 240, 150, 170, colors.skin1, 9);
  circle(px, 165, 150, 18, colors.orange);
  // tangkap
  kid(315, 200, colors.orange);
  line(px, 315, 240, 270, 260, colors.skin1, 9);
  line(px, 315, 240, 360, 260, colors.skin1, 9);
  circle(px, 315, 275, 18, colors.orange);
  // tendang
  kid(515, 200, colors.blue);
  line(px, 515, 300, 550, 350, colors.navy, 12);
  circle(px, 570, 360, 18, colors.orange);
  // menggiring
  kid(715, 200, colors.red);
  line(px, 715, 250, 680, 310, colors.skin1, 9);
  circle(px, 665, 330, 18, colors.orange);
  line(px, 620, 300, 655, 300, colors.navy, 4);
  line(px, 610, 340, 650, 340, colors.navy, 4);
  return px;
}

function imanScene() {
  const px = canvas();
  fill(px, colors.navy);
  circle(px, 400, 300, 170, [30, 41, 59, 255]);
  circle(px, 360, 270, 55, colors.red);
  circle(px, 440, 270, 55, colors.red);
  triangle(px, 305, 290, 495, 290, 400, 410, colors.red);
  // lentera
  rect(px, 90, 120, 70, 110, colors.sun);
  rect(px, 105, 100, 40, 20, colors.sun);
  circle(px, 125, 175, 20, colors.white);
  // bintang
  for (let i = 0; i < 6; i += 1) {
    const angle = (i * 60 * Math.PI) / 180;
    const x = 400 + Math.cos(angle) * 230;
    const y = 300 + Math.sin(angle) * 190;
    line(px, x - 14, y, x + 14, y, colors.sun, 5);
    line(px, x, y - 14, x, y + 14, colors.sun, 5);
  }
  return px;
}

function artElements() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 60, colors.teal);
  // bidang dan bentuk
  rect(px, 90, 120, 180, 180, colors.orange);
  circle(px, 430, 220, 110, colors.teal);
  ellipse(px, 650, 180, 100, 60, colors.sun);
  // garis
  for (let i = 0; i < 5; i += 1) line(px, 90, 380 + i * 18, 330, 380 + i * 18, colors.navy, 5);
  for (let i = 0; i < 4; i += 1) line(px, 380 + i * 30, 360, 500 + i * 30, 470, colors.blue, 4);
  // tekstur titik
  for (let y = 0; y < 6; y += 1) {
    for (let x = 0; x < 8; x += 1) circle(px, 560 + x * 24, 350 + y * 24, 5, colors.greenDark);
  }
  // ruang/negative space dibiarkan
  rect(px, 620, 480, 130, 70, colors.tealLight);
  return px;
}

function movementScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [40, 240, 440, 640];
  for (const x of panels) {
    rect(px, x, 100, 150, 420, colors.sky);
    rect(px, x, 100, 150, 5, colors.navy);
    rect(px, x, 515, 150, 5, colors.navy);
    rect(px, x, 100, 5, 420, colors.navy);
    rect(px, x + 145, 100, 5, 420, colors.navy);
  }
  const drawKid = (cx, cy, pose) => {
    circle(px, cx, cy, 24, colors.skin1);
    line(px, cx, cy + 24, cx, cy + 100, colors.teal, 12);
    if (pose === "walk") {
      line(px, cx, cy + 45, cx - 30, cy + 75, colors.navy, 8);
      line(px, cx, cy + 45, cx + 30, cy + 75, colors.navy, 8);
      line(px, cx, cy + 100, cx - 22, cy + 155, colors.navy, 8);
      line(px, cx, cy + 100, cx + 22, cy + 155, colors.navy, 8);
    } else if (pose === "run") {
      line(px, cx, cy + 45, cx - 40, cy + 65, colors.navy, 8);
      line(px, cx, cy + 45, cx + 40, cy + 60, colors.navy, 8);
      line(px, cx, cy + 100, cx - 40, cy + 140, colors.navy, 8);
      line(px, cx, cy + 100, cx + 45, cy + 145, colors.navy, 8);
      line(px, cx - 55, cy + 40, cx - 20, cy + 40, colors.orange, 4);
      line(px, cx - 60, cy + 70, cx - 25, cy + 70, colors.orange, 4);
    } else if (pose === "jump") {
      line(px, cx, cy + 45, cx - 45, cy + 15, colors.navy, 8);
      line(px, cx, cy + 45, cx + 45, cy + 15, colors.navy, 8);
      line(px, cx, cy + 100, cx - 30, cy + 135, colors.navy, 8);
      line(px, cx, cy + 100, cx + 30, cy + 135, colors.navy, 8);
      line(px, cx - 60, cy + 180, cx + 60, cy + 180, colors.green, 5);
    } else {
      circle(px, cx, cy + 20, 24, colors.skin1);
      line(px, cx, cy + 44, cx + 10, cy + 120, colors.teal, 12);
      line(px, cx + 10, cy + 120, cx + 40, cy + 150, colors.navy, 8);
      line(px, cx + 10, cy + 120, cx - 10, cy + 160, colors.navy, 8);
      line(px, cx + 5, cy + 70, cx - 20, cy + 120, colors.navy, 8);
    }
  };
  drawKid(115, 150, "walk");
  drawKid(315, 150, "run");
  drawKid(515, 130, "jump");
  drawKid(715, 170, "bend");
  return px;
}

function quranScene() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 60, colors.teal);
  rect(px, 560, 120, 160, 220, colors.sky);
  rect(px, 560, 120, 160, 8, colors.white);
  rect(px, 636, 120, 8, 220, colors.white);
  // sajadah
  rect(px, 180, 420, 440, 140, colors.teal);
  rect(px, 200, 440, 400, 100, colors.tealLight);
  // rehal
  line(px, 300, 430, 480, 330, colors.soil, 12);
  line(px, 500, 430, 320, 330, colors.soil, 12);
  // kitab tertutup
  rect(px, 310, 280, 200, 60, colors.greenDark);
  rect(px, 310, 280, 200, 12, colors.sun);
  circle(px, 410, 310, 16, colors.sun);
  // lampu
  line(px, 700, 0, 700, 120, colors.navy, 4);
  circle(px, 700, 140, 26, colors.sun);
  return px;
}

function printmakingScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  rect(px, 50, 110, 380, 420, colors.sand);
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const x = 115 + col * 110;
      const y = 180 + row * 115;
      circle(px, x, y, 32, colors.green);
      rect(px, x - 42, y + 28, 84, 10, colors.greenDark);
    }
  }
  rect(px, 500, 150, 70, 260, colors.green);
  for (let i = 0; i < 6; i += 1) line(px, 505, 165 + i * 40, 565, 165 + i * 40, colors.greenDark, 4);
  circle(px, 650, 260, 55, colors.orange);
  rect(px, 600, 350, 120, 40, colors.navy);
  rect(px, 620, 390, 20, 80, colors.navy);
  rect(px, 680, 390, 20, 80, colors.navy);
  return px;
}

function naturalCraftScene() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 60, colors.teal);
  rect(px, 60, 120, 260, 380, colors.white);
  for (let i = 0; i < 8; i += 1) rect(px, 80 + i * 28, 140, 14, 340, colors.orange);
  for (let i = 0; i < 10; i += 1) rect(px, 80, 150 + i * 32, 220, 12, colors.soil);
  ellipse(px, 420, 200, 40, 70, colors.green);
  ellipse(px, 490, 240, 34, 60, colors.greenDark);
  line(px, 420, 200, 420, 320, colors.soil, 5);
  line(px, 490, 240, 490, 340, colors.soil, 5);
  for (const [x, y] of [[400, 420], [450, 450], [500, 410], [550, 455], [430, 500], [520, 500]]) {
    ellipse(px, x, y, 16, 12, colors.sun);
  }
  rect(px, 610, 180, 70, 120, colors.white);
  rect(px, 625, 150, 40, 35, colors.blue);
  return px;
}

function artAppreciationScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 0, W, 60, colors.teal);
  const frames = [60, 310, 560];
  const frameColors = [colors.red, colors.orange, colors.green];
  frames.forEach((x, i) => {
    rect(px, x, 120, 180, 240, colors.white);
    rect(px, x + 10, 130, 160, 220, frameColors[i]);
    if (i === 0) circle(px, x + 90, 240, 55, colors.sun);
    if (i === 1) triangle(px, x + 20, 340, x + 90, 170, x + 160, 340, colors.teal);
    if (i === 2) {
      for (let k = 0; k < 4; k += 1) circle(px, x + 50 + k * 30, 220, 18, colors.blue);
    }
    rect(px, x + 40, 390, 100, 36, colors.white);
    rect(px, x + 55, 400, 70, 6, colors.navy);
  });
  circle(px, 400, 480, 26, colors.skin1);
  line(px, 400, 506, 400, 560, colors.navy, 14);
  return px;
}

function smallBallScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [40, 290, 540];
  for (const x of panels) {
    rect(px, x, 100, 220, 420, colors.sky);
    rect(px, x, 100, 220, 5, colors.navy);
    rect(px, x, 515, 220, 5, colors.navy);
    rect(px, x, 100, 5, 420, colors.navy);
    rect(px, x + 215, 100, 5, 420, colors.navy);
  }
  circle(px, 150, 300, 52, colors.sun);
  arc(px, 150, 300, 52, 20, 120, colors.white, 4);
  ellipse(px, 150, 400, 34, 50, colors.orange);
  line(px, 150, 440, 150, 500, colors.soil, 10);
  ellipse(px, 400, 260, 34, 40, colors.white);
  for (let i = -2; i <= 2; i += 1) line(px, 400, 300, 400 + i * 18, 400, colors.navy, 3);
  ellipse(px, 400, 410, 26, 26, colors.green);
  line(px, 400, 436, 400, 500, colors.soil, 10);
  ellipse(px, 650, 320, 70, 90, colors.red);
  line(px, 650, 230, 650, 410, colors.soil, 10);
  circle(px, 720, 400, 18, colors.white);
  return px;
}

function basicGymnasticsScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  rect(px, 50, 420, 700, 120, colors.blue);
  rect(px, 50, 420, 700, 10, colors.navy);
  circle(px, 150, 380, 40, colors.skin1);
  arc(px, 150, 390, 60, 200, 340, colors.navy, 10);
  circle(px, 380, 220, 34, colors.skin2);
  line(px, 380, 254, 380, 360, colors.teal, 14);
  line(px, 380, 280, 320, 220, colors.navy, 8);
  line(px, 380, 280, 440, 220, colors.navy, 8);
  line(px, 380, 360, 350, 430, colors.navy, 8);
  line(px, 380, 360, 410, 430, colors.navy, 8);
  circle(px, 620, 240, 34, colors.skin3);
  line(px, 620, 274, 620, 380, colors.teal, 14);
  line(px, 620, 300, 550, 280, colors.navy, 8);
  line(px, 620, 300, 690, 280, colors.navy, 8);
  line(px, 620, 380, 620, 450, colors.navy, 8);
  line(px, 620, 380, 580, 340, colors.navy, 8);
  return px;
}

function athleticsScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 0, W, 60, colors.teal);
  rect(px, 0, 330, W, 270, colors.red);
  for (let i = 0; i < 5; i += 1) rect(px, 0, 360 + i * 48, W, 4, colors.white);
  rect(px, 80, 380, 30, 60, colors.navy);
  rect(px, 110, 420, 80, 20, colors.navy);
  circle(px, 260, 280, 26, colors.skin1);
  line(px, 260, 306, 260, 360, colors.teal, 12);
  line(px, 260, 320, 220, 350, colors.navy, 8);
  line(px, 260, 320, 300, 350, colors.navy, 8);
  line(px, 260, 360, 230, 410, colors.navy, 8);
  line(px, 260, 360, 300, 420, colors.navy, 8);
  rect(px, 470, 360, 260, 130, colors.sand);
  rect(px, 470, 360, 260, 8, colors.soil);
  line(px, 740, 220, 740, 400, colors.navy, 6);
  rect(px, 690, 300, 50, 14, colors.white);
  return px;
}

function fastingScene() {
  const px = canvas();
  fill(px, colors.navy);
  circle(px, 650, 110, 46, colors.sun);
  circle(px, 670, 96, 42, colors.navy);
  for (const [x, y] of [[540, 60], [720, 170], [470, 150]]) circle(px, x, y, 5, colors.white);
  rect(px, 80, 220, 260, 180, colors.teal);
  ellipse(px, 210, 220, 130, 60, colors.teal);
  rect(px, 190, 150, 40, 80, colors.tealLight);
  circle(px, 210, 145, 14, colors.sun);
  rect(px, 0, 480, W, 120, colors.soil);
  rect(px, 420, 420, 300, 60, colors.white);
  for (const x of [450, 510, 570]) ellipse(px, x, 410, 20, 14, colors.orange);
  rect(px, 620, 380, 40, 80, colors.sky);
  rect(px, 630, 390, 20, 40, colors.blue);
  return px;
}

function charityScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  rect(px, 90, 200, 230, 240, colors.green);
  rect(px, 90, 200, 230, 30, colors.greenDark);
  rect(px, 170, 180, 70, 20, colors.navy);
  rect(px, 130, 280, 150, 60, colors.white);
  for (const [x, y] of [[180, 400], [220, 380], [260, 410]]) circle(px, x, y, 18, colors.sun);
  rect(px, 390, 260, 150, 180, colors.sand);
  ellipse(px, 465, 260, 75, 30, colors.sand);
  rect(px, 420, 320, 90, 50, colors.white);
  circle(px, 620, 300, 30, colors.skin1);
  line(px, 620, 330, 580, 380, colors.teal, 12);
  circle(px, 700, 380, 30, colors.skin2);
  line(px, 700, 380, 650, 380, colors.teal, 12);
  circle(px, 640, 355, 14, colors.sun);
  return px;
}

function islamHistoryScene() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 60, colors.teal);
  line(px, 70, 320, 730, 320, colors.navy, 6);
  rect(px, 80, 200, 110, 120, colors.navy);
  rect(px, 80, 230, 110, 18, colors.sun);
  triangle(px, 250, 320, 320, 200, 390, 320, colors.soil);
  rect(px, 300, 270, 40, 50, colors.navy);
  rect(px, 450, 230, 180, 90, colors.teal);
  ellipse(px, 540, 230, 90, 46, colors.teal);
  rect(px, 520, 160, 40, 70, colors.tealLight);
  circle(px, 540, 155, 12, colors.sun);
  rect(px, 680, 260, 70, 60, colors.greenDark);
  rect(px, 680, 260, 70, 10, colors.sun);
  for (const x of [135, 320, 540, 715]) circle(px, x, 320, 12, colors.orange);
  return px;
}

function goodMannersScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 140, 230, 34, colors.skin3);
  line(px, 140, 264, 140, 380, colors.teal, 14);
  line(px, 140, 300, 190, 260, colors.navy, 8);
  line(px, 140, 380, 115, 460, colors.navy, 8);
  line(px, 140, 380, 165, 460, colors.navy, 8);
  circle(px, 240, 260, 28, colors.skin1);
  line(px, 240, 288, 240, 390, colors.orange, 12);
  line(px, 240, 390, 220, 450, colors.navy, 8);
  line(px, 240, 390, 260, 450, colors.navy, 8);
  rect(px, 400, 420, 300, 60, colors.white);
  circle(px, 430, 240, 30, colors.skin2);
  line(px, 430, 270, 430, 380, colors.teal, 12);
  circle(px, 520, 240, 30, colors.skin1);
  line(px, 520, 270, 520, 380, colors.green, 12);
  rect(px, 450, 400, 80, 20, colors.orange);
  rect(px, 545, 400, 80, 20, colors.sun);
  circle(px, 650, 300, 26, colors.skin3);
  line(px, 650, 326, 650, 400, colors.blue, 12);
  circle(px, 620, 360, 12, colors.red);
  return px;
}

function placeValueBlocks() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const columns = [
    { x: 30, color: colors.teal, size: 96, count: 3, gap: 12 },
    { x: 210, color: colors.orange, size: 62, count: 4, gap: 12 },
    { x: 390, color: colors.green, size: 16, count: 5, gap: 18, rod: true },
    { x: 570, color: colors.red, size: 28, count: 2, gap: 12 }
  ];
  for (const column of columns) {
    rect(px, column.x, 110, 200, 430, colors.sky);
    rect(px, column.x, 110, 200, 5, colors.navy);
    rect(px, column.x, 535, 200, 5, colors.navy);
    rect(px, column.x, 110, 5, 430, colors.navy);
    rect(px, column.x + 195, 110, 5, 430, colors.navy);
    for (let i = 0; i < column.count; i += 1) {
      if (column.rod) {
        const bx = column.x + 40 + i * (column.size + column.gap);
        rect(px, bx, 180, column.size, 330, column.color);
      } else {
        const bx = column.x + (200 - column.size) / 2;
        const by = 500 - i * (column.size + column.gap) - column.size;
        rect(px, bx, by, column.size, column.size, column.color);
      }
    }
  }
  return px;
}

function descriptionGarden() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 690, 120, 46, colors.sun);
  rect(px, 0, 480, W, 120, colors.green);
  rect(px, 0, 480, W, 12, colors.greenDark);
  // pohon
  rect(px, 150, 300, 34, 190, colors.soil);
  circle(px, 167, 270, 90, colors.green);
  circle(px, 120, 320, 55, colors.greenDark);
  circle(px, 215, 320, 55, colors.green);
  // bunga
  for (const [x, y] of [[260, 440], [300, 470], [340, 440], [600, 440], [640, 470]]) {
    line(px, x, y + 40, x, y + 90, colors.greenDark, 5);
    circle(px, x, y, 22, colors.red);
    circle(px, x, y, 9, colors.sun);
  }
  // bangku
  rect(px, 330, 380, 170, 16, colors.soil);
  rect(px, 340, 396, 14, 60, colors.navy);
  rect(px, 470, 396, 14, 60, colors.navy);
  // bendera
  rect(px, 700, 300, 8, 190, colors.navy);
  rect(px, 708, 300, 60, 20, colors.red);
  rect(px, 708, 320, 60, 20, colors.white);
  return px;
}

function livingThingsGarden() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 90, 110, 40, colors.sun);
  rect(px, 0, 450, W, 150, colors.green);
  // kolam
  ellipse(px, 240, 500, 150, 55, colors.blue);
  ellipse(px, 240, 495, 130, 42, colors.sky);
  ellipse(px, 210, 495, 28, 14, colors.orange);
  triangle(px, 185, 495, 160, 480, 160, 510, colors.orange);
  // tumbuhan
  line(px, 420, 470, 420, 360, colors.greenDark, 8);
  ellipse(px, 400, 380, 26, 16, colors.green);
  ellipse(px, 445, 400, 26, 16, colors.green);
  ellipse(px, 420, 340, 22, 14, colors.green);
  // kupu-kupu
  ellipse(px, 560, 250, 26, 18, colors.orange);
  ellipse(px, 600, 250, 26, 18, colors.orange);
  line(px, 580, 230, 580, 280, colors.navy, 4);
  // burung
  ellipse(px, 690, 220, 28, 20, colors.blue);
  circle(px, 710, 205, 12, colors.blue);
  triangle(px, 720, 205, 740, 200, 720, 212, colors.orange);
  // kucing
  ellipse(px, 150, 430, 42, 30, colors.orange);
  circle(px, 120, 405, 25, colors.orange);
  triangle(px, 104, 390, 110, 360, 124, 386, colors.orange);
  triangle(px, 136, 386, 146, 360, 150, 390, colors.orange);
  line(px, 100, 400, 76, 394, colors.navy, 3);
  line(px, 100, 406, 76, 406, colors.navy, 3);
  line(px, 100, 412, 76, 418, colors.navy, 3);
  return px;
}

function pancasilaSymbols() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const xs = [30, 190, 350, 510, 670];
  for (const x of xs) {
    rect(px, x, 100, 120, 430, colors.sky);
    rect(px, x, 100, 120, 5, colors.navy);
    rect(px, x, 525, 120, 5, colors.navy);
    rect(px, x, 100, 5, 430, colors.navy);
    rect(px, x + 115, 100, 5, 430, colors.navy);
  }
  // bintang
  star(px, 90, 250, 46, 19, colors.sun);
  // rantai
  for (let row = 0; row < 3; row += 1) {
    for (let i = 0; i < 3; i += 1) {
      ellipse(px, 220 + i * 30, 210 + row * 52, 17, 25, colors.orange);
    }
  }
  // pohon beringin
  rect(px, 400, 300, 18, 190, colors.soil);
  ellipse(px, 409, 250, 54, 44, colors.green);
  ellipse(px, 380, 290, 34, 28, colors.greenDark);
  ellipse(px, 438, 290, 34, 28, colors.greenDark);
  for (const x of [370, 400, 430, 448]) line(px, 409, 330, x, 490, colors.soil, 4);
  // kepala banteng
  ellipse(px, 570, 300, 42, 52, colors.navy);
  ellipse(px, 540, 246, 30, 12, colors.orange);
  ellipse(px, 600, 246, 30, 12, colors.orange);
  rect(px, 542, 280, 12, 12, colors.white);
  rect(px, 586, 280, 12, 12, colors.white);
  ellipse(px, 570, 340, 22, 12, colors.navy);
  // padi dan kapas
  line(px, 690, 480, 770, 480, colors.greenDark, 6);
  line(px, 710, 480, 710, 200, colors.greenDark, 5);
  for (let i = 0; i < 5; i += 1) {
    ellipse(px, 696, 220 + i * 36, 10, 14, colors.sun);
    ellipse(px, 724, 238 + i * 36, 10, 14, colors.sun);
  }
  line(px, 755, 480, 755, 230, colors.greenDark, 5);
  line(px, 755, 262, 742, 262, colors.greenDark, 4);
  line(px, 755, 250, 768, 250, colors.greenDark, 4);
  circle(px, 742, 262, 14, colors.white);
  circle(px, 768, 250, 14, colors.white);
  circle(px, 755, 226, 15, colors.white);
  return px;
}

function additionSubtractionScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  line(px, 60, 200, 740, 200, colors.navy, 5);
  for (let x = 60; x <= 740; x += 40) line(px, x, 190, x, 210, colors.navy, 3);
  arc(px, 200, 200, 70, -170, -20, colors.orange, 6);
  arc(px, 360, 260, 70, 200, 340, colors.green, 6);
  rect(px, 70, 330, 240, 180, colors.sky);
  for (let i = 0; i < 7; i += 1) {
    circle(px, 110 + (i % 4) * 50, 390 + Math.floor(i / 4) * 60, 18, colors.red);
  }
  rect(px, 350, 412, 50, 12, colors.navy);
  rect(px, 369, 393, 12, 50, colors.navy);
  rect(px, 470, 330, 240, 180, colors.sky);
  for (let i = 0; i < 5; i += 1) {
    circle(px, 510 + (i % 3) * 50, 390 + Math.floor(i / 3) * 60, 18, colors.green);
  }
  return px;
}

function multiplicationGroupsScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const boxes = [60, 300, 540];
  for (const x of boxes) {
    rect(px, x, 110, 200, 220, colors.sky);
    rect(px, x, 110, 200, 5, colors.navy);
    rect(px, x, 325, 200, 5, colors.navy);
    rect(px, x, 110, 5, 220, colors.navy);
    rect(px, x + 195, 110, 5, 220, colors.navy);
    for (let i = 0; i < 4; i += 1) {
      star(px, x + 60 + (i % 2) * 80, 175 + Math.floor(i / 2) * 90, 30, 13, colors.sun);
    }
  }
  const groupBoxes = [70, 300, 530];
  for (const x of groupBoxes) {
    rect(px, x, 400, 180, 120, colors.sand);
    for (let i = 0; i < 4; i += 1) circle(px, x + 35 + i * 37, 460, 14, colors.orange);
  }
  return px;
}

function lifeCycleScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  arc(px, 400, 310, 190, -70, 20, colors.navy, 5);
  arc(px, 400, 310, 190, 110, 200, colors.navy, 5);
  arc(px, 400, 310, 190, 20, 110, colors.navy, 5);
  arc(px, 400, 310, 190, 200, 290, colors.navy, 5);
  // telur
  ellipse(px, 400, 120, 26, 34, colors.white);
  ellipse(px, 400, 120, 26, 34, colors.sand);
  // ulat
  for (let i = 0; i < 5; i += 1) circle(px, 530 + i * 24, 280, 17, colors.green);
  circle(px, 650, 280, 19, colors.greenDark);
  // arah daur (chevron pada lingkaran)
  for (let k = 0; k < 4; k += 1) {
    const angle = -Math.PI / 4 + (k * Math.PI) / 2;
    const x = 400 + Math.cos(angle) * 190;
    const y = 310 + Math.sin(angle) * 190;
    const tangent = angle + Math.PI / 2;
    const tipX = x + Math.cos(tangent) * 14;
    const tipY = y + Math.sin(tangent) * 14;
    const baseX = x - Math.cos(tangent) * 8;
    const baseY = y - Math.sin(tangent) * 8;
    const normalX = Math.cos(tangent + Math.PI / 2) * 9;
    const normalY = Math.sin(tangent + Math.PI / 2) * 9;
    triangle(px, baseX + normalX, baseY + normalY, baseX - normalX, baseY - normalY, tipX, tipY, colors.orange);
  }
  // kepompong
  ellipse(px, 400, 500, 24, 48, colors.soil);
  line(px, 400, 452, 400, 430, colors.soil, 4);
  // kupu-kupu
  ellipse(px, 150, 300, 30, 22, colors.orange);
  ellipse(px, 200, 300, 30, 22, colors.orange);
  line(px, 175, 275, 175, 325, colors.navy, 4);
  return px;
}

function perimeterAreaScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const cell = 40;
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      rect(px, 90 + col * cell, 140 + row * cell, cell - 2, cell - 2, colors.sky);
    }
  }
  for (let i = 0; i <= 8; i += 1) line(px, 90 + i * cell, 140, 90 + i * cell, 340, colors.navy, 2);
  for (let i = 0; i <= 5; i += 1) line(px, 90, 140 + i * cell, 410, 140 + i * cell, colors.navy, 2);
  rect(px, 86, 136, 8 * cell, 8, colors.orange);
  rect(px, 86, 336, 8 * cell, 8, colors.orange);
  rect(px, 86, 136, 8, 5 * cell, colors.orange);
  rect(px, 406, 136, 8, 5 * cell, colors.orange);
  const cell2 = 34;
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      rect(px, 500 + col * cell2, 170 + row * cell2, cell2 - 2, cell2 - 2, colors.tealLight);
    }
  }
  for (let i = 0; i <= 6; i += 1) line(px, 500 + i * cell2, 170, 500 + i * cell2, 374, colors.navy, 2);
  for (let i = 0; i <= 6; i += 1) line(px, 500, 170 + i * cell2, 704, 170 + i * cell2, colors.navy, 2);
  rect(px, 496, 166, 6 * cell2, 7, colors.green);
  rect(px, 496, 370, 6 * cell2, 7, colors.green);
  rect(px, 496, 166, 7, 6 * cell2, colors.green);
  rect(px, 700, 166, 7, 6 * cell2, colors.green);
  return px;
}

function weatherScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [40, 290, 540];
  for (const x of panels) {
    rect(px, x, 100, 220, 430, colors.sky);
    rect(px, x, 100, 220, 5, colors.navy);
    rect(px, x, 525, 220, 5, colors.navy);
    rect(px, x, 100, 5, 430, colors.navy);
    rect(px, x + 215, 100, 5, 430, colors.navy);
  }
  circle(px, 150, 200, 52, colors.sun);
  for (let i = 0; i < 8; i += 1) {
    const angle = (i * Math.PI) / 4;
    line(px, 150 + Math.cos(angle) * 66, 200 + Math.sin(angle) * 66, 150 + Math.cos(angle) * 90, 200 + Math.sin(angle) * 90, colors.sun, 5);
  }
  ellipse(px, 400, 210, 80, 46, colors.white);
  ellipse(px, 360, 230, 48, 30, colors.white);
  ellipse(px, 440, 230, 48, 30, colors.white);
  for (let i = 0; i < 5; i += 1) line(px, 340 + i * 30, 280, 330 + i * 30, 330, colors.blue, 4);
  rect(px, 370, 390, 60, 40, colors.orange);
  arc(px, 400, 390, 30, 180, 360, colors.orange, 8);
  line(px, 400, 430, 400, 480, colors.soil, 6);
  for (let i = 0; i < 4; i += 1) {
    arc(px, 620 + i * 20, 200 + i * 45, 40, 120, 260, colors.teal, 4);
  }
  line(px, 640, 470, 640, 330, colors.soil, 8);
  ellipse(px, 610, 330, 45, 28, colors.green);
  ellipse(px, 670, 290, 45, 28, colors.green);
  return px;
}

function millionPlaceValue() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const counts = [4, 5, 2, 3, 1, 6];
  const palette = [colors.teal, colors.orange, colors.green, colors.red, colors.blue, colors.soil];
  for (let column = 0; column < 6; column += 1) {
    const x = 20 + column * 130;
    rect(px, x, 100, 120, 440, colors.sky);
    rect(px, x, 100, 120, 5, colors.navy);
    rect(px, x, 535, 120, 5, colors.navy);
    rect(px, x, 100, 5, 440, colors.navy);
    rect(px, x + 115, 100, 5, 440, colors.navy);
    for (let i = 0; i < counts[column]; i += 1) {
      circle(px, x + 38 + (i % 2) * 44, 160 + Math.floor(i / 2) * 60, 16, palette[column]);
    }
  }
  return px;
}

function beachScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 680, 120, 46, colors.sun);
  rect(px, 0, 250, W, 180, colors.blue);
  rect(px, 0, 420, W, 180, colors.sand);
  for (let i = 0; i < 4; i += 1) arc(px, 120 + i * 190, 300, 55, 200, 340, colors.white, 4);
  // perahu
  triangle(px, 520, 300, 620, 300, 570, 340, colors.white);
  line(px, 570, 250, 570, 300, colors.navy, 5);
  triangle(px, 570, 250, 570, 295, 620, 295, colors.red);
  // pohon kelapa
  line(px, 150, 470, 170, 250, colors.soil, 16);
  for (const angle of [-150, -110, -70, -30]) {
    const radians = (angle * Math.PI) / 180;
    line(px, 170, 250, 170 + Math.cos(radians) * 90, 250 + Math.sin(radians) * 55, colors.green, 10);
  }
  circle(px, 135, 250, 16, colors.soil);
  circle(px, 205, 250, 16, colors.soil);
  // kerang
  for (const [x, y] of [[340, 500], [400, 520], [680, 480], [720, 520]]) {
    arc(px, x, y, 16, 180, 360, colors.orange, 5);
  }
  return px;
}

function digestiveScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 400, 120, 46, colors.skin1);
  rect(px, 375, 160, 50, 40, colors.skin1);
  rect(px, 300, 190, 200, 330, colors.sand);
  // mulut dan kerongkongan
  rect(px, 388, 130, 24, 70, colors.red);
  rect(px, 394, 200, 14, 110, colors.red);
  // lambung
  ellipse(px, 370, 320, 55, 42, colors.orange);
  arc(px, 425, 320, 30, 270, 90, colors.orange, 10);
  // usus halus
  for (let i = 0; i < 4; i += 1) {
    arc(px, 400, 390 + i * 22, 55 - i * 6, 0, 180, colors.red, 6);
    arc(px, 400, 400 + i * 22, 55 - i * 6, 180, 360, colors.red, 6);
  }
  // usus besar
  rect(px, 320, 380, 20, 110, colors.greenDark);
  rect(px, 460, 380, 20, 110, colors.greenDark);
  rect(px, 320, 470, 160, 20, colors.greenDark);
  return px;
}

function pancasilaHistoryScene() {
  const px = canvas();
  fill(px, colors.sand);
  rect(px, 0, 0, W, 60, colors.teal);
  rect(px, 0, 470, W, 130, colors.soil);
  rect(px, 120, 320, 560, 120, colors.white);
  rect(px, 120, 320, 560, 12, colors.navy);
  // peserta
  const seats = [180, 330, 480, 630];
  for (const x of seats) {
    ellipse(px, x, 290, 34, 46, colors.teal);
    circle(px, x, 240, 28, colors.skin1);
  }
  // dokumen
  rect(px, 320, 350, 170, 60, colors.white);
  star(px, 405, 380, 20, 8, colors.sun);
  // bendera
  rect(px, 720, 120, 8, 220, colors.navy);
  rect(px, 728, 120, 55, 18, colors.red);
  rect(px, 728, 138, 55, 18, colors.white);
  return px;
}

function respiratoryScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 400, 120, 46, colors.skin1);
  rect(px, 375, 160, 50, 40, colors.skin1);
  rect(px, 300, 190, 200, 330, colors.sand);
  // trakea dan bronkus
  rect(px, 392, 180, 16, 130, colors.red);
  line(px, 400, 300, 340, 340, colors.red, 10);
  line(px, 400, 300, 460, 340, colors.red, 10);
  // paru-paru
  ellipse(px, 345, 370, 60, 85, colors.red);
  ellipse(px, 455, 370, 60, 85, colors.red);
  for (const [x, y] of [[320, 350], [340, 400], [370, 320], [480, 350], [460, 400], [430, 320]]) {
    circle(px, x, y, 10, colors.sky);
  }
  // diafragma
  arc(px, 400, 470, 110, 200, 340, colors.orange, 8);
  return px;
}

function perspectiveScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 680, 120, 40, colors.sun);
  rect(px, 0, 300, W, 300, colors.green);
  line(px, 0, 300, W, 300, colors.navy, 4);
  circle(px, 400, 300, 7, colors.red);
  line(px, 0, 600, 400, 300, colors.sand, 6);
  line(px, W, 600, 400, 300, colors.sand, 6);
  line(px, 200, 600, 400, 300, colors.sand, 4);
  line(px, 600, 600, 400, 300, colors.sand, 4);
  // pohon dekat dan jauh
  rect(px, 120, 400, 18, 120, colors.soil);
  circle(px, 129, 380, 58, colors.greenDark);
  rect(px, 470, 330, 10, 50, colors.soil);
  circle(px, 475, 320, 28, colors.greenDark);
  rect(px, 650, 310, 6, 24, colors.soil);
  circle(px, 653, 305, 14, colors.greenDark);
  // rumah
  rect(px, 540, 420, 110, 80, colors.white);
  triangle(px, 530, 420, 595, 360, 660, 420, colors.red);
  return px;
}

function circulationScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 400, 115, 44, colors.skin1);
  rect(px, 300, 170, 200, 350, colors.sand);
  // paru-paru
  ellipse(px, 350, 260, 45, 60, colors.sky);
  ellipse(px, 450, 260, 45, 60, colors.sky);
  // jantung
  circle(px, 380, 350, 38, colors.red);
  circle(px, 420, 350, 38, colors.red);
  triangle(px, 345, 365, 455, 365, 400, 440, colors.red);
  // pembuluh
  line(px, 380, 312, 350, 220, colors.blue, 7);
  line(px, 420, 312, 450, 220, colors.blue, 7);
  line(px, 400, 440, 400, 500, colors.blue, 7);
  line(px, 345, 370, 310, 420, colors.red, 6);
  line(px, 455, 370, 490, 420, colors.red, 6);
  for (const [x, y] of [[340, 480], [360, 480], [440, 480], [460, 480]]) {
    circle(px, x, y, 8, colors.red);
  }
  return px;
}

function solidShapesScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const panels = [30, 220, 410, 600];
  for (const x of panels) {
    rect(px, x, 100, 170, 420, colors.sky);
    rect(px, x, 100, 170, 5, colors.navy);
    rect(px, x, 515, 170, 5, colors.navy);
    rect(px, x, 100, 5, 420, colors.navy);
    rect(px, x + 165, 100, 5, 420, colors.navy);
  }
  // kubus
  triangle(px, 60, 300, 90, 270, 190, 270, colors.sun);
  triangle(px, 60, 300, 190, 270, 160, 300, colors.sun);
  triangle(px, 160, 300, 190, 270, 190, 370, colors.sand);
  triangle(px, 160, 300, 190, 370, 160, 400, colors.sand);
  rect(px, 60, 300, 100, 100, colors.orange);
  // balok
  triangle(px, 250, 320, 280, 290, 400, 290, colors.tealLight);
  triangle(px, 250, 320, 400, 290, 370, 320, colors.tealLight);
  triangle(px, 370, 320, 400, 290, 400, 370, colors.sand);
  triangle(px, 370, 320, 400, 370, 370, 400, colors.sand);
  rect(px, 250, 320, 120, 80, colors.teal);
  // tabung
  ellipse(px, 495, 290, 55, 20, colors.green);
  rect(px, 440, 290, 110, 120, colors.green);
  ellipse(px, 495, 410, 55, 20, colors.greenDark);
  // kerucut
  triangle(px, 645, 410, 725, 260, 805, 410, colors.red);
  ellipse(px, 725, 410, 80, 22, colors.red);
  return px;
}

function volumeScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  // balok satuan 4 x 3 x 2
  const size = 60;
  for (let depth = 0; depth < 2; depth += 1) {
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        const x = 120 + col * size + depth * 30;
        const y = 420 - row * size - depth * 30;
        rect(px, x, y, size - 2, size - 2, depth === 0 ? colors.orange : colors.sun);
        line(px, x, y, x, y, colors.navy, 1);
      }
    }
  }
  // kubus satuan pembanding
  rect(px, 610, 380, 60, 60, colors.teal);
  rect(px, 610, 380, 60, 60, colors.teal);
  line(px, 610, 380, 670, 380, colors.navy, 3);
  line(px, 670, 380, 670, 440, colors.navy, 3);
  line(px, 610, 440, 670, 440, colors.navy, 3);
  line(px, 610, 380, 610, 440, colors.navy, 3);
  return px;
}

function ecosystemScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 90, 110, 40, colors.sun);
  rect(px, 0, 440, W, 160, colors.green);
  // tumbuhan
  line(px, 190, 470, 190, 330, colors.greenDark, 8);
  ellipse(px, 170, 340, 26, 16, colors.green);
  ellipse(px, 214, 360, 26, 16, colors.green);
  // belalang
  ellipse(px, 330, 420, 30, 16, colors.greenDark);
  line(px, 310, 410, 290, 390, colors.greenDark, 4);
  line(px, 300, 430, 280, 450, colors.greenDark, 4);
  // burung
  ellipse(px, 480, 330, 34, 24, colors.blue);
  circle(px, 505, 315, 14, colors.blue);
  triangle(px, 516, 315, 536, 310, 516, 322, colors.orange);
  // ular
  for (let i = 0; i < 6; i += 1) circle(px, 620 + i * 22, 440 - (i % 2) * 15, 14, colors.greenDark);
  circle(px, 760, 440, 16, colors.greenDark);
  // panah rantai makanan
  for (const x of [250, 390, 560]) {
    line(px, x, 250, x + 45, 250, colors.navy, 5);
    triangle(px, x + 45, 250, x + 32, 242, x + 32, 258, colors.navy);
  }
  return px;
}

function solarSystemScene() {
  const px = canvas();
  fill(px, colors.navy);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 90, 330, 60, colors.sun);
  const planets = [
    { x: 230, y: 330, r: 14, color: colors.orange },
    { x: 320, y: 250, r: 20, color: colors.sand },
    { x: 420, y: 400, r: 22, color: colors.blue },
    { x: 530, y: 220, r: 26, color: colors.red },
    { x: 650, y: 380, r: 34, color: colors.orange },
    { x: 730, y: 180, r: 24, color: colors.sun }
  ];
  for (const planet of planets) {
    arc(px, 90, 330, Math.hypot(planet.x - 90, planet.y - 330), 0, 360, colors.tealLight, 1);
    circle(px, planet.x, planet.y, planet.r, planet.color);
  }
  for (const [x, y] of [[300, 100], [450, 140], [600, 90], [700, 500], [350, 520]]) {
    circle(px, x, y, 3, colors.white);
  }
  rect(px, 0, 0, W, 60, colors.teal);
  return px;
}

function ratioScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  // batang perbandingan 4 : 3
  rect(px, 90, 150, 620, 90, colors.sky);
  for (let i = 0; i < 4; i += 1) rect(px, 100 + i * 150, 160, 140, 70, colors.orange);
  rect(px, 90, 320, 620, 90, colors.sky);
  for (let i = 0; i < 3; i += 1) rect(px, 100 + i * 150, 330, 140, 70, colors.teal);
  // kelompok benda 4 dan 3
  for (let i = 0; i < 4; i += 1) circle(px, 180 + i * 60, 490, 22, colors.red);
  for (let i = 0; i < 3; i += 1) circle(px, 180 + i * 60, 540, 22, colors.blue);
  return px;
}

function circleScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  circle(px, 400, 330, 180, colors.sky);
  arc(px, 400, 330, 180, 0, 360, colors.navy, 4);
  circle(px, 400, 330, 8, colors.navy);
  line(px, 400, 330, 580, 330, colors.red, 5);
  line(px, 400, 330, 400, 150, colors.green, 5);
  line(px, 220, 330, 580, 330, colors.navy, 3);
  return px;
}

function probabilityScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  // roda putar
  const cx = 260;
  const cy = 330;
  const palette = [colors.red, colors.sun, colors.green, colors.blue];
  for (let i = 0; i < 12; i += 1) {
    const start = (i * Math.PI) / 6;
    const end = ((i + 1) * Math.PI) / 6;
    const x1 = cx + Math.cos(start) * 170;
    const y1 = cy + Math.sin(start) * 170;
    const x2 = cx + Math.cos(end) * 170;
    const y2 = cy + Math.sin(end) * 170;
    triangle(px, cx, cy, x1, y1, x2, y2, palette[Math.floor(i / 3)]);
  }
  circle(px, cx, cy, 18, colors.white);
  triangle(px, cx, 140, cx - 18, 190, cx + 18, 190, colors.navy);
  // dadu
  rect(px, 560, 240, 160, 160, colors.white);
  rect(px, 560, 240, 160, 8, colors.navy);
  rect(px, 560, 392, 160, 8, colors.navy);
  rect(px, 560, 240, 8, 160, colors.navy);
  rect(px, 712, 240, 8, 160, colors.navy);
  for (const [x, y] of [[600, 280], [640, 320], [680, 360], [600, 360], [680, 280]]) {
    circle(px, x, y, 10, colors.navy);
  }
  return px;
}

function traditionalGameScene() {
  const px = canvas();
  fill(px, colors.sky);
  rect(px, 0, 0, W, 60, colors.teal);
  rect(px, 0, 420, W, 180, colors.green);
  for (const [x, y] of [[100, 300], [160, 340], [220, 300], [640, 300], [700, 340], [760, 300]]) {
    triangle(px, x - 16, y + 40, x + 16, y + 40, x, y, colors.orange);
  }
  const drawKid = (cx, cy, color) => {
    circle(px, cx, cy, 24, colors.skin1);
    line(px, cx, cy + 24, cx, cy + 100, color, 12);
    line(px, cx, cy + 100, cx - 26, cy + 150, colors.navy, 8);
    line(px, cx, cy + 100, cx + 26, cy + 150, colors.navy, 8);
    line(px, cx, cy + 50, cx - 34, cy + 80, colors.navy, 8);
    line(px, cx, cy + 50, cx + 34, cy + 80, colors.navy, 8);
  };
  drawKid(320, 200, colors.red);
  drawKid(420, 180, colors.blue);
  drawKid(520, 210, colors.teal);
  ellipse(px, 420, 470, 120, 24, colors.white);
  return px;
}

function countingScene() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const cell = 100;
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const x = 150 + col * cell;
      const y = 170 + row * cell;
      rect(px, x, y, cell - 4, cell - 4, colors.sky);
      rect(px, x, y, cell - 4, 4, colors.navy);
      rect(px, x, y + cell - 8, cell - 4, 4, colors.navy);
      rect(px, x, y, 4, cell - 4, colors.navy);
      rect(px, x + cell - 8, y, 4, cell - 4, colors.navy);
    }
  }
  for (let i = 0; i < 7; i += 1) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const cx = 200 + col * cell;
    const cy = 220 + row * cell;
    circle(px, cx, cy, 26, colors.red);
    ellipse(px, cx + 8, cy - 26, 14, 7, colors.green);
  }
  return px;
}

function hundredChart() {
  const px = canvas();
  fill(px, colors.white);
  rect(px, 0, 0, W, 60, colors.teal);
  const size = 46;
  for (let row = 0; row < 10; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      const x = 170 + col * (size + 4);
      const y = 90 + row * (size + 4);
      rect(px, x, y, size, size, row % 2 === 0 ? colors.sky : colors.sand);
      rect(px, x, y, size, 2, colors.navy);
      rect(px, x, y + size - 2, size, 2, colors.navy);
      rect(px, x, y, 2, size, colors.navy);
      rect(px, x + size - 2, y, 2, size, colors.navy);
      if ((row * 10 + col + 1) % 10 === 0) circle(px, x + size / 2, y + size / 2, 8, colors.orange);
    }
  }
  return px;
}

write("content/packages/kelas4-matematika-b04-pengukuran/assets/pengukuran-panjang-berat.png", measurementScene());
write("content/packages/kelas4-ipas-b04-energi/assets/energi-perubahan.png", energyScene());
write("content/packages/kelas4-bahasa-indonesia-b04-menulis-deskripsi/assets/menulis-deskripsi.png", writingScene());
write("content/packages/kelas4-pendidikan-pancasila-b04-musyawarah/assets/musyawarah-kelas.png", discussionScene());
write("content/packages/kelas4-seni-rupa-b01-unsur-prinsip/assets/unsur-seni.png", artElements());
write("content/packages/kelas4-pjok-b01-gerak-dasar/assets/gerak-dasar.png", movementScene());
write("content/packages/kelas4-pai-b01-surah-pendek/assets/membaca-quran.png", quranScene());
write("content/packages/kelas4-seni-rupa-b02-menggambar-bentuk/assets/menggambar-bentuk.png", drawingShapes());
write("content/packages/kelas4-pjok-b02-gerak-manipulatif/assets/gerak-manipulatif.png", manipulativeScene());
write("content/packages/kelas4-pai-b02-iman/assets/iman-ilustrasi.png", imanScene());
write("content/packages/kelas4-seni-rupa-b03-warna-tekstur/assets/warna-tekstur.png", colorTexture());
write("content/packages/kelas4-pjok-b03-kebugaran/assets/kebugaran.png", fitnessScene());
write("content/packages/kelas4-pai-b03-akhlak/assets/akhlak-terpuji.png", akhlakScene());
write("content/packages/kelas4-seni-rupa-b08-pameran-kelas/assets/pameran-kelas.png", exhibitionScene());
write("content/packages/kelas4-pjok-b08-kesehatan/assets/kebersihan-diri.png", hygieneScene());
write("content/packages/kelas4-pai-b04-shalat/assets/shalat-ilustrasi.png", prayerScene());
write("content/packages/kelas4-matematika-b05-bangun-datar/assets/bangun-datar.png", planeShapes());
write("content/packages/kelas4-ipas-b05-siklus-air/assets/siklus-air.png", waterCycle());
write("content/packages/kelas4-bahasa-indonesia-b05-teks-prosedur/assets/menanam-biji.png", plantingSteps());
write("content/packages/kelas4-pendidikan-pancasila-b05-bhinneka/assets/bhinneka.png", bhinnekaScene());
write("content/packages/kelas4-matematika-b06-garis-sudut/assets/garis-sudut.png", geometryScene());
write("content/packages/kelas4-ipas-b06-keragaman-budaya/assets/keragaman-budaya.png", cultureScene());
write("content/packages/kelas4-bahasa-indonesia-b06-teks-narasi/assets/teks-narasi.png", narrativeScene());
write("content/packages/kelas4-pendidikan-pancasila-b06-nkri/assets/upacara-bendera.png", flagCeremonyScene());
write("content/packages/kelas4-matematika-b07-waktu-volume-data/assets/waktu-volume-data.png", timeVolumeData());
write("content/packages/kelas4-ipas-b07-sejarah-kerajaan/assets/kerajaan-nusantara.png", kingdomScene());
write("content/packages/kelas4-bahasa-indonesia-b07-wawancara-presentasi/assets/wawancara-presentasi.png", interviewScene());
write("content/packages/kelas4-pendidikan-pancasila-b07-gotong-royong/assets/gotong-royong.png", communityScene());
write("content/packages/kelas4-matematika-b08-pemecahan-masalah/assets/pemecahan-masalah.png", problemSolvingScene());
write("content/packages/kelas4-ipas-b08-ekonomi-pelestarian/assets/ekonomi-pelestarian.png", economyScene());
write("content/packages/kelas4-bahasa-indonesia-b08-apresiasi-sastra/assets/apresiasi-sastra.png", literatureScene());
write("content/packages/kelas4-pendidikan-pancasila-b08-proyek-kewargaan/assets/proyek-kewargaan.png", civicProjectScene());
write("content/packages/kelas4-seni-rupa-b04-kolase/assets/kolase.png", collageScene());
write("content/packages/kelas4-pjok-b04-bola-besar/assets/bola-besar.png", bigBallScene());
write("content/packages/kelas4-seni-rupa-b05-seni-cetak/assets/seni-cetak.png", printmakingScene());
write("content/packages/kelas4-seni-rupa-b06-kerajinan-bahan-alam/assets/kerajinan-bahan-alam.png", naturalCraftScene());
write("content/packages/kelas4-seni-rupa-b07-apresiasi-karya/assets/apresiasi-karya.png", artAppreciationScene());
write("content/packages/kelas4-pjok-b05-bola-kecil/assets/bola-kecil.png", smallBallScene());
write("content/packages/kelas4-pjok-b06-senam-dasar/assets/senam-dasar.png", basicGymnasticsScene());
write("content/packages/kelas4-pjok-b07-atletik-dasar/assets/atletik-dasar.png", athleticsScene());
write("content/packages/kelas4-pai-b05-puasa/assets/puasa.png", fastingScene());
write("content/packages/kelas4-pai-b06-zakat-infak/assets/zakat-infak.png", charityScene());
write("content/packages/kelas4-pai-b07-sejarah-islam/assets/sejarah-islam.png", islamHistoryScene());
write("content/packages/kelas4-pai-b08-adab-kisah-teladan/assets/adab-kisah-teladan.png", goodMannersScene());
write("content/packages/kelas3-matematika-b01-bilangan-10000/assets/nilai-tempat-10000.png", placeValueBlocks());
write("content/packages/kelas3-bahasa-indonesia-b01-teks-deskripsi/assets/taman-sekolah.png", descriptionGarden());
write("content/packages/kelas3-ipas-b01-makhluk-hidup/assets/makhluk-hidup-sekitar.png", livingThingsGarden());
write("content/packages/kelas3-pendidikan-pancasila-b01-pancasila/assets/simbol-pancasila.png", pancasilaSymbols());
write("content/packages/kelas3-matematika-b02-penjumlahan-pengurangan/assets/penjumlahan-pengurangan.png", additionSubtractionScene());
write("content/packages/kelas3-matematika-b03-perkalian-pembagian/assets/perkalian-pembagian.png", multiplicationGroupsScene());
write("content/packages/kelas3-matematika-b04-pecahan/assets/pecahan-sederhana.png", mathFractionBars());
write("content/packages/kelas3-bahasa-indonesia-b02-kalimat-efektif/assets/sudut-baca-kelas3.png", readingCorner());
write("content/packages/kelas3-bahasa-indonesia-b03-ide-pokok/assets/mendengarkan-cerita-kelas3.png", storyListening());
write("content/packages/kelas3-bahasa-indonesia-b04-menulis-paragraf/assets/menulis-paragraf.png", writingScene());
write("content/packages/kelas3-ipas-b02-daur-hidup/assets/daur-hidup.png", lifeCycleScene());
write("content/packages/kelas3-ipas-b03-wujud-zat/assets/wujud-zat-kelas3.png", statesOfMatter());
write("content/packages/kelas3-ipas-b04-gaya-gerak/assets/gaya-gerak-kelas3.png", forceMotion());
write("content/packages/kelas3-pendidikan-pancasila-b02-aturan/assets/antrean-kelas3.png", queueScene());
write("content/packages/kelas3-pendidikan-pancasila-b03-hak-kewajiban/assets/hak-kewajiban-kelas3.png", rightsDuties());
write("content/packages/kelas3-pendidikan-pancasila-b04-musyawarah/assets/musyawarah-kelas3.png", discussionScene());
write("content/packages/kelas3-seni-rupa-b01-unsur-garis/assets/unsur-garis-warna.png", artElements());
write("content/packages/kelas3-seni-rupa-b02-menggambar-bentuk/assets/menggambar-bentuk-kelas3.png", drawingShapes());
write("content/packages/kelas3-seni-rupa-b03-tekstur-bahan/assets/tekstur-bahan.png", colorTexture());
write("content/packages/kelas3-seni-rupa-b04-kolase/assets/kolase-kelas3.png", collageScene());
write("content/packages/kelas3-pjok-b01-gerak-lokomotor/assets/gerak-lokomotor.png", movementScene());
write("content/packages/kelas3-pjok-b02-gerak-non-lokomotor/assets/gerak-non-lokomotor.png", fitnessScene());
write("content/packages/kelas3-pjok-b03-gerak-manipulatif/assets/gerak-manipulatif-kelas3.png", manipulativeScene());
write("content/packages/kelas3-pjok-b04-kebugaran/assets/kebugaran-kelas3.png", fitnessScene());
write("content/packages/kelas3-pai-b01-surah-pendek/assets/membaca-quran-kelas3.png", quranScene());
write("content/packages/kelas3-pai-b02-iman/assets/iman-kelas3.png", imanScene());
write("content/packages/kelas3-pai-b03-akhlak/assets/akhlak-kelas3.png", akhlakScene());
write("content/packages/kelas3-pai-b04-salat/assets/salat-kelas3.png", prayerScene());
write("content/packages/kelas3-matematika-b05-bangun-datar/assets/bangun-datar-kelas3.png", planeShapes());
write("content/packages/kelas3-matematika-b06-keliling-luas/assets/keliling-luas.png", perimeterAreaScene());
write("content/packages/kelas3-matematika-b07-waktu-panjang-berat/assets/waktu-panjang-berat.png", measurementScene());
write("content/packages/kelas3-matematika-b08-penyajian-data/assets/penyajian-data-kelas3.png", timeVolumeData());
write("content/packages/kelas3-bahasa-indonesia-b05-teks-prosedur/assets/teks-prosedur-kelas3.png", plantingSteps());
write("content/packages/kelas3-bahasa-indonesia-b06-dongeng/assets/dongeng-kelas3.png", narrativeScene());
write("content/packages/kelas3-bahasa-indonesia-b07-wawancara/assets/wawancara-kelas3.png", interviewScene());
write("content/packages/kelas3-bahasa-indonesia-b08-menulis-cerita/assets/menulis-cerita-kelas3.png", writingScene());
write("content/packages/kelas3-ipas-b05-cuaca-musim/assets/cuaca-musim.png", weatherScene());
write("content/packages/kelas3-ipas-b06-keragaman-budaya/assets/keragaman-budaya-kelas3.png", cultureScene());
write("content/packages/kelas3-ipas-b07-lingkungan-pelestarian/assets/lingkungan-pelestarian.png", economyScene());
write("content/packages/kelas3-ipas-b08-ekonomi/assets/ekonomi-kelas3.png", economyScene());
write("content/packages/kelas3-pendidikan-pancasila-b05-keberagaman/assets/keberagaman-kelas3.png", bhinnekaScene());
write("content/packages/kelas3-pendidikan-pancasila-b06-nkri/assets/nkri-kelas3.png", flagCeremonyScene());
write("content/packages/kelas3-pendidikan-pancasila-b07-gotong-royong/assets/gotong-royong-kelas3.png", communityScene());
write("content/packages/kelas3-pendidikan-pancasila-b08-proyek-kewargaan/assets/proyek-kewargaan-kelas3.png", civicProjectScene());
write("content/packages/kelas3-seni-rupa-b05-seni-cetak/assets/seni-cetak-kelas3.png", printmakingScene());
write("content/packages/kelas3-seni-rupa-b06-kerajinan-bahan-alam/assets/kerajinan-kelas3.png", naturalCraftScene());
write("content/packages/kelas3-seni-rupa-b07-apresiasi-karya/assets/apresiasi-kelas3.png", artAppreciationScene());
write("content/packages/kelas3-seni-rupa-b08-pameran-kelas/assets/pameran-kelas3.png", exhibitionScene());
write("content/packages/kelas3-pjok-b05-bola-kecil/assets/bola-kecil-kelas3.png", smallBallScene());
write("content/packages/kelas3-pjok-b06-senam-dasar/assets/senam-dasar-kelas3.png", basicGymnasticsScene());
write("content/packages/kelas3-pjok-b07-atletik-dasar/assets/atletik-kelas3.png", athleticsScene());
write("content/packages/kelas3-pjok-b08-kesehatan/assets/kesehatan-kelas3.png", hygieneScene());
write("content/packages/kelas3-pai-b05-puasa/assets/puasa-kelas3.png", fastingScene());
write("content/packages/kelas3-pai-b06-zakat-infak/assets/zakat-infak-kelas3.png", charityScene());
write("content/packages/kelas3-pai-b07-sejarah-islam/assets/sejarah-islam-kelas3.png", islamHistoryScene());
write("content/packages/kelas3-pai-b08-adab-kisah-teladan/assets/adab-kelas3.png", goodMannersScene());
write("content/packages/kelas5-matematika-b01-bilangan-1000000/assets/nilai-tempat-1000000.png", millionPlaceValue());
write("content/packages/kelas5-bahasa-indonesia-b01-teks-deskripsi/assets/teks-deskripsi-kelas5.png", beachScene());
write("content/packages/kelas5-ipas-b01-sistem-pencernaan/assets/sistem-pencernaan.png", digestiveScene());
write("content/packages/kelas5-pendidikan-pancasila-b01-sejarah-pancasila/assets/sejarah-pancasila.png", pancasilaHistoryScene());
write("content/packages/kelas5-seni-rupa-b01-unsur-prinsip/assets/unsur-prinsip-kelas5.png", artElements());
write("content/packages/kelas5-pjok-b01-bola-besar/assets/bola-besar-kelas5.png", bigBallScene());
write("content/packages/kelas5-pai-b01-quran-tajwid/assets/quran-kelas5.png", quranScene());
write("content/packages/kelas5-matematika-b02-operasi-pecahan/assets/operasi-pecahan.png", mathFractionBars());
write("content/packages/kelas5-bahasa-indonesia-b02-teks-narasi/assets/teks-narasi-kelas5.png", narrativeScene());
write("content/packages/kelas5-ipas-b02-sistem-pernapasan/assets/sistem-pernapasan.png", respiratoryScene());
write("content/packages/kelas5-pendidikan-pancasila-b02-nilai-pancasila/assets/nilai-pancasila.png", bhinnekaScene());
write("content/packages/kelas5-matematika-b03-faktor-kelipatan/assets/faktor-kelipatan-kelas5.png", factorVenn());
write("content/packages/kelas5-seni-rupa-b02-perspektif/assets/perspektif.png", perspectiveScene());
write("content/packages/kelas5-pjok-b02-bola-kecil/assets/bola-kecil-kelas5.png", smallBallScene());
write("content/packages/kelas5-pai-b02-iman-rasul/assets/iman-rasul.png", imanScene());
write("content/packages/kelas5-bahasa-indonesia-b03-ide-pokok/assets/ide-pokok-kelas5.png", storyListening());
write("content/packages/kelas5-seni-rupa-b03-warna-komposisi/assets/warna-komposisi.png", colorTexture());
write("content/packages/kelas5-pjok-b03-atletik/assets/atletik-kelas5.png", athleticsScene());
write("content/packages/kelas5-pai-b03-akhlak/assets/akhlak-kelas5.png", akhlakScene());
write("content/packages/kelas5-pendidikan-pancasila-b03-hak-kewajiban/assets/hak-kewajiban-kelas5.png", rightsDuties());
write("content/packages/kelas5-seni-rupa-b04-karya-campuran/assets/karya-campuran.png", collageScene());
write("content/packages/kelas5-pjok-b04-kebugaran/assets/kebugaran-kelas5.png", fitnessScene());
write("content/packages/kelas5-pai-b04-salat-ibadah/assets/salat-ibadah.png", prayerScene());
write("content/packages/kelas5-ipas-b03-peredaran-darah/assets/peredaran-darah.png", circulationScene());
write("content/packages/kelas5-matematika-b04-pengukuran-sudut/assets/pengukuran-sudut.png", geometryScene());
write("content/packages/kelas5-bahasa-indonesia-b04-laporan/assets/laporan-kelas5.png", writingScene());
write("content/packages/kelas5-ipas-b04-kesehatan-tubuh/assets/kesehatan-tubuh.png", hygieneScene());
write("content/packages/kelas5-pendidikan-pancasila-b04-musyawarah-demokrasi/assets/musyawarah-demokrasi.png", discussionScene());
write("content/packages/kelas5-matematika-b05-bangun-ruang/assets/bangun-ruang-kelas5.png", solidShapesScene());
write("content/packages/kelas5-matematika-b06-volume-luas-permukaan/assets/volume-kelas5.png", volumeScene());
write("content/packages/kelas5-matematika-b07-data/assets/data-kelas5.png", timeVolumeData());
write("content/packages/kelas5-matematika-b08-pemecahan-masalah/assets/pemecahan-masalah-kelas5.png", problemSolvingScene());
write("content/packages/kelas5-bahasa-indonesia-b05-eksposisi/assets/eksposisi-kelas5.png", readingCorner());
write("content/packages/kelas5-bahasa-indonesia-b06-puisi-pantun/assets/puisi-pantun.png", literatureScene());
write("content/packages/kelas5-bahasa-indonesia-b07-wawancara-presentasi/assets/wawancara-kelas5.png", interviewScene());
write("content/packages/kelas5-bahasa-indonesia-b08-menulis-cerita/assets/menulis-cerita-kelas5.png", writingScene());
write("content/packages/kelas5-ipas-b05-ekosistem/assets/ekosistem-kelas5.png", ecosystemScene());
write("content/packages/kelas5-ipas-b06-siklus-air/assets/siklus-air-kelas5.png", waterCycle());
write("content/packages/kelas5-ipas-b07-energi-listrik/assets/energi-listrik.png", energyScene());
write("content/packages/kelas5-ipas-b08-tata-surya/assets/tata-surya.png", solarSystemScene());
write("content/packages/kelas5-pendidikan-pancasila-b05-keberagaman/assets/keberagaman-kelas5.png", bhinnekaScene());
write("content/packages/kelas5-pendidikan-pancasila-b06-nkri-otonomi/assets/nkri-otonomi.png", flagCeremonyScene());
write("content/packages/kelas5-pendidikan-pancasila-b07-gotong-royong/assets/gotong-royong-kelas5.png", communityScene());
write("content/packages/kelas5-pendidikan-pancasila-b08-proyek-kewargaan/assets/proyek-kewargaan-kelas5.png", civicProjectScene());
write("content/packages/kelas5-seni-rupa-b05-seni-cetak/assets/seni-cetak-kelas5.png", printmakingScene());
write("content/packages/kelas5-seni-rupa-b06-kerajinan-campuran/assets/kerajinan-campuran.png", naturalCraftScene());
write("content/packages/kelas5-seni-rupa-b07-apresiasi/assets/apresiasi-kelas5.png", artAppreciationScene());
write("content/packages/kelas5-seni-rupa-b08-pameran/assets/pameran-kelas5.png", exhibitionScene());
write("content/packages/kelas5-pjok-b05-bola-besar-lanjutan/assets/bola-besar-lanjutan.png", bigBallScene());
write("content/packages/kelas5-pjok-b06-senam-lantai/assets/senam-lantai.png", basicGymnasticsScene());
write("content/packages/kelas5-pjok-b07-atletik-lanjutan/assets/atletik-lanjutan.png", athleticsScene());
write("content/packages/kelas5-pjok-b08-kesehatan-kebugaran/assets/kesehatan-kebugaran.png", hygieneScene());
write("content/packages/kelas5-pai-b05-puasa/assets/puasa-kelas5.png", fastingScene());
write("content/packages/kelas5-pai-b06-zakat/assets/zakat-kelas5.png", charityScene());
write("content/packages/kelas5-pai-b07-sejarah-islam/assets/sejarah-islam-kelas5.png", islamHistoryScene());
write("content/packages/kelas5-pai-b08-adab/assets/adab-kelas5.png", goodMannersScene());
write("content/packages/kelas6-matematika-b01-bilangan-bulat/assets/bilangan-bulat.png", additionSubtractionScene());
write("content/packages/kelas6-matematika-b02-pecahan-desimal/assets/pecahan-desimal.png", mathFractionBars());
write("content/packages/kelas6-matematika-b03-rasio-proporsi/assets/rasio.png", ratioScene());
write("content/packages/kelas6-matematika-b04-lingkaran/assets/lingkaran.png", circleScene());
write("content/packages/kelas6-matematika-b05-bangun-ruang/assets/bangun-ruang-kelas6.png", solidShapesScene());
write("content/packages/kelas6-matematika-b06-statistika/assets/statistika.png", timeVolumeData());
write("content/packages/kelas6-matematika-b07-peluang/assets/peluang.png", probabilityScene());
write("content/packages/kelas6-matematika-b08-pemecahan-masalah/assets/pemecahan-masalah-kelas6.png", problemSolvingScene());
write("content/packages/kelas6-bahasa-indonesia-b01-laporan/assets/laporan-kelas6.png", writingScene());
write("content/packages/kelas6-bahasa-indonesia-b02-eksposisi/assets/eksposisi-kelas6.png", readingCorner());
write("content/packages/kelas6-bahasa-indonesia-b03-fabel/assets/fabel.png", narrativeScene());
write("content/packages/kelas6-bahasa-indonesia-b04-puisi-pantun/assets/puisi-pantun-kelas6.png", literatureScene());
write("content/packages/kelas6-bahasa-indonesia-b05-prosedur/assets/prosedur-kelas6.png", plantingSteps());
write("content/packages/kelas6-bahasa-indonesia-b06-diskusi/assets/diskusi-kelas6.png", discussionScene());
write("content/packages/kelas6-bahasa-indonesia-b07-wawancara/assets/wawancara-kelas6.png", interviewScene());
write("content/packages/kelas6-bahasa-indonesia-b08-menulis-karya/assets/menulis-karya.png", writingScene());
write("content/packages/kelas6-ipas-b01-perkembangbiakan/assets/perkembangbiakan.png", lifeCycleScene());
write("content/packages/kelas6-ipas-b02-pewarisan-sifat/assets/pewarisan-sifat.png", livingThingsGarden());
write("content/packages/kelas6-ipas-b03-listrik-magnet/assets/listrik-magnet.png", forceMotion());
write("content/packages/kelas6-ipas-b04-energi/assets/energi-kelas6.png", energyScene());
write("content/packages/kelas6-ipas-b05-ekosistem/assets/ekosistem-kelas6.png", ecosystemScene());
write("content/packages/kelas6-ipas-b06-bumi-tata-surya/assets/tata-surya-kelas6.png", solarSystemScene());
write("content/packages/kelas6-ipas-b07-teknologi-ramah-lingkungan/assets/teknologi-ramah-lingkungan.png", economyScene());
write("content/packages/kelas6-ipas-b08-pelestarian/assets/pelestarian-kelas6.png", waterCycle());
write("content/packages/kelas6-pendidikan-pancasila-b01-pancasila-uud/assets/pancasila-uud.png", pancasilaSymbols());
write("content/packages/kelas6-pendidikan-pancasila-b02-hak-kewajiban/assets/hak-kewajiban-kelas6.png", rightsDuties());
write("content/packages/kelas6-pendidikan-pancasila-b03-demokrasi/assets/demokrasi.png", discussionScene());
write("content/packages/kelas6-pendidikan-pancasila-b04-keberagaman/assets/keberagaman-kelas6.png", bhinnekaScene());
write("content/packages/kelas6-pendidikan-pancasila-b05-nkri-globalisasi/assets/nkri-globalisasi.png", flagCeremonyScene());
write("content/packages/kelas6-pendidikan-pancasila-b06-gotong-royong/assets/gotong-royong-kelas6.png", communityScene());
write("content/packages/kelas6-pendidikan-pancasila-b07-proyek-kewargaan/assets/proyek-kewargaan-kelas6.png", civicProjectScene());
write("content/packages/kelas6-pendidikan-pancasila-b08-kearifan-lokal/assets/kearifan-lokal.png", cultureScene());
write("content/packages/kelas6-seni-rupa-b01-unsur-prinsip/assets/unsur-prinsip-kelas6.png", artElements());
write("content/packages/kelas6-seni-rupa-b02-ilustrasi/assets/ilustrasi.png", drawingShapes());
write("content/packages/kelas6-seni-rupa-b03-warna-teknik/assets/warna-teknik.png", colorTexture());
write("content/packages/kelas6-seni-rupa-b04-karya-tiga-dimensi/assets/karya-tiga-dimensi.png", solidShapesScene());
write("content/packages/kelas6-seni-rupa-b05-seni-cetak/assets/seni-cetak-kelas6.png", printmakingScene());
write("content/packages/kelas6-seni-rupa-b06-kerajinan-campuran/assets/kerajinan-campuran-kelas6.png", naturalCraftScene());
write("content/packages/kelas6-seni-rupa-b07-apresiasi/assets/apresiasi-kelas6.png", artAppreciationScene());
write("content/packages/kelas6-seni-rupa-b08-pameran/assets/pameran-kelas6.png", exhibitionScene());
write("content/packages/kelas6-pjok-b01-bola-besar/assets/bola-besar-kelas6.png", bigBallScene());
write("content/packages/kelas6-pjok-b02-bola-kecil/assets/bola-kecil-kelas6.png", smallBallScene());
write("content/packages/kelas6-pjok-b03-atletik/assets/atletik-kelas6.png", athleticsScene());
write("content/packages/kelas6-pjok-b04-kebugaran/assets/kebugaran-kelas6.png", fitnessScene());
write("content/packages/kelas6-pjok-b05-senam/assets/senam-kelas6.png", basicGymnasticsScene());
write("content/packages/kelas6-pjok-b06-gerak-berirama/assets/gerak-berirama.png", movementScene());
write("content/packages/kelas6-pjok-b07-kesehatan/assets/kesehatan-kelas6.png", hygieneScene());
write("content/packages/kelas6-pjok-b08-permainan-tradisional/assets/permainan-tradisional.png", traditionalGameScene());
write("content/packages/kelas6-pai-b01-quran-tajwid/assets/quran-kelas6.png", quranScene());
write("content/packages/kelas6-pai-b02-iman-hari-akhir/assets/iman-hari-akhir.png", imanScene());
write("content/packages/kelas6-pai-b03-akhlak/assets/akhlak-kelas6.png", akhlakScene());
write("content/packages/kelas6-pai-b04-salat/assets/salat-kelas6.png", prayerScene());
write("content/packages/kelas6-pai-b05-puasa/assets/puasa-kelas6.png", fastingScene());
write("content/packages/kelas6-pai-b06-zakat/assets/zakat-kelas6.png", charityScene());
write("content/packages/kelas6-pai-b07-sejarah-islam/assets/sejarah-islam-kelas6.png", islamHistoryScene());
write("content/packages/kelas6-pai-b08-adab/assets/adab-kelas6.png", goodMannersScene());
write("content/packages/kelas1-matematika-b01-bilangan-1-10/assets/bilangan-1-10.png", countingScene());
write("content/packages/kelas1-bahasa-indonesia-b01-huruf-suku-kata/assets/huruf-suku-kata.png", readingCorner());
write("content/packages/kelas1-pendidikan-pancasila-b01-simbol-pancasila/assets/simbol-pancasila-kelas1.png", pancasilaSymbols());
write("content/packages/kelas1-seni-rupa-b01-garis-warna/assets/garis-warna-kelas1.png", artElements());
write("content/packages/kelas1-pjok-b01-jalan-lari/assets/jalan-lari.png", movementScene());
write("content/packages/kelas1-pai-b01-huruf-hijaiyah/assets/huruf-hijaiyah.png", quranScene());
write("content/packages/kelas1-matematika-b02-penjumlahan-10/assets/penjumlahan-10.png", additionSubtractionScene());
write("content/packages/kelas1-bahasa-indonesia-b02-membaca-kata/assets/membaca-kata.png", readingCorner());
write("content/packages/kelas1-pendidikan-pancasila-b02-aturan-rumah/assets/aturan-rumah.png", rightsDuties());
write("content/packages/kelas1-seni-rupa-b02-menggambar-bebas/assets/menggambar-bebas.png", drawingShapes());
write("content/packages/kelas1-pjok-b02-melompat/assets/melompat.png", movementScene());
write("content/packages/kelas1-pai-b02-iman-allah/assets/iman-allah-kelas1.png", imanScene());
write("content/packages/kelas1-matematika-b03-bentuk-pola/assets/bentuk-pola.png", planeShapes());
write("content/packages/kelas1-bahasa-indonesia-b03-menyimak-cerita/assets/menyimak-cerita.png", storyListening());
write("content/packages/kelas1-pendidikan-pancasila-b03-hak-kewajiban-rumah/assets/hak-kewajiban-rumah.png", rightsDuties());
write("content/packages/kelas1-seni-rupa-b03-tekstur/assets/tekstur-kelas1.png", colorTexture());
write("content/packages/kelas1-pjok-b03-keseimbangan/assets/keseimbangan.png", fitnessScene());
write("content/packages/kelas1-pai-b03-akhlak/assets/akhlak-kelas1.png", akhlakScene());
write("content/packages/kelas1-matematika-b04-pengukuran/assets/pengukuran-kelas1.png", measurementScene());
write("content/packages/kelas1-bahasa-indonesia-b04-menulis-kata/assets/menulis-kata.png", writingScene());
write("content/packages/kelas1-pendidikan-pancasila-b04-kebersamaan/assets/kebersamaan-kelas1.png", bhinnekaScene());
write("content/packages/kelas1-seni-rupa-b04-kolase/assets/kolase-kelas1.png", collageScene());
write("content/packages/kelas1-pjok-b04-kebersihan/assets/kebersihan-kelas1.png", hygieneScene());
write("content/packages/kelas1-pai-b04-belajar-salat/assets/belajar-salat.png", prayerScene());
write("content/packages/kelas1-matematika-b05-bilangan-11-20/assets/bilangan-11-20.png", countingScene());
write("content/packages/kelas1-matematika-b06-penjumlahan-20/assets/penjumlahan-20.png", additionSubtractionScene());
write("content/packages/kelas1-matematika-b07-bangun-datar/assets/bangun-datar-kelas1.png", planeShapes());
write("content/packages/kelas1-matematika-b08-pola-bilangan/assets/pola-bilangan.png", colorTexture());
write("content/packages/kelas1-bahasa-indonesia-b05-membaca-kalimat/assets/membaca-kalimat.png", readingCorner());
write("content/packages/kelas1-bahasa-indonesia-b06-menulis-kalimat/assets/menulis-kalimat.png", writingScene());
write("content/packages/kelas1-bahasa-indonesia-b07-bercerita/assets/bercerita.png", storyListening());
write("content/packages/kelas1-bahasa-indonesia-b08-kosakata-baru/assets/kosakata-baru.png", literatureScene());
write("content/packages/kelas1-pendidikan-pancasila-b05-simbol-warna/assets/simbol-warna-pancasila.png", pancasilaSymbols());
write("content/packages/kelas1-pendidikan-pancasila-b06-aturan-sekolah/assets/aturan-sekolah.png", queueScene());
write("content/packages/kelas1-pendidikan-pancasila-b07-tolong-menolong/assets/tolong-menolong.png", communityScene());
write("content/packages/kelas1-pendidikan-pancasila-b08-proyek-kelas/assets/proyek-kelas.png", civicProjectScene());
write("content/packages/kelas1-seni-rupa-b05-mewarnai-bentuk/assets/mewarnai-bentuk.png", colorTexture());
write("content/packages/kelas1-seni-rupa-b06-kerajinan-bahan-alam/assets/kerajinan-bahan-alam-kelas1.png", naturalCraftScene());
write("content/packages/kelas1-seni-rupa-b07-apresiasi/assets/apresiasi-kelas1.png", artAppreciationScene());
write("content/packages/kelas1-seni-rupa-b08-pameran/assets/pameran-kelas1.png", exhibitionScene());
write("content/packages/kelas1-pjok-b05-permainan-sederhana/assets/permainan-sederhana.png", traditionalGameScene());
write("content/packages/kelas1-pjok-b06-senam-ringan/assets/senam-ringan.png", basicGymnasticsScene());
write("content/packages/kelas1-pjok-b07-kebugaran/assets/kebugaran-kelas1.png", fitnessScene());
write("content/packages/kelas1-pjok-b08-kesehatan-kebersihan/assets/kesehatan-kebersihan-kelas1.png", hygieneScene());
write("content/packages/kelas1-pai-b05-huruf-harakat/assets/huruf-harakat.png", quranScene());
write("content/packages/kelas1-pai-b06-mengenal-malaikat/assets/mengenal-malaikat.png", imanScene());
write("content/packages/kelas1-pai-b07-kisah-nabi/assets/kisah-nabi.png", islamHistoryScene());
write("content/packages/kelas1-pai-b08-adab/assets/adab-kelas1.png", goodMannersScene());
write("content/packages/kelas2-matematika-b01-bilangan-1-100/assets/bilangan-1-100.png", hundredChart());
write("content/packages/kelas2-bahasa-indonesia-b01-membaca-lancar/assets/membaca-lancar.png", readingCorner());
write("content/packages/kelas2-pendidikan-pancasila-b01-simbol-pancasila/assets/simbol-pancasila-kelas2.png", pancasilaSymbols());
write("content/packages/kelas2-seni-rupa-b01-garis-bentuk-warna/assets/garis-bentuk-warna.png", artElements());
write("content/packages/kelas2-pjok-b01-gerak-lokomotor/assets/gerak-lokomotor-kelas2.png", movementScene());
write("content/packages/kelas2-pai-b01-huruf-hijaiyah/assets/huruf-hijaiyah-kelas2.png", quranScene());
