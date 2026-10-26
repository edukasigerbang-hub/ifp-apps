export interface Size {
  width: number;
  height: number;
}

export interface Offset {
  x: number;
  y: number;
}

export interface DrawRect {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

export const AVATAR_VIEWPORT = 288;
export const AVATAR_OUTPUT = 512;
export const AVATAR_TARGET_BYTES = 1_000_000;

export function coverScale(image: Size, viewport: number): number {
  if (image.width <= 0 || image.height <= 0) return 1;
  return Math.max(viewport / image.width, viewport / image.height);
}

export function clampOffset(
  offset: Offset,
  image: Size,
  scale: number,
  viewport: number
): Offset {
  const width = image.width * scale;
  const height = image.height * scale;
  const minX = Math.min(0, viewport - width);
  const minY = Math.min(0, viewport - height);
  return {
    x: Math.min(0, Math.max(minX, offset.x)),
    y: Math.min(0, Math.max(minY, offset.y))
  };
}

export function centeredOffset(image: Size, scale: number, viewport: number): Offset {
  return clampOffset(
    {
      x: (viewport - image.width * scale) / 2,
      y: (viewport - image.height * scale) / 2
    },
    image,
    scale,
    viewport
  );
}

export function cropDrawRect(
  offset: Offset,
  image: Size,
  scale: number,
  viewport: number,
  output: number
): DrawRect {
  const factor = output / viewport;
  return {
    dx: offset.x * factor,
    dy: offset.y * factor,
    dw: image.width * scale * factor,
    dh: image.height * scale * factor
  };
}
