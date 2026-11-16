import {
  colors,
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
  strokeRoundRect,
  triangle,
  arrow,
  checkMark,
  dashedLine,
  equalsSign,
  minusSign,
  plusSign
} from "./illustrationKit.mjs";

export function ellipseOutline(c, cx, cy, rx, ry, width, color) {
  const steps = 96;
  let previous = null;
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    const point = [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
    if (previous) strokeLine(c, previous[0], previous[1], point[0], point[1], width, color);
    previous = point;
  }
}

export function sector(c, cx, cy, r, fromDeg, toDeg, color) {
  const points = [[cx, cy]];
  const steps = 64;
  for (let i = 0; i <= steps; i += 1) {
    const angle = ((fromDeg + ((toDeg - fromDeg) * i) / steps) * Math.PI) / 180;
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  fillPolygon(c, points, color);
}

export function pie(c, cx, cy, r, parts, filled, fill = colors.teal) {
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

export function fractionBar(c, x, y, width, height, parts, filled, fill = colors.teal) {
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

export function tenFrame(c, x, y, filled, color = colors.teal, cell = 58, gap = 10) {
  for (let i = 0; i < 10; i += 1) {
    const cx = x + (i % 5) * (cell + gap);
    const cy = y + Math.floor(i / 5) * (cell + gap);
    fillRect(c, cx, cy, cell, cell, colors.white);
    strokeRect(c, cx, cy, cell, cell, 4, colors.navy);
    if (i < filled) fillCircle(c, cx + cell / 2, cy + cell / 2, cell * 0.3, color);
  }
}

export function dotRow(c, x, cy, count, gap, radius, color) {
  for (let i = 0; i < count; i += 1) fillCircle(c, x + i * gap, cy, radius, color);
}

export function dotArray(c, x, y, columns, rows, gap, radius, color) {
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      fillCircle(c, x + column * gap + radius, y + row * gap + radius, radius, color);
    }
  }
}

export function ringAround(c, cx, cy, radius, thickness, color) {
  ring(c, cx, cy, radius, thickness, color);
}

export function rod(c, x, y, height, width = 18) {
  fillRect(c, x, y, width, height, colors.tealLight);
  strokeRect(c, x, y, width, height, 4, colors.navy);
  for (let offset = 10; offset < height; offset += 10) {
    strokeLine(c, x + 2, y + offset, x + width - 2, y + offset, 1, colors.teal);
  }
}

export function unit(c, x, y, size = 18) {
  fillRect(c, x, y, size, size, colors.tealLight);
  strokeRect(c, x, y, size, size, 4, colors.navy);
}

export function flat(c, x, y, size = 90) {
  fillRect(c, x, y, size, size, colors.tealLight);
  strokeRect(c, x, y, size, size, 4, colors.navy);
  for (let i = 10; i < size; i += 10) {
    strokeLine(c, x + 2, y + i, x + size - 2, y + i, 1, colors.teal);
    strokeLine(c, x + i, y + 2, x + i, y + size - 2, 1, colors.teal);
  }
}

export function cubeBlock(c, x, y, size = 90) {
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

export function ruler(c, x, y, width, height, divisions) {
  fillRect(c, x, y, width, height, colors.pale);
  strokeRect(c, x, y, width, height, 4, colors.navy);
  for (let i = 0; i <= divisions; i += 1) {
    const tx = x + (width * i) / divisions;
    const length = i % 10 === 0 ? height * 0.6 : i % 5 === 0 ? height * 0.42 : height * 0.26;
    strokeLine(c, tx, y, tx, y + length, i % 10 === 0 ? 4 : 2, colors.navy);
  }
}

export function balanceScale(c, cx, baseY, span) {
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

export function clockFace(c, cx, cy, r, hour, minute) {
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

export function barChart(c, x, y, width, height, values, options = {}) {
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

export function curveArrow(c, x1, y1, x2, y2, lift, width, color) {
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

export function flowStep(c, cx, cy, radius, dots, active = false) {
  fillCircle(c, cx, cy, radius, active ? colors.orangeLight : colors.pale);
  ring(c, cx, cy, radius, active ? 8 : 5, active ? colors.orange : colors.navy);
  const gap = 16;
  const start = cx - ((dots - 1) * gap) / 2;
  for (let i = 0; i < dots; i += 1) fillCircle(c, start + i * gap, cy, 6, active ? colors.orange : colors.teal);
}

export function coin(c, cx, cy, r, tone) {
  fillCircle(c, cx, cy, r, tone);
  ring(c, cx, cy, r, 5, colors.navy);
  ring(c, cx, cy, r * 0.66, 3, colors.navy);
}

export function note(c, x, y, width, height) {
  fillRoundRect(c, x, y, width, height, 10, colors.tealLight);
  strokeRect(c, x, y, width, height, 4, colors.navy);
  ring(c, x + width / 2, y + height / 2, Math.min(width, height) * 0.26, 4, colors.navy);
}

export function ellipseShape(c, cx, cy, rx, ry) {
  fillEllipse(c, cx, cy, rx, ry, colors.tealLight);
  ellipseOutline(c, cx, cy, rx, ry, 5, colors.navy);
}

export function cube3d(c, x, y, size, depth = 26) {
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

export function cylinder3d(c, cx, topY, bottomY, rx) {
  const ry = rx * 0.3;
  fillRect(c, cx - rx, topY, rx * 2, bottomY - topY, colors.tealLight);
  fillEllipse(c, cx, bottomY, rx, ry, colors.tealLight);
  fillEllipse(c, cx, topY, rx, ry, colors.sky);
  strokeLine(c, cx - rx, topY, cx - rx, bottomY, 5, colors.navy);
  strokeLine(c, cx + rx, topY, cx + rx, bottomY, 5, colors.navy);
  ellipseOutline(c, cx, topY, rx, ry, 5, colors.navy);
  ellipseOutline(c, cx, bottomY, rx, ry, 5, colors.navy);
}

export function pyramid3d(c, cx, apexY, baseY, halfWidth) {
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

export function prism3d(c, x, y) {
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

export function cone3d(c, cx, baseY, radius, height) {
  const topY = baseY - height;
  fillPolygon(c, [[cx, topY], [cx + radius, baseY], [cx - radius, baseY]], colors.tealLight);
  fillEllipse(c, cx, baseY, radius, radius * 0.3, colors.pale);
  strokeLine(c, cx, topY, cx - radius, baseY, 5, colors.navy);
  strokeLine(c, cx, topY, cx + radius, baseY, 5, colors.navy);
  ellipseOutline(c, cx, baseY, radius, radius * 0.3, 5, colors.navy);
}

export function angleFigure(c, cx, cy, degrees, color = colors.teal, arm = 82) {
  strokeLine(c, cx - arm, cy, cx + arm, cy, 6, colors.navy);
  const rad = (-degrees * Math.PI) / 180;
  const rayLength = arm * 1.35;
  strokeLine(c, cx, cy, cx + Math.cos(rad) * rayLength, cy + Math.sin(rad) * rayLength, 6, color);
  ringSegment(c, cx, cy, 36, 4, -degrees, 0, colors.navy);
  fillCircle(c, cx, cy, 7, colors.navy);
}

export function numberLine(c, x, y, width, ticks) {
  strokeLine(c, x, y, x + width, y, 6, colors.navy);
  for (let i = 0; i <= ticks; i += 1) {
    const tx = x + (width * i) / ticks;
    const tall = i % 2 === 0;
    strokeLine(c, tx, y - (tall ? 18 : 10), tx, y + (tall ? 4 : 2), tall ? 4 : 2, colors.navy);
  }
}

export function tableGrid(c, x, y, width, height, columns, rows) {
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

export function pictograph(c, x, y, rows, maxDots) {
  rows.forEach((count, rowIndex) => {
    const rowY = y + rowIndex * 62;
    fillRect(c, x, rowY, maxDots * 40 + 30, 46, colors.pale);
    strokeRect(c, x, rowY, maxDots * 40 + 30, 46, 3, colors.navy);
    dotRow(c, x + 22, rowY + 23, count, 40, 12, colors.teal);
  });
}

export function apple(c, cx, cy, r) {
  fillCircle(c, cx, cy, r, colors.red);
  ring(c, cx, cy, r, 4, colors.navy);
  strokeLine(c, cx, cy - r, cx + 4, cy - r - 12, 4, colors.navy);
  fillPolygon(c, [[cx + 4, cy - r - 4], [cx + 22, cy - r - 12], [cx + 10, cy - r - 22]], colors.green);
}

export function books(c, x, y, count) {
  for (let i = 0; i < count; i += 1) {
    const bx = x + i * 26;
    fillRect(c, bx, y - i * 8, 120, 78, i % 2 === 0 ? colors.tealLight : colors.blueLight);
    strokeRect(c, bx, y - i * 8, 120, 78, 4, colors.navy);
    strokeLine(c, bx + 12, y - i * 8 + 12, bx + 108, y - i * 8 + 12, 3, colors.navy);
  }
}

export function glass(c, cx, topY, bottomY, halfWidth, level) {
  const bodyBottom = bottomY;
  fillPolygon(
    c,
    [[cx - halfWidth, topY], [cx + halfWidth, topY], [cx + halfWidth, bodyBottom], [cx - halfWidth, bodyBottom]],
    colors.white
  );
  const waterTop = bodyBottom - (bodyBottom - topY) * level;
  fillPolygon(
    c,
    [
      [cx - halfWidth + 4, waterTop],
      [cx + halfWidth - 4, waterTop],
      [cx + halfWidth - 4, bodyBottom - 4],
      [cx - halfWidth + 4, bodyBottom - 4]
    ],
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

export function chevron(c, cx, cy, size, direction, color, width) {
  strokeLine(c, cx - size * direction, cy - size, cx + size * direction, cy, width, color);
  strokeLine(c, cx + size * direction, cy, cx - size * direction, cy + size, width, color);
}

export function towerRow(c, x, baseY, counts, color, unitSize = 34, gap = 40) {
  counts.forEach((count, index) => {
    const tx = x + index * (unitSize + gap);
    for (let i = 0; i < count; i += 1) {
      fillRect(c, tx, baseY - (i + 1) * unitSize, unitSize, unitSize, color);
      strokeRect(c, tx, baseY - (i + 1) * unitSize, unitSize, unitSize, 4, colors.navy);
    }
  });
}

export function patternStrip(c, x, y, kinds, colorsByKind, step = 120, size = 40) {
  kinds.forEach((kind, index) => {
    const cx = x + index * step;
    drawShape(c, kind, cx, y, size, { fill: colorsByKind[kind] });
  });
}

export function drawShape(c, kind, cx, cy, size, options = {}) {
  const fill = options.fill ?? colors.teal;
  const stroke = options.stroke ?? colors.navy;
  if (kind === "circle") {
    fillCircle(c, cx, cy, size * 0.62, fill);
    ring(c, cx, cy, size * 0.62, 5, stroke);
  } else if (kind === "square") {
    fillRect(c, cx - size / 2, cy - size / 2, size, size, fill);
    strokeRect(c, cx - size / 2, cy - size / 2, size, size, 5, stroke);
  } else if (kind === "rectangle") {
    fillRect(c, cx - size * 0.7, cy - size * 0.42, size * 1.4, size * 0.84, fill);
    strokeRect(c, cx - size * 0.7, cy - size * 0.42, size * 1.4, size * 0.84, 5, stroke);
  } else if (kind === "triangle") {
    triangle(c, cx, cy, size * 0.62, 0, fill);
  }
}

export function equalSideMarks(c, cx, cy, size) {
  const half = size / 2;
  for (const offset of [-18, 18]) {
    strokeLine(c, cx - 6, cy - half + offset, cx + 6, cy - half + offset + 10, 4, colors.navy);
    strokeLine(c, cx - 6, cy + half + offset, cx + 6, cy + half + offset + 10, 4, colors.navy);
    strokeLine(c, cx - half + offset, cy - 6, cx - half + offset + 10, cy + 6, 4, colors.navy);
    strokeLine(c, cx + half + offset, cy - 6, cx + half + offset + 10, cy + 6, 4, colors.navy);
  }
}

export function rightAngleMarks(c, cx, cy, size) {
  const half = size / 2 - 8;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const x = cx + sx * half;
      const y = cy + sy * half;
      strokeLine(c, x, y, x - sx * 20, y, 4, colors.navy);
      strokeLine(c, x, y, x, y - sy * 20, 4, colors.navy);
    }
  }
}

export function placeValueBoard(c, x, y, width, height, columns) {
  const columnWidth = width / columns.length;
  columns.forEach((column, index) => {
    const left = x + columnWidth * index;
    const cx = left + columnWidth / 2;
    if (column.highlight) {
      fillRoundRect(c, left + 4, y + 5, columnWidth - 8, height - 10, 16, colors.orangeLight);
    }
    if (index > 0) strokeLine(c, left, y, left, y + height, 3, colors.navy);
    const color = column.color ?? undefined;
    if (column.kind === "cube" || column.kind === "flat") {
      const gap = 8;
      const gridColumns = column.count > 3 ? 2 : 1;
      const rows = Math.ceil(column.count / gridColumns);
      const size = Math.min(
        columnWidth * (gridColumns === 1 ? 0.52 : 0.4),
        (height - 40) / rows - gap,
        column.kind === "cube" ? 52 : 64
      );
      const totalWidth = gridColumns * size + (gridColumns - 1) * 4;
      for (let i = 0; i < column.count; i += 1) {
        const bx = cx - totalWidth / 2 + (i % gridColumns) * (size + 4);
        const by = y + height - 16 - (Math.floor(i / gridColumns) + 1) * (size + gap);
        if (column.kind === "cube") {
          if (color === "orange") {
            fillRect(c, bx, by, size, size, colors.orangeLight);
            strokeRect(c, bx, by, size, size, 4, colors.navy);
          } else {
            cubeBlock(c, bx, by, size);
          }
        } else {
          flat(c, bx, by, size);
        }
      }
    } else if (column.kind === "rod") {
      const gap = 6;
      const rodWidth = Math.max(8, Math.min(18, (columnWidth - 24) / Math.max(column.count, 1) - gap));
      const total = column.count * (rodWidth + gap) - gap;
      for (let i = 0; i < column.count; i += 1) {
        rod(c, cx - total / 2 + i * (rodWidth + gap), y + 30, height - 60, rodWidth);
      }
    } else {
      const size = Math.max(12, Math.min(24, columnWidth / 4));
      const gap = 6;
      for (let i = 0; i < column.count; i += 1) {
        const bx = cx - size - gap / 2 + (i % 2) * (size + gap);
        const by = y + 26 + Math.floor(i / 2) * (size + gap);
        unit(c, bx, by, size);
      }
    }
  });
  strokeRect(c, x, y, width, height, 4, colors.navy);
}

export function vennFactors(c, options = {}) {
  const { cx = 400, cy = 300, r = 190, gap = 150, lensMode = "filled" } = options;
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
  const leftDots = [
    [cx - 140, cy - 40],
    [cx - 140, cy + 40]
  ];
  const lensDots = [
    [cx - 70, cy - 60],
    [cx - 70, cy + 60],
    [cx + 70, cy - 60],
    [cx + 70, cy + 60]
  ];
  const rightDots = [
    [cx + 140, cy - 40],
    [cx + 140, cy + 40]
  ];
  for (const [x, y] of leftDots) fillCircle(c, x, y, 16, colors.blue);
  for (const [x, y] of rightDots) fillCircle(c, x, y, 16, colors.red);
  for (const [x, y] of lensDots) {
    if (lensMode === "filled") fillCircle(c, x, y, 16, colors.navy);
    else ring(c, x, y, 16, 4, colors.navy);
  }
  if (lensMode !== "filled") {
    for (const [x, y] of [...leftDots, ...rightDots]) ring(c, x, y, 16, 4, colors.navy);
  }
}

export function factorArcs(c, x, y, width, total, pairs) {
  const step = width / (total - 1);
  for (let i = 0; i < total; i += 1) fillCircle(c, x + i * step, y, 10, colors.teal);
  const pairColors = [colors.blue, colors.orange, colors.green];
  pairs.forEach(([a, b], index) => {
    const start = x + (a - 1) * step;
    const end = x + (b - 1) * step;
    const mid = (start + end) / 2;
    const radius = (end - start) / 2;
    const depth = Math.min(150, radius * 0.9);
    let previous = null;
    for (let t = 180; t <= 360; t += 4) {
      const rad = (t * Math.PI) / 180;
      const px = mid + Math.cos(rad) * radius;
      const py = y + 10 + Math.sin(rad) * depth;
      if (previous) strokeLine(c, previous[0], previous[1], px, py, 4, pairColors[index % pairColors.length]);
      previous = [px, py];
    }
  });
}

export function hand(c, cx, cy, scale = 1, raised = [true, true, true, true, true]) {
  const palmWidth = 92 * scale;
  const palmHeight = 84 * scale;
  fillRoundRect(c, cx - palmWidth / 2, cy, palmWidth, palmHeight, 22 * scale, colors.pale);
  strokeRoundRect(c, cx - palmWidth / 2, cy, palmWidth, palmHeight, 22 * scale, 4, colors.navy);
  for (let i = 0; i < 4; i += 1) {
    const fx = cx - 38 * scale + i * 21 * scale;
    const tall = raised[i];
    const height = tall ? 74 * scale : 30 * scale;
    const top = cy - height + 8 * scale;
    fillRoundRect(c, fx, top, 16 * scale, height, 8 * scale, colors.pale);
    strokeRoundRect(c, fx, top, 16 * scale, height, 8 * scale, 4, colors.navy);
  }
  const thumbHeight = raised[4] ? 50 * scale : 26 * scale;
  fillRoundRect(c, cx - palmWidth / 2 - 26 * scale, cy + 22 * scale, 30 * scale, 16 * scale, 8 * scale, colors.pale);
  strokeRoundRect(c, cx - palmWidth / 2 - 26 * scale, cy + 22 * scale, 30 * scale, 16 * scale, 8 * scale, 4, colors.navy);
  fillRoundRect(c, cx - 20 * scale, cy + palmHeight - 4 * scale, 40 * scale, thumbHeight, 8 * scale, colors.pale);
  strokeRoundRect(c, cx - 20 * scale, cy + palmHeight - 4 * scale, 40 * scale, thumbHeight, 8 * scale, 4, colors.navy);
}

export function handSpan(c, cx, cy, span, scale = 1) {
  hand(c, cx, cy, scale);
  const y = cy + 150 * scale;
  strokeLine(c, cx - span / 2, y, cx + span / 2, y, 5, colors.teal);
  strokeLine(c, cx - span / 2, y - 14, cx - span / 2, y + 14, 4, colors.teal);
  strokeLine(c, cx + span / 2, y - 14, cx + span / 2, y + 14, 4, colors.teal);
}

export function tapeMeasure(c, x, y, width) {
  fillRoundRect(c, x, y, 72, 72, 16, colors.sun);
  strokeRoundRect(c, x, y, 72, 72, 16, 4, colors.navy);
  ring(c, x + 36, y + 36, 20, 4, colors.navy);
  fillRect(c, x + 70, y + 22, width - 70, 28, colors.pale);
  strokeRect(c, x + 70, y + 22, width - 70, 28, 4, colors.navy);
  for (let i = 0; i <= 10; i += 1) {
    const tx = x + 78 + ((width - 96) * i) / 10;
    strokeLine(c, tx, y + 22, tx, y + 22 + (i % 5 === 0 ? 16 : 9), i % 5 === 0 ? 4 : 2, colors.navy);
  }
  fillRect(c, x + width - 10, y + 14, 10, 44, colors.navy);
}

export function dayNight(c, cx, cy, r) {
  fillCircle(c, cx, cy, r, colors.sky);
  sector(c, cx, cy, r, -90, 90, colors.navy);
  fillCircle(c, cx - r * 0.35, cy - r * 0.25, r * 0.22, colors.sun);
  fillCircle(c, cx + r * 0.3, cy - r * 0.2, r * 0.32, colors.white);
  fillCircle(c, cx + r * 0.42, cy - r * 0.32, r * 0.3, colors.navy);
  for (const [dx, dy, size] of [
    [0.55, 0.2, 5],
    [0.28, 0.48, 4],
    [0.62, 0.55, 3]
  ]) {
    fillCircle(c, cx + r * dx, cy + r * dy, size, colors.white);
  }
  ring(c, cx, cy, r, 6, colors.navy);
}

export function diceFace(c, x, y, size, pips) {
  fillRoundRect(c, x, y, size, size, size * 0.14, colors.white);
  strokeRoundRect(c, x, y, size, size, size * 0.14, 6, colors.navy);
  const r = size * 0.09;
  const positions = {
    1: [[0.5, 0.5]],
    2: [
      [0.3, 0.3],
      [0.7, 0.7]
    ],
    3: [
      [0.28, 0.28],
      [0.5, 0.5],
      [0.72, 0.72]
    ],
    4: [
      [0.3, 0.3],
      [0.7, 0.3],
      [0.3, 0.7],
      [0.7, 0.7]
    ],
    5: [
      [0.3, 0.3],
      [0.7, 0.3],
      [0.5, 0.5],
      [0.3, 0.7],
      [0.7, 0.7]
    ],
    6: [
      [0.3, 0.25],
      [0.7, 0.25],
      [0.3, 0.5],
      [0.7, 0.5],
      [0.3, 0.75],
      [0.7, 0.75]
    ]
  };
  for (const [px, py] of positions[pips]) {
    fillCircle(c, x + size * px, y + size * py, r, colors.navy);
  }
}

export function bodyScale(c, cx, baseY, scale = 1) {
  fillRoundRect(c, cx - 150 * scale, baseY - 34 * scale, 300 * scale, 34 * scale, 14 * scale, colors.pale);
  strokeRoundRect(c, cx - 150 * scale, baseY - 34 * scale, 300 * scale, 34 * scale, 14 * scale, 5, colors.navy);
  strokeLine(c, cx + 100 * scale, baseY - 34 * scale, cx + 100 * scale, baseY - 250 * scale, 8, colors.navy);
  fillCircle(c, cx + 100 * scale, baseY - 262 * scale, 46 * scale, colors.white);
  ring(c, cx + 100 * scale, baseY - 262 * scale, 46 * scale, 5, colors.navy);
  strokeLine(c, cx + 100 * scale, baseY - 262 * scale, cx + 100 * scale, baseY - 292 * scale, 5, colors.red);
  const px = cx - 30 * scale;
  fillCircle(c, px, baseY - 205 * scale, 24 * scale, colors.pale);
  ring(c, px, baseY - 205 * scale, 24 * scale, 4, colors.navy);
  fillRoundRect(c, px - 28 * scale, baseY - 180 * scale, 56 * scale, 96 * scale, 14 * scale, colors.tealLight);
  strokeRoundRect(c, px - 28 * scale, baseY - 180 * scale, 56 * scale, 96 * scale, 14 * scale, 4, colors.navy);
  strokeLine(c, px - 28 * scale, baseY - 130 * scale, px - 50 * scale, baseY - 80 * scale, 6, colors.navy);
  strokeLine(c, px + 28 * scale, baseY - 130 * scale, px + 50 * scale, baseY - 80 * scale, 6, colors.navy);
  strokeLine(c, px - 18 * scale, baseY - 84 * scale, px - 24 * scale, baseY - 34 * scale, 7, colors.navy);
  strokeLine(c, px + 18 * scale, baseY - 84 * scale, px + 24 * scale, baseY - 34 * scale, 7, colors.navy);
}

export function magnifier(c, cx, cy, r) {
  fillCircle(c, cx, cy, r, colors.sky);
  ring(c, cx, cy, r, 12, colors.navy);
  strokeLine(c, cx + r * 0.72, cy + r * 0.72, cx + r * 1.5, cy + r * 1.5, 20, colors.teal);
}

export function operationTile(c, cx, cy, size, op) {
  fillRoundRect(c, cx - size / 2, cy - size / 2, size, size, 18, colors.pale);
  strokeRoundRect(c, cx - size / 2, cy - size / 2, size, size, 18, 4, colors.navy);
  if (op === "plus") plusSign(c, cx, cy, size * 0.24, 8, colors.navy);
  else if (op === "minus") minusSign(c, cx, cy, size * 0.24, 8, colors.navy);
  else if (op === "times") {
    const d = size * 0.24;
    strokeLine(c, cx - d, cy - d, cx + d, cy + d, 8, colors.navy);
    strokeLine(c, cx - d, cy + d, cx + d, cy - d, 8, colors.navy);
  } else {
    minusSign(c, cx + 4, cy, size * 0.18, 7, colors.navy);
    fillCircle(c, cx - 7, cy - 12, 6, colors.navy);
    fillCircle(c, cx - 7, cy + 12, 6, colors.navy);
  }
}

export function summaryTrio(c, painters, cy = 340) {
  const zones = [145, 400, 655];
  zones.forEach((cx, index) => {
    fillRoundRect(c, cx - 108, 170, 216, 336, 26, colors.pale);
    strokeRoundRect(c, cx - 108, 170, 216, 336, 26, 3, colors.muted);
    painters[index](c, cx, cy);
  });
}

export function miniFrame(c, cx, cy, filled, color = colors.teal) {
  tenFrame(c, cx - 88, cy - 40, filled, color, 30, 5);
}

export function miniDots(c, cx, cy, count, color, gap = 24, radius = 10) {
  dotRow(c, cx - ((count - 1) * gap) / 2, cy, count, gap, radius, color);
}

export function miniShapes(c, cx, cy, kinds) {
  kinds.forEach((kind, index) => {
    const x = cx - 62 + index * 62;
    drawShape(c, kind, x, cy, 54, { fill: kind === "circle" ? colors.teal : kind === "square" ? colors.sun : colors.blue });
  });
}

export function miniBarChart(c, cx, cy, values, highlight = -1, mean = null) {
  barChart(c, cx - 92, cy - 78, 184, 156, values, { highlight, mean });
}

export function miniTable(c, cx, cy) {
  tableGrid(c, cx - 92, cy - 46, 184, 92, 3, 2);
}

export function miniClock(c, cx, cy, hour = 9, minute = 0) {
  clockFace(c, cx, cy, 52, hour, minute);
}

export function miniMoney(c, cx, cy) {
  note(c, cx - 20, cy - 42, 100, 44);
  coin(c, cx - 54, cy + 22, 24, colors.sun);
  coin(c, cx + 24, cy + 22, 20, colors.pale);
}

export function miniScale(c, cx, cy) {
  balanceScale(c, cx, cy + 48, 62);
  apple(c, cx - 62, cy - 14, 15);
  fillRect(c, cx + 48, cy - 32, 30, 30, colors.blueLight);
  strokeRect(c, cx + 48, cy - 32, 30, 30, 3, colors.navy);
}

export function miniRuler(c, cx, cy) {
  ruler(c, cx - 88, cy - 18, 176, 38, 16);
}

export function miniCube(c, cx, cy) {
  cube3d(c, cx - 55, cy - 42, 88, 22);
}

export function miniCylinder(c, cx, cy) {
  cylinder3d(c, cx, cy - 72, cy + 58, 46);
}

export function miniCone(c, cx, cy) {
  cone3d(c, cx, cy + 58, 46, 132);
}

export function miniPyramid(c, cx, cy) {
  pyramid3d(c, cx, cy - 70, cy + 58, 58);
}

export function miniPrism(c, cx, cy) {
  prism3d(c, cx - 82, cy + 48);
}

export function miniFlow(c, cx, cy, count) {
  const radius = 30;
  const gap = 74;
  for (let i = 0; i < count; i += 1) {
    const x = cx - ((count - 1) * gap) / 2 + i * gap;
    flowStep(c, x, cy, radius, i + 1);
    if (i > 0) arrow(c, x - gap + radius + 4, cy, x - radius - 4, cy, 4, colors.navy, 10);
  }
}

export function miniVenn(c, cx, cy) {
  vennFactors(c, { cx, cy, r: 78, gap: 58 });
}

export function miniFactorArc(c, cx, cy) {
  factorArcs(c, cx - 84, cy - 20, 168, 12, [
    [1, 12],
    [2, 6],
    [3, 4]
  ]);
}

export function miniNumberLine(c, cx, cy, marks) {
  numberLine(c, cx - 90, cy, 180, 12);
  marks.forEach(([tick, color]) => {
    fillCircle(c, cx - 90 + (180 * tick) / 12, cy, 8, color);
  });
}

export function miniAngle(c, cx, cy, degrees) {
  angleFigure(c, cx, cy, degrees, colors.teal, 52);
}

export function miniCircle(c, cx, cy, kind) {
  const r = 64;
  fillCircle(c, cx, cy, r, colors.pale);
  ring(c, cx, cy, r, 6, colors.navy);
  if (kind === "radius") {
    strokeLine(c, cx, cy, cx + r * Math.cos(-Math.PI / 6), cy + r * Math.sin(-Math.PI / 6), 6, colors.teal);
  } else if (kind === "diameter") {
    strokeLine(c, cx - r * Math.cos(Math.PI / 7), cy - r * Math.sin(Math.PI / 7), cx + r * Math.cos(Math.PI / 7), cy + r * Math.sin(Math.PI / 7), 6, colors.blue);
  } else {
    ring(c, cx, cy, r - 6, 8, colors.teal);
  }
  fillCircle(c, cx, cy, 8, colors.navy);
}

export function miniDice(c, cx, cy) {
  diceFace(c, cx - 52, cy - 52, 104, 3);
}

export function miniCoins(c, cx, cy) {
  coin(c, cx - 42, cy, 40, colors.sun);
  star(c, cx - 42, cy, 18, colors.navy);
  coin(c, cx + 46, cy, 34, colors.pale);
  ring(c, cx + 46, cy, 16, 4, colors.navy);
}

export function miniMagnifier(c, cx, cy) {
  magnifier(c, cx - 10, cy - 10, 46);
}

export function miniStoryCard(c, cx, cy) {
  fillRoundRect(c, cx - 80, cy - 62, 160, 124, 14, colors.white);
  strokeRoundRect(c, cx - 80, cy - 62, 160, 124, 14, 4, colors.navy);
  dashedLine(c, cx - 56, cy - 26, cx + 56, cy - 26, 4, colors.muted, 10, 8);
  dashedLine(c, cx - 56, cy + 2, cx + 56, cy + 2, 4, colors.muted, 10, 8);
  dashedLine(c, cx - 56, cy + 30, cx + 20, cy + 30, 4, colors.muted, 10, 8);
}

export function miniTiles(c, cx, cy) {
  operationTile(c, cx - 54, cy, 64, "plus");
  operationTile(c, cx + 54, cy, 64, "minus");
}

export function miniCrossedDots(c, cx, cy, count, crossedCount, color = colors.teal) {
  const gap = 26;
  const start = cx - ((count - 1) * gap) / 2;
  for (let i = 0; i < count; i += 1) fillCircle(c, start + i * gap, cy, 11, color);
  for (let i = count - crossedCount; i < count; i += 1) {
    const x = start + i * gap;
    dashedLine(c, x - 12, cy - 12, x + 12, cy + 12, 4, colors.red, 6, 4);
    dashedLine(c, x + 12, cy - 12, x - 12, cy + 12, 4, colors.red, 6, 4);
  }
}

export function miniStarGrid(c, cx, cy, columns, rows) {
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      star(c, cx - ((columns - 1) * 30) / 2 + column * 30, cy - ((rows - 1) * 30) / 2 + row * 30, 11, colors.sun, 2);
    }
  }
}

export function miniRings(c, cx, cy, count, perRing) {
  const gap = count > 3 ? 54 : 66;
  for (let i = 0; i < count; i += 1) {
    const rx = cx + (i - (count - 1) / 2) * gap;
    ringAround(c, rx, cy, 28, 3, colors.blue);
    dotRow(c, rx - ((perRing - 1) * 12) / 2, cy, perRing, 12, 5, colors.teal);
  }
}

export function miniDotColumn(c, cx, baseY, count, color) {
  for (let i = 0; i < count; i += 1) fillCircle(c, cx, baseY - i * 16, 6, color);
}

export function miniGrid(c, cx, cy, columns, rows, filled, cell = 18) {
  const x = cx - (columns * cell) / 2;
  const y = cy - (rows * cell) / 2;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      fillRect(c, x + column * cell, y + row * cell, cell, cell, index < filled ? colors.green : colors.pale);
    }
  }
  strokeRect(c, x, y, columns * cell, rows * cell, 3, colors.navy);
}

export function miniBars(c, cx, cy, lengths, tones = [colors.tealLight, colors.blueLight]) {
  lengths.forEach((length, index) => {
    const width = Math.min(170, length * 7);
    fillRect(c, cx - 85, cy - 24 + index * 34, width, 22, tones[index % tones.length]);
    strokeRect(c, cx - 85, cy - 24 + index * 34, width, 22, 3, colors.navy);
  });
}

export function miniNet(c, cx, cy) {
  const cell = 32;
  const layout = [
    [-1, 0],
    [0, 0],
    [1, 0],
    [0, 1],
    [0, 2],
    [0, 3]
  ];
  for (const [dx, dy] of layout) {
    fillRect(c, cx + dx * cell - cell / 2, cy + dy * cell - cell * 1.5, cell, cell, colors.tealLight);
    strokeRect(c, cx + dx * cell - cell / 2, cy + dy * cell - cell * 1.5, cell, cell, 3, colors.navy);
  }
}

export function miniProtractor(c, cx, cy) {
  ringSegment(c, cx, cy + 20, 76, 6, 180, 360, colors.navy);
  strokeLine(c, cx - 76, cy + 20, cx + 76, cy + 20, 4, colors.navy);
  for (let i = 0; i <= 12; i += 1) {
    const angle = (180 + i * 15) * (Math.PI / 180);
    strokeLine(
      c,
      cx + Math.cos(angle) * 76,
      cy + 20 + Math.sin(angle) * 76,
      cx + Math.cos(angle) * (i % 3 === 0 ? 58 : 66),
      cy + 20 + Math.sin(angle) * (i % 3 === 0 ? 58 : 66),
      i % 3 === 0 ? 3 : 2,
      colors.navy
    );
  }
  fillCircle(c, cx, cy + 20, 5, colors.navy);
}

export function miniSixRing(c, cx, cy) {
  ring(c, cx, cy, 44, 4, colors.navy);
  for (let i = 0; i < 6; i += 1) {
    const angle = ((-90 + i * 60) * Math.PI) / 180;
    fillCircle(c, cx + Math.cos(angle) * 44, cy + Math.sin(angle) * 44, 6, colors.teal);
  }
}

export function miniDotRows(c, cx, cy, rows) {
  rows.forEach((count, index) => {
    dotRow(c, cx - ((count - 1) * 20) / 2, cy - 30 + index * 30, count, 20, 8, index % 2 === 0 ? colors.teal : colors.blue);
  });
}

export function miniCubeStack(c, cx, baseY, count, size = 34) {
  for (let i = 0; i < count; i += 1) {
    fillRect(c, cx - size / 2, baseY - (i + 1) * size, size, size, colors.tealLight);
    strokeRect(c, cx - size / 2, baseY - (i + 1) * size, size, size, 3, colors.navy);
  }
}

export function miniAreaGrid(c, cx, cy, columns, rows, highlight = -1) {
  const cell = 24;
  const x = cx - (columns * cell) / 2;
  const y = cy - (rows * cell) / 2;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      fillRect(c, x + column * cell, y + row * cell, cell, cell, index === highlight ? colors.orange : colors.tealLight);
    }
  }
  for (let i = 0; i <= columns; i += 1) strokeLine(c, x + i * cell, y, x + i * cell, y + rows * cell, 2, colors.navy);
  for (let i = 0; i <= rows; i += 1) strokeLine(c, x, y + i * cell, x + columns * cell, y + i * cell, 2, colors.navy);
  strokeRect(c, x, y, columns * cell, rows * cell, 3, colors.navy);
}

export function miniPerimeterRect(c, cx, cy) {
  strokeRect(c, cx - 70, cy - 46, 140, 92, 5, colors.navy);
  strokeLine(c, cx - 70, cy - 60, cx + 70, cy - 60, 4, colors.teal);
  strokeLine(c, cx + 84, cy - 46, cx + 84, cy + 46, 4, colors.teal);
  strokeLine(c, cx + 70, cy + 60, cx - 70, cy + 60, 4, colors.teal);
  strokeLine(c, cx - 84, cy + 46, cx - 84, cy - 46, 4, colors.teal);
}

export function miniCheckLoop(c, cx, cy) {
  flowStep(c, cx - 55, cy - 20, 30, 3);
  flowStep(c, cx + 55, cy - 20, 30, 4);
  arrow(c, cx - 25, cy - 20, cx + 25, cy - 20, 4, colors.navy, 10);
  curveArrow(c, cx + 55, cy + 10, cx - 55, cy + 10, 40, 4, colors.teal);
  checkMark(c, cx + 74, cy + 30, 38, 7, colors.green);
}

export function panel(c, x, y, width, height, paint) {
  fillRoundRect(c, x, y, width, height, 26, colors.pale);
  strokeRoundRect(c, x, y, width, height, 26, 3, colors.muted);
  paint(c, x + width / 2, y + height / 2);
}

export function comparePanels(c, left, right) {
  panel(c, 50, 120, 335, 360, left);
  panel(c, 415, 120, 335, 360, right);
}

export function dashedBox(c, x, y, width, height, color = colors.muted) {
  dashedLine(c, x, y, x + width, y, 4, color, 12, 8);
  dashedLine(c, x + width, y, x + width, y + height, 4, color, 12, 8);
  dashedLine(c, x + width, y + height, x, y + height, 4, color, 12, 8);
  dashedLine(c, x, y + height, x, y, 4, color, 12, 8);
}

export function dotColumn(c, cx, baseY, count, color, step = 22, r = 9) {
  for (let i = 0; i < count; i += 1) fillCircle(c, cx, baseY - i * step, r, color);
}

export function ringDots(c, cx, cy, radius, count, color, r = 8) {
  for (let i = 0; i < count; i += 1) {
    const angle = ((-90 + (360 * i) / count) * Math.PI) / 180;
    fillCircle(c, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, r, color);
  }
}

export function blockGroup(c, cx, baseY, blocks, scale = 1) {
  const { flats = 0, rods = 0, units = 0 } = blocks;
  const gap = 6 * scale;
  const unitSize = 14 * scale;
  const rodWidth = 14 * scale;
  const rodHeight = 96 * scale;
  const flatSize = 42 * scale;
  const flatsWidth = flats * (flatSize + gap) - (flats ? gap : 0);
  const rodsWidth = rods * (rodWidth + gap) - (rods ? gap : 0);
  const unitsWidth = units * (unitSize + gap) - (units ? gap : 0);
  const width = Math.max(flatsWidth, rodsWidth, unitsWidth, 0);
  const unitsLift = units ? unitSize + gap : 0;
  const rodsBottom = baseY - unitsLift;
  const flatsY = (rods ? rodsBottom - rodHeight : baseY - unitsLift) - gap - flatSize;
  let x = cx - flatsWidth / 2;
  for (let i = 0; i < flats; i += 1) {
    flat(c, x, flatsY, flatSize);
    x += flatSize + gap;
  }
  x = cx - rodsWidth / 2;
  for (let i = 0; i < rods; i += 1) {
    rod(c, x, rodsBottom - rodHeight, rodHeight, rodWidth);
    x += rodWidth + gap;
  }
  x = cx - unitsWidth / 2;
  for (let i = 0; i < units; i += 1) {
    fillRect(c, x, baseY - unitSize, unitSize, unitSize, colors.tealLight);
    strokeRect(c, x, baseY - unitSize, unitSize, unitSize, 2, colors.navy);
    x += unitSize + gap;
  }
  return width;
}

export function badgeFrame(c, cx, cy, size, color = colors.orange) {
  strokeRoundRect(c, cx - size / 2, cy - size / 2, size, size, 18, 6, color);
}
