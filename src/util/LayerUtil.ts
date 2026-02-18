import { getLocalPixelIndex, getPixelIndex, intToRGB, rgbaToInt } from '@/helpers/color';
import {
  Cordinate,
  Direction,
  Layer,
  LayerEntity,
  OutOfBoundItem,
  Rectangle,
  SelectionLayer,
} from '@/models/Layer';
import { blendColor } from './ColorUtil';
import { buffer } from 'stream/consumers';
/**
 *
 * @param width
 * @param height
 * @param xPos
 * @param yPos
 * @returns
 */
export function createLayer(rect: Rectangle, colorInt?: number): Layer {
  const pixels = new Uint32Array(Math.max(rect.width * rect.height, 0));
  pixels.fill(colorInt ?? rgbaToInt(0, 0, 0, 0));
  return {
    rect,
    pixels,
  };
}

export function createLayerEntity(name: string, id?: string, layer?: Layer): LayerEntity {
  const layerForEntity = layer ? layer : createLayer({ x: 0, y: 0, width: 0, height: 0 });

  return {
    name: name,
    layer: layerForEntity,
    id: id ? id : crypto.randomUUID(),
  };
}

export function convertSelectionLayer(
  oldLayer: SelectionLayer,
  width: number,
  height: number,
): SelectionLayer {
  const pixels = new Uint8Array(Math.max(width * height, 0));
  pixels.fill(0);

  for (let i: number = 0; i < height; i++) {
    if (i > oldLayer.rect.height) {
      i = height;
      continue;
    }
    for (let j: number = 0; j < width; j++) {
      if (j > oldLayer.rect.width) {
        j = width;
        continue;
      }
      pixels[getPixelIndex(i, width, j)] =
        oldLayer.pixels[getPixelIndex(i, oldLayer.rect.width, j)];
    }
  }

  return oldLayer;
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
  const layer = createLayer({ width, height, x, y });

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
  if (width <= 0 || height <= 0) {
    return createLayer({ width: 0, height: 0, x: 0, y: 0 });
  }

  const x = OriginalLayer.rect.x + dir.left;
  const y = OriginalLayer.rect.y + dir.top;

  //new layer with update dimensions and positioning
  const layer = createLayer({ width, height, x, y });

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
export function getPixelPositions(x: number, y: number, pixelSize: number): Cordinate {
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

export function stampLayer(
  stamp: Layer,
  originalLayer: Layer,
  replace: boolean,
  strokeLayer: Layer,
  strokeNr: number,
): Layer {
  // Combined bounding rect in *canvas* coordinates
  const combinedRect = combineRectangles(originalLayer.rect, stamp.rect);

  const newWidth = combinedRect.width;
  const newHeight = combinedRect.height;

  //!TODO possible bottleneck, might not have to do this if layer is being updated
  // Allocate new pixel buffer
  const newPixels = new Uint32Array(newWidth * newHeight);

  // Helper to map canvas (global) coords -> local index in newPixels
  const toNewIndex = (globalX: number, globalY: number): number => {
    const localX = globalX - combinedRect.x;
    const localY = globalY - combinedRect.y;
    return getPixelIndex(localY, newWidth, localX);
  };

  // Copy original layer into the new buffer
  for (let y = 0; y < originalLayer.rect.height; y++) {
    for (let x = 0; x < originalLayer.rect.width; x++) {
      const globalX = originalLayer.rect.x + x;
      const globalY = originalLayer.rect.y + y;

      const srcIndex = getPixelIndex(y, originalLayer.rect.width, x);

      const dstIndex = toNewIndex(globalX, globalY);

      newPixels[dstIndex] = originalLayer.pixels[srcIndex];
    }
  }

  // Copy stamp layer into the new buffer
  for (let y = 0; y < stamp.rect.height; y++) {
    for (let x = 0; x < stamp.rect.width; x++) {
      const globalX = stamp.rect.x + x;
      const globalY = stamp.rect.y + y;

      const srcIndex = getPixelIndex(y, stamp.rect.width, x);
      const dstIndex = toNewIndex(globalX, globalY);

      const stampPixel = stamp.pixels[srcIndex];
      const originalPixel = newPixels[dstIndex];

      const blendedPixel = replace ? stampPixel : blendColor(stampPixel, originalPixel);

      newPixels[dstIndex] = blendedPixel;
    }
  }

  // Return a new layer, keeping the original layer's metadata
  const newLayer: Layer = {
    ...originalLayer,
    rect: combinedRect,
    pixels: newPixels,
  };

  return newLayer;
}

export function lineStampLayer(
  stamp: Layer,
  to: Rectangle,
  originalLayer: Layer,
  strokeLayer: Layer,
  strokeNr: number,
): Layer {
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
    out = stampLayer(s, out, true, strokeLayer, strokeNr);

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

export function isRectanglesIntersecting(r1: Rectangle, r2: Rectangle): boolean {
  return (
    r1.x <= r2.x + r2.width - 1 &&
    r2.x <= r1.x + r1.width - 1 &&
    r1.y <= r2.y + r2.height - 1 &&
    r2.y <= r1.y + r1.height - 1
  );
}

export function combineRectangles(r1: Rectangle, r2: Rectangle): Rectangle {
  if (r1.height == 0 || r1.width == 0) return r2;
  if (r2.height == 0 || r2.width == 0) return r1;

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

export function drawLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size: number,
  color: number,
  firstInStroke: boolean,
  strokeLayer?: Layer,
  strokeNr?: number,
): Layer {
  const r = Math.floor(size / 2);

  const r1: Rectangle = {
    x: x1 - r,
    y: y1 - r,
    width: size,
    height: size,
  };

  const firstStamp = createLayer(r1, color);

  const r2: Rectangle = {
    x: x2 - r,
    y: y2 - r,
    width: size,
    height: size,
  };

  const outRectangle: Rectangle = combineRectangles(r1, r2);
  const out: Layer = createLayer(outRectangle);
  //stamp first layer

  //console.log(firstInStroke);
  if (firstInStroke && strokeLayer && strokeNr) {
    replacePixelsWithStroke(out, firstStamp, strokeLayer, strokeNr);
  } else if (firstInStroke) {
    replacePixels(out, firstStamp);
  }

  const dX = Math.abs(x1 - x2);
  const dY = Math.abs(y1 - y2);

  const longestDistance = Math.max(dX, dY);

  if (longestDistance === 0) {
    return out;
  }

  const yDir = y1 >= y2 ? -1 : 1;
  const xDir = x1 >= x2 ? -1 : 1;

  let lastStepX = x1;
  let lastStepY = y1;

  for (let i: number = 1; i < longestDistance + 1; i++) {
    const dSteps: number = i / longestDistance;

    const stepX = x1 + xDir * Math.round(dSteps * dX);
    const stepY = y1 + yDir * Math.round(dSteps * dY);

    const edgeX = stepX - r + (xDir === 1 ? size - 1 : 0);
    const edgeY = stepY - r + (yDir === 1 ? size - 1 : 0);

    const localX = edgeX - out.rect.x;
    const localY = edgeY - out.rect.y;

    //Draw verticallys
    if (stepX != lastStepX) {
      for (let j: number = 0; j < size; j++) {
        //if you can draw on the same place twice
        if (strokeLayer && strokeNr) {
          const strokeLayerIndex = getPixelIndex(edgeY + j * -yDir, strokeLayer.rect.width, edgeX);
          if (strokeLayer.pixels[strokeLayerIndex] == strokeNr) {
            continue;
          }

          strokeLayer.pixels[strokeLayerIndex] = strokeNr;
        }
        out.pixels[getPixelIndex(localY + j * -yDir, out.rect.width, localX)] = color;
      }
    }
    //Draw Horizontally
    if (stepY != lastStepY) {
      for (let j: number = 0; j < size; j++) {
        if (strokeLayer && strokeNr) {
          const strokeLayerIndex = getPixelIndex(edgeY, strokeLayer.rect.width, edgeX + j * -xDir);
          if (strokeLayer.pixels[strokeLayerIndex] == strokeNr) {
            continue;
          }

          strokeLayer.pixels[strokeLayerIndex] = strokeNr;
        }
        out.pixels[getPixelIndex(localY, out.rect.width, localX + j * -xDir)] = color;
      }
    }

    lastStepX = stepX;
    lastStepY = stepY;
    //console.log('out', out);
  }

  return out;
}

export function clipLayerToSelection(layer: Layer, selectionLayer: SelectionLayer): Layer {
  // return if there is no intersection between the rectangles
  if (!isRectanglesIntersecting(layer.rect, selectionLayer.rect)) {
    return createLayer({ x: layer.rect.x, y: layer.rect.y, width: 0, height: 0 });
  }

  const intersectingRect = rectangleIntersection(layer.rect, selectionLayer.rect);

  const out: Layer = createLayer(intersectingRect);

  for (let y: number = 0; y < out.rect.height; y++) {
    for (let x: number = 0; x < out.rect.width; x++) {
      const selectionOffsetX: number = out.rect.x - selectionLayer.rect.x + x;
      const selectionOffsetY: number = out.rect.y - selectionLayer.rect.y + y;

      const selectionPixel: number =
        selectionLayer.pixels[
          getPixelIndex(selectionOffsetY, selectionLayer.rect.width, selectionOffsetX)
        ];

      //dont draw where you are not allowed
      if (selectionPixel === 0) continue;

      const layerOffsetX: number = out.rect.x - layer.rect.x + x;
      const layerOffsetY: number = out.rect.y - layer.rect.y + y;

      const layerPixel: number =
        layer.pixels[getPixelIndex(layerOffsetY, layer.rect.width, layerOffsetX)];

      out.pixels[getPixelIndex(y, out.rect.width, x)] = layerPixel;
    }
  }
  return out;
}

export function clipLayerToRect(layer: Layer, rect: Rectangle): Layer {
  const intersectingRect = rectangleIntersection(layer.rect, rect);

  const out: Layer = createLayer(intersectingRect);

  for (let y: number = 0; y < out.rect.height; y++) {
    for (let x: number = 0; x < out.rect.width; x++) {
      const layerOffsetX: number = out.rect.x - layer.rect.x + x;
      const layerOffsetY: number = out.rect.y - layer.rect.y + y;

      const layerPixel: number =
        layer.pixels[getPixelIndex(layerOffsetY, layer.rect.width, layerOffsetX)];

      out.pixels[getPixelIndex(y, out.rect.width, x)] = layerPixel;
    }
  }
  return out;
}

export function rectangleIntersection(r1: Rectangle, r2: Rectangle): Rectangle {
  const x1: number = Math.max(r1.x, r2.x);
  const x2: number = Math.min(r1.x + r1.width, r2.x + r2.width);
  const y1: number = Math.max(r1.y, r2.y);
  const y2: number = Math.min(r1.y + r1.height, r2.y + r2.height);

  return {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
  };
}

export function stampToCanvasLayer(stamp: Layer, originalLayer: Layer): Layer {
  //create a new layer with both (layers)
  const combinedRectangle: Rectangle = combineRectangles(originalLayer.rect, stamp.rect);
  const combinedLayer: Layer = createLayer(combinedRectangle);

  //copy from original layer to new
  replacePixels(combinedLayer, originalLayer);

  //blend stampPixles into original Layer;
  blendPixels(combinedLayer, stamp);

  return combinedLayer;
}

export function replacePixels(to: Layer, from: Layer) {
  for (let y = 0; y < from.rect.height; y++) {
    for (let x = 0; x < from.rect.width; x++) {
      const globalX = from.rect.x + x;
      const globalY = from.rect.y + y;

      const srcIndex = getPixelIndex(y, from.rect.width, x);

      const destY = globalY - to.rect.y;
      const destX = globalX - to.rect.x;
      const dstIndex = getPixelIndex(destY, to.rect.width, destX);

      to.pixels[dstIndex] = from.pixels[srcIndex];
    }
  }
}

const EMPTY = rgbaToInt(0, 0, 0, 0);

export function replacePixelsWithStroke(
  to: Layer,
  from: Layer,
  strokeLayer: Layer,
  strokeNr: number,
) {
  for (let y = 0; y < from.rect.height; y++) {
    for (let x = 0; x < from.rect.width; x++) {
      const globalX = from.rect.x + x;
      const globalY = from.rect.y + y;

      // strokeLayer is global: assume rect.x/y = 0. Still bounds-check.
      if (
        globalX < 0 ||
        globalY < 0 ||
        globalX >= strokeLayer.rect.width ||
        globalY >= strokeLayer.rect.height
      ) {
        continue;
      }

      const srcIndex = getPixelIndex(y, from.rect.width, x);
      const srrpixel = from.pixels[srcIndex];

      // Defensive: never stamp "empty" into destination (prevents accidental erasing).
      if (srrpixel === EMPTY) continue;

      const strokeIdx = getPixelIndex(globalY, strokeLayer.rect.width, globalX);
      if (strokeLayer.pixels[strokeIdx] === strokeNr) continue;

      const destX = globalX - to.rect.x;
      const destY = globalY - to.rect.y;

      if (destX < 0 || destY < 0 || destX >= to.rect.width || destY >= to.rect.height) {
        continue;
      }

      const dstIndex = getPixelIndex(destY, to.rect.width, destX);

      to.pixels[dstIndex] = srrpixel;
      strokeLayer.pixels[strokeIdx] = strokeNr;
    }
  }
}

export function blendPixels(to: Layer, from: Layer) {
  for (let y = 0; y < from.rect.height; y++) {
    for (let x = 0; x < from.rect.width; x++) {
      const globalX = from.rect.x + x;
      const globalY = from.rect.y + y;

      const srcIndex = getPixelIndex(y, from.rect.width, x);

      const destY = globalY - to.rect.y;
      const destX = globalX - to.rect.x;
      const dstIndex = getPixelIndex(destY, to.rect.width, destX);

      to.pixels[dstIndex] = blendColor(from.pixels[srcIndex], to.pixels[dstIndex]);
    }
  }
}

/**
 * Subtracts alpha from destination pixels based on source mask.
 * The mask's alpha value determines how much to reduce the destination's alpha.
 * RGB values of the destination are preserved.
 */
export function subtractAlphaPixels(to: Layer, mask: Layer) {
  for (let y = 0; y < mask.rect.height; y++) {
    for (let x = 0; x < mask.rect.width; x++) {
      const globalX = mask.rect.x + x;
      const globalY = mask.rect.y + y;

      const srcIndex = getPixelIndex(y, mask.rect.width, x);

      const destY = globalY - to.rect.y;
      const destX = globalX - to.rect.x;

      // Skip if outside destination bounds
      if (destX < 0 || destY < 0 || destX >= to.rect.width || destY >= to.rect.height) {
        continue;
      }

      const dstIndex = getPixelIndex(destY, to.rect.width, destX);

      to.pixels[dstIndex] = subtractAlpha(mask.pixels[srcIndex], to.pixels[dstIndex]);
    }
  }
}

/**
 * Reduces destination pixel's alpha by the mask pixel's alpha.
 * Preserves the destination's RGB values.
 */
function subtractAlpha(maskPixel: number, destPixel: number): number {
  const mask = intToRGB(maskPixel);
  const dest = intToRGB(destPixel);

  // Keep destination RGB, reduce alpha by mask's alpha
  const newAlpha = Math.max(0, dest.a - mask.a);

  return rgbaToInt(dest.r, dest.g, dest.b, newAlpha);
}

/**
 * Erases (reduces alpha) from a canvas layer using a mask layer.
 * Similar to stampToCanvasLayer but subtracts alpha instead of blending.
 * After erasing, reduces the layer size by removing empty edges.
 */
export function eraseFromCanvasLayer(mask: Layer, originalLayer: Layer): Layer {
  // For erasing, we only need the intersection - layer can never grow
  const intersectRect = rectangleIntersection(originalLayer.rect, mask.rect);

  // If no intersection, return original unchanged
  if (intersectRect.width <= 0 || intersectRect.height <= 0) {
    return originalLayer;
  }

  // Create new layer with same bounds as original
  const newLayer: Layer = {
    ...originalLayer,
    pixels: originalLayer.pixels.slice(),
  };

  // Subtract alpha from the mask positions
  subtractAlphaPixels(newLayer, mask);

  // Reduce layer size by removing empty edges
  return reduceLayerToContent(newLayer);
}

/**
 * Reduces a layer's bounds by removing empty edges (rows/columns with alpha = 0).
 * Scans from each edge inward until finding a pixel with alpha > 0.
 */
export function reduceLayerToContent(layer: Layer): Layer {
  // Early return for empty layers
  if (layer.rect.width <= 0 || layer.rect.height <= 0) {
    return layer;
  }

  let leftTrim = 0;
  let topTrim = 0;
  let rightTrim = 0;
  let bottomTrim = 0;

  const { width, height } = layer.rect;

  // Scan from left edge
  let foundContent = false;
  for (let x = 0; x < width && !foundContent; x++) {
    for (let y = 0; y < height; y++) {
      const pixelAlpha = layer.pixels[y * width + x] & 0xff;
      if (pixelAlpha > 0) {
        foundContent = true;
        break;
      }
    }
    if (!foundContent) leftTrim++;
  }

  // If entire layer is empty, return empty layer
  if (leftTrim === width) {
    return createLayer({ x: layer.rect.x, y: layer.rect.y, width: 0, height: 0 });
  }

  // Scan from right edge
  foundContent = false;
  for (let x = width - 1; x >= leftTrim && !foundContent; x--) {
    for (let y = 0; y < height; y++) {
      const pixelAlpha = layer.pixels[y * width + x] & 0xff;
      if (pixelAlpha > 0) {
        foundContent = true;
        break;
      }
    }
    if (!foundContent) rightTrim++;
  }

  // Scan from top edge
  foundContent = false;
  for (let y = 0; y < height && !foundContent; y++) {
    for (let x = leftTrim; x < width - rightTrim; x++) {
      const pixelAlpha = layer.pixels[y * width + x] & 0xff;
      if (pixelAlpha > 0) {
        foundContent = true;
        break;
      }
    }
    if (!foundContent) topTrim++;
  }

  // Scan from bottom edge
  foundContent = false;
  for (let y = height - 1; y >= topTrim && !foundContent; y--) {
    for (let x = leftTrim; x < width - rightTrim; x++) {
      const pixelAlpha = layer.pixels[y * width + x] & 0xff;
      if (pixelAlpha > 0) {
        foundContent = true;
        break;
      }
    }
    if (!foundContent) bottomTrim++;
  }

  // If no trimming needed, return original
  if (leftTrim === 0 && rightTrim === 0 && topTrim === 0 && bottomTrim === 0) {
    return layer;
  }

  // Create reduced layer
  const newWidth = width - leftTrim - rightTrim;
  const newHeight = height - topTrim - bottomTrim;
  const newX = layer.rect.x + leftTrim;
  const newY = layer.rect.y + topTrim;

  const reducedLayer = createLayer({ x: newX, y: newY, width: newWidth, height: newHeight });

  // Copy pixels to reduced layer
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcX = x + leftTrim;
      const srcY = y + topTrim;
      const srcIndex = srcY * width + srcX;
      const dstIndex = y * newWidth + x;
      reducedLayer.pixels[dstIndex] = layer.pixels[srcIndex];
    }
  }

  return reducedLayer;
}

export function getSmallestRectangleFromPoints(
  xArray: number[],
  yArray: number[],
  buffer: number,
): Rectangle {
  const minX = Math.min(...xArray) - buffer;
  const maxX = Math.max(...xArray) + buffer;
  const minY = Math.min(...yArray) - buffer;
  const maxY = Math.max(...yArray) + buffer;

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  return {
    x: minX,
    y: minY,
    width,
    height,
  };
}

export function drawRectangle(
  rect: Rectangle,
  strokeSize: number,
  strokeColor: number,
  fillColor?: number,
): Layer {
  // early return if stroke takes up whole
  if (strokeSize * 2 >= rect.width || strokeSize * 2 >= rect.height)
    return createLayer(rect, strokeColor);

  const layer = createLayer(rect, fillColor);

  for (let i = 0; i < strokeSize; i++) {
    for (let j = 0; j < rect.width; j++) {
      const bottomIndex = getPixelIndex(rect.height - i - 1, rect.width, j);
      const topIndex = getPixelIndex(i, rect.width, j);

      layer.pixels[bottomIndex] = strokeColor;
      layer.pixels[topIndex] = strokeColor;
    }
  }

  for (let i = 0; i < strokeSize; i++) {
    for (let j = strokeSize; j + strokeSize < rect.height; j++) {
      const leftIndex = getPixelIndex(j, rect.width, i);
      const rightIndex = getPixelIndex(j, rect.width, rect.width - i - 1);

      layer.pixels[leftIndex] = strokeColor;
      layer.pixels[rightIndex] = strokeColor;
    }
  }

  return layer;
}

export function drawOval(
  rect: Rectangle,
  strokeSize: number,
  strokeColor: number,
  fillColor?: number,
): Layer {
  const w = rect.width;
  const h = rect.height;

  const layer = createLayer(rect, undefined);

  if (w <= 0 || h <= 0) return layer;

  const a = w / 2;
  const b = h / 2;
  const cx = w / 2;
  const cy = h / 2;

  if (strokeSize <= 0) {
    // fill-only ellipse
    if (fillColor === undefined) return layer;

    const invA2 = a === 0 ? 0 : 1 / (a * a);
    const invB2 = b === 0 ? 0 : 1 / (b * b);

    for (let y = 0; y < h; y++) {
      const dy = y - cy;
      const dy2 = dy * dy;
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const v = (a === 0 ? 0 : dx * dx * invA2) + (b === 0 ? 0 : dy2 * invB2);
        if (v <= 1) layer.pixels[getPixelIndex(y, w, x)] = fillColor;
      }
    }
    return layer;
  }

  const invA2 = a === 0 ? 0 : 1 / (a * a);
  const invB2 = b === 0 ? 0 : 1 / (b * b);

  const innerA = a - strokeSize;
  const innerB = b - strokeSize;

  const hasInner = innerA > 0 && innerB > 0;
  const invInnerA2 = hasInner ? 1 / (innerA * innerA) : 0;
  const invInnerB2 = hasInner ? 1 / (innerB * innerB) : 0;

  if (!hasInner) {
    for (let y = 0; y < h; y++) {
      const dy = y - cy;
      const dy2 = dy * dy;
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const outer = (a === 0 ? 0 : dx * dx * invA2) + (b === 0 ? 0 : dy2 * invB2);
        if (outer <= 1) layer.pixels[getPixelIndex(y, w, x)] = strokeColor;
      }
    }
    return layer;
  }

  for (let y = 0; y < h; y++) {
    const py = y + 0.5;
    const dy = py - cy;
    const dy2 = dy * dy;

    for (let x = 0; x < w; x++) {
      const px = x + 0.5;
      const dx = px - cx;
      const dx2 = dx * dx;

      const outer = dx2 * invA2 + dy2 * invB2;
      if (outer > 1) continue;

      const idx = getPixelIndex(y, w, x);

      if (!hasInner) {
        layer.pixels[idx] = strokeColor;
        continue;
      }

      const inner = dx2 * invInnerA2 + dy2 * invInnerB2;

      if (inner > 1) layer.pixels[idx] = strokeColor;
      else if (fillColor !== undefined) layer.pixels[idx] = fillColor;
    }
  }

  return layer;
}

export function fillLayerScanLine(
  color: number,
  t: number,
  sl: Layer, // selected layer
  sPos: Cordinate,
  sel?: SelectionLayer,
): Layer | null {
  const index = getPixelIndex(sPos.y, sl.rect.width, sPos.x);

  const oc: number = sl.pixels[index];

  if (oc == color) return null;

  const out = createLayer(sl.rect);

  //first seed
  const seeds: Cordinate[] = [sPos];

  let debugCount = 0;

  while (seeds.length > 0) {
    debugCount++;
    if (debugCount > 1000) {
      debugger;
    }

    const op = seeds.pop();

    if (!op) continue;

    sl.pixels[getPixelIndex(op.y, sl.rect.width, op.x)] = color;
    out.pixels[getPixelIndex(op.y, sl.rect.width, op.x)] = color;

    let rp = { x: op.x + 1, y: op.y };
    let lp = { x: op.x - 1, y: op.y };

    const originalTopClear: boolean = compareTolerance(op.x, op.y + 1, oc, sl, t, color, sel);
    const originalBottomClear: boolean = compareTolerance(op.x, op.y - 1, oc, sl, t, color, sel);

    if (originalTopClear) {
      seeds.push({ x: op.x, y: op.y + 1 });
    }

    if (originalBottomClear) {
      seeds.push({ x: op.x, y: op.y - 1 });
    }

    let prevTopClear = originalTopClear;
    let prevBottomClear = originalBottomClear;
    //right
    let rightClear: boolean = compareTolerance(rp.x, rp.y, oc, sl, t, color, sel);

    while (rightClear) {
      const index = getPixelIndex(rp.y, sl.rect.width, rp.x);

      sl.pixels[index] = color;
      out.pixels[index] = color;

      const topClear: boolean = compareTolerance(rp.x, rp.y + 1, oc, sl, t, color, sel);
      const bottomClear: boolean = compareTolerance(rp.x, rp.y - 1, oc, sl, t, color, sel);

      if (!prevTopClear && topClear) seeds.push({ x: rp.x, y: rp.y + 1 });
      if (!prevBottomClear && bottomClear) seeds.push({ x: rp.x, y: rp.y - 1 });

      prevTopClear = topClear;
      prevBottomClear = bottomClear;

      rightClear = compareTolerance(rp.x + 1, rp.y, oc, sl, t, color, sel);

      rp.x++;
    }

    prevTopClear = originalTopClear;
    prevBottomClear = originalBottomClear;

    //left
    let leftClear: boolean = compareTolerance(lp.x, lp.y, oc, sl, t, color, sel);

    while (leftClear) {
      const index = getPixelIndex(lp.y, sl.rect.width, lp.x);
      sl.pixels[index] = color;
      out.pixels[index] = color;

      const topClear: boolean = compareTolerance(lp.x, lp.y + 1, oc, sl, t, color, sel);
      const bottomClear: boolean = compareTolerance(lp.x, lp.y - 1, oc, sl, t, color, sel);

      if (!prevTopClear && topClear) seeds.push({ x: lp.x, y: lp.y + 1 });
      if (!prevBottomClear && bottomClear) seeds.push({ x: lp.x, y: lp.y - 1 });

      prevTopClear = topClear;
      prevBottomClear = bottomClear;

      leftClear = compareTolerance(lp.x - 1, lp.y, oc, sl, t, color, sel);

      lp.x--;
    }
  }

  return reduceLayerToContent(out);
}

function compareTolerance(
  x: number,
  y: number,
  oc: number,
  layer: Layer,
  t: number,
  fillColor: number,
  sel?: SelectionLayer,
): boolean {
  if (outOfBounds({ x, y }, layer.rect)) return false;

  const width = layer.rect.width;
  const compareColor = layer.pixels[getPixelIndex(y, width, x)] >>> 0;

  if (sel) {
    const selectionIndex = getLocalPixelIndex(x, y, sel.rect);

    if (selectionIndex === -1) return false;

    const hasSelection = sel.pixels[selectionIndex];

    if (hasSelection == 0) return false;
  }

  if (compareColor == fillColor) {
    return false;
  }

  // Fast path for exact match
  if (t === 0) {
    return compareColor === oc;
  }

  const r1 = (oc >>> 24) & 255;
  const g1 = (oc >>> 16) & 255;
  const b1 = (oc >>> 8) & 255;
  const a1 = oc & 255;

  const r2 = (compareColor >>> 24) & 255;
  const g2 = (compareColor >>> 16) & 255;
  const b2 = (compareColor >>> 8) & 255;
  const a2 = compareColor & 255;

  const diff = Math.max(Math.abs(r1 - r2), Math.abs(g1 - g2), Math.abs(b1 - b2), Math.abs(a1 - a2));

  return diff <= t;
}

function outOfBounds(cor: Cordinate, rect: Rectangle): boolean {
  return (
    cor.x < rect.x ||
    cor.y < rect.y ||
    cor.x >= rect.x + rect.width ||
    cor.y >= rect.y + rect.height
  );
}
