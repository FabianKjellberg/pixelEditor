'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { useLayerContext } from '@/context/LayerContext';
import { CenteredRectangle, Cordinate, LayerEntity } from '@/models/Layer';
import { combineManyRectangles, rectangleIntersection } from '@/util/LayerUtil';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './TrasnformOverlay.module.css';
import {
  getH,
  getStyles,
  getW,
  radToDeg,
  rectangleButton,
  roundButton,
  TransformBtn,
} from '@/helpers/transform';
import { useToolContext } from '@/context/ToolContext';
import { TransformProperty } from '@/models/properties/transformProperties';

type TransformOverlayProps = {
  width: number;
  height: number;
};

const TransformOverlay = ({ width, height }: TransformOverlayProps) => {
  const { activeLayerIds, layerTreeItems } = useLayerContext();
  const { selectionLayer, pixelSize, pan } = useCanvasContext();
  const { activeTool } = useToolContext();

  const [transformArea, setTransformArea] = useState<CenteredRectangle>(() => {
    const activeLayers: LayerEntity[] = layerTreeItems.filter((layer): layer is LayerEntity =>
      activeLayerIds.some((id) => id === layer.id),
    );

    const layerRectangle = combineManyRectangles(activeLayers.map((layer) => layer.layer.rect));

    const rect = selectionLayer
      ? rectangleIntersection(layerRectangle, selectionLayer.rect)
      : layerRectangle;

    return {
      center: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
      width: rect.width,
      height: rect.height,
      rotation: 0,
    };
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const originRef = useRef<Cordinate | null>(null);
  const moveDifference = useRef<Cordinate | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setIsCtrlPressed(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlPressed(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isCtrlPressed) {
      setIsDragging(false);
      moveDifference.current = null;
    }
  }, [isCtrlPressed]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    if (activeTool.name === 'transform' && transformArea != null) {
      activeTool.onUpdate?.(new TransformProperty(transformArea));
    }
  }, [transformArea, activeTool]);

  const tryChangeRectangle = useCallback(
    (x: number, y: number, btn: TransformBtn, shiftKey: boolean) => {
      setTransformArea((prev) => {
        if (btn === TransformBtn.rot) {
          const centerX = prev.center.x * pixelSize;
          const centerY = prev.center.y * pixelSize;

          originRef.current = { x: centerX + pan.x, y: centerY + pan.y };

          const dx = x - pan.x - centerX;
          const dy = y - pan.y - centerY;

          const angle = Math.atan2(dx, -dy);

          let degrees = radToDeg(angle);

          if (!shiftKey) {
            degrees = Math.round(degrees / 15) * 15;

            if (degrees === prev.rotation) return prev;
          }

          if (degrees < 0) {
            degrees += 360;
          }

          return { ...prev, rotation: degrees };
        } else if (btn === TransformBtn.move) {
          const md = moveDifference.current;

          if (md === null) return prev;

          let newX = (x - md.x - pan.x) / pixelSize;
          let newY = (y - md.y - pan.y) / pixelSize;

          if (!shiftKey) {
            newX = Math.round(newX);
            newY = Math.round(newY);

            if (prev.width % 2 === 1) newX += 0.5; // adjusted of odd widths
            if (prev.height % 2 === 1) newY += 0.5; // adjusted for odd height
          }

          if (prev.center.x === newX && prev.center.y === newY) return prev;

          return { ...prev, center: { x: newX, y: newY } };
        } else {
          const dx = (x - pan.x) / pixelSize - prev.center.x;
          const dy = (y - pan.y) / pixelSize - prev.center.y;

          const rads = prev.rotation * (Math.PI / 180);

          const cos = Math.cos(-rads);
          const sin = Math.sin(-rads);

          const xFromCenter = dx * cos - dy * sin;
          const yFromCenter = dx * sin + dy * cos;

          let newW = getW(btn, xFromCenter, prev.width);
          let newH = getH(btn, yFromCenter, prev.height);

          if (!shiftKey) {
            newW = Math.round(newW);
            newH = Math.round(newH);
          }

          if (prev.height === newH && prev.width === newW) return prev;

          return { ...prev, width: newW, height: newH };
        }
      });
    },
    [pan, pixelSize],
  );

  const onPointerDownCallback = useCallback(
    (e: React.PointerEvent<SVGGElement>, btn: TransformBtn) => {
      setIsDragging(true);
      if (activeTool.name !== 'transform') return;
      e.currentTarget.setPointerCapture(e.pointerId);

      if (btn === TransformBtn.move && svgRef.current !== null) {
        const svg = svgRef.current;
        const ctm = svg.getScreenCTM();
        if (!ctm) return;

        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;

        const localPoint = point.matrixTransform(ctm.inverse());

        const dx = localPoint.x - (transformArea.center.x * pixelSize + pan.x);
        const dy = localPoint.y - (transformArea.center.y * pixelSize + pan.y);

        moveDifference.current = { x: dx, y: dy };
      }
    },
    [pan, transformArea, activeTool],
  );

  const onPointerMoveCallback = useCallback(
    (e: React.PointerEvent<SVGGElement>, btn: TransformBtn) => {
      if (activeTool.name !== 'transform') return;

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
    [tryChangeRectangle, activeTool],
  );

  const onPointerUpCallback = useCallback(
    (e: React.PointerEvent<SVGGElement>, btn: TransformBtn) => {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
      moveDifference.current = null;
    },
    [activeTool],
  );

  const rectangle = useMemo(() => {
    const x = pan.x + pixelSize * transformArea.center.x;
    const y = pan.y + pixelSize * transformArea.center.y;
    const w = pixelSize * transformArea.width;
    const h = pixelSize * transformArea.height;

    if (originRef.current === null) {
      originRef.current = { x, y };
    }

    return (
      <g transform={`rotate(${transformArea.rotation} ${x} ${y})`}>
        <rect
          x={x - w / 2}
          y={y - h / 2}
          width={w}
          height={h}
          fill="#00000000"
          stroke="black"
          strokeWidth={2}
          style={{
            pointerEvents: isCtrlPressed ? 'none' : 'auto',
          }}
          className={styles.move}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.move)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.move)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.move)}
        />
        <line x1={x} x2={x} y1={y - h / 2} y2={y - h / 2 - 20} stroke="black" strokeWidth={2} />

        <g
          style={{ pointerEvents: isCtrlPressed ? 'none' : 'auto' }}
          className={isDragging ? styles.grabbing : styles.grab}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.rot)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.rot)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.rot)}
        >
          {roundButton(x, y - h / 2 - 20)}
        </g>

        <g
          style={{
            ...getStyles(TransformBtn.nw, transformArea.rotation),
            pointerEvents: isCtrlPressed ? 'none' : 'auto',
          }}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.nw)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.nw)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.nw)}
        >
          {rectangleButton(x - w / 2, y - h / 2)}
        </g>
        <g
          style={{
            ...getStyles(TransformBtn.ne, transformArea.rotation),
            pointerEvents: isCtrlPressed ? 'none' : 'auto',
          }}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.ne)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.ne)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.ne)}
        >
          {rectangleButton(x + w / 2, y - h / 2)}
        </g>
        <g
          style={{
            ...getStyles(TransformBtn.sw, transformArea.rotation),
            pointerEvents: isCtrlPressed ? 'none' : 'auto',
          }}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.sw)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.sw)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.sw)}
        >
          {rectangleButton(x - w / 2, y + h / 2)}
        </g>
        <g
          style={{
            ...getStyles(TransformBtn.se, transformArea.rotation),
            pointerEvents: isCtrlPressed ? 'none' : 'auto',
          }}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.se)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.se)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.se)}
        >
          {rectangleButton(x + w / 2, y + h / 2)}
        </g>
        <g
          style={{
            ...getStyles(TransformBtn.n, transformArea.rotation),
            pointerEvents: isCtrlPressed ? 'none' : 'auto',
          }}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.n)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.n)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.n)}
        >
          {rectangleButton(x, y - h / 2)}
        </g>
        <g
          style={{
            ...getStyles(TransformBtn.s, transformArea.rotation),
            pointerEvents: isCtrlPressed ? 'none' : 'auto',
          }}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.s)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.s)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.s)}
        >
          {rectangleButton(x, y + h / 2)}
        </g>
        <g
          style={{
            ...getStyles(TransformBtn.w, transformArea.rotation),
            pointerEvents: isCtrlPressed ? 'none' : 'auto',
          }}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.w)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.w)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.w)}
        >
          {rectangleButton(x - w / 2, y)}
        </g>
        <g
          style={{
            ...getStyles(TransformBtn.e, transformArea.rotation),
            pointerEvents: isCtrlPressed ? 'none' : 'auto',
          }}
          onPointerDown={(e) => onPointerDownCallback(e, TransformBtn.e)}
          onPointerMove={(e) => onPointerMoveCallback(e, TransformBtn.e)}
          onPointerUp={(e) => onPointerUpCallback(e, TransformBtn.e)}
        >
          {rectangleButton(x + w / 2, y)}
        </g>
      </g>
    );
  }, [
    pan,
    pixelSize,
    transformArea,
    onPointerMoveCallback,
    isDragging,
    onPointerDownCallback,
    onPointerUpCallback,
    isCtrlPressed,
  ]);

  return (
    <>
      <svg width={width} height={height} style={{ pointerEvents: 'none' }} ref={svgRef}>
        {rectangle}
      </svg>
    </>
  );
};

export default TransformOverlay;
