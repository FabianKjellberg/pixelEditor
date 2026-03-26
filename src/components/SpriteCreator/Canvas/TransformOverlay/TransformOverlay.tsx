'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { useLayerContext } from '@/context/LayerContext';
import { LayerEntity, Rectangle } from '@/models/Layer';
import { combineManyRectangles, rectangleIntersection } from '@/util/LayerUtil';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './TrasnformOverlay.module.css';
import { useToolContext } from '@/context/ToolContext';
import { getH, getW, getX, getY, rectangleButton, roundButton } from '@/helpers/transform';

type TransformOverlayProps = {
  width: number;
  height: number;
};

export enum TransformBtn {
  'default',
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
  'nw',
  'rot',
}

const TransformOverlay = ({ width, height }: TransformOverlayProps) => {
  const { activeLayerIds, layerTreeItems } = useLayerContext();
  const { selectionLayer, pixelSize, pan } = useCanvasContext();
  const { activeTool } = useToolContext();

  const [transformArea, setTransformArea] = useState<{ rect: Rectangle; rotation: number }>(() => {
    const activeLayers: LayerEntity[] = layerTreeItems.filter((layer): layer is LayerEntity =>
      activeLayerIds.some((id) => id === layer.id),
    );

    const layerRectangle = combineManyRectangles(activeLayers.map((layer) => layer.layer.rect));

    const rect = selectionLayer
      ? rectangleIntersection(layerRectangle, selectionLayer.rect)
      : layerRectangle;

    return {
      rect,
      rotation: 0,
    };
  });

  useEffect(() => {
    console.log(transformArea.rotation);
  }, [transformArea.rotation]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const onPointerDownCallback = useCallback(
    (e: React.PointerEvent<SVGGElement>, btn: TransformBtn) => {
      isDraggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [],
  );

  const tryChangeRectangle = useCallback(
    (x: number, y: number, btn: TransformBtn, shiftKey: boolean) => {
      setTransformArea((prev) => {
        if (btn === TransformBtn.rot) {
          const centerX = (prev.rect.width / 2 + prev.rect.x) * pixelSize;
          const centerY = (prev.rect.height / 2 + prev.rect.y) * pixelSize;

          const dx = x - pan.x - centerX;
          const dy = y - pan.y - centerY;

          const angle = Math.atan2(dx, -dy);

          let degrees = (angle * 180) / Math.PI;

          if (shiftKey) {
            degrees = Math.round(degrees / 15) * 15;
          }

          if (degrees < 0) {
            degrees += 360;
          }

          return { ...prev, rotation: degrees };
        } else {
          const x1 = getX(btn, prev.rect.x, x - pan.x, pixelSize);
          const y1 = getY(btn, prev.rect.y, y - pan.y, pixelSize);
          const x2 = getW(btn, prev.rect.x, prev.rect.width, x - pan.x, pixelSize);
          const y2 = getH(btn, prev.rect.y, prev.rect.height, y - pan.y, pixelSize);

          if (
            x1 === prev.rect.x &&
            y1 === prev.rect.y &&
            x2 - x1 === prev.rect.width &&
            y2 - y1 === prev.rect.height
          ) {
            return prev;
          }
          return {
            rect: { x: x1, y: y1, width: x2 - x1, height: y2 - y1 },
            rotation: prev.rotation,
          };
        }
      });
    },
    [pan, pixelSize],
  );

  const onPointerMoveCallback = useCallback(
    (e: React.PointerEvent<SVGGElement>, btn: TransformBtn) => {
      if (!isDraggingRef.current || svgRef.current === null) return;

      const svg = svgRef.current;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;

      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;

      const localPoint = point.matrixTransform(ctm.inverse());

      tryChangeRectangle(localPoint.x, localPoint.y, btn, e.shiftKey);
    },
    [tryChangeRectangle],
  );

  const onPointerUpCallback = useCallback(
    (e: React.PointerEvent<SVGGElement>, btn: TransformBtn) => {
      isDraggingRef.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    [],
  );

  const rectangle = useMemo(() => {
    const x = pan.x + pixelSize * transformArea.rect.x;
    const y = pan.y + pixelSize * transformArea.rect.y;
    const w = pixelSize * transformArea.rect.width;
    const h = pixelSize * transformArea.rect.height;

    const originX = x + w / 2;
    const originY = y + h / 2;

    return (
      <g transform={`rotate(${transformArea.rotation} ${originX} ${originY})`}>
        <rect x={x} y={y} width={w} height={h} fill="none" stroke="black" strokeWidth={2} />
        <line x1={x + w / 2} x2={x + w / 2} y1={y} y2={y - 20} stroke="black" strokeWidth={2} />

        <g
          className={styles.rotate}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.rot)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.rot)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.rot)}
        >
          {roundButton(x + w / 2, y - 20)}
        </g>

        <g
          className={styles.nwse}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.nw)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.nw)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.nw)}
        >
          {rectangleButton(x, y)}
        </g>
        <g
          className={styles.nesw}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.ne)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.ne)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.ne)}
        >
          {rectangleButton(x + w, y)}
        </g>
        <g
          className={styles.nesw}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.sw)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.sw)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.sw)}
        >
          {rectangleButton(x, y + h)}
        </g>
        <g
          className={styles.nwse}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.se)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.se)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.se)}
        >
          {rectangleButton(x + w, y + h)}
        </g>
        <g
          className={styles.ns}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.n)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.n)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.n)}
        >
          {rectangleButton(x + w / 2, y)}
        </g>
        <g
          className={styles.ns}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.s)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.s)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.s)}
        >
          {rectangleButton(x + w / 2, y + h)}
        </g>
        <g
          className={styles.ew}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.w)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.w)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.w)}
        >
          {rectangleButton(x, y + h / 2)}
        </g>
        <g
          className={styles.ew}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.e)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.e)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.e)}
        >
          {rectangleButton(x + w, y + h / 2)}
        </g>
      </g>
    );
  }, [pan, pixelSize, transformArea, onPointerMoveCallback]);

  return (
    <>
      <svg width={width} height={height} style={{ pointerEvents: 'none' }} ref={svgRef}>
        {rectangle}
      </svg>
    </>
  );
};

export default TransformOverlay;
