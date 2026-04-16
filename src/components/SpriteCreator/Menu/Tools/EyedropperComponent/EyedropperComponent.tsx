'use client';

import React from 'react';
import ToolButton from '../ToolButton/ToolButton';
import { EyedropperTool } from '@/models/Tools/EyedropperTool';
import { useCanvasContext } from '@/context/CanvasContext';
import { useColorContext } from '@/context/ColorContext';

const EyedropperComponent = () => {
  const { setPColor } = useColorContext();
  const { getColorFromCanvas } = useCanvasContext();
  const { addRecentColor } = useColorContext();

  return (
    <ToolButton
      icon="/icons/eyedropper.png"
      tool={new EyedropperTool({ setPrimaryColor: setPColor }, getColorFromCanvas, addRecentColor)}
    />
  );
};

export default EyedropperComponent;
