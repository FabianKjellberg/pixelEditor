import { getPixelIndex, rgbaToInt } from '@/helpers/color';
import { Cordinate, Direction, Layer, OutOfBoundItem } from '@/models/Layer';

/**
 *
 * @param width
 * @param height
 * @param xPos
 * @param yPos
 * @returns
 */
export function createLayer(
  width: number,
  height: number,
  xPos: number = 0,
  yPos: number = 0,
): Layer {
  const pixels = new Uint32Array(width * height);
  pixels.fill(rgbaToInt(0, 0, 0, 0));
  return {
    xPos,
    yPos,
    width,
    height,
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
  const oL = { ...l };

  const wNew = dir.left + oL.width + dir.right;
  const hNew = dir.top + oL.height + dir.bottom;

  const newXPos = oL.xPos - dir.left;
  const newYPos = oL.yPos - dir.top;

  //new Layer with updated dimensions and positioning
  const nL = createLayer(wNew, hNew, newXPos, newYPos);

  const widthLeftOffset = dir.left;
  const hegihtTopOffset = dir.top * wNew;

  //overwrite the newly created array with the old array
  for (let y: number = 0; y < oL.height; y++) {
    for (let x: number = 0; x < oL.width; x++) {
      const src = getPixelIndex(y, oL.width, x);
      const dest = widthLeftOffset + hegihtTopOffset + wNew * y + x;
      nL.pixels[dest] = oL.pixels[src];
    }
  }

  return nL;
}

export function decreaseLayerBoundary(dir: Direction, l: Layer) {
  const oL = { ...l };

  const wNew = oL.width - (dir.left + dir.right);
  const hNew = oL.height - (dir.top + dir.bottom);

  //early return if the height or width would not exist :)
  if (wNew <= 0 || hNew <= 0) {
    console.log('wow, nothing left??');
    return createLayer(0, 0, 0, 0);
  }

  const newXPos = oL.xPos + dir.left;
  const newYPos = oL.yPos + dir.top;

  //new layer with update dimensions and positioning
  const nL = createLayer(wNew, hNew, newXPos, newYPos);

  const widthLeftOffset = dir.left;
  const heightTopOffset = dir.top * oL.width;

  for (let y: number = 0; y < nL.height; y++) {
    for (let x: number = 0; x < nL.width; x++) {
      const src = widthLeftOffset + heightTopOffset + oL.width * y + x;
      const dest = getPixelIndex(y, nL.width, x);
      nL.pixels[dest] = oL.pixels[src];
    }
  }

  return nL;
}

/**
 * from a mouse event, this method converts y & x cordinates to flat numbers based on the size of each pixel
 * @param e
 * @param pixelSize
 * @returns
 */
export function getPixelPositions(e: any, pixelSize: number): Cordinate {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();

  //Get cordinates of the canvas
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  //Round out number based on pixelsize zoom etx (before zooming is added its just going to be pixel size)
  const xPos = Math.floor(x / pixelSize);
  const yPos = Math.floor(y / pixelSize);

  return { x: xPos, y: yPos };
}

export function outOfBoundFinder(x: number, y: number, w: number, h: number): OutOfBoundItem {
  const growthLeft = x < 0 ? -x : 0;
  const growthTop = y < 0 ? -y : 0;
  const growthRight = x >= w ? x - (w - 1) : 0;
  const growthBottom = y >= h ? y - (h - 1) : 0;

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

export function tryReduceLayerSize(dir: Direction, layer: Layer): Layer {
  //variable that confirms that user has reached bottom
  let boundFound = false;
  let leftCount = 0;
  let topCount = 0;
  let rightCount = 0;
  let bottomCount = 0;

  const EMPTY = rgbaToInt(0, 0, 0, 0);

  //getLeftCount
  if (dir.left > 0) {
    while (!boundFound && leftCount < layer.width) {
      for (let i: number = 0; i < layer.height; i++) {
        if (layer.pixels[i * layer.width + leftCount] !== EMPTY) {
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
    while (!boundFound && topCount < layer.height) {
      for (let i: number = 0; i < layer.width; i++) {
        if (layer.pixels[topCount * layer.width + i] !== EMPTY) {
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
    while (!boundFound && rightCount < layer.width) {
      for (let i: number = 0; i < layer.height; i++) {
        if (layer.pixels[i * layer.width + layer.width - rightCount - 1] !== EMPTY) {
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
    while (!boundFound && bottomCount < layer.height) {
      for (let i: number = 0; i < layer.width; i++) {
        if (layer.pixels[(layer.height - bottomCount - 1) * layer.width + i] !== EMPTY) {
          boundFound = true;
          break;
        }
      }
      if (!boundFound) bottomCount++;
    }
  }

  //reduce the layer boundaries by creating a new array

  //early return if no changes are present
  if (rightCount === 0 && topCount === 0 && leftCount === 0 && bottomCount === 0) return layer;

  return decreaseLayerBoundary(
    {
      bottom: bottomCount,
      left: leftCount,
      right: rightCount,
      top: topCount,
    },
    layer,
  );
}
