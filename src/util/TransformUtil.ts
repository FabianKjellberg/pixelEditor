import {
  CenteredRectangle,
  Cordinate,
  LayerEntity,
  Rectangle,
  SelectionLayer,
} from '@/models/Layer';
import { combineRectangles, createLayer, rectangleIntersection, replacePixels } from './LayerUtil';
import { getGlobalCordinate, getLocalPixelIndex, intToRgba, rgbaToInt } from '@/helpers/color';
import { degToRad } from '@/helpers/transform';
import { blendColor } from './ColorUtil';

export type CropLayer = {
  croppedLayer: LayerEntity;
  restLayer: LayerEntity;
};

export const cropLayer = (
  layer: LayerEntity,
  rect: Rectangle,
  selectionLayer?: SelectionLayer,
): CropLayer => {
  const rectangle = rectangleIntersection(layer.layer.rect, rect);

  //same layer as before with a new identical array
  const restLayer: LayerEntity = {
    ...layer,
    layer: {
      ...layer.layer,
      rect: { ...layer.layer.rect },
      pixels: new Uint32Array(layer.layer.pixels),
    },
  };
  const croppedLayer = { ...layer };

  // make a new layer with the crop rectangle boundaries
  croppedLayer.layer = createLayer(rectangle);

  for (let y = 0; y < rectangle.height; y++) {
    for (let x = 0; x < rectangle.width; x++) {
      const gPos = getGlobalCordinate(x, y, rectangle);

      if (selectionLayer) {
        const selectionIndex = getLocalPixelIndex(gPos.x, gPos.y, selectionLayer.rect);

        if (selectionIndex === -1) continue;
        if (selectionLayer.pixels[selectionIndex] !== 1) continue;
      }

      const croppedIndex = getLocalPixelIndex(gPos.x, gPos.y, croppedLayer.layer.rect);
      const restIndex = getLocalPixelIndex(gPos.x, gPos.y, restLayer.layer.rect);

      croppedLayer.layer.pixels[croppedIndex] = restLayer.layer.pixels[restIndex];
      restLayer.layer.pixels[restIndex] = 0;
    }
  }
  return {
    croppedLayer,
    restLayer,
  };
};

export const transformLayer = (
  to: LayerEntity,
  stamp: LayerEntity,
  rect: CenteredRectangle,
  originalRect: Rectangle,
  rendering: string | null,
): LayerEntity => {
  const originalCenter: Cordinate = {
    x: originalRect.x + originalRect.width / 2,
    y: originalRect.y + originalRect.height / 2,
  };

  const rads = degToRad(rect.rotation);
  const sin = Math.sin(rads);
  const cos = Math.cos(rads);

  const wScale = rect.width / originalRect.width;
  const hScale = rect.height / originalRect.height;

  const halfW = rect.width / 2;
  const halfH = rect.height / 2;

  // Rotated destination corners in global space
  const corners = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: halfW, y: halfH },
    { x: -halfW, y: halfH },
  ].map((p) => ({
    x: rect.center.x + p.x * cos - p.y * sin,
    y: rect.center.y + p.x * sin + p.y * cos,
  }));

  const minX = Math.floor(Math.min(...corners.map((p) => p.x))) - 1;
  const minY = Math.floor(Math.min(...corners.map((p) => p.y))) - 1;
  const maxX = Math.ceil(Math.max(...corners.map((p) => p.x))) + 1;
  const maxY = Math.ceil(Math.max(...corners.map((p) => p.y))) + 1;

  const rectBoundary: Rectangle = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };

  const outRect = combineRectangles(to.layer.rect, rectBoundary);
  const out = createLayer(outRect);

  replacePixels(out, to.layer);

  const stampRect = stamp.layer.rect;

  for (let y = 0; y < rectBoundary.height; y++) {
    for (let x = 0; x < rectBoundary.width; x++) {
      const gx = rectBoundary.x + x;
      const gy = rectBoundary.y + y;

      // destination pixel relative to transformed center
      const px = gx + 0.5 - rect.center.x;
      const py = gy + 0.5 - rect.center.y;

      // inverse rotation
      const rx = px * cos + py * sin;
      const ry = -px * sin + py * cos;

      // inverse scale
      const sx = rx / wScale;
      const sy = ry / hScale;

      // back into source space
      const srcX = sx + originalCenter.x;
      const srcY = sy + originalCenter.y;

      // source bounds check
      if (
        srcX < stampRect.x ||
        srcX >= stampRect.x + stampRect.width ||
        srcY < stampRect.y ||
        srcY >= stampRect.y + stampRect.height
      ) {
        continue;
      }

      const outIndex = getLocalPixelIndex(gx, gy, outRect);

      //nearest neighbor

      let stampColor: number = 0;

      switch (rendering) {
        case 'Nearest Neighbor':
          stampColor = nearestNeighbor(srcX, srcY, stampRect, stamp);
          break;
        case 'Bilinear':
          stampColor = bilinear(srcX, srcY, stampRect, stamp);
          break;
      }

      const blendedColor = blendColor(stampColor, out.pixels[outIndex]);

      out.pixels[outIndex] = blendedColor;
    }
  }

  return {
    ...to,
    layer: out,
  };
};

function nearestNeighbor(
  srcX: number,
  srcY: number,
  stampRect: Rectangle,
  stamp: LayerEntity,
): number {
  const ix = Math.round(srcX - 0.5);
  const iy = Math.round(srcY - 0.5);

  const stampIndex = getLocalPixelIndex(ix, iy, stampRect);
  const stampColor = stamp.layer.pixels[stampIndex];

  return stampColor;
}

function bilinear(srcX: number, srcY: number, stampRect: Rectangle, stamp: LayerEntity): number {
  const pixels = stamp.layer.pixels;

  const ix = srcX - 0.5;
  const iy = srcY - 0.5;

  const x1 = Math.floor(ix);
  const x2 = Math.ceil(ix);
  const y1 = Math.floor(iy);
  const y2 = Math.ceil(iy);

  const x1y1n: number = pixels[getLocalPixelIndex(x1, y1, stampRect)];
  if (x1 === x2 && y1 === y2) x1y1n;
  const x1y2n: number = pixels[getLocalPixelIndex(x1, y2, stampRect)];
  const x2y1n: number = pixels[getLocalPixelIndex(x2, y1, stampRect)];
  const x2y2n: number = pixels[getLocalPixelIndex(x2, y2, stampRect)];

  const fx = ix - x1;
  const fy = iy - y1;

  const x1y1 = intToRgba(x1y1n);
  const x1y2 = intToRgba(x1y2n);
  const x2y1 = intToRgba(x2y1n);
  const x2y2 = intToRgba(x2y2n);

  const a1 = x1y1.a / 255;
  const a2 = x2y1.a / 255;
  const a3 = x1y2.a / 255;
  const a4 = x2y2.a / 255;

  const rTop = x1y1.r * a1 * (1 - fx) + x2y1.r * a2 * fx;
  const rBot = x1y2.r * a3 * (1 - fx) + x2y2.r * a4 * fx;
  const rPremul = rTop * (1 - fy) + rBot * fy;

  const gTop = x1y1.g * a1 * (1 - fx) + x2y1.g * a2 * fx;
  const gBot = x1y2.g * a3 * (1 - fx) + x2y2.g * a4 * fx;
  const gPremul = gTop * (1 - fy) + gBot * fy;

  const bTop = x1y1.b * a1 * (1 - fx) + x2y1.b * a2 * fx;
  const bBot = x1y2.b * a3 * (1 - fx) + x2y2.b * a4 * fx;
  const bPremul = bTop * (1 - fy) + bBot * fy;

  const aTop = a1 * (1 - fx) + a2 * fx;
  const aBot = a3 * (1 - fx) + a4 * fx;
  const a = aTop * (1 - fy) + aBot * fy;

  const r = a > 0 ? rPremul / a : 0;
  const g = a > 0 ? gPremul / a : 0;
  const b = a > 0 ? bPremul / a : 0;

  const outA = a * 255;

  return rgbaToInt(Math.round(r), Math.round(g), Math.round(b), Math.round(outA));
}

export function invertHorizontally(layer: LayerEntity, boundary: Rectangle): void {
  const width = layer.layer.rect.width;
  const pixels = layer.layer.pixels;
  const x = layer.layer.rect.x;

  const result = new Uint32Array(pixels.length);

  for (let y = 0; y < pixels.length / width; y++) {
    const rowStart = y * width;

    for (let x = 0; x < width; x++) {
      const srcIndex = rowStart + x;
      const dstIndex = rowStart + (width - 1 - x);

      result[dstIndex] = pixels[srcIndex];
    }
  }
  const x2 = x + width;
  const xM = boundary.x + boundary.width / 2;
  const x2f = 2 * xM - x2;

  layer.layer = {
    pixels: result,
    rect: {
      ...layer.layer.rect,
      x: x2f,
    },
  };
}

export function invertVertically(layer: LayerEntity, boundary: Rectangle): void {
  const width = layer.layer.rect.width;
  const height = layer.layer.rect.height;
  const pixels = layer.layer.pixels;
  const y = layer.layer.rect.y;

  const result = new Uint32Array(pixels.length);

  for (let y = 0; y < height; y++) {
    const srcRow = y;
    const dstRow = height - 1 - y;

    for (let x = 0; x < width; x++) {
      const srcIndex = srcRow * width + x;
      const dstIndex = dstRow * width + x;

      result[dstIndex] = pixels[srcIndex];
    }
  }

  const y2 = y + height;
  const yM = boundary.y + boundary.height / 2;
  const y2f = 2 * yM - y2;

  layer.layer = {
    pixels: result,
    rect: {
      ...layer.layer.rect,
      y: y2f,
    },
  };
}

export const getAngle = (dx: number, dy: number): number => {
  const radians = Math.atan2(dy, dx);
  const degrees = radians * (180 / Math.PI);
  return degrees;
};
