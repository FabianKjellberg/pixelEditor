import { TransformBtn } from '@/components/SpriteCreator/Canvas/TransformOverlay/TransformOverlay';

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

export const getX = (btn: TransformBtn, oldX: number, newX: number, pixelSize: number) => {
  switch (btn) {
    case TransformBtn.nw:
    case TransformBtn.sw:
    case TransformBtn.w:
      const dif = Math.round((newX - oldX * pixelSize) / pixelSize);

      return oldX + dif;
    case TransformBtn.n:
    case TransformBtn.ne:
    case TransformBtn.e:
    case TransformBtn.s:
    case TransformBtn.se:

    default:
      return oldX;
  }
};

export const getY = (btn: TransformBtn, oldY: number, newY: number, pixelSize: number) => {
  switch (btn) {
    case TransformBtn.n:
    case TransformBtn.ne:
    case TransformBtn.nw:
      const dif = Math.round((newY - oldY * pixelSize) / pixelSize);

      return oldY + dif;
    case TransformBtn.e:
    case TransformBtn.w:
    case TransformBtn.s:
    case TransformBtn.se:
    case TransformBtn.sw:
    default:
      return oldY;
  }
};

export const getW = (
  btn: TransformBtn,
  oldX: number,
  oldW: number,
  newX: number,
  pixelSize: number,
) => {
  switch (btn) {
    case TransformBtn.ne:
    case TransformBtn.e:
    case TransformBtn.se:
      const dif = Math.round((newX - (oldX + oldW) * pixelSize) / pixelSize);

      return oldW + oldX + dif;
    case TransformBtn.nw:
    case TransformBtn.n:
    case TransformBtn.w:
    case TransformBtn.s:
    case TransformBtn.sw:
    default:
      return oldW + oldX;
  }
};

export const getH = (
  btn: TransformBtn,
  oldY: number,
  oldH: number,
  newY: number,
  pixelSize: number,
) => {
  switch (btn) {
    case TransformBtn.s:
    case TransformBtn.sw:
    case TransformBtn.se:
      const dif = Math.round((newY - (oldY + oldH) * pixelSize) / pixelSize);

      return oldH + oldY + dif;
    case TransformBtn.nw:
    case TransformBtn.n:
    case TransformBtn.w:
    case TransformBtn.ne:
    case TransformBtn.e:
    default:
      return oldH + oldY;
  }
};
