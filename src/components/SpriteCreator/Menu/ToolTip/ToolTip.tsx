'use client';

import { useToolTipContext } from '@/context/TooltipContext';
import { useEffect, useMemo } from 'react';
import { format } from 'util';

const ToolTip = () => {
  const { canvasPos, toolTipValues } = useToolTipContext();

  useEffect(() => {
    console.log(toolTipValues);
  }, [toolTipValues]);

  const pos = useMemo(() => {
    return format(`x: ${canvasPos?.x ?? '-'}, y: ${canvasPos?.y ?? '-'}`);
  }, [canvasPos]);

  return (
    <>
      <div>{pos}</div>
      {toolTipValues.map((value) => {
        switch (value.type) {
          case 'angle':
            return <span>angle: {value.angle != undefined ? value.angle + '°' : '-'}</span>;
          case 'delta':
            return <span>{`Δx: ${value.dx ?? '-'}, Δy: ${value.dy ?? '-'}`}</span>;
          case 'length':
            return <span>length: {value.length != undefined ? value.length + ' px' : '-'}</span>;
        }
      })}
    </>
  );
};

export default ToolTip;
