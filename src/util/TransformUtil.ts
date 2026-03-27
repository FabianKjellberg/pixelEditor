import {
  CenteredRectangle,
  Cordinate,
  Layer,
  LayerEntity,
  Rectangle,
  SelectionLayer,
} from '@/models/Layer';
import {
  blendPixels,
  combineRectangles,
  createLayer,
  createLayerEntity,
  rectangleIntersection,
  replacePixels,
  stampLayer,
} from './LayerUtil';
import { getGlobalCordinate, getLocalPixelIndex, getPixelIndex } from '@/helpers/color';
import { degToRad, rectangleFromCenteredRect } from '@/helpers/transform';
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

  //const debug: Cordinate[][] = Array.from({ length: rectBoundary.height }, () =>
  //Array.from({ length: rectBoundary.width }, () => ({ x: 0, y: 0 })),
  //);

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
        //debug[y][x] = { x: -1, y: -y };
        continue;
      }

      //debug[y][x] = { x: srcX, y: srcY };

      const ix = Math.round(srcX - 0.5);
      const iy = Math.round(srcY - 0.5);

      const stampIndex = getLocalPixelIndex(ix, iy, stampRect);
      const outIndex = getLocalPixelIndex(gx, gy, outRect);

      const blendedColor = blendColor(stamp.layer.pixels[stampIndex], out.pixels[outIndex]);

      out.pixels[outIndex] = blendedColor;
    }
  }

  /*for (let y = 0; y < debug.length; y++) {
    const row = debug[y];
    if (!row) continue;

    let line = '';

    for (let x = 0; x < row.length; x++) {
      const c = row[x];

      if (!c) {
        line += `[${x},${y}] (---, ---)  `;
        continue;
      }

      line += `[${x},${y}] (${c.x.toFixed(3)}, ${c.y.toFixed(3)})  `;
    }

    console.log(line);
  }*/

  return {
    ...to,
    layer: out,
  };
};
