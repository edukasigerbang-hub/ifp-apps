import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import {
  colors,
  createCanvas,
  fillCircle,
  fillEllipse,
  fillPolygon,
  fillRect,
  fillRoundRect,
  ring,
  ringSegment,
  star,
  strokeLine,
  strokeRect,
  toPng,
  triangle,
  arrow,
  checkMark,
  dashedLine,
  equalsSign,
  minusSign,
  plusSign
} from "./lib/illustrationKit.mjs";

const APPLY = process.argv.includes("--apply");
const FILTER = process.argv.find((arg) => arg.startsWith("--filter="))?.slice("--filter=".length);
const PREVIEW_ROOT = ".tmp-aktivitas";

function ellipseOutline(c, cx, cy, rx, ry, width, color) {
  const steps = 96;
  let previous = null;
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    const point = [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
    if (previous) strokeLine(c, previous[0], previous[1], point[0], point[1], width, color);
    previous = point;
  }
}

function sector(c, cx, cy, r, fromDeg, toDeg, color) {
  const points = [[cx, cy]];
  const steps = 64;
  for (let i = 0; i <= steps; i += 1) {
    const angle = ((fromDeg + ((toDeg - fromDeg) * i) / steps) * Math.PI) / 180;
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  fillPolygon(c, points, color);
}

function pie(c, cx, cy, r, parts, filled, fill = colors.teal) {
  fillCircle(c, cx, cy, r, colors.pale);
  const step = 360 / parts;
  for (let i = 0; i < filled; i += 1) {
    sector(c, cx, cy, r, -90 + i * step, -90 + (i + 1) * step, fill);
  }
  for (let i = 0; i < parts; i += 1) {
    const angle = ((-90 + i * step) * Math.PI) / 180;
    strokeLine(c, cx, cy, cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 4, colors.navy);
  }
  ring(c, cx, cy, r, 6, colors.navy);
}

function fractionBar(c, x, y, width, height, parts, filled, fill = colors.teal) {
  fillRect(c, x, y, width, height, colors.pale);
  const partWidth = width / parts;
  for (let i = 0; i < filled; i += 1) {
    fillRect(c, x + i * partWidth, y, partWidth, height, fill);
  }
  for (let i = 0; i <= parts; i += 1) {
    strokeLine(c, x + i * partWidth, y, x + i * partWidth, y + height, 4, colors.navy);
  }
  strokeLine(c, x, y, x + width, y, 5, colors.navy);
  strokeLine(c, x, y + height, x + width, y + height, 5, colors.navy);
}

function tenFrame(c, x, y, filled, color = colors.teal) {
  const cell = 58;
  const gap = 10;
  for (let i = 0; i < 10; i += 1) {
    const cx = x + (i % 5) * (cell + gap);
    const cy = y + Math.floor(i / 5) * (cell + gap);
    fillRect(c, cx, cy, cell, cell, colors.white);
    strokeRect(c, cx, cy, cell, cell, 4, colors.navy);
    if (i < filled) fillCircle(c, cx + cell / 2, cy + cell / 2, cell * 0.3, color);
  }
}

function dotRow(c, x, cy, count, gap, radius, color) {
  for (let i = 0; i < count; i += 1) fillCircle(c, x + i * gap, cy, radius, color);
}

function dotArray(c, x, y, columns, rows, gap, radius, color) {
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      fillCircle(c, x + column * gap + radius, y + row * gap + radius, radius, color);
    }
  }
}

function ringAround(c, cx, cy, radius, thickness, color) {
  ring(c, cx, cy, radius, thickness, color);
}

function rod(c, x, y, height, width = 18) {
  fillRect(c, x, y, width, height, colors.tealLight);
  strokeRect(c, x, y, width, height, 4, colors.navy);
  for (let offset = 10; offset < height; offset += 10) {
    strokeLine(c, x + 2, y + offset, x + width - 2, y + offset, 1, colors.teal);
  }
}

function unit(c, x, y, size = 18) {
  fillRect(c, x, y, size, size, colors.tealLight);
  strokeRect(c, x, y, size, size, 4, colors.navy);
}

function flat(c, x, y, size = 90) {
  fillRect(c, x, y, size, size, colors.tealLight);
  strokeRect(c, x, y, size, size, 4, colors.navy);
  for (let i = 10; i < size; i += 10) {
    strokeLine(c, x + 2, y + i, x + size - 2, y + i, 1, colors.teal);
    strokeLine(c, x + i, y + 2, x + i, y + size - 2, 1, colors.teal);
  }
}

function cubeBlock(c, x, y, size = 90) {
  fillRect(c, x, y, size, size, colors.tealLight);
  strokeRect(c, x, y, size, size, 4, colors.navy);
  for (let i = 10; i < size; i += 10) {
    strokeLine(c, x + 2, y + i, x + size - 2, y + i, 1, colors.teal);
    strokeLine(c, x + i, y + 2, x + i, y + size - 2, 1, colors.teal);
  }
  strokeLine(c, x, y, x + 18, y - 18, 4, colors.navy);
  strokeLine(c, x + size, y, x + size + 18, y - 18, 4, colors.navy);
  strokeLine(c, x + 18, y - 18, x + size + 18, y - 18, 4, colors.navy);
  strokeLine(c, x + size, y + size, x + size + 18, y + size - 18, 4, colors.navy);
  strokeLine(c, x + size + 18, y - 18, x + size + 18, y + size - 18, 4, colors.navy);
}

function ruler(c, x, y, width, height, divisions) {
  fillRect(c, x, y, width, height, colors.pale);
  strokeRect(c, x, y, width, height, 4, colors.navy);
  for (let i = 0; i <= divisions; i += 1) {
    const tx = x + (width * i) / divisions;
    const length = i % 10 === 0 ? height * 0.6 : i % 5 === 0 ? height * 0.42 : height * 0.26;
    strokeLine(c, tx, y, tx, y + length, i % 10 === 0 ? 4 : 2, colors.navy);
  }
}

function balanceScale(c, cx, baseY, span) {
  const beamY = baseY - 170;
  fillRect(c, cx - 80, baseY - 12, 160, 12, colors.navy);
  strokeLine(c, cx, baseY - 12, cx, beamY, 9, colors.navy);
  strokeLine(c, cx - span, beamY, cx + span, beamY, 9, colors.navy);
  fillCircle(c, cx, beamY, 11, colors.navy);
  for (const side of [-1, 1]) {
    const px = cx + side * span;
    strokeLine(c, px, beamY, px, beamY + 64, 4, colors.navy);
    const panY = beamY + 64;
    fillPolygon(c, [[px - 58, panY], [px + 58, panY], [px + 38, panY + 34], [px - 38, panY + 34]], colors.pale);
    strokeLine(c, px - 58, panY, px + 58, panY, 5, colors.navy);
    strokeLine(c, px - 58, panY, px - 38, panY + 34, 4, colors.navy);
    strokeLine(c, px + 58, panY, px + 38, panY + 34, 4, colors.navy);
    strokeLine(c, px - 38, panY + 34, px + 38, panY + 34, 4, colors.navy);
  }
}

function clockFace(c, cx, cy, r, hour, minute) {
  fillCircle(c, cx, cy, r, colors.white);
  ring(c, cx, cy, r, 6, colors.navy);
  for (let i = 0; i < 12; i += 1) {
    const angle = ((-90 + i * 30) * Math.PI) / 180;
    const inner = i % 3 === 0 ? r - 26 : r - 16;
    strokeLine(
      c,
      cx + Math.cos(angle) * inner,
      cy + Math.sin(angle) * inner,
      cx + Math.cos(angle) * (r - 7),
      cy + Math.sin(angle) * (r - 7),
      i % 3 === 0 ? 5 : 3,
      colors.navy
    );
  }
  const hourAngle = ((-90 + hour * 30 + minute * 0.5) * Math.PI) / 180;
  const minuteAngle = ((-90 + minute * 6) * Math.PI) / 180;
  strokeLine(c, cx, cy, cx + Math.cos(hourAngle) * r * 0.5, cy + Math.sin(hourAngle) * r * 0.5, 9, colors.teal);
  strokeLine(c, cx, cy, cx + Math.cos(minuteAngle) * r * 0.76, cy + Math.sin(minuteAngle) * r * 0.76, 5, colors.navy);
  fillCircle(c, cx, cy, 8, colors.navy);
}

function barChart(c, x, y, width, height, values, options = {}) {
  const { color = colors.teal, highlight = -1, mean = null, max = Math.max(...values) } = options;
  const baseY = y + height;
  strokeLine(c, x, baseY, x + width, baseY, 5, colors.navy);
  strokeLine(c, x, y, x, baseY, 5, colors.navy);
  const slot = width / values.length;
  const barWidth = slot * 0.5;
  values.forEach((value, index) => {
    const barHeight = (height * 0.84 * value) / max;
    const bx = x + slot * index + (slot - barWidth) / 2;
    fillRect(c, bx, baseY - barHeight, barWidth, barHeight, index === highlight ? colors.orange : color);
    strokeRect(c, bx, baseY - barHeight, barWidth, barHeight, 4, colors.navy);
  });
  if (mean !== null) {
    const my = baseY - (height * 0.84 * mean) / max;
    dashedLine(c, x, my, x + width, my, 4, colors.red);
  }
}

function curveArrow(c, x1, y1, x2, y2, lift, width, color) {
  const points = [];
  const steps = 40;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2;
    const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (Math.min(y1, y2) - lift) + t * t * y2;
    points.push([x, y]);
  }
  for (let i = 0; i + 1 < points.length; i += 1) {
    strokeLine(c, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], width, color);
  }
  const [px, py] = points[points.length - 2];
  const angle = Math.atan2(y2 - py, x2 - px);
  fillPolygon(
    c,
    [
      [x2, y2],
      [x2 - Math.cos(angle - 0.5) * 16, y2 - Math.sin(angle - 0.5) * 16],
      [x2 - Math.cos(angle + 0.5) * 16, y2 - Math.sin(angle + 0.5) * 16]
    ],
    color
  );
}

function flowStep(c, cx, cy, radius, dots) {
  fillCircle(c, cx, cy, radius, colors.pale);
  ring(c, cx, cy, radius, 5, colors.navy);
  const gap = 16;
  const start = cx - ((dots - 1) * gap) / 2;
  for (let i = 0; i < dots; i += 1) fillCircle(c, start + i * gap, cy, 6, colors.teal);
}

function coin(c, cx, cy, r, tone) {
  fillCircle(c, cx, cy, r, tone);
  ring(c, cx, cy, r, 5, colors.navy);
  ring(c, cx, cy, r * 0.66, 3, colors.navy);
}

function note(c, x, y, width, height) {
  fillRoundRect(c, x, y, width, height, 10, colors.tealLight);
  strokeRect(c, x, y, width, height, 4, colors.navy);
  ring(c, x + width / 2, y + height / 2, Math.min(width, height) * 0.26, 4, colors.navy);
}

function ellipseShape(c, cx, cy, rx, ry) {
  fillEllipse(c, cx, cy, rx, ry, colors.tealLight);
  ellipseOutline(c, cx, cy, rx, ry, 5, colors.navy);
}

function cube3d(c, x, y, size, depth = 26) {
  fillPolygon(c, [[x, y], [x + depth, y - depth], [x + size + depth, y - depth], [x + size, y]], colors.sky);
  fillPolygon(
    c,
    [[x + size, y], [x + size + depth, y - depth], [x + size + depth, y + size - depth], [x + size, y + size]],
    colors.pale
  );
  fillRect(c, x, y, size, size, colors.tealLight);
  strokeRect(c, x, y, size, size, 5, colors.navy);
  strokeLine(c, x, y, x + depth, y - depth, 5, colors.navy);
  strokeLine(c, x + size, y, x + size + depth, y - depth, 5, colors.navy);
  strokeLine(c, x + size, y + size, x + size + depth, y + size - depth, 5, colors.navy);
  strokeLine(c, x + depth, y - depth, x + size + depth, y - depth, 5, colors.navy);
  strokeLine(c, x + size + depth, y - depth, x + size + depth, y + size - depth, 5, colors.navy);
}

function cylinder3d(c, cx, topY, bottomY, rx) {
  const ry = rx * 0.3;
  fillRect(c, cx - rx, topY, rx * 2, bottomY - topY, colors.tealLight);
  fillEllipse(c, cx, bottomY, rx, ry, colors.tealLight);
  fillEllipse(c, cx, topY, rx, ry, colors.sky);
  strokeLine(c, cx - rx, topY, cx - rx, bottomY, 5, colors.navy);
  strokeLine(c, cx + rx, topY, cx + rx, bottomY, 5, colors.navy);
  ellipseOutline(c, cx, topY, rx, ry, 5, colors.navy);
  ellipseOutline(c, cx, bottomY, rx, ry, 5, colors.navy);
}

function pyramid3d(c, cx, apexY, baseY, halfWidth) {
  fillPolygon(c, [[cx, apexY], [cx + halfWidth, baseY], [cx - halfWidth, baseY]], colors.tealLight);
  fillPolygon(c, [[cx, apexY], [cx + halfWidth, baseY], [cx + halfWidth + 26, baseY - 22]], colors.pale);
  strokeLine(c, cx, apexY, cx - halfWidth, baseY, 5, colors.navy);
  strokeLine(c, cx, apexY, cx + halfWidth, baseY, 5, colors.navy);
  strokeLine(c, cx, apexY, cx + halfWidth + 26, baseY - 22, 5, colors.navy);
  strokeLine(c, cx - halfWidth, baseY, cx + halfWidth, baseY, 5, colors.navy);
  strokeLine(c, cx + halfWidth, baseY, cx + halfWidth + 26, baseY - 22, 5, colors.navy);
  strokeLine(c, cx - halfWidth, baseY, cx - halfWidth + 26, baseY - 22, 4, colors.muted);
  strokeLine(c, cx - halfWidth + 26, baseY - 22, cx + halfWidth + 26, baseY - 22, 4, colors.muted);
}

function prism3d(c, x, y) {
  fillPolygon(c, [[x, y], [x + 120, y], [x + 210, y - 90], [x + 90, y - 90]], colors.tealLight);
  fillPolygon(c, [[x, y], [x + 90, y - 90], [x + 90, y - 30], [x, y + 60]], colors.sky);
  fillPolygon(c, [[x + 120, y], [x + 210, y - 90], [x + 210, y - 30], [x + 120, y + 60]], colors.pale);
  strokeLine(c, x, y, x + 120, y, 5, colors.navy);
  strokeLine(c, x, y, x + 90, y - 90, 5, colors.navy);
  strokeLine(c, x, y, x, y + 60, 5, colors.navy);
  strokeLine(c, x + 120, y, x + 210, y - 90, 5, colors.navy);
  strokeLine(c, x + 120, y, x + 120, y + 60, 4, colors.muted);
  strokeLine(c, x + 90, y - 90, x + 210, y - 90, 5, colors.navy);
  strokeLine(c, x + 210, y - 90, x + 210, y - 30, 5, colors.navy);
  strokeLine(c, x + 210, y - 30, x + 120, y + 60, 5, colors.navy);
  strokeLine(c, x, y + 60, x + 120, y + 60, 5, colors.navy);
}

function angleFigure(c, cx, cy, degrees, color = colors.teal, arm = 82) {
  strokeLine(c, cx - arm, cy, cx + arm, cy, 6, colors.navy);
  const rad = (-degrees * Math.PI) / 180;
  const rayLength = arm * 1.35;
  strokeLine(c, cx, cy, cx + Math.cos(rad) * rayLength, cy + Math.sin(rad) * rayLength, 6, color);
  ringSegment(c, cx, cy, 36, 4, -degrees, 0, colors.navy);
  fillCircle(c, cx, cy, 7, colors.navy);
}

function numberLine(c, x, y, width, ticks) {
  strokeLine(c, x, y, x + width, y, 6, colors.navy);
  for (let i = 0; i <= ticks; i += 1) {
    const tx = x + (width * i) / ticks;
    const tall = i % 2 === 0;
    strokeLine(c, tx, y - (tall ? 18 : 10), tx, y + (tall ? 4 : 2), tall ? 4 : 2, colors.navy);
  }
}

function tableGrid(c, x, y, width, height, columns, rows) {
  fillRect(c, x, y, width, height, colors.white);
  fillRect(c, x + 2, y + 2, width - 4, height / rows - 3, colors.pale);
  strokeRect(c, x, y, width, height, 4, colors.navy);
  for (let i = 1; i < columns; i += 1) {
    strokeLine(c, x + (width * i) / columns, y, x + (width * i) / columns, y + height, 3, colors.navy);
  }
  for (let i = 1; i < rows; i += 1) {
    strokeLine(c, x, y + (height * i) / rows, x + width, y + (height * i) / rows, 3, colors.navy);
  }
}

function pictograph(c, x, y, rows, maxDots) {
  rows.forEach((count, rowIndex) => {
    const rowY = y + rowIndex * 62;
    fillRect(c, x, rowY, maxDots * 40 + 30, 46, colors.pale);
    strokeRect(c, x, rowY, maxDots * 40 + 30, 46, 3, colors.navy);
    dotRow(c, x + 22, rowY + 23, count, 40, 12, colors.teal);
  });
}

function apple(c, cx, cy, r) {
  fillCircle(c, cx, cy, r, colors.red);
  ring(c, cx, cy, r, 4, colors.navy);
  strokeLine(c, cx, cy - r, cx + 4, cy - r - 12, 4, colors.navy);
  fillPolygon(c, [[cx + 4, cy - r - 4], [cx + 22, cy - r - 12], [cx + 10, cy - r - 22]], colors.green);
}

function books(c, x, y, count) {
  for (let i = 0; i < count; i += 1) {
    const bx = x + i * 26;
    fillRect(c, bx, y - i * 8, 120, 78, i % 2 === 0 ? colors.tealLight : colors.blueLight);
    strokeRect(c, bx, y - i * 8, 120, 78, 4, colors.navy);
    strokeLine(c, bx + 12, y - i * 8 + 12, bx + 108, y - i * 8 + 12, 3, colors.navy);
  }
}

function glass(c, cx, topY, bottomY, halfWidth, level) {
  const bodyBottom = bottomY;
  fillPolygon(
    c,
    [[cx - halfWidth, topY], [cx + halfWidth, topY], [cx + halfWidth, bodyBottom], [cx - halfWidth, bodyBottom]],
    colors.white
  );
  const waterTop = bodyBottom - (bodyBottom - topY) * level;
  fillPolygon(
    c,
    [[cx - halfWidth + 4, waterTop], [cx + halfWidth - 4, waterTop], [cx + halfWidth - 4, bodyBottom - 4], [cx - halfWidth + 4, bodyBottom - 4]],
    colors.sky
  );
  strokeLine(c, cx - halfWidth, topY, cx - halfWidth, bodyBottom, 5, colors.navy);
  strokeLine(c, cx + halfWidth, topY, cx + halfWidth, bodyBottom, 5, colors.navy);
  strokeLine(c, cx - halfWidth, bodyBottom, cx + halfWidth, bodyBottom, 5, colors.navy);
  strokeLine(c, cx - halfWidth + 2, waterTop, cx + halfWidth - 2, waterTop, 4, colors.blue);
  for (let i = 1; i <= 4; i += 1) {
    const ty = bodyBottom - ((bodyBottom - topY) * i) / 5;
    strokeLine(c, cx + halfWidth - 16, ty, cx + halfWidth - 2, ty, 3, colors.navy);
  }
}

function chevron(c, cx, cy, size, direction, color, width) {
  strokeLine(c, cx - size * direction, cy - size, cx + size * direction, cy, width, color);
  strokeLine(c, cx + size * direction, cy, cx - size * direction, cy + size, width, color);
}

export const PLAN = [
  {
    packageDir: "kelas1-matematika-b01-bilangan-1-10",
    file: "aktivitas-bilangan-1-10.png",
    alt: "Kerangka sepuluh berisi tujuh apel merah dan tiga kotak kosong, di samping dua kelompok titik berisi lima dan tiga titik.",
    draw(c) {
      tenFrame(c, 60, 120, 7, colors.red);
      strokeLine(c, 60, 340, 700, 340, 3, colors.muted);
      dotRow(c, 120, 470, 5, 46, 20, colors.teal);
      chevron(c, 400, 470, 22, 1, colors.navy, 9);
      dotRow(c, 500, 470, 3, 46, 20, colors.blue);
    }
  },
  {
    packageDir: "kelas1-matematika-b02-penjumlahan-10",
    file: "aktivitas-penjumlahan-10.png",
    alt: "Baris atas: dua titik ditambah tiga titik menghasilkan lima titik. Baris bawah: lima titik dikurangi dua titik, dua di antaranya dicoret.",
    draw(c) {
      dotRow(c, 90, 170, 2, 56, 24, colors.red);
      plusSign(c, 250, 170, 26, 9, colors.navy);
      dotRow(c, 310, 170, 3, 56, 24, colors.blue);
      equalsSign(c, 480, 170, 26, 9, colors.navy);
      dotRow(c, 560, 170, 5, 50, 20, colors.teal);
      strokeLine(c, 60, 300, 740, 300, 3, colors.muted);
      dotRow(c, 90, 450, 5, 56, 24, colors.teal);
      minusSign(c, 400, 450, 26, 9, colors.navy);
      dotRow(c, 500, 450, 2, 56, 24, colors.red);
      dashedLine(c, 500, 410, 556, 490, 5, colors.red);
      dashedLine(c, 556, 410, 500, 490, 5, colors.red);
    }
  },
  {
    packageDir: "kelas1-matematika-b03-bentuk-pola",
    file: "aktivitas-bentuk-pola.png",
    alt: "Dua pita pola berulang: lingkaran merah dan persegi kuning bergantian, lalu segitiga biru dan lingkaran teal; setiap pita berakhir pada kotak kosong bergaris putus-putus.",
    draw(c) {
      const strip = (y, shapes) => {
        shapes.forEach((shape, index) => {
          const cx = 110 + index * 130;
          if (shape === "circle") {
            fillCircle(c, cx, y, 40, colors.red);
            ring(c, cx, y, 40, 5, colors.navy);
          } else if (shape === "square") {
            fillRect(c, cx - 40, y - 40, 80, 80, colors.sun);
            strokeRect(c, cx - 40, y - 40, 80, 80, 5, colors.navy);
          } else {
            triangle(c, cx, y, 50, 0, colors.blue);
          }
        });
        dashedLine(c, 630, y - 46, 720, y - 46, 4, colors.muted, 10, 8);
        dashedLine(c, 720, y - 46, 720, y + 46, 4, colors.muted, 10, 8);
        dashedLine(c, 720, y + 46, 630, y + 46, 4, colors.muted, 10, 8);
        dashedLine(c, 630, y + 46, 630, y - 46, 4, colors.muted, 10, 8);
      };
      strip(180, ["circle", "square", "circle", "square"]);
      strokeLine(c, 60, 300, 740, 300, 3, colors.muted);
      strip(440, ["triangle", "circle", "triangle", "circle"]);
    }
  },
  {
    packageDir: "kelas1-matematika-b04-pengukuran",
    file: "aktivitas-pengukuran-sederhana.png",
    alt: "Empat alat ukur: penggaris dengan pensil di atasnya, timbangan dua lengan dengan apel di satu lengan, jam dinding, dan gelas ukur.",
    draw(c) {
      ruler(c, 60, 190, 300, 60, 30);
      fillRect(c, 90, 150, 210, 22, colors.orange);
      strokeRect(c, 90, 150, 210, 22, 4, colors.navy);
      strokeLine(c, 300, 150, 320, 161, 4, colors.navy);
      strokeLine(c, 300, 172, 320, 161, 4, colors.navy);
      balanceScale(c, 520, 300, 90);
      apple(c, 460, 194, 18);
      clockFace(c, 150, 430, 80, 3, 0);
      cylinder3d(c, 560, 420, 520, 46);
    }
  },
  {
    packageDir: "kelas1-matematika-b05-bilangan-11-20",
    file: "aktivitas-bilangan-11-20.png",
    alt: "Dua kerangka sepuluh: kerangka pertama penuh sepuluh titik, kerangka kedua berisi tujuh titik.",
    draw(c) {
      tenFrame(c, 60, 160, 10, colors.red);
      tenFrame(c, 430, 160, 7, colors.red);
      strokeLine(c, 60, 400, 740, 400, 3, colors.muted);
      dotRow(c, 120, 480, 10, 46, 14, colors.teal);
    }
  },
  {
    packageDir: "kelas1-matematika-b06-penjumlahan-20",
    file: "aktivitas-penjumlahan-20.png",
    alt: "Kerangka sepuluh penuh ditambah dua titik, lalu tanda tambah dan lima titik di sampingnya.",
    draw(c) {
      tenFrame(c, 50, 150, 10, colors.teal);
      dotRow(c, 60, 330, 2, 50, 20, colors.blue);
      plusSign(c, 440, 250, 26, 9, colors.navy);
      dotRow(c, 510, 250, 5, 50, 20, colors.red);
      strokeLine(c, 60, 430, 740, 430, 3, colors.muted);
      tenFrame(c, 380, 450, 7, colors.teal);
    }
  },
  {
    packageDir: "kelas1-matematika-b07-bangun-datar",
    file: "aktivitas-bangun-datar.png",
    alt: "Empat bangun datar berjajar: lingkaran teal, persegi kuning, segitiga biru, dan persegi panjang merah muda.",
    draw(c) {
      fillCircle(c, 130, 300, 80, colors.teal);
      ring(c, 130, 300, 80, 6, colors.navy);
      fillRect(c, 250, 220, 160, 160, colors.sun);
      strokeRect(c, 250, 220, 160, 160, 6, colors.navy);
      triangle(c, 540, 300, 92, 0, colors.blue);
      fillRect(c, 620, 250, 130, 100, colors.redLight);
      strokeRect(c, 620, 250, 130, 100, 6, colors.navy);
    }
  },
  {
    packageDir: "kelas1-matematika-b08-pola-bilangan",
    file: "aktivitas-pola-bilangan.png",
    alt: "Menara titik bertambah satu: satu, dua, tiga, empat titik. Di bawahnya menara dua, empat, dan enam titik, masing-masing diikuti menara kosong bergaris putus-putus.",
    draw(c) {
      const tower = (x, baseY, count, color, unitSize = 34) => {
        for (let i = 0; i < count; i += 1) {
          fillRect(c, x, baseY - (i + 1) * unitSize, unitSize, unitSize, color);
          strokeRect(c, x, baseY - (i + 1) * unitSize, unitSize, unitSize, 4, colors.navy);
        }
      };
      for (let i = 1; i <= 4; i += 1) tower(80 + (i - 1) * 110, 240, i, colors.teal);
      dashedLine(c, 520, 106, 554, 106, 4, colors.muted, 8, 6);
      dashedLine(c, 554, 106, 554, 240, 4, colors.muted, 8, 6);
      dashedLine(c, 554, 240, 520, 240, 4, colors.muted, 8, 6);
      dashedLine(c, 520, 240, 520, 106, 4, colors.muted, 8, 6);
      strokeLine(c, 60, 300, 700, 300, 3, colors.muted);
      for (let i = 1; i <= 3; i += 1) tower(80 + (i - 1) * 150, 560, i * 2, colors.blue, 26);
      dashedLine(c, 530, 404, 556, 404, 4, colors.muted, 8, 6);
      dashedLine(c, 556, 404, 556, 560, 4, colors.muted, 8, 6);
      dashedLine(c, 556, 560, 530, 560, 4, colors.muted, 8, 6);
      dashedLine(c, 530, 560, 530, 404, 4, colors.muted, 8, 6);
    }
  },
  {
    packageDir: "kelas2-matematika-b01-bilangan-1-100",
    file: "aktivitas-bilangan-1-100.png",
    alt: "Panel kiri: empat batang puluhan dan tujuh satuan dalam tabel nilai tempat. Panel kanan: batang pendek di atas dan batang panjang di bawah, dengan tanda perbandingan di antara keduanya.",
    draw(c) {
      tableGrid(c, 60, 120, 300, 360, 2, 1);
      for (let i = 0; i < 4; i += 1) rod(c, 92 + i * 26, 200, 220);
      for (let i = 0; i < 7; i += 1) unit(c, 250 + (i % 2) * 44, 200 + Math.floor(i / 2) * 56);
      strokeLine(c, 420, 170, 620, 170, 12, colors.teal);
      strokeLine(c, 420, 330, 700, 330, 12, colors.blue);
      fillCircle(c, 420, 170, 11, colors.navy);
      fillCircle(c, 420, 330, 11, colors.navy);
      chevron(c, 700, 250, 26, 1, colors.navy, 9);
    }
  },
  {
    packageDir: "kelas2-matematika-b02-penjumlahan-100",
    file: "aktivitas-penjumlahan-100.png",
    alt: "Empat batang puluhan dan lima satuan digabung dengan tiga batang puluhan dan dua satuan; hasilnya tujuh batang puluhan dan tujuh satuan.",
    draw(c) {
      for (let i = 0; i < 4; i += 1) rod(c, 80 + i * 26, 150, 180);
      for (let i = 0; i < 5; i += 1) unit(c, 200 + i * 26, 360);
      plusSign(c, 320, 260, 24, 8, colors.navy);
      for (let i = 0; i < 3; i += 1) rod(c, 360 + i * 26, 150, 180);
      for (let i = 0; i < 2; i += 1) unit(c, 460 + i * 26, 360);
      equalsSign(c, 520, 260, 22, 8, colors.navy);
      for (let i = 0; i < 7; i += 1) rod(c, 570 + i * 26, 150, 180);
      for (let i = 0; i < 7; i += 1) unit(c, 560 + i * 26, 360);
      strokeLine(c, 60, 440, 740, 440, 3, colors.muted);
      dotRow(c, 90, 500, 10, 42, 12, colors.teal);
      dotRow(c, 540, 500, 10, 20, 8, colors.blue);
    }
  },
  {
    packageDir: "kelas2-matematika-b03-perkalian-dasar",
    file: "aktivitas-perkalian-dasar.png",
    alt: "Dua susunan titik: dua baris berisi tiga titik dan empat baris berisi dua titik, masing-masing ditandai kurung baris dan kolom.",
    draw(c) {
      dotArray(c, 130, 180, 3, 2, 80, 20, colors.teal);
      strokeLine(c, 120, 140, 340, 140, 3, colors.navy);
      strokeLine(c, 120, 140, 120, 132, 3, colors.navy);
      strokeLine(c, 340, 140, 340, 132, 3, colors.navy);
      strokeLine(c, 390, 180, 390, 260, 3, colors.navy);
      strokeLine(c, 390, 180, 398, 180, 3, colors.navy);
      strokeLine(c, 390, 260, 398, 260, 3, colors.navy);
      dotArray(c, 470, 160, 2, 4, 90, 20, colors.blue);
      strokeLine(c, 460, 120, 590, 120, 3, colors.navy);
      strokeLine(c, 460, 120, 460, 112, 3, colors.navy);
      strokeLine(c, 590, 120, 590, 112, 3, colors.navy);
      strokeLine(c, 640, 160, 640, 430, 3, colors.navy);
      strokeLine(c, 640, 160, 648, 160, 3, colors.navy);
      strokeLine(c, 640, 430, 648, 430, 3, colors.navy);
    }
  },
  {
    packageDir: "kelas2-matematika-b04-pengukuran",
    file: "aktivitas-pengukuran.png",
    alt: "Panel atas membandingkan dua batang panjang berbeda; panel bawah menunjukkan penggaris, pensil, dan timbangan dengan apel.",
    draw(c) {
      fillRect(c, 80, 100, 560, 46, colors.tealLight);
      strokeRect(c, 80, 100, 560, 46, 5, colors.navy);
      fillRect(c, 80, 180, 180, 40, colors.orange);
      strokeRect(c, 80, 180, 180, 40, 5, colors.navy);
      strokeLine(c, 60, 260, 740, 260, 3, colors.muted);
      ruler(c, 60, 380, 300, 56, 30);
      fillRect(c, 90, 340, 210, 20, colors.orange);
      strokeRect(c, 90, 340, 210, 20, 4, colors.navy);
      balanceScale(c, 590, 470, 80);
      apple(c, 540, 366, 18);
    }
  },
  {
    packageDir: "kelas2-matematika-b05-perkalian-pembagian",
    file: "aktivitas-perkalian-pembagian.png",
    alt: "Susunan dua baris tiga titik, lalu enam titik yang sama dikelompokkan menjadi dua lingkaran berisi tiga titik.",
    draw(c) {
      dotArray(c, 160, 220, 3, 2, 76, 20, colors.teal);
      arrow(c, 390, 250, 470, 250, 6, colors.navy);
      ringAround(c, 560, 230, 66, 5, colors.blue);
      ringAround(c, 560, 390, 66, 5, colors.blue);
      dotRow(c, 520, 230, 3, 40, 14, colors.teal);
      dotRow(c, 520, 390, 3, 40, 14, colors.teal);
    }
  },
  {
    packageDir: "kelas2-matematika-b06-bangun-datar",
    file: "aktivitas-bangun-datar-kelas2.png",
    alt: "Persegi dengan tanda sisi sama panjang, persegi panjang, lingkaran, dan segitiga.",
    draw(c) {
      fillRect(c, 70, 200, 150, 150, colors.sun);
      strokeRect(c, 70, 200, 150, 150, 6, colors.navy);
      for (const [tx, ty, dx, dy] of [
        [145, 200, 0, 22],
        [145, 350, 0, -22],
        [70, 275, 22, 0],
        [220, 275, -22, 0]
      ]) {
        strokeLine(c, tx - dx / 2, ty - dy / 2, tx + dx / 2, ty + dy / 2, 4, colors.navy);
      }
      fillRect(c, 290, 230, 190, 110, colors.redLight);
      strokeRect(c, 290, 230, 190, 110, 6, colors.navy);
      fillCircle(c, 580, 285, 66, colors.teal);
      ring(c, 580, 285, 66, 6, colors.navy);
      triangle(c, 700, 470, 60, 0, colors.blue);
      triangle(c, 150, 470, 60, 180, colors.teal);
    }
  },
  {
    packageDir: "kelas2-matematika-b07-waktu-uang",
    file: "aktivitas-waktu-uang.png",
    alt: "Jam dinding, dua koin, dan satu lembar uang kertas.",
    draw(c) {
      clockFace(c, 210, 240, 120, 9, 0);
      strokeLine(c, 60, 420, 740, 420, 3, colors.muted);
      coin(c, 180, 500, 46, colors.sun);
      coin(c, 300, 500, 46, colors.pale);
      note(c, 400, 456, 300, 88);
    }
  },
  {
    packageDir: "kelas2-matematika-b08-data",
    file: "aktivitas-data.png",
    alt: "Tabel kosong berkolom, lalu diagram batang empat batang dengan sumbu mendatar dan tegak.",
    draw(c) {
      tableGrid(c, 60, 150, 300, 260, 4, 3);
      barChart(c, 430, 170, 280, 320, [4, 6, 3, 8], { highlight: 3 });
    }
  },
  {
    packageDir: "kelas3-matematika-b01-bilangan-10000",
    file: "aktivitas-bilangan-10000.png",
    alt: "Tabel empat kolom nilai tempat berisi dua kubus ribuan, tiga ratusan, empat puluhan, dan lima satuan.",
    draw(c) {
      tableGrid(c, 60, 100, 680, 420, 4, 1);
      cubeBlock(c, 110, 200, 70);
      cubeBlock(c, 110, 300, 70);
      flat(c, 260, 190, 76);
      flat(c, 260, 290, 76);
      flat(c, 260, 390, 76);
      for (let i = 0; i < 4; i += 1) rod(c, 424 + i * 26, 200, 200);
      for (let i = 0; i < 5; i += 1) unit(c, 590 + (i % 2) * 44, 220 + Math.floor(i / 2) * 60);
    }
  },
  {
    packageDir: "kelas3-matematika-b02-penjumlahan-pengurangan",
    file: "aktivitas-penjumlahan-pengurangan.png",
    alt: "Sepuluh satuan digabung menjadi satu batang puluhan, dan satu batang puluhan diuraikan kembali menjadi sepuluh satuan.",
    draw(c) {
      for (let i = 0; i < 10; i += 1) unit(c, 90 + (i % 5) * 44, 160 + Math.floor(i / 5) * 56);
      curveArrow(c, 330, 200, 430, 200, 60, 6, colors.teal);
      rod(c, 470, 130, 220, 34);
      strokeLine(c, 60, 380, 740, 380, 3, colors.muted);
      rod(c, 120, 420, 160, 34);
      curveArrow(c, 230, 500, 330, 500, 60, 6, colors.teal);
      for (let i = 0; i < 10; i += 1) unit(c, 380 + (i % 5) * 44, 420 + Math.floor(i / 5) * 56);
    }
  },
  {
    packageDir: "kelas3-matematika-b03-perkalian-pembagian",
    file: "aktivitas-perkalian-pembagian.png",
    alt: "Susunan empat kolom tiga baris bintang, lalu dua belas bintang yang dikelompokkan menjadi tiga lingkaran berisi empat bintang.",
    draw(c) {
      for (let row = 0; row < 3; row += 1) {
        for (let column = 0; column < 4; column += 1) {
          star(c, 110 + column * 70, 170 + row * 70, 26, colors.sun, 4);
        }
      }
      arrow(c, 330, 250, 400, 250, 6, colors.navy);
      for (let g = 0; g < 3; g += 1) {
        const centerY = 180 + 150 * g;
        ringAround(c, 500, centerY, 62, 4, colors.blue);
        for (let i = 0; i < 4; i += 1) {
          star(c, 470 + (i % 2) * 60, centerY - 30 + Math.floor(i / 2) * 60, 18, colors.sun, 3);
        }
      }
    }
  },
  {
    packageDir: "kelas3-matematika-b04-pecahan",
    file: "aktivitas-pecahan.png",
    alt: "Lingkaran terbagi dua dengan satu bagian diwarnai, batang terbagi tiga dengan satu bagian, dan batang terbagi empat dengan tiga bagian. Baris bawah: lingkaran terbagi empat dengan satu bagian dan batang terbagi dua dengan satu bagian.",
    draw(c) {
      pie(c, 170, 200, 110, 2, 1);
      fractionBar(c, 340, 90, 360, 66, 3, 1);
      fractionBar(c, 340, 240, 360, 66, 4, 3, colors.blue);
      strokeLine(c, 60, 350, 740, 350, 3, colors.muted);
      pie(c, 170, 470, 90, 4, 1);
      fractionBar(c, 340, 440, 360, 66, 2, 1);
    }
  },
  {
    packageDir: "kelas3-matematika-b05-bangun-datar",
    file: "aktivitas-bangun-datar-ciri.png",
    alt: "Susunan bangun datar membentuk rumah: persegi sebagai badan, segitiga sebagai atap, persegi panjang sebagai pintu, lingkaran sebagai jendela, dan lingkaran matahari.",
    draw(c) {
      fillRect(c, 180, 260, 300, 240, colors.pale);
      strokeRect(c, 180, 260, 300, 240, 6, colors.navy);
      fillPolygon(c, [[330, 110], [170, 260], [490, 260]], colors.redLight);
      strokeLine(c, 330, 110, 170, 260, 6, colors.navy);
      strokeLine(c, 330, 110, 490, 260, 6, colors.navy);
      fillRect(c, 270, 360, 90, 140, colors.tealLight);
      strokeRect(c, 270, 360, 90, 140, 5, colors.navy);
      fillCircle(c, 400, 330, 34, colors.sky);
      ring(c, 400, 330, 34, 5, colors.navy);
      fillCircle(c, 640, 120, 52, colors.sun);
      ring(c, 640, 120, 52, 5, colors.navy);
    }
  },
  {
    packageDir: "kelas3-matematika-b06-keliling-luas",
    file: "aktivitas-keliling-luas.png",
    alt: "Panel kiri: persegi panjang dengan panah mengelilingi keempat tepinya. Panel kanan: persegi panjang yang sama terbagi kotak-kotak satuan yang seluruhnya diwarnai.",
    draw(c) {
      strokeLine(c, 410, 80, 410, 520, 3, colors.muted);
      strokeRect(c, 90, 160, 260, 220, 8, colors.navy);
      strokeLine(c, 90, 120, 350, 120, 5, colors.teal);
      arrow(c, 300, 120, 350, 120, 5, colors.teal);
      strokeLine(c, 380, 160, 380, 380, 5, colors.teal);
      arrow(c, 380, 330, 380, 380, 5, colors.teal);
      strokeLine(c, 350, 412, 90, 412, 5, colors.teal);
      arrow(c, 140, 412, 90, 412, 5, colors.teal);
      strokeLine(c, 60, 380, 60, 160, 5, colors.teal);
      arrow(c, 60, 210, 60, 160, 5, colors.teal);
      for (let row = 0; row < 4; row += 1) {
        for (let column = 0; column < 5; column += 1) {
          fillRect(c, 460 + column * 52, 160 + row * 55, 52, 55, colors.tealLight);
        }
      }
      for (let i = 0; i <= 5; i += 1) strokeLine(c, 460 + i * 52, 160, 460 + i * 52, 380, 3, colors.navy);
      for (let i = 0; i <= 4; i += 1) strokeLine(c, 460, 160 + i * 55, 720, 160 + i * 55, 3, colors.navy);
      strokeRect(c, 460, 160, 260, 220, 7, colors.navy);
    }
  },
  {
    packageDir: "kelas3-matematika-b07-waktu-panjang-berat",
    file: "aktivitas-waktu-panjang-berat.png",
    alt: "Jam, penggaris panjang dengan seratus pembagian, dan timbangan dua lengan dengan beban satu kilogram.",
    draw(c) {
      clockFace(c, 170, 180, 100, 7, 30);
      ruler(c, 330, 130, 400, 70, 50);
      strokeLine(c, 60, 300, 740, 300, 3, colors.muted);
      balanceScale(c, 380, 520, 120);
      fillRect(c, 228, 372, 64, 48, colors.blueLight);
      strokeRect(c, 228, 372, 64, 48, 5, colors.navy);
      apple(c, 500, 392, 26);
    }
  },
  {
    packageDir: "kelas3-matematika-b08-penyajian-data",
    file: "aktivitas-penyajian-data.png",
    alt: "Diagram gambar berisi baris-baris titik, diagram batang dengan empat batang berbeda tinggi, dan tabel kosong dua baris.",
    draw(c) {
      pictograph(c, 70, 110, [4, 2, 6, 3], 6);
      barChart(c, 430, 120, 290, 280, [4, 2, 6, 3], { highlight: 2 });
      strokeLine(c, 60, 430, 740, 430, 3, colors.muted);
      tableGrid(c, 70, 460, 620, 110, 4, 2);
    }
  },
  {
    packageDir: "kelas4-matematika-b01-bilangan-cacah",
    file: "aktivitas-bilangan-cacah.png",
    alt: "Lima kolom nilai tempat berisi satu kubus puluh ribuan, dua kubus ribuan, tiga ratusan, empat puluhan, dan lima satuan.",
    draw(c) {
      tableGrid(c, 40, 90, 720, 440, 5, 1);
      cubeBlock(c, 66, 200, 84);
      cubeBlock(c, 208, 200, 62);
      cubeBlock(c, 208, 292, 62);
      flat(c, 352, 200, 68);
      flat(c, 352, 282, 68);
      flat(c, 352, 364, 68);
      for (let i = 0; i < 4; i += 1) rod(c, 496 + i * 26, 220, 180);
      for (let i = 0; i < 5; i += 1) unit(c, 640 + (i % 2) * 44, 240 + Math.floor(i / 2) * 56);
    }
  },
  {
    packageDir: "kelas4-matematika-b02-faktor-kelipatan",
    file: "aktivitas-faktor-kelipatan.png",
    alt: "Diagram Venn dua lingkaran: dua titik faktor khusus di kiri, empat faktor persekutuan di daerah irisan berwarna oranye, dan dua titik faktor khusus di kanan.",
    draw(c) {
      const r = 190;
      const gap = 150;
      const cx = 400;
      const cy = 300;
      fillCircle(c, cx - gap / 2, cy, r, colors.pale);
      fillCircle(c, cx + gap / 2, cy, r, colors.pale);
      const a = (Math.acos(gap / 2 / r) * 180) / Math.PI;
      const lens = [];
      for (let t = -a; t <= a; t += 2) {
        const rad = (t * Math.PI) / 180;
        lens.push([cx - gap / 2 + Math.cos(rad) * r, cy + Math.sin(rad) * r]);
      }
      for (let t = 180 - a; t <= 180 + a; t += 2) {
        const rad = (t * Math.PI) / 180;
        lens.push([cx + gap / 2 + Math.cos(rad) * r, cy + Math.sin(rad) * r]);
      }
      fillPolygon(c, lens, colors.orange);
      ring(c, cx - gap / 2, cy, r, 6, colors.navy);
      ring(c, cx + gap / 2, cy, r, 6, colors.navy);
      fillCircle(c, 260, 260, 16, colors.blue);
      fillCircle(c, 260, 340, 16, colors.blue);
      fillCircle(c, 330, 240, 16, colors.navy);
      fillCircle(c, 330, 360, 16, colors.navy);
      fillCircle(c, 470, 240, 16, colors.navy);
      fillCircle(c, 470, 360, 16, colors.navy);
      fillCircle(c, 540, 260, 16, colors.red);
      fillCircle(c, 540, 340, 16, colors.red);
    }
  },
  {
    packageDir: "kelas4-matematika-b03-pecahan",
    file: "aktivitas-pecahan-senilai.png",
    alt: "Tiga batang sama panjang: batang pertama terbagi dua dengan satu bagian diwarnai, batang kedua terbagi empat dengan dua bagian, batang ketiga terbagi delapan dengan empat bagian.",
    draw(c) {
      fractionBar(c, 80, 120, 640, 80, 2, 1);
      fractionBar(c, 80, 260, 640, 80, 4, 2, colors.blue);
      fractionBar(c, 80, 400, 640, 80, 8, 4, colors.green);
    }
  },
  {
    packageDir: "kelas4-matematika-b04-pengukuran",
    file: "aktivitas-pengukuran-panjang-berat.png",
    alt: "Penggaris dengan pensil, timbangan dapur dengan buah, dan tongkat meter dengan seratus pembagian.",
    draw(c) {
      ruler(c, 60, 160, 340, 60, 30);
      fillRect(c, 90, 120, 240, 24, colors.orange);
      strokeRect(c, 90, 120, 240, 24, 4, colors.navy);
      balanceScale(c, 580, 330, 90);
      apple(c, 520, 224, 18);
      strokeLine(c, 60, 400, 740, 400, 3, colors.muted);
      ruler(c, 60, 470, 680, 70, 100);
    }
  },
  {
    packageDir: "kelas4-matematika-b05-bangun-datar",
    file: "aktivitas-bangun-datar-kelas4.png",
    alt: "Persegi panjang berpetak kotak satuan dengan panah mengelilingi keempat sisinya.",
    draw(c) {
      for (let row = 0; row < 4; row += 1) {
        for (let column = 0; column < 6; column += 1) {
          fillRect(c, 100 + column * 100, 160 + row * 60, 100, 60, (row + column) % 2 === 0 ? colors.pale : colors.white);
        }
      }
      for (let i = 0; i <= 6; i += 1) strokeLine(c, 100 + i * 100, 160, 100 + i * 100, 400, 3, colors.navy);
      for (let i = 0; i <= 4; i += 1) strokeLine(c, 100, 160 + i * 60, 700, 160 + i * 60, 3, colors.navy);
      strokeRect(c, 100, 160, 600, 240, 7, colors.navy);
      strokeLine(c, 100, 130, 700, 130, 5, colors.teal);
      arrow(c, 640, 130, 700, 130, 5, colors.teal);
      strokeLine(c, 730, 160, 730, 400, 5, colors.teal);
      arrow(c, 730, 340, 730, 400, 5, colors.teal);
      strokeLine(c, 700, 430, 100, 430, 5, colors.teal);
      arrow(c, 160, 430, 100, 430, 5, colors.teal);
      strokeLine(c, 70, 400, 70, 160, 5, colors.teal);
      arrow(c, 70, 220, 70, 160, 5, colors.teal);
    }
  },
  {
    packageDir: "kelas4-matematika-b06-garis-sudut",
    file: "aktivitas-garis-sudut.png",
    alt: "Dua garis sejajar dipotong satu garis melintang di bagian atas; sudut siku-siku, sudut lancip, dan sudut tumpul berjajar di bawah.",
    draw(c) {
      strokeLine(c, 220, 150, 580, 150, 6, colors.navy);
      strokeLine(c, 220, 330, 580, 330, 6, colors.navy);
      strokeLine(c, 260, 100, 440, 380, 6, colors.teal);
      angleFigure(c, 150, 520, 90, colors.blue);
      angleFigure(c, 400, 520, 40, colors.teal);
      angleFigure(c, 650, 520, 135, colors.orange);
    }
  },
  {
    packageDir: "kelas4-matematika-b07-waktu-volume-data",
    file: "aktivitas-waktu-volume-data.png",
    alt: "Jam dinding, gelas ukur berisi air dengan tanda skala, diagram batang empat batang, dan tabel kosong tiga kolom.",
    draw(c) {
      clockFace(c, 130, 160, 90, 10, 15);
      glass(c, 380, 90, 330, 62, 0.6);
      barChart(c, 500, 120, 260, 240, [3, 7, 5, 4], { highlight: 1 });
      strokeLine(c, 60, 380, 740, 380, 3, colors.muted);
      tableGrid(c, 70, 410, 620, 120, 3, 2);
    }
  },
  {
    packageDir: "kelas4-matematika-b08-pemecahan-masalah",
    file: "aktivitas-pemecahan-masalah.png",
    alt: "Tiga buku bertumpuk, satu lembar uang kertas, dua koin, dan panah kembali menuju buku, menggambarkan pembelian dan kembalian.",
    draw(c) {
      note(c, 430, 110, 260, 90);
      arrow(c, 560, 212, 560, 252, 6, colors.navy);
      coin(c, 560, 300, 40, colors.sun);
      coin(c, 680, 300, 34, colors.pale);
      strokeLine(c, 60, 370, 740, 370, 3, colors.muted);
      books(c, 100, 420, 3);
      curveArrow(c, 640, 420, 330, 470, 40, 6, colors.teal);
      strokeLine(c, 60, 512, 740, 512, 3, colors.muted);
      flowStep(c, 150, 552, 34, 1);
      flowStep(c, 300, 552, 34, 2);
      flowStep(c, 450, 552, 34, 3);
    }
  },
  {
    packageDir: "kelas5-matematika-b01-bilangan-1000000",
    file: "aktivitas-bilangan-1000000.png",
    alt: "Enam kolom nilai tempat berisi empat kubus ratus ribuan, lima kubus puluh ribuan, dua ribuan, tiga ratusan, satu puluhan, dan enam satuan.",
    draw(c) {
      tableGrid(c, 30, 100, 740, 420, 6, 1);
      for (let i = 0; i < 4; i += 1) cubeBlock(c, 44, 160 + i * 84, 50);
      for (let i = 0; i < 5; i += 1) cubeBlock(c, 168, 140 + i * 70, 40);
      flat(c, 296, 220, 64);
      flat(c, 296, 310, 64);
      for (let i = 0; i < 3; i += 1) rod(c, 424 + i * 26, 220, 180);
      rod(c, 560, 260, 140, 26);
      for (let i = 0; i < 6; i += 1) unit(c, 668 + (i % 2) * 44, 220 + Math.floor(i / 2) * 56);
    }
  },
  {
    packageDir: "kelas5-matematika-b02-operasi-pecahan",
    file: "aktivitas-operasi-pecahan.png",
    alt: "Baris atas: seperempat ditambah dua perempat menjadi tiga perempat. Baris bawah: tiga perempat dikurangi seperempat menjadi dua perempat.",
    draw(c) {
      fractionBar(c, 70, 120, 140, 70, 4, 1);
      plusSign(c, 250, 155, 18, 7, colors.navy);
      fractionBar(c, 290, 120, 140, 70, 4, 2, colors.blue);
      equalsSign(c, 470, 155, 18, 7, colors.navy);
      fractionBar(c, 510, 120, 140, 70, 4, 3, colors.green);
      fractionBar(c, 70, 330, 140, 70, 4, 3);
      minusSign(c, 250, 365, 18, 7, colors.navy);
      fractionBar(c, 290, 330, 140, 70, 4, 1, colors.blue);
      equalsSign(c, 470, 365, 18, 7, colors.navy);
      fractionBar(c, 510, 330, 140, 70, 4, 2, colors.green);
      strokeLine(c, 60, 250, 740, 250, 3, colors.muted);
    }
  },
  {
    packageDir: "kelas5-matematika-b03-faktor-kelipatan",
    file: "aktivitas-faktor-kelipatan-kpk.png",
    alt: "Dua garis bilangan: kelipatan empat dan kelipatan enam. Kelipatan persekutuan ditandai batang oranye, dan dua lingkaran beriris menunjukkan kelipatan bersama.",
    draw(c) {
      numberLine(c, 80, 170, 640, 24);
      for (let i = 4; i <= 24; i += 4) fillCircle(c, 80 + (640 * i) / 24, 170, 7, colors.teal);
      numberLine(c, 80, 350, 640, 24);
      for (let i = 6; i <= 24; i += 6) fillCircle(c, 80 + (640 * i) / 24, 350, 7, colors.blue);
      for (const multiple of [12, 24]) {
        const x = 80 + (640 * multiple) / 24;
        strokeRect(c, x - 10, 146, 20, 228, 4, colors.orange);
      }
      ringAround(c, 280, 480, 48, 4, colors.teal);
      ringAround(c, 340, 480, 48, 4, colors.blue);
      fillCircle(c, 310, 480, 9, colors.orange);
    }
  },
  {
    packageDir: "kelas5-matematika-b04-pengukuran-sudut",
    file: "aktivitas-pengukuran-sudut.png",
    alt: "Busur derajat setengah lingkaran dengan garis skala, dan tiga sudut: siku-siku, lancip, dan tumpul.",
    draw(c) {
      ringSegment(c, 400, 300, 150, 8, 180, 360, colors.navy);
      strokeLine(c, 250, 300, 550, 300, 5, colors.navy);
      for (let i = 0; i <= 18; i += 1) {
        const angle = (180 + i * 10) * (Math.PI / 180);
        strokeLine(
          c,
          400 + Math.cos(angle) * 150,
          300 + Math.sin(angle) * 150,
          400 + Math.cos(angle) * (i % 3 === 0 ? 120 : 136),
          300 + Math.sin(angle) * (i % 3 === 0 ? 120 : 136),
          i % 3 === 0 ? 4 : 2,
          colors.navy
        );
      }
      fillCircle(c, 400, 300, 7, colors.navy);
      angleFigure(c, 130, 560, 90, colors.blue);
      angleFigure(c, 380, 560, 35, colors.teal);
      angleFigure(c, 620, 560, 130, colors.orange);
    }
  },
  {
    packageDir: "kelas5-matematika-b05-bangun-ruang",
    file: "aktivitas-bangun-ruang.png",
    alt: "Kubus, tabung, dan kerucut digambar tiga dimensi.",
    draw(c) {
      cube3d(c, 100, 220, 200, 46);
      cylinder3d(c, 462, 170, 420, 78);
      fillPolygon(c, [[620, 420], [700, 140], [780, 420]], colors.tealLight);
      ellipseOutline(c, 700, 420, 80, 24, 5, colors.navy);
      strokeLine(c, 700, 140, 620, 420, 5, colors.navy);
      strokeLine(c, 700, 140, 780, 420, 5, colors.navy);
    }
  },
  {
    packageDir: "kelas5-matematika-b06-volume-luas-permukaan",
    file: "aktivitas-volume-luas-permukaan.png",
    alt: "Kubus tiga dimensi dengan petak tiga kali dua di sisi depan, dan jaring-jaring enam persegi tersusun seperti huruf T.",
    draw(c) {
      cube3d(c, 80, 220, 220, 50);
      for (let i = 1; i < 3; i += 1) strokeLine(c, 80 + (220 * i) / 3, 220, 80 + (220 * i) / 3, 440, 3, colors.navy);
      for (let i = 1; i < 2; i += 1) strokeLine(c, 80, 220 + (220 * i) / 2, 300, 220 + (220 * i) / 2, 3, colors.navy);
      const cell = 70;
      const layout = [
        [470, 120],
        [540, 120],
        [610, 120],
        [540, 190],
        [540, 260],
        [540, 330]
      ];
      for (const [x, y] of layout) {
        fillRect(c, x, y, cell, cell, colors.tealLight);
        strokeRect(c, x, y, cell, cell, 4, colors.navy);
      }
    }
  },
  {
    packageDir: "kelas5-matematika-b07-data",
    file: "aktivitas-data-kelas5.png",
    alt: "Diagram batang lima batang dengan garis rata-rata mendatar putus-putus di atasnya.",
    draw(c) {
      barChart(c, 90, 90, 620, 400, [4, 6, 8, 5, 7], { highlight: 2, mean: 6 });
    }
  },
  {
    packageDir: "kelas5-matematika-b08-pemecahan-masalah",
    file: "aktivitas-pemecahan-masalah-kelas5.png",
    alt: "Empat langkah penyelesaian soal berjajar: lingkaran bertitik satu, dua, tiga, dan empat, dihubungkan panah.",
    draw(c) {
      flowStep(c, 130, 240, 62, 1);
      flowStep(c, 330, 240, 62, 2);
      flowStep(c, 530, 240, 62, 3);
      flowStep(c, 700, 240, 62, 4);
      arrow(c, 200, 240, 260, 240, 6, colors.navy);
      arrow(c, 400, 240, 460, 240, 6, colors.navy);
      arrow(c, 600, 240, 632, 240, 6, colors.navy);
      strokeLine(c, 60, 360, 740, 360, 3, colors.muted);
      books(c, 120, 500, 3);
      note(c, 440, 420, 260, 84);
    }
  },
  {
    packageDir: "kelas6-matematika-b01-bilangan-bulat",
    file: "aktivitas-bilangan-bulat.png",
    alt: "Garis bilangan dengan titik nol di tengah, bagian kiri bertanda negatif, panah melengkung tiga langkah ke kanan, dan dua penanda untuk membandingkan posisi.",
    draw(c) {
      numberLine(c, 80, 300, 640, 14);
      fillCircle(c, 400 - (640 * 3) / 14, 300, 11, colors.red);
      fillCircle(c, 400 + (640 * 1) / 14, 300, 11, colors.teal);
      curveArrow(c, 400 - (640 * 5) / 14, 280, 400 - (640 * 2) / 14, 280, 60, 6, colors.blue);
      strokeLine(c, 60, 420, 740, 420, 3, colors.muted);
      strokeLine(c, 100, 500, 700, 500, 4, colors.muted);
      fillCircle(c, 240, 500, 26, colors.redLight);
      ring(c, 240, 500, 26, 4, colors.navy);
      fillCircle(c, 560, 500, 26, colors.greenLight);
      ring(c, 560, 500, 26, 4, colors.navy);
      chevron(c, 400, 500, 22, -1, colors.navy, 9);
    }
  },
  {
    packageDir: "kelas6-matematika-b02-pecahan-desimal",
    file: "aktivitas-pecahan-desimal.png",
    alt: "Batang terbagi sepuluh dengan lima bagian diwarnai, batang terbagi empat dengan satu bagian diwarnai, dan kotak seratus dengan dua puluh lima kotak diwarnai.",
    draw(c) {
      fractionBar(c, 80, 120, 640, 70, 10, 5);
      fractionBar(c, 80, 250, 640, 70, 4, 1, colors.blue);
      for (let row = 0; row < 10; row += 1) {
        for (let column = 0; column < 10; column += 1) {
          const filled = row < 5 && column < 5;
          fillRect(c, 240 + column * 32, 370 + row * 20, 32, 20, filled ? colors.green : colors.pale);
        }
      }
      strokeRect(c, 240, 370, 320, 200, 4, colors.navy);
      for (let i = 1; i < 10; i += 1) {
        strokeLine(c, 240 + i * 32, 370, 240 + i * 32, 570, 1, colors.navy);
        strokeLine(c, 240, 370 + i * 20, 560, 370 + i * 20, 1, colors.navy);
      }
    }
  },
  {
    packageDir: "kelas6-matematika-b03-rasio-proporsi",
    file: "aktivitas-rasio-proporsi.png",
    alt: "Empat titik merah dan tiga titik biru, sepasang batang delapan banding enam, lalu panah ke bawah menuju sepasang batang empat banding tiga.",
    draw(c) {
      dotRow(c, 120, 120, 4, 70, 24, colors.red);
      dotRow(c, 400, 120, 3, 70, 24, colors.blue);
      strokeLine(c, 60, 210, 740, 210, 3, colors.muted);
      fillRect(c, 100, 250, 400, 52, colors.redLight);
      strokeRect(c, 100, 250, 400, 52, 4, colors.navy);
      fillRect(c, 100, 322, 300, 52, colors.blueLight);
      strokeRect(c, 100, 322, 300, 52, 4, colors.navy);
      arrow(c, 400, 394, 400, 432, 6, colors.navy);
      fillRect(c, 100, 452, 200, 46, colors.redLight);
      strokeRect(c, 100, 452, 200, 46, 4, colors.navy);
      fillRect(c, 100, 514, 150, 46, colors.blueLight);
      strokeRect(c, 100, 514, 150, 46, 4, colors.navy);
    }
  },
  {
    packageDir: "kelas6-matematika-b04-lingkaran",
    file: "aktivitas-lingkaran.png",
    alt: "Lingkaran dengan titik pusat, satu garis jari-jari berwarna teal dari pusat ke tepi, dan satu garis diameter berwarna biru menembus pusat.",
    draw(c) {
      fillCircle(c, 400, 300, 200, colors.pale);
      ring(c, 400, 300, 200, 7, colors.navy);
      strokeLine(c, 400, 300, 400 + 200 * Math.cos(-Math.PI / 6), 300 + 200 * Math.sin(-Math.PI / 6), 6, colors.teal);
      strokeLine(c, 400 - 200 * Math.cos(Math.PI / 7), 300 - 200 * Math.sin(Math.PI / 7), 400 + 200 * Math.cos(Math.PI / 7), 300 + 200 * Math.sin(Math.PI / 7), 6, colors.blue);
      fillCircle(c, 400, 300, 12, colors.navy);
    }
  },
  {
    packageDir: "kelas6-matematika-b05-bangun-ruang",
    file: "aktivitas-bangun-ruang-kelas6.png",
    alt: "Prisma segitiga, limas, dan tabung digambar tiga dimensi.",
    draw(c) {
      prism3d(c, 70, 260);
      pyramid3d(c, 470, 140, 400, 110);
      cylinder3d(c, 690, 170, 400, 62);
    }
  },
  {
    packageDir: "kelas6-matematika-b06-statistika",
    file: "aktivitas-statistika.png",
    alt: "Tiga tiang titik bertingkat tujuh, delapan, dan sembilan titik, dengan garis mendatar putus-putus pada tiang tengah sebagai penanda nilai tengah.",
    draw(c) {
      const columns = [7, 8, 9];
      columns.forEach((count, index) => {
        const cx = 220 + index * 180;
        for (let i = 0; i < count; i += 1) {
          fillCircle(c, cx, 500 - i * 44, 16, index === 1 ? colors.teal : colors.blue);
        }
      });
      dashedLine(c, 100, 500 - 7 * 44, 700, 500 - 7 * 44, 5, colors.orange);
      strokeLine(c, 60, 530, 740, 530, 5, colors.navy);
    }
  },
  {
    packageDir: "kelas6-matematika-b07-peluang",
    file: "aktivitas-peluang.png",
    alt: "Dadu dengan tiga mata dadu, dua sisi koin, dan enam titik hasil yang mungkin.",
    draw(c) {
      fillRect(c, 100, 150, 220, 220, colors.white);
      strokeRect(c, 100, 150, 220, 220, 7, colors.navy);
      for (const [dx, dy] of [
        [150, 200],
        [210, 260],
        [270, 320]
      ]) {
        fillCircle(c, dx, dy, 20, colors.navy);
      }
      coin(c, 500, 230, 90, colors.sun);
      star(c, 500, 230, 40, colors.navy);
      coin(c, 660, 230, 70, colors.pale);
      ring(c, 660, 230, 34, 4, colors.navy);
      strokeLine(c, 60, 420, 740, 420, 3, colors.muted);
      for (let i = 0; i < 6; i += 1) fillCircle(c, 160 + i * 96, 500, 24, i % 2 === 0 ? colors.teal : colors.blue);
    }
  },
  {
    packageDir: "kelas6-matematika-b08-pemecahan-masalah",
    file: "aktivitas-pemecahan-masalah-kelas6.png",
    alt: "Empat langkah penyelesaian berjajar dengan panah maju, satu panah kembali ke langkah pertama, dan tanda centang di langkah terakhir.",
    draw(c) {
      flowStep(c, 120, 220, 58, 1);
      flowStep(c, 300, 220, 58, 2);
      flowStep(c, 480, 220, 58, 3);
      flowStep(c, 640, 220, 58, 4);
      arrow(c, 184, 220, 238, 220, 6, colors.navy);
      arrow(c, 364, 220, 418, 220, 6, colors.navy);
      arrow(c, 544, 220, 578, 220, 6, colors.navy);
      curveArrow(c, 640, 290, 120, 290, 90, 5, colors.teal);
      checkMark(c, 620, 340, 44, 8, colors.green);
      strokeLine(c, 60, 420, 740, 420, 3, colors.muted);
      strokeRect(c, 120, 460, 560, 90, 4, colors.navy);
      dashedLine(c, 140, 505, 300, 505, 4, colors.muted, 10, 8);
      dashedLine(c, 320, 505, 480, 505, 4, colors.muted, 10, 8);
      dashedLine(c, 500, 505, 660, 505, 4, colors.muted, 10, 8);
    }
  }
];

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function renderEntry(entry) {
  const canvas = createCanvas();
  entry.draw(canvas);
  return toPng(canvas);
}

function main() {
  const entries = PLAN.filter(
    (entry) => !FILTER || entry.packageDir.includes(FILTER)
  );
  let totalBytes = 0;
  const rows = [];

  for (const entry of entries) {
    const png = renderEntry(entry);
    totalBytes += png.length;
    rows.push({ entry, png, size: png.length });

    if (APPLY) {
      const assetsDir = path.join("content", "packages", entry.packageDir, "assets");
      mkdirSync(assetsDir, { recursive: true });
      writeFileSync(path.join(assetsDir, entry.file), png);
    } else {
      const previewDir = path.join(PREVIEW_ROOT, entry.packageDir);
      mkdirSync(previewDir, { recursive: true });
      writeFileSync(path.join(previewDir, entry.file), png);
    }
  }

  for (const row of rows) {
    console.log(
      `${APPLY ? "wrote" : "preview"} ${row.entry.packageDir}/${row.entry.file} · ${(row.size / 1024).toFixed(1)} KB`
    );
  }
  console.log(
    `\n${rows.length} ilustrasi · ${(totalBytes / 1024).toFixed(0)} KB total · ${
      APPLY ? "ditulis ke paket" : `pratinjau di ${PREVIEW_ROOT}/`
    }`
  );

  if (APPLY) {
    console.log("lanjut: npm run content:assets:wire -- --apply");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
