import { getGlobalCordinate, getLocalPixelIndex, getPixelIndex, intToRgba } from '@/helpers/color';
import { Cordinate, Layer, LayerEntity, Rectangle, SelectionLayer } from '@/models/Layer';
import { edge, point } from '@/models/Selection';
import { createLayer, Edge, rectangleIntersection } from './LayerUtil';
import { sl } from 'zod/locales';

function pointKey(p: point): string {
  return `${p.x},${p.y}`;
}

function pointsEqual(a: point, b: point): boolean {
  return a.x === b.x && a.y === b.y;
}

function removeEdge(map: Map<string, point[]>, a: point, b: point) {
  const ak = pointKey(a);
  const bk = pointKey(b);

  const aNeighbors = map.get(ak);
  if (aNeighbors) {
    const filtered = aNeighbors.filter((p) => !pointsEqual(p, b));
    if (filtered.length > 0) map.set(ak, filtered);
    else map.delete(ak);
  }

  const bNeighbors = map.get(bk);
  if (bNeighbors) {
    const filtered = bNeighbors.filter((p) => !pointsEqual(p, a));
    if (filtered.length > 0) map.set(bk, filtered);
    else map.delete(bk);
  }
}

function getCell(sl: SelectionLayer, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= sl.rect.width || y >= sl.rect.height) return false;

  return sl.pixels[y * sl.rect.width + x] === 0 ? false : true;
}

function keyToPoint(key: string): point | null {
  const pointArray = key.split(',');

  if (pointArray.length < 2) return null;

  return {
    x: Number(pointArray[0]),
    y: Number(pointArray[1]),
  };
}

export function getPath(sl: SelectionLayer) {
  const edges: edge[] = [];

  for (let y = 0; y < sl.rect.height; y++) {
    for (let x = 0; x < sl.rect.width; x++) {
      if (!getCell(sl, x, y)) continue;

      //top
      if (!getCell(sl, x, y - 1)) edges.push({ p1: { x: x, y: y }, p2: { x: x + 1, y: y } });
      //right
      if (!getCell(sl, x + 1, y))
        edges.push({ p1: { x: x + 1, y: y }, p2: { x: x + 1, y: y + 1 } });
      //bottom
      if (!getCell(sl, x, y + 1))
        edges.push({ p1: { x: x, y: y + 1 }, p2: { x: x + 1, y: y + 1 } });
      //left
      if (!getCell(sl, x - 1, y)) edges.push({ p1: { x: x, y: y }, p2: { x: x, y: y + 1 } });
    }
  }

  const edgeMap: Map<string, point[]> = new Map();
  edges.forEach((edge) => {
    const p1Key = `${edge.p1.x},${edge.p1.y}`;
    const p2Key = `${edge.p2.x},${edge.p2.y}`;

    const p1Neighbors = edgeMap.get(p1Key) ?? [];
    const p2Neighbors = edgeMap.get(p2Key) ?? [];

    const updatedP1Neighbors = [...p1Neighbors, edge.p2];
    const updatedP2Neighbors = [...p2Neighbors, edge.p1];

    edgeMap.set(p1Key, updatedP1Neighbors);
    edgeMap.set(p2Key, updatedP2Neighbors);
  });

  const pathParts: point[] = [];

  while (edgeMap.size > 0) {
    const { value: firstEntry } = edgeMap.entries().next();
    if (!firstEntry) break;

    const [startKey, neighbors] = firstEntry;
    const startPoint = keyToPoint(startKey);
    if (!startPoint || neighbors.length === 0) {
      edgeMap.delete(startKey);
      continue;
    }

    // start a new path from startPoint → first neighbor
    let current = neighbors[0];

    // consume the first edge
    removeEdge(edgeMap, startPoint, current);

    pathParts.push(startPoint);
    pathParts.push(current);

    // walk until we come back to the start
    while (!pointsEqual(current, startPoint)) {
      const key = pointKey(current);
      const nextNeighbors = edgeMap.get(key);

      if (!nextNeighbors || nextNeighbors.length === 0) {
        edgeMap.delete(key);
        break;
      }

      const nextPoint = nextNeighbors[0];

      removeEdge(edgeMap, current, nextPoint);

      pathParts.push(nextPoint);

      current = nextPoint;
    }
  }
  return pathParts;
}

/**
 *
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
export function createSelectionRectangleLayer(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): SelectionLayer {
  const x: number = Math.min(x1, x2);
  const y: number = Math.min(y1, y2);

  const width = Math.max(x1, x2) - x + 1;
  const height = Math.max(y1, y2) - y + 1;

  return createSelectionLayer({ x, y, width, height }, true);
}

/**
 *
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
export function createSelectionCircleLayer(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): SelectionLayer {
  const x: number = Math.min(x1, x2);
  const y: number = Math.min(y1, y2);

  const width = Math.max(x1, x2) - x + 1;
  const height = Math.max(y1, y2) - y + 1;

  const out = createSelectionLayer({ x, y, width, height }, false);

  const aSqr = Math.pow(width / 2, 2);
  const bSqr = Math.pow(height / 2, 2);
  const h = width / 2;
  const k = height / 2;

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const inside = Math.pow(j - h, 2) / aSqr + Math.pow(i - k, 2) / bSqr;

      if (inside < 1) {
        const index = getPixelIndex(i, width, j);

        out.pixels[index] = 1;
      }
    }
  }

  return out;
}

/**
 *
 * @param sl1
 * @param sl2
 * @returns
 */
export function combinedSelections(
  sl1: SelectionLayer | undefined,
  sl2: SelectionLayer,
): SelectionLayer {
  if (sl1 === undefined) return sl2;

  // world coordinates
  const minX = Math.min(sl1.rect.x, sl2.rect.x);
  const minY = Math.min(sl1.rect.y, sl2.rect.y);
  const maxX = Math.max(sl1.rect.x + sl1.rect.width, sl2.rect.x + sl2.rect.width);
  const maxY = Math.max(sl1.rect.y + sl1.rect.height, sl2.rect.y + sl2.rect.height);

  // local to combined layer
  const width = maxX - minX;
  const height = maxY - minY;

  const combinedLayers: SelectionLayer = createSelectionLayer(
    { x: minX, y: minY, width, height },
    false,
  );

  //copy over first layer
  for (let y: number = 0; y < sl1.rect.height; y++) {
    for (let x: number = 0; x < sl1.rect.width; x++) {
      const destX = x + (sl1.rect.x - minX);
      const destY = y + (sl1.rect.y - minY);
      const destIdx = getPixelIndex(destY, combinedLayers.rect.width, destX);

      combinedLayers.pixels[destIdx] = sl1.pixels[getPixelIndex(y, sl1.rect.width, x)];
    }
  }

  //copy over second layer
  for (let y: number = 0; y < sl2.rect.height; y++) {
    for (let x: number = 0; x < sl2.rect.width; x++) {
      const destX = x + (sl2.rect.x - minX);
      const destY = y + (sl2.rect.y - minY);
      const destIdx = getPixelIndex(destY, combinedLayers.rect.width, destX);

      if (combinedLayers.pixels[destIdx] === 1) continue;

      combinedLayers.pixels[destIdx] = sl2.pixels[getPixelIndex(y, sl2.rect.width, x)];
    }
  }

  return combinedLayers;
}

export function subtractSelection(
  sl1: SelectionLayer | undefined,
  sl2: SelectionLayer,
): SelectionLayer {
  if (!sl1) return createSelectionLayer({ x: 0, y: 0, width: 0, height: 0 }, false);

  const intersectingRect = rectangleIntersection(sl1.rect, sl2.rect);

  const out: SelectionLayer = {
    pixels: structuredClone(sl1.pixels),
    rect: structuredClone(sl1.rect),
  };

  for (let y = 0; y < intersectingRect.height; y++) {
    for (let x = 0; x < intersectingRect.width; x++) {
      const globalCord = getGlobalCordinate(x, y, intersectingRect);

      const sl1Index = getLocalPixelIndex(globalCord.x, globalCord.y, sl1.rect);
      const sl2Index = getLocalPixelIndex(globalCord.x, globalCord.y, sl2.rect);

      if (sl1.pixels[sl1Index] === 1 && sl2.pixels[sl2Index] === 1) {
        out.pixels[sl1Index] = 0;
      }
    }
  }

  return cleanSelectionLayerEdges(out);
}

/**
 * This functions create a new selection layer,
 * @param width
 * @param height
 * @param active
 * @returns
 */
export function createSelectionLayer(rect: Rectangle, fillWith: boolean): SelectionLayer {
  const pixels = new Uint8Array(Math.max(rect.width * rect.height, 0));
  pixels.fill(fillWith ? 1 : 0);

  return {
    rect,
    pixels,
  };
}

export function selectLayer(layer: Layer): SelectionLayer {
  const rect: Rectangle = layer.rect;

  const out = createSelectionLayer(rect, false);

  for (let y = 0; y < rect.height; y++) {
    for (let x = 0; x < rect.width; x++) {
      const i = getPixelIndex(y, rect.width, x);

      if (layer.pixels[i] !== 0) {
        out.pixels[i] = 1;
      }
    }
  }

  return out;
}

export function inverseSelection(
  layer: SelectionLayer | undefined,
  rect: Rectangle,
): SelectionLayer {
  const out = createSelectionLayer(rect, true);

  if (!layer) {
    return createSelectionLayer(rect, true);
  }

  for (let y = layer.rect.y; y < rect.height; y++) {
    if (layer.rect.y + layer.rect.height <= y) continue;
    for (let x = layer.rect.x; x < rect.width; x++) {
      if (layer.rect.x + layer.rect.width <= x) continue;

      const localI = getLocalPixelIndex(x, y, layer.rect);
      const i = getPixelIndex(y, rect.width, x);

      out.pixels[i] = layer.pixels[localI] === 0 ? 1 : 0;
    }
  }

  return out;
}

export function addVisibleLayerToSelection(layer: LayerEntity, sl: SelectionLayer) {
  for (let y = 0; y < sl.rect.height; y++) {
    const layerY = sl.rect.y + y - layer.layer.rect.y;

    if (layerY < 0) continue;
    if (layerY > layer.layer.rect.height) break;
    for (let x = 0; x < sl.rect.width; x++) {
      const layerX = sl.rect.x + x - layer.layer.rect.x;

      if (layerX < 0) continue;
      if (layerX > layer.layer.rect.width - 1) break;

      const fromIndex = getPixelIndex(layerY, layer.layer.rect.width, layerX);

      const layerColor = intToRgba(layer.layer.pixels[fromIndex]);

      if (layerColor.a === 0) continue;

      const toIndex = getPixelIndex(y, sl.rect.width, x);

      sl.pixels[toIndex] = 1;
    }
  }
}

export function fillSelectionPolygon(points: Cordinate[]) {
  const uniquePoints: Cordinate[] = [];
  const seen = new Set<string>();

  points.forEach((point) => {
    const x = Math.round(point.x);
    const y = Math.round(point.y);

    const key = `${x},${y}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniquePoints.push({ x, y });
    }
  });

  const rx1 = Math.min(...uniquePoints.map((p) => p.x));
  const ry1 = Math.min(...uniquePoints.map((p) => p.y));
  const rx2 = Math.max(...uniquePoints.map((p) => p.x));
  const ry2 = Math.max(...uniquePoints.map((p) => p.y));

  const r: Rectangle = {
    x: rx1,
    y: ry1,
    width: rx2 - rx1 + 1,
    height: ry2 - ry1 + 1,
  };

  const out = createSelectionLayer(r, false);

  const edges: Edge[] = [];

  for (let i = 0; i < uniquePoints.length; i++) {
    const p1 = uniquePoints[i];
    const p2 = uniquePoints[(i + 1) % uniquePoints.length];

    edges.push({
      c0: { x: p1.x - out.rect.x, y: p1.y - out.rect.y },
      c1: { x: p2.x - out.rect.x, y: p2.y - out.rect.y },
    });
  }

  for (let y = 0.5; y < out.rect.height; y++) {
    const intersectX: number[] = [];

    for (const edge of edges) {
      const outVer = Math.min(edge.c0.y, edge.c1.y) > y || Math.max(edge.c0.y, edge.c1.y) < y;

      const horizontal = edge.c0.y === edge.c1.y;

      if (outVer || horizontal) continue;

      const x0 = edge.c0.x;
      const y0 = edge.c0.y;
      const x1 = edge.c1.x;
      const y1 = edge.c1.y;

      const x = x0 + ((y - y0) * (x1 - x0)) / (y1 - y0);
      intersectX.push(x);
    }

    intersectX.sort((a, b) => a - b);

    for (let i = 1; i < intersectX.length; i += 2) {
      const row = Math.floor(y) * out.rect.width;

      const xStart = Math.ceil(intersectX[i - 1]);
      const xEnd = Math.floor(intersectX[i]);

      if (xEnd < xStart) continue;

      const start = Math.max(0, Math.min(out.rect.width - 1, xStart));
      const end = Math.max(0, Math.min(out.rect.width - 1, xEnd));

      out.pixels.fill(1, row + start, row + end + 1);
    }
  }

  return out;
}

export function cleanSelectionLayerEdges(sl: SelectionLayer): SelectionLayer {
  const { pixels, rect } = sl;
  const { x, y, width, height } = rect;

  if (width === 0 || height === 0 || pixels.length === 0) {
    return {
      pixels: new Uint8Array(0),
      rect: { x, y, width: 0, height: 0 },
    };
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const index = py * width + px;

      if (pixels[index] !== 1) continue;

      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    }
  }

  if (maxX === -1 || maxY === -1) {
    return {
      pixels: new Uint8Array(0),
      rect: { x: 0, y: 0, width: 0, height: 0 },
    };
  }

  const newWidth = maxX - minX + 1;
  const newHeight = maxY - minY + 1;
  const newPixels = new Uint8Array(newWidth * newHeight);

  for (let py = 0; py < newHeight; py++) {
    for (let px = 0; px < newWidth; px++) {
      const oldX = minX + px;
      const oldY = minY + py;

      const oldIndex = oldY * width + oldX;
      const newIndex = py * newWidth + px;

      newPixels[newIndex] = pixels[oldIndex];
    }
  }

  return {
    pixels: newPixels,
    rect: {
      x: x + minX,
      y: y + minY,
      width: newWidth,
      height: newHeight,
    },
  };
}
