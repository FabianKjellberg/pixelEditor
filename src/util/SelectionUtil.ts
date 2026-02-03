import { getPixelIndex } from '@/helpers/color';
import { Rectangle, SelectionLayer } from '@/models/Layer';
import { edge, point } from '@/models/Selection';

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

  return createSelectionLayer(x, y, width, height, true);
}

/**
 *
 * @param sl1
 * @param sl2
 * @returns
 */
export function combinedSelections(sl1: SelectionLayer, sl2: SelectionLayer): SelectionLayer {
  // world coordinates
  const minX = Math.min(sl1.rect.x, sl2.rect.x);
  const minY = Math.min(sl1.rect.y, sl2.rect.y);
  const maxX = Math.max(sl1.rect.x + sl1.rect.width, sl2.rect.x + sl2.rect.width);
  const maxY = Math.max(sl1.rect.y + sl1.rect.height, sl2.rect.y + sl2.rect.height);

  // local to combined layer
  const width = maxX - minX;
  const height = maxY - minY;

  const combinedLayers: SelectionLayer = createSelectionLayer(minX, minY, width, height, false);

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

      combinedLayers.pixels[destIdx] = sl2.pixels[getPixelIndex(y, sl2.rect.width, x)];
    }
  }

  return combinedLayers;
}

/**
 * This functions create a new selection layer,
 * @param width
 * @param height
 * @param active
 * @returns
 */
export function createSelectionLayer(
  x: number,
  y: number,
  width: number,
  height: number,
  fillWith: boolean,
): SelectionLayer {
  const pixels = new Uint8Array(Math.max(width * height, 0));
  pixels.fill(fillWith ? 1 : 0);
  const rect: Rectangle = {
    x,
    y,
    width,
    height,
  };

  return {
    rect,
    pixels,
  };
}
