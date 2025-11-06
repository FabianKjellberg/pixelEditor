import { getPixelIndex, rgbaToInt } from '@/helpers/color';
import { Cordinate, Direction, Layer, OutOfBoundItem, Rectangle } from '@/models/Layer';

/**
 *
 * @param width
 * @param height
 * @param xPos
 * @param yPos
 * @returns
 */
export function createLayer(rect: Rectangle, name: string, colorInt?: number): Layer {
  const pixels = new Uint32Array(Math.max(rect.width * rect.height, 0));
  pixels.fill(colorInt ?? rgbaToInt(0, 0, 0, 0));
  return {
    name,
    rect,
    pixels,
  };
}
/**
 * This method increases the size of a layer, while it also
 * adjusts the pixel array so to keeps its original shape and position
 * @param b b represents a OutOfBoundItem and consists of how big it should grow
 * @param l The layer that should be increased in size
 * @returns returns the updated layer
 */
export function increaseLayerBoundary(dir: Direction, l: Layer): Layer {
  //original layer
  const OriginalLayer = { ...l };

  const width = dir.left + OriginalLayer.rect.width + dir.right;
  const height = dir.top + OriginalLayer.rect.height + dir.bottom;

  const x = OriginalLayer.rect.x - dir.left;
  const y = OriginalLayer.rect.y - dir.top;

  //new Layer with updated dimensions and positioning
  const layer = createLayer({ width, height, x, y }, OriginalLayer.name);

  const widthLeftOffset = dir.left;
  const hegihtTopOffset = dir.top * width;

  //overwrite the newly created array with the old array
  for (let y: number = 0; y < OriginalLayer.rect.height; y++) {
    for (let x: number = 0; x < OriginalLayer.rect.width; x++) {
      const src = getPixelIndex(y, OriginalLayer.rect.width, x);
      const dest = widthLeftOffset + hegihtTopOffset + width * y + x;
      layer.pixels[dest] = OriginalLayer.pixels[src];
    }
  }

  return layer;
}

export function decreaseLayerBoundary(dir: Direction, l: Layer) {
  const OriginalLayer = { ...l };

  const width = OriginalLayer.rect.width - (dir.left + dir.right);
  const height = OriginalLayer.rect.height - (dir.top + dir.bottom);

  //early return if the height or width would not exist :)
  if (width <= 0 || width <= 0) {
    return createLayer({ width: 0, height: 0, x: 0, y: 0 }, OriginalLayer.name);
  }

  const x = OriginalLayer.rect.x + dir.left;
  const y = OriginalLayer.rect.y + dir.top;

  //new layer with update dimensions and positioning
  const layer = createLayer({ width, height, x, y }, OriginalLayer.name);

  const widthLeftOffset = dir.left;
  const heightTopOffset = dir.top * OriginalLayer.rect.width;

  for (let y: number = 0; y < layer.rect.height; y++) {
    for (let x: number = 0; x < layer.rect.width; x++) {
      const src = widthLeftOffset + heightTopOffset + OriginalLayer.rect.width * y + x;
      const dest = getPixelIndex(y, layer.rect.width, x);
      layer.pixels[dest] = OriginalLayer.pixels[src];
    }
  }

  return layer;
}

/**
 * from a mouse event, this method converts y & x cordinates to flat numbers based on the size of each pixel
 * @param e
 * @param pixelSize
 * @returns
 */
export function getPixelPositions<T extends Element>(
  e: React.PointerEvent<T>,
  pixelSize: number,
  panX: number,
  panY: number,
): Cordinate {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();

  //Get cordinates of the canvas
  const x = e.clientX - rect.left - panX;
  const y = e.clientY - rect.top - panY;

  //Round out number based on pixelsize zoom etx (before zooming is added its just going to be pixel size)
  const xPos = Math.floor(x / pixelSize);
  const yPos = Math.floor(y / pixelSize);

  return { x: xPos, y: yPos };
}

export function outOfBoundFinder(r: Rectangle, w: number, h: number): OutOfBoundItem {
  const growthLeft = r.x < 0 ? -r.x : 0;
  const growthTop = r.y < 0 ? -r.y : 0;
  const growthRight = r.x + r.width >= w ? r.x + r.width - w : 0;
  const growthBottom = r.y + r.height >= h ? r.y + r.height - h : 0;

  return {
    outOfBounds: growthBottom != 0 || growthLeft != 0 || growthTop != 0 || growthRight != 0,
    dir: {
      left: growthLeft,
      top: growthTop,
      right: growthRight,
      bottom: growthBottom,
    },
  };
}

export function tryReduceLayerSize(dir: Direction, layer: Layer): { layer: Layer; dir: Direction } {
  //variable that confirms that user has reached bottom
  let boundFound = false;
  let leftCount = 0;
  let topCount = 0;
  let rightCount = 0;
  let bottomCount = 0;

  const EMPTY = rgbaToInt(0, 0, 0, 0);

  //getLeftCount
  if (dir.left > 0) {
    while (!boundFound && leftCount < layer.rect.width) {
      for (let i: number = 0; i < layer.rect.height; i++) {
        if (layer.pixels[i * layer.rect.width + leftCount] !== EMPTY) {
          boundFound = true;
          break;
        }
      }
      if (!boundFound) leftCount++;
    }
    boundFound = false;
  }

  //getTopCount
  if (dir.top > 0) {
    while (!boundFound && topCount < layer.rect.height) {
      for (let i: number = 0; i < layer.rect.width; i++) {
        if (layer.pixels[topCount * layer.rect.width + i] !== EMPTY) {
          boundFound = true;
          break;
        }
      }
      if (!boundFound) topCount++;
    }
    boundFound = false;
  }

  //getRightCount
  if (dir.right > 0) {
    while (!boundFound && rightCount < layer.rect.width) {
      for (let i: number = 0; i < layer.rect.height; i++) {
        if (layer.pixels[i * layer.rect.width + layer.rect.width - rightCount - 1] !== EMPTY) {
          boundFound = true;
          break;
        }
      }
      if (!boundFound) rightCount++;
    }
    boundFound = false;
  }

  //getBottomCount
  if (dir.bottom > 0) {
    while (!boundFound && bottomCount < layer.rect.height) {
      for (let i: number = 0; i < layer.rect.width; i++) {
        if (layer.pixels[(layer.rect.height - bottomCount - 1) * layer.rect.width + i] !== EMPTY) {
          boundFound = true;
          break;
        }
      }
      if (!boundFound) bottomCount++;
    }
  }

  //reduce the layer boundaries by creating a directions object
  const reduceAmnt: Direction = {
    bottom: bottomCount,
    left: leftCount,
    right: rightCount,
    top: topCount,
  };

  //early return if no changes are present
  if (rightCount === 0 && topCount === 0 && leftCount === 0 && bottomCount === 0)
    return { layer, dir: reduceAmnt };

  return { layer: decreaseLayerBoundary(reduceAmnt, layer), dir: reduceAmnt };
}

export function stampLayer(stamp: Layer, originaLayer: Layer): Layer {
  for (let y = 0; y < stamp.rect.height; y++) {
    //check in boundary
    const yOffset = stamp.rect.y + y;
    //go to next layer if not inside the height boundary yet
    if (yOffset < 0) continue;
    //end whole loop if the max height has been reached
    if (yOffset >= originaLayer.rect.height) {
      y = stamp.rect.height;
      continue;
    }

    for (let x = 0; x < stamp.rect.width; x++) {
      const xOffset = stamp.rect.x + x;

      //go to next x loop if not in boundary yet
      if (xOffset < 0) continue;
      //go to next y loop if reached end of the x boundary
      if (xOffset >= originaLayer.rect.width) {
        x = stamp.rect.width;
        continue;
      }

      const originalIndex = getPixelIndex(yOffset, originaLayer.rect.width, xOffset);
      const stampIndex = getPixelIndex(y, stamp.rect.width, x);
      originaLayer.pixels[originalIndex] = stamp.pixels[stampIndex];
    }
  }

  return originaLayer;
}

export function lineStampLayer(stamp: Layer, to: Rectangle, originalLayer: Layer): Layer {
  let x0 = stamp.rect.x,
    y0 = stamp.rect.y;
  const x1 = to.x,
    y1 = to.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;

  let err = dx - dy;
  let out = originalLayer;

  while (true) {
    const s = { ...stamp, rect: { ...stamp.rect, x: x0, y: y0 } };
    out = stampLayer(s, out);

    if (x0 === x1 && y0 === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  return out;
}

export function rectanglesIntersecting(r1: Rectangle, r2: Rectangle): boolean {
  return (
    r1.x <= r2.x + r2.width - 1 &&
    r2.x <= r1.x + r1.width - 1 &&
    r1.y <= r2.y + r2.height - 1 &&
    r2.y <= r1.y + r1.height - 1
  );
}

export function combineRectangles(r1: Rectangle, r2: Rectangle): Rectangle {
  const x1 = Math.min(r1.x, r2.x);
  const y1 = Math.min(r1.y, r2.y);
  const x2 = Math.max(r1.x + r1.width, r2.x + r2.width);
  const y2 = Math.max(r1.y + r1.height, r2.y + r2.height);

  return {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
  };
}
