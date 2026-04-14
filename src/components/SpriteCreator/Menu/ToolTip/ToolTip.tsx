'use client';

import { useToolTipContext } from '@/context/TooltipContext';
import { useEffect, useMemo } from 'react';
import { format } from 'util';

const ToolTip = () => {
  const { canvasPos, toolTipValues } = useToolTipContext();

  const pos = useMemo(() => {
    return format(`x: ${canvasPos?.x ?? '-'}, y: ${canvasPos?.y ?? '-'}`);
  }, [canvasPos]);

  const toolTipStrings = useMemo((): string[] => {
    return toolTipValues.map((value) => {
      switch (value.type) {
        case 'angle':
          const angle = value.angle != undefined ? value.angle + '°' : '-';

          return `angle: ${angle}`;
        case 'delta':
          const dx = value.dx != undefined ? Math.abs(value.dx) : '-';
          const dy = value.dy != undefined ? Math.abs(value.dy) : '-';
          const dxPrefix =
            value.dx != undefined ? (value.dx < 0 ? '-' : value.dx > 0 ? '+' : '') : '';
          const dyPrefix =
            value.dy != undefined ? (value.dy < 0 ? '-' : value.dy > 0 ? '+' : '') : '';

          return `Δx: ${dxPrefix + dx}, Δy: ${dyPrefix + dy}`;
        case 'length':
          const length = value.length != undefined ? `${value.length} px` : '-';

          return `length: ${length}`;
        case 'scale':
          const sx = value.xScale != undefined ? value.xScale : undefined;
          const sy = value.yScale != undefined ? value.yScale : undefined;

          return `scale x: ${sx}%, scale y: ${sy}%`;
        case 'size':
          const w = value.width != undefined ? `${value.width} px` : '-';
          const h = value.height != undefined ? `${value.height} px` : '-';

          return `w: ${w}, h: ${h}`;
        default:
          return 'not found';
      }
    });
  }, [toolTipValues]);

  return (
    <>
      <div>{pos}</div>
      {toolTipStrings.map((value, index) => (
        <span key={`tooltip-${index}`}>{value}</span>
      ))}
    </>
  );
};

export default ToolTip;
