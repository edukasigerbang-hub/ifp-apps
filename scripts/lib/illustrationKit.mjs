import { deflateSync } from "node:zlib";

// Rasterizer kecil tanpa dependensi. Digambar pada 2x lalu diturunkan ke ukuran
// akhir supaya tepi bentuk halus, seperti ilustrasi vektor pada paket pilot.
export const WIDTH = 800;
export const HEIGHT = 600;
const SS = 2;

export const colors = {
  white: [255, 255, 255, 255],
  navy: [23, 42, 74, 255],
  teal: [13, 138, 132, 255],
  tealLight: [153, 232, 224, 255],
  pale: [233, 238, 248, 255],
  sky: [224, 242, 254, 255],
  sun: [250, 204, 21, 255],
  orange: [245, 158, 11, 255],
  orangeLight: [253, 230, 138, 255],
  red: [220, 38, 38, 255],
  redLight: [254, 202, 202, 255],
  blue: [37, 99, 235, 255],
  blueLight: [191, 219, 254, 255],
  green: [22, 163, 74, 255],
  greenLight: [187, 247, 208, 255],
  gray: [148, 163, 184, 255],
  muted: [203, 213, 225, 255]
};

function put(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  const i = (y * canvas.width + x) * 4;
  canvas.pixels[i] = color[0];
  canvas.pixels[i + 1] = color[1];
  canvas.pixels[i + 2] = color[2];
  canvas.pixels[i + 3] = color[3];
}

export function createCanvas() {
  const width = WIDTH * SS;
  const height = HEIGHT * SS;
  const canvas = { width, height, pixels: new Uint8Array(width * height * 4) };
  fillRect(canvas, 0, 0, WIDTH, HEIGHT, colors.white);
  return canvas;
}

export function fillRect(canvas, x, y, width, height, color) {
  const x0 = Math.round(x * SS);
  const y0 = Math.round(y * SS);
  const x1 = Math.round((x + width) * SS);
  const y1 = Math.round((y + height) * SS);
  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) put(canvas, px, py, color);
  }
}

export function fillCircle(canvas, cx, cy, r, color) {
  const cxp = cx * SS;
  const cyp = cy * SS;
  const rp = r * SS;
  for (let y = Math.floor(cyp - rp); y <= Math.ceil(cyp + rp); y += 1) {
    for (let x = Math.floor(cxp - rp); x <= Math.ceil(cxp + rp); x += 1) {
      const dx = x + 0.5 - cxp;
      const dy = y + 0.5 - cyp;
      if (dx * dx + dy * dy <= rp * rp) put(canvas, x, y, color);
    }
  }
}

export function fillEllipse(canvas, cx, cy, rx, ry, color) {
  const cxp = cx * SS;
  const cyp = cy * SS;
  const rxp = rx * SS;
  const ryp = ry * SS;
  for (let y = Math.floor(cyp - ryp); y <= Math.ceil(cyp + ryp); y += 1) {
    for (let x = Math.floor(cxp - rxp); x <= Math.ceil(cxp + rxp); x += 1) {
      const dx = (x + 0.5 - cxp) / rxp;
      const dy = (y + 0.5 - cyp) / ryp;
      if (dx * dx + dy * dy <= 1) put(canvas, x, y, color);
    }
  }
}

export function ring(canvas, cx, cy, r, thickness, color) {
  const cxp = cx * SS;
  const cyp = cy * SS;
  const inner = Math.max(0, r - thickness / 2) * SS;
  const outer = (r + thickness / 2) * SS;
  const rp = (r + thickness) * SS;
  for (let y = Math.floor(cyp - rp); y <= Math.ceil(cyp + rp); y += 1) {
    for (let x = Math.floor(cxp - rp); x <= Math.ceil(cxp + rp); x += 1) {
      const dx = x + 0.5 - cxp;
      const dy = y + 0.5 - cyp;
      const d2 = dx * dx + dy * dy;
      if (d2 >= inner * inner && d2 <= outer * outer) put(canvas, x, y, color);
    }
  }
}

export function ringSegment(canvas, cx, cy, r, thickness, fromDeg, toDeg, color) {
  const cxp = cx * SS;
  const cyp = cy * SS;
  const inner = Math.max(0, r - thickness / 2) * SS;
  const outer = (r + thickness / 2) * SS;
  const rp = (r + thickness) * SS;
  const from = normalizeDeg(fromDeg);
  const rawSpan = toDeg - fromDeg;
  const span = rawSpan < 0 ? rawSpan + 360 : rawSpan;
  for (let y = Math.floor(cyp - rp); y <= Math.ceil(cyp + rp); y += 1) {
    for (let x = Math.floor(cxp - rp); x <= Math.ceil(cxp + rp); x += 1) {
      const dx = x + 0.5 - cxp;
      const dy = y + 0.5 - cyp;
      const d2 = dx * dx + dy * dy;
      if (d2 < inner * inner || d2 > outer * outer) continue;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const delta = normalizeDeg(angle - from);
      if (delta <= span) put(canvas, x, y, color);
    }
  }
}

function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

export function strokeLine(canvas, x1, y1, x2, y2, width, color) {
  const ax = x1 * SS;
  const ay = y1 * SS;
  const bx = x2 * SS;
  const by = y2 * SS;
  const half = Math.max(0.5, (width * SS) / 2);
  const minX = Math.floor(Math.min(ax, bx) - half);
  const maxX = Math.ceil(Math.max(ax, bx) + half);
  const minY = Math.floor(Math.min(ay, by) - half);
  const maxY = Math.ceil(Math.max(ay, by) + half);
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      let t = lengthSquared === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lengthSquared;
      t = Math.max(0, Math.min(1, t));
      const ex = ax + dx * t - px;
      const ey = ay + dy * t - py;
      if (ex * ex + ey * ey <= half * half) put(canvas, x, y, color);
    }
  }
}

export function fillPolygon(canvas, points, color) {
  const scaled = points.map(([x, y]) => [x * SS, y * SS]);
  const minY = Math.floor(Math.min(...scaled.map(([, y]) => y)));
  const maxY = Math.ceil(Math.max(...scaled.map(([, y]) => y)));
  for (let y = minY; y < maxY; y += 1) {
    const scan = y + 0.5;
    const crossings = [];
    for (let i = 0; i < scaled.length; i += 1) {
      const [x1, y1] = scaled[i];
      const [x2, y2] = scaled[(i + 1) % scaled.length];
      if (y1 === y2) continue;
      if ((scan >= y1 && scan < y2) || (scan >= y2 && scan < y1)) {
        crossings.push(x1 + ((scan - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    crossings.sort((left, right) => left - right);
    for (let i = 0; i + 1 < crossings.length; i += 2) {
      const from = Math.round(crossings[i]);
      const to = Math.round(crossings[i + 1]);
      for (let x = from; x < to; x += 1) put(canvas, x, y, color);
    }
  }
}

export function strokeRect(canvas, x, y, width, height, thickness, color) {
  strokeLine(canvas, x, y, x + width, y, thickness, color);
  strokeLine(canvas, x + width, y, x + width, y + height, thickness, color);
  strokeLine(canvas, x + width, y + height, x, y + height, thickness, color);
  strokeLine(canvas, x, y + height, x, y, thickness, color);
}

export function fillRoundRect(canvas, x, y, width, height, radius, color) {
  fillRect(canvas, x + radius, y, width - radius * 2, height, color);
  fillRect(canvas, x, y + radius, width, height - radius * 2, color);
  fillCircle(canvas, x + radius, y + radius, radius, color);
  fillCircle(canvas, x + width - radius, y + radius, radius, color);
  fillCircle(canvas, x + radius, y + height - radius, radius, color);
  fillCircle(canvas, x + width - radius, y + height - radius, radius, color);
}

export function strokeRoundRect(canvas, x, y, width, height, radius, thickness, color) {
  strokeLine(canvas, x + radius, y, x + width - radius, y, thickness, color);
  strokeLine(canvas, x + radius, y + height, x + width - radius, y + height, thickness, color);
  strokeLine(canvas, x, y + radius, x, y + height - radius, thickness, color);
  strokeLine(canvas, x + width, y + radius, x + width, y + height - radius, thickness, color);
  ringSegment(canvas, x + radius, y + radius, radius, thickness, 180, 270, color);
  ringSegment(canvas, x + width - radius, y + radius, radius, thickness, 270, 360, color);
  ringSegment(canvas, x + width - radius, y + height - radius, radius, thickness, 0, 90, color);
  ringSegment(canvas, x + radius, y + height - radius, radius, thickness, 90, 180, color);
}

export function dashedLine(canvas, x1, y1, x2, y2, width, color, dash = 14, gap = 10) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  if (length === 0) return;
  const ux = (x2 - x1) / length;
  const uy = (y2 - y1) / length;
  let position = 0;
  while (position < length) {
    const end = Math.min(position + dash, length);
    strokeLine(
      canvas,
      x1 + ux * position,
      y1 + uy * position,
      x1 + ux * end,
      y1 + uy * end,
      width,
      color
    );
    position = end + gap;
  }
}

export function arrow(canvas, x1, y1, x2, y2, width, color, head = 14) {
  strokeLine(canvas, x1, y1, x2, y2, width, color);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const left = [x2 - Math.cos(angle - 0.45) * head, y2 - Math.sin(angle - 0.45) * head];
  const right = [x2 - Math.cos(angle + 0.45) * head, y2 - Math.sin(angle + 0.45) * head];
  fillPolygon(canvas, [[x2, y2], left, right], color);
}

export function triangle(canvas, cx, cy, size, rotationDeg, fill, stroke = 5) {
  const points = [0, 120, 240].map((offset) => {
    const angle = ((rotationDeg + offset - 90) * Math.PI) / 180;
    return [cx + Math.cos(angle) * size, cy + Math.sin(angle) * size];
  });
  fillPolygon(canvas, points, fill);
  for (let i = 0; i < 3; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % 3];
    strokeLine(canvas, x1, y1, x2, y2, stroke, colors.navy);
  }
}

export function star(canvas, cx, cy, outer, fill, stroke = 0) {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : outer * 0.45;
    const angle = ((i * 36 - 90) * Math.PI) / 180;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  fillPolygon(canvas, points, fill);
  if (stroke > 0) {
    for (let i = 0; i < 10; i += 1) {
      strokeLine(canvas, points[i][0], points[i][1], points[(i + 1) % 10][0], points[(i + 1) % 10][1], stroke, colors.navy);
    }
  }
}

export function checkMark(canvas, x, y, size, width, color) {
  strokeLine(canvas, x, y + size * 0.55, x + size * 0.35, y + size, width, color);
  strokeLine(canvas, x + size * 0.35, y + size, x + size, y, width, color);
}

export function plusSign(canvas, cx, cy, size, width, color) {
  strokeLine(canvas, cx - size, cy, cx + size, cy, width, color);
  strokeLine(canvas, cx, cy - size, cx, cy + size, width, color);
}

export function minusSign(canvas, cx, cy, size, width, color) {
  strokeLine(canvas, cx - size, cy, cx + size, cy, width, color);
}

export function equalsSign(canvas, cx, cy, size, width, color) {
  strokeLine(canvas, cx - size, cy - size * 0.45, cx + size, cy - size * 0.45, width, color);
  strokeLine(canvas, cx - size, cy + size * 0.45, cx + size, cy + size * 0.45, width, color);
}

// Banyak scene menggambar objek kecil di tengah kanvas 800×600 sehingga di player
// ilustrasi tampak mungil. Fungsi ini memotong ruang kosong di sekitar isi lalu
// memperbesarnya kembali ke kanvas yang sama tanpa mengubah ukuran/rasio berkas.
export function normalizeContent(canvas, { margin = 20, minGain = 1.25, maxGain = 1.9 } = {}) {
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const i = (y * canvas.width + x) * 4;
      if (canvas.pixels[i] < 250 || canvas.pixels[i + 1] < 250 || canvas.pixels[i + 2] < 250) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return canvas;

  const marginPx = margin * SS;
  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;
  const fit = Math.min(
    (canvas.width - marginPx * 2) / contentWidth,
    (canvas.height - marginPx * 2) / contentHeight
  );
  if (!Number.isFinite(fit) || fit <= minGain) return canvas;
  const scale = Math.min(fit, maxGain);

  const out = { width: canvas.width, height: canvas.height, pixels: new Uint8Array(canvas.width * canvas.height * 4) };
  for (let i = 0; i < out.pixels.length; i += 4) {
    out.pixels[i] = 255;
    out.pixels[i + 1] = 255;
    out.pixels[i + 2] = 255;
    out.pixels[i + 3] = 255;
  }

  const destWidth = contentWidth * scale;
  const destHeight = contentHeight * scale;
  const offsetX = (canvas.width - destWidth) / 2;
  const offsetY = (canvas.height - destHeight) / 2;
  for (let dy = 0; dy < Math.floor(destHeight); dy += 1) {
    for (let dx = 0; dx < Math.floor(destWidth); dx += 1) {
      const sx = minX + (dx + 0.5) / scale - 0.5;
      const sy = minY + (dy + 0.5) / scale - 0.5;
      const x0 = Math.max(minX, Math.floor(sx));
      const y0 = Math.max(minY, Math.floor(sy));
      const x1 = Math.min(maxX, x0 + 1);
      const y1 = Math.min(maxY, y0 + 1);
      const fx = Math.min(1, Math.max(0, sx - x0));
      const fy = Math.min(1, Math.max(0, sy - y0));
      const at = (px, py, channel) => canvas.pixels[(py * canvas.width + px) * 4 + channel];
      const target = ((Math.round(dy + offsetY) * out.width) + Math.round(dx + offsetX)) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        const top = at(x0, y0, channel) * (1 - fx) + at(x1, y0, channel) * fx;
        const bottom = at(x0, y1, channel) * (1 - fx) + at(x1, y1, channel) * fx;
        out.pixels[target + channel] = Math.round(top * (1 - fy) + bottom * fy);
      }
    }
  }
  return out;
}

export function toPng(canvas) {
  const rowLength = WIDTH * 4 + 1;
  const raw = Buffer.alloc(rowLength * HEIGHT);
  const samples = SS * SS;
  for (let y = 0; y < HEIGHT; y += 1) {
    raw[y * rowLength] = 0;
    for (let x = 0; x < WIDTH; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const index = ((y * SS + sy) * canvas.width + (x * SS + sx)) * 4;
          r += canvas.pixels[index];
          g += canvas.pixels[index + 1];
          b += canvas.pixels[index + 2];
          a += canvas.pixels[index + 3];
        }
      }
      const offset = y * rowLength + 1 + x * 4;
      raw[offset] = Math.round(r / samples);
      raw[offset + 1] = Math.round(g / samples);
      raw[offset + 2] = Math.round(b / samples);
      raw[offset + 3] = Math.round(a / samples);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(WIDTH, 0);
  ihdr.writeUInt32BE(HEIGHT, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
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
