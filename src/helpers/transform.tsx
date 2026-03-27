import { CenteredRectangle, Rectangle } from '@/models/Layer';
import { CSSProperties } from 'react';
import { he } from 'zod/v4/locales';

export enum TransformBtn {
  'move',
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

export const rectangleButton = (cx: number, cy: number) => {
  const x = cx - 5;
  const y = cy - 5;
  const w = 10;
  const h = 10;

  return <rect x={x} y={y} width={w} height={h} fill="#54fe3a" stroke="black" strokeWidth={2} />;
};

export const roundButton = (cx: number, cy: number) => {
  const x = cx - 4;
  const y = cy - 4;
  const w = 8;
  const h = 8;
  return (
    <>
      <rect x={x} y={y - 2} width={8} height={12} />;
      <rect x={x - 2} y={y} width={12} height={8} />;
      <rect x={x} y={y} width={w} height={h} fill="#54fe3a" stroke="none" />;
    </>
  );
};

export const getW = (btn: TransformBtn, dx: number, oldW: number) => {
  switch (btn) {
    case TransformBtn.nw:
    case TransformBtn.sw:
    case TransformBtn.w:
    case TransformBtn.ne:
    case TransformBtn.e:
    case TransformBtn.se:
      const newWidth = Math.abs(dx * 2);

      return newWidth;
    case TransformBtn.s:
    case TransformBtn.n:
    default:
      return oldW;
  }
};
export const getH = (btn: TransformBtn, dy: number, oldH: number) => {
  switch (btn) {
    case TransformBtn.nw:
    case TransformBtn.n:
    case TransformBtn.ne:
    case TransformBtn.sw:
    case TransformBtn.s:
    case TransformBtn.se:
      const newHeight = Math.abs(dy * 2);

      return newHeight <= 1 ? 1 : newHeight;
    case TransformBtn.e:
    case TransformBtn.w:
    default:
      return oldH;
  }
};

export const getStyles = (btn: TransformBtn, rotation: number): CSSProperties => {
  const normalizedRotation = ((rotation % 360) + 360) % 360;

  const directions: TransformBtn[] = [
    TransformBtn.n,
    TransformBtn.ne,
    TransformBtn.e,
    TransformBtn.se,
    TransformBtn.s,
    TransformBtn.sw,
    TransformBtn.w,
    TransformBtn.nw,
  ];

  const rotationSteps = Math.round(normalizedRotation / 45) % 8;

  const baseIndex = directions.indexOf(btn);
  const rotatedIndex = (baseIndex + rotationSteps) % 8;
  const rotatedDirection = directions[rotatedIndex];

  const cursor = getCursorForDirection(rotatedDirection);

  return {
    pointerEvents: 'auto',
    cursor,
  };
};

function getCursorForDirection(direction: TransformBtn): CSSProperties['cursor'] {
  switch (direction) {
    case TransformBtn.n:
    case TransformBtn.s:
      return 'ns-resize';

    case TransformBtn.e:
    case TransformBtn.w:
      return 'ew-resize';

    case TransformBtn.ne:
    case TransformBtn.sw:
      return 'nesw-resize';

    case TransformBtn.nw:
    case TransformBtn.se:
      return 'nwse-resize';

    default:
      return 'default';
  }
}

export const centeredRectFromRectangle = (rect: Rectangle): CenteredRectangle => {
  return {
    center: {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    },
    width: rect.width,
    height: rect.height,
    rotation: 0,
  };
};

export const rectangleFromCenteredRect = (rect: CenteredRectangle): Rectangle => {
  const a = degToRad(rect.rotation);

  const cos = Math.cos(a);
  const sin = Math.sin(a);

  const width = Math.round(Math.abs(rect.width * cos)) + Math.round(Math.abs(rect.height * sin));
  const height = Math.round(Math.abs(rect.width * sin)) + Math.round(Math.abs(rect.height * cos));

  const x = Math.round(rect.center.x - width / 2);
  const y = Math.round(rect.center.y - height / 2);

  return {
    width,
    height,
    x,
    y,
  };
};

export const degToRad = (deg: number): number => {
  return (deg * Math.PI) / 180;
};

export const radToDeg = (rad: number): number => {
  return (rad * 180) / Math.PI;
};
