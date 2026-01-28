'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { edge, point } from '@/models/Selection';
import { getPath } from '@/util/SelectionUtil';
import { useEffect, useMemo, useState } from 'react';

type SelectionProps = {
  canvasWidth: number;
  canvasHeight: number;
};

const Selection = ({ canvasHeight, canvasWidth }: SelectionProps) => {
  const { pixelSize, selectionLayer, pan } = useCanvasContext();
  const [pathOffset, setPathOffset] = useState<number>(0);

  //make selection move
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPathOffset((prev) => (prev += 1) % 8);
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  const paths: point[] | undefined = useMemo(() => {
    if (!selectionLayer) return undefined;

    return getPath(selectionLayer);
  }, [selectionLayer]);

  const pathString = useMemo((): string => {
    const pathStringParts: string[] = [];
    if (paths && paths.length > 0 && selectionLayer) {
      let lastX: number | null = null;
      let lastY: number | null = null;

      paths.forEach((pt, index) => {
        const x = pt.x * pixelSize + pixelSize * selectionLayer.rect.x + pan.x;
        const y = pt.y * pixelSize + pixelSize * selectionLayer.rect.y + pan.y;

        const newPath =
          lastX === null ||
          lastY === null ||
          Math.abs(lastX - pt.x) > 1 ||
          Math.abs(lastY - pt.y) > 1;

        pathStringParts.push(`${newPath ? 'M' : 'L'} ${x} ${y} `);

        lastX = pt.x;
        lastY = pt.y;
      });
    }

    return pathStringParts.join(' ');
  }, [pixelSize, paths, selectionLayer, pan]);

  return (
    <div>
      <svg width={canvasWidth} height={canvasHeight}>
        <path d={pathString} fill="none" stroke="black" strokeWidth={2} />
        <path
          d={pathString}
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeDasharray="4 4"
          strokeDashoffset={pathOffset}
        />
      </svg>
    </div>
  );
};
export default Selection;
