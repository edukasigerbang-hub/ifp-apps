export interface PenPoint {
  x: number;
  y: number;
}

export interface PenStroke {
  id: string;
  color: string;
  width: number;
  /** Titik dalam piksel CSS relatif terhadap sudut kiri atas area eksplorasi. */
  points: PenPoint[];
}

export function distanceToSegment(point: PenPoint, start: PenPoint, end: PenPoint): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }
  const projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
  const t = Math.min(1, Math.max(0, projection));
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}

/** `radius` dalam piksel CSS; titik stroke maupun jalur berada pada ruang piksel yang sama. */
export function strokeIntersectsPath(stroke: PenStroke, path: PenPoint[], radius: number): boolean {
  if (path.length === 0 || stroke.points.length === 0) {
    return false;
  }
  const reach = radius + stroke.width / 2;
  for (const probe of path) {
    if (stroke.points.length === 1) {
      if (Math.hypot(probe.x - stroke.points[0].x, probe.y - stroke.points[0].y) <= reach) {
        return true;
      }
      continue;
    }
    for (let index = 1; index < stroke.points.length; index += 1) {
      if (distanceToSegment(probe, stroke.points[index - 1], stroke.points[index]) <= reach) {
        return true;
      }
    }
  }
  return false;
}
