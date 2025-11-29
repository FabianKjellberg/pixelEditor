'use client';

import { useEffect, useMemo, useState } from 'react';

export type point = {
  x: number;
  y: number;
};
export type edge = {
  p1: point;
  p2: point;
};

const SVG = () => {
  const [hej, setHej] = useState<number>(0);
  const [pathString, setPathString] = useState<string>('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setHej((prev) => (prev += 1) % 8);
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    console.log('hej', hej);
  }, [hej]);

  const selectedArray = new Uint8Array([1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1]);
  const width = 4;
  const height = 4;
  const pixelSize = 40;

  function getCell(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= width || y >= height) return false;

    return selectedArray[y * width + x] === 0 ? false : true;
  }

  function keyToPoint(key: string): point | null {
    const pointArray = key.split(',');

    if (pointArray.length < 2) return null;

    return {
      x: Number(pointArray[0]),
      y: Number(pointArray[1]),
    };
  }

  const pointKey = (p: point) => `${p.x},${p.y}`;

  const pointsEqual = (a: point, b: point) => a.x === b.x && a.y === b.y;

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

  const getEdges = (): string => {
    const edges: edge[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!getCell(x, y)) continue;

        //top
        if (!getCell(x, y - 1)) {
          edges.push({ p1: { x: x, y: y }, p2: { x: x + 1, y: y } });
        }
        //right
        if (!getCell(x + 1, y)) edges.push({ p1: { x: x + 1, y: y }, p2: { x: x + 1, y: y + 1 } });
        //bottom
        if (!getCell(x, y + 1)) edges.push({ p1: { x: x, y: y + 1 }, p2: { x: x + 1, y: y + 1 } });
        //left
        if (!getCell(x - 1, y)) edges.push({ p1: { x: x, y: y }, p2: { x: x, y: y + 1 } });
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

    let exit = false;
    const pathParts: string[] = [];

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

      pathParts.push(`M ${startPoint.x * pixelSize} ${startPoint.y * pixelSize} `);
      pathParts.push(`L ${current.x * pixelSize} ${current.y * pixelSize} `);

      // walk until we come back to the start
      while (!pointsEqual(current, startPoint)) {
        const key = pointKey(current);
        const nextNeighbors = edgeMap.get(key);

        if (!nextNeighbors || nextNeighbors.length === 0) {
          // open contour / error case
          edgeMap.delete(key);
          break;
        }

        // after consuming edges, degree should be 1 here
        const nextPoint = nextNeighbors[0];

        removeEdge(edgeMap, current, nextPoint);

        pathParts.push(`L ${nextPoint.x * pixelSize} ${nextPoint.y * pixelSize} `);

        current = nextPoint;
      }
    }

    console.log('pathParts', pathParts.join(' '));
    return pathParts.join(' ');
  };

  useEffect(() => {
    setPathString(getEdges());
  }, []);

  const svgtest = useMemo(() => {
    console.log(pathString);
    return (
      <svg width={600} height={600}>
        <path d={pathString} fill="none" stroke="black" strokeWidth={2} strokeDasharray="" />
        <path
          d={pathString}
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeDasharray="4 4"
          strokeDashoffset={hej}
        />
      </svg>
    );
  }, [pathString, hej]);

  return (
    <>
      <div style={{ padding: 100 }}>{svgtest}</div>
    </>
  );
};
export default SVG;
