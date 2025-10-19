import { getPixelIndex, rgbaToInt } from '@/helpers/color';
import { Cordinate, Layer } from '@/models/Layer';

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
 * @param growLeft How much the boundary is pushed to the left
 * @param growTop How much the bounadry is pushed to the top
 * @param growRight How much the bounadry is pushed to the right
 * @param growBottom How much the bounadry is pushed to the bottom
 * @param layer The layer that should be increased in size
 * @returns returns the updated layer
 */
export function increaseLayerBoundary(
  growLeft: number,
  growTop: number,
  growRight: number,
  growBottom: number,
  layer: Layer,
): Layer {
  //original layer
  const oL = { ...layer };

  console.log(growLeft, growTop, growRight, growBottom);

  const wNew = Math.abs(growLeft) + oL.width + growRight;
  const hNew = Math.abs(growTop) + oL.height + growBottom;

  console.log(oL.width, oL.height);
  console.log(wNew, hNew);

  const newXPos = oL.xPos + (growLeft < 0 ? growLeft : 0);
  const newYPos = oL.yPos + (growTop < 0 ? growTop : 0);

  //new Layer
  const nL = createLayer(wNew, hNew, newXPos, newYPos);

  const widthLeftOffset = growLeft < 0 ? Math.abs(growLeft) : 0;
  const hegihtTopOffset = growTop < 0 ? Math.abs(growTop) * wNew : 0;

  //return nL;
  for (let y: number = 0; y < oL.height; y++) {
    for (let x: number = 0; x < oL.width; x++) {
      const src = getPixelIndex(y, layer.width, x);
      const dest = widthLeftOffset + hegihtTopOffset + wNew * y + x;
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
