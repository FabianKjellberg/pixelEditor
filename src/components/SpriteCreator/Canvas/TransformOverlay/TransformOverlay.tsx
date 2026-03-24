'use client';

import { useMouseEventContext } from '@/context/MouseEventContext/MouseEventContext';
import { useTransformContext } from '@/context/TransformContext';
import { useEffect, useState } from 'react';

const TransformOverlay = () => {
  const [firstKeyStroke, setFirstKeyStroke] = useState<boolean>(true);

  const { onKeyDownEvent } = useMouseEventContext();
  const { setTransforming } = useTransformContext();

  useEffect(() => {
    if (!onKeyDownEvent || firstKeyStroke) {
      setFirstKeyStroke(false);
      return;
    }

    if (onKeyDownEvent.key === 'enter') {
      setTransforming(false);
    }
  }, [onKeyDownEvent?.trigger]);

  return (
    <>
      <p>hej</p>
    </>
  );
};

export default TransformOverlay;
